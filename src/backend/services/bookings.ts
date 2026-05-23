import "server-only";

import { AuditAction, BookingStatus } from "@prisma/client";
import { db } from "@/backend/lib/db";
import { getAdminEmail } from "@/backend/lib/env";
import { BookingListQuerySchema, type BookingInput } from "@/shared/types/booking";
import type { z } from "zod";

type BookingListQuery = z.infer<typeof BookingListQuerySchema>;
import {
  bookingConfirmSelect,
  bookingRowSelect,
  type BookingConfirm,
  type BookingRow,
} from "@/shared/types/db";
import { writeAuditLog } from "@/backend/services/audit";
import { calculateLeadScore } from "@/backend/services/lead-score";
import { canTransition, validNextStatuses } from "@/backend/services/booking-transitions";
import { getActiveServiceBySlug } from "@/backend/services/services";
import { upsertLead } from "@/backend/services/leads";
import { ServiceError } from "@/backend/lib/errors";

export async function createBooking(
  data: BookingInput,
  meta: { ipAddress: string; userAgent: string }
): Promise<BookingConfirm> {
  // Resolve the slug against the live catalogue. A retired or unknown slug
  // is a client problem (the form was rendered with stale data), so surface
  // a 400 rather than letting the FK insert blow up with a 500.
  const service = await getActiveServiceBySlug(data.service);
  if (!service) {
    throw ServiceError.badRequest(
      "Selected service is not available. Please reload and choose again.",
      { service: data.service }
    );
  }

  const leadScore = calculateLeadScore(data);
  const adminEmail = getAdminEmail();

  const [booking] = await db.$transaction([
    db.booking.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        service: data.service,
        serviceId: service.id,
        location: data.location,
        description: data.description,
        meetingDate: data.meetingDate ? new Date(data.meetingDate) : null,
        budget: data.budget ?? null,
        // Convert whole-Rand inputs to cents for the structured columns.
        // Both columns stay null when the client sends neither.
        budgetMinCents: data.budgetMinRand != null ? BigInt(data.budgetMinRand) * 100n : null,
        budgetMaxCents: data.budgetMaxRand != null ? BigInt(data.budgetMaxRand) * 100n : null,
        budgetCurrency: data.budgetCurrency ?? "ZAR",
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
          phone: data.phone,
          service: data.service,
          serviceId: service.id,
          location: data.location,
          description: data.description,
          meetingDate: data.meetingDate ? new Date(data.meetingDate) : null,
          budget: data.budget ?? null,
          budgetMinCents: data.budgetMinRand != null ? BigInt(data.budgetMinRand) * 100n : null,
          budgetMaxCents: data.budgetMaxRand != null ? BigInt(data.budgetMaxRand) * 100n : null,
          budgetCurrency: data.budgetCurrency ?? "ZAR",
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
      tx.notification.create({
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
  });

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
