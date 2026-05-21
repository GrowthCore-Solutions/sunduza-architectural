import "server-only";

import { AuditAction, BookingStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { getAdminEmail } from "@/lib/env";
import { BookingListQuerySchema, type BookingInput } from "@/types/booking";
import type { z } from "zod";

type BookingListQuery = z.infer<typeof BookingListQuerySchema>;
import {
  bookingConfirmSelect,
  bookingRowSelect,
  type BookingConfirm,
  type BookingRow,
} from "@/types/db";
import { writeAuditLog } from "@/server/audit";
import { calculateLeadScore } from "@/server/lead-score";
import { canTransition, validNextStatuses } from "@/server/booking-transitions";

export async function createBooking(
  data: BookingInput,
  meta: { ipAddress: string; userAgent: string }
): Promise<BookingConfirm> {
  const leadScore = calculateLeadScore(data);
  const adminEmail = getAdminEmail();

  const [booking] = await db.$transaction([
    db.booking.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        service: data.service,
        location: data.location,
        description: data.description,
        meetingDate: data.meetingDate ? new Date(data.meetingDate) : null,
        budget: data.budget ?? null,
        status: BookingStatus.PENDING,
        leadScore,
        consentGiven: true,
        consentGivenAt: new Date(),
        utmSource: data.utmSource ?? null,
        utmMedium: data.utmMedium ?? null,
        utmCampaign: data.utmCampaign ?? null,
        utmTerm: data.utmTerm ?? null,
        utmContent: data.utmContent ?? null,
        referrerUrl: data.referrerUrl ?? null,
        landingPage: data.landingPage ?? null,
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      },
      select: bookingConfirmSelect,
    }),
    db.notification.create({
      data: {
        type: "BOOKING_NEW",
        channel: "email",
        recipient: adminEmail,
        payload: {
          name: data.name,
          email: data.email,
          service: data.service,
          leadScore,
        },
      },
    }),
  ]);

  await writeAuditLog({
    action: AuditAction.BOOKING_CREATE,
    entityType: "Booking",
    entityId: booking.id,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
    metadata: { service: data.service, leadScore },
  });

  return booking;
}

export async function getAdminBookings(query: BookingListQuery): Promise<{
  bookings: BookingRow[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const skip = (query.page - 1) * query.limit;
  const statusFilter = query.status
    ? { status: query.status as BookingStatus }
    : undefined;

  const [bookings, total] = await db.$transaction([
    db.booking.findMany({
      where: statusFilter,
      orderBy: { createdAt: "desc" },
      select: bookingRowSelect,
      skip,
      take: query.limit,
    }),
    db.booking.count({ where: statusFilter }),
  ]);

  return {
    bookings,
    total,
    page: query.page,
    totalPages: Math.ceil(total / query.limit) || 1,
  };
}

export async function getBookingById(id: string): Promise<BookingRow | null> {
  return db.booking.findUnique({
    where: { id },
    select: bookingRowSelect,
  });
}

export async function updateBookingStatus(
  id: string,
  update: { status?: BookingStatus; adminNotes?: string },
  context: { userId: string; ipAddress: string }
): Promise<{ booking: BookingRow; error: null } | { booking: null; error: string }> {
  const current = await db.booking.findUnique({
    where: { id },
    select: { id: true, status: true },
  });

  if (!current) {
    return { booking: null, error: "Booking not found" };
  }

  if (update.status !== undefined && update.status !== current.status) {
    if (!canTransition(current.status, update.status)) {
      const allowed = validNextStatuses(current.status);
      return {
        booking: null,
        error:
          allowed.length === 0
            ? `Booking is ${current.status.toLowerCase()} — no further status changes are allowed.`
            : `Cannot move from ${current.status} to ${update.status}. Allowed: ${allowed.join(", ")}.`,
      };
    }
  }

  const updated = await db.booking.update({
    where: { id },
    data: {
      ...(update.status !== undefined && { status: update.status }),
      ...(update.adminNotes !== undefined && { adminNotes: update.adminNotes }),
    },
    select: bookingRowSelect,
  });

  await writeAuditLog({
    action: AuditAction.BOOKING_STATUS_UPDATE,
    entityType: "Booking",
    entityId: id,
    userId: context.userId,
    ipAddress: context.ipAddress,
    metadata: {
      previousStatus: current.status,
      newStatus: update.status,
    },
  });

  return { booking: updated, error: null };
}

export async function softDeleteBooking(
  id: string,
  context: { userId: string; ipAddress?: string }
): Promise<boolean> {
  const existing = await db.booking.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return false;

  await db.booking.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await writeAuditLog({
    action: AuditAction.BOOKING_DELETE,
    entityType: "Booking",
    entityId: id,
    userId: context.userId,
    ipAddress: context.ipAddress,
  });

  return true;
}
