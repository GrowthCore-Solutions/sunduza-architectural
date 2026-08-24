import "server-only";

import { AuditAction, BookingStatus } from "@prisma/client";
import type { z } from "zod";
import { db } from "@/backend/lib/db";
import { getAdminEmail } from "@/backend/lib/env";
import { BookingListQuerySchema, type BookingInput } from "@/shared/types/booking";
import type { BookingConfirm, BookingRow } from "@/shared/types/db";
import { bookingsRepository } from "@/backend/repositories/bookings.repository";
import { notificationsRepository } from "@/backend/repositories/notifications.repository";
import { pageMeta, pageOffset } from "@/shared/lib/pagination";
import { writeAuditLog } from "@/backend/services/audit";
import { calculateLeadScore } from "@/backend/services/lead-score";
import { canTransition, validNextStatuses } from "@/shared/lib/booking-transitions";
import { getActiveServiceBySlug } from "@/backend/services/services";
import { upsertLead } from "@/backend/services/leads";
import { ServiceError } from "@/backend/lib/errors";

type BookingListQuery = z.infer<typeof BookingListQuerySchema>;

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

  // Lead upsert, booking creation and the notification-outbox row share one
  // transaction so the aggregate lead row, the booking row and the admin
  // notification commit together atomically.
  const booking = await db.$transaction(async (tx) => {
    const lead = await upsertLead(tx, {
      email: data.email,
      name: data.name,
      phone: data.phone,
    });

    const created = await bookingsRepository.create(
      {
        leadId: lead.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        service: data.service,
        serviceId: service.id,
        location: data.location,
        description: data.description,
        meetingDate: data.meetingDate ? new Date(data.meetingDate) : null,
        // Legacy free-text snapshot kept verbatim for historical attribution.
        // `||` not `??` - same empty-string-vs-null class of bug as
        // contact.ts's phone field (2026-08-24). No CHECK constraint on
        // this column currently, so it wasn't crashing, but "" and "not
        // provided" should still mean the same thing in the database.
        budget: data.budget || null,
        // Whole-Rand inputs converted to cents for the structured columns.
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
      tx
    );

    // Outbox row for the future notification worker. Payload carries only
    // what the worker needs to compose and send the message — never the
    // full booking row.
    await notificationsRepository.create(
      {
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
      tx
    );

    return created;
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
  const where = query.status ? { status: query.status as BookingStatus } : undefined;

  const { rows, total } = await bookingsRepository.findPage({
    where,
    skip: pageOffset(query.page, query.limit),
    take: query.limit,
  });

  return { bookings: rows, ...pageMeta(total, query.page, query.limit) };
}

export function getBookingById(id: string): Promise<BookingRow | null> {
  return bookingsRepository.findById(id);
}

export async function updateBookingStatus(
  id: string,
  update: { status?: BookingStatus; adminNotes?: string },
  context: { userId: string; ipAddress: string }
): Promise<{ booking: BookingRow; error: null } | { booking: null; error: string }> {
  const current = await bookingsRepository.findStatusById(id);

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

  const updated = await bookingsRepository.update(id, {
    ...(update.status !== undefined && { status: update.status }),
    ...(update.adminNotes !== undefined && { adminNotes: update.adminNotes }),
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
  const existing = await bookingsRepository.findStatusById(id);
  if (!existing) return false;

  await bookingsRepository.softDelete(id);

  await writeAuditLog({
    action: AuditAction.BOOKING_DELETE,
    entityType: "Booking",
    entityId: id,
    userId: context.userId,
    ipAddress: context.ipAddress,
  });

  return true;
}
