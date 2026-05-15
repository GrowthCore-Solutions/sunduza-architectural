import "server-only";
import { BookingStatus, AuditAction } from "@prisma/client";
import { db } from "@/lib/db";
import { buildAuditLogCreate } from "@/src/server/repositories/audit.repository";

const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING:   [BookingStatus.CONTACTED, BookingStatus.REJECTED],
  CONTACTED: [BookingStatus.CONFIRMED, BookingStatus.REJECTED],
  CONFIRMED: [BookingStatus.COMPLETED, BookingStatus.REJECTED],
  COMPLETED: [],
  REJECTED:  [],
};

export class InvalidStatusTransitionError extends Error {
  constructor(from: BookingStatus, to: BookingStatus) {
    super(`Cannot move booking from ${from} to ${to}`);
    this.name = "InvalidStatusTransitionError";
  }
}

export interface UpdateBookingStatusInput {
  bookingId: string;
  newStatus: BookingStatus;
  adminNotes?: string;
  adminUserId: string;
}

export async function updateBookingStatus(input: UpdateBookingStatusInput) {
  const booking = await db.booking.findUnique({
    where: { id: input.bookingId },
    select: { id: true, status: true, name: true },
  });

  if (!booking) throw new Error("Booking not found");

  const allowed = VALID_TRANSITIONS[booking.status];
  if (!allowed.includes(input.newStatus)) {
    throw new InvalidStatusTransitionError(booking.status, input.newStatus);
  }

  const [updated] = await db.$transaction([
    db.booking.update({
      where: { id: input.bookingId },
      data: {
        status: input.newStatus,
        ...(input.adminNotes !== undefined && { adminNotes: input.adminNotes }),
      },
      select: { id: true, status: true, adminNotes: true, updatedAt: true },
    }),
    buildAuditLogCreate({
      action: AuditAction.BOOKING_STATUS_UPDATE,
      entityType: "Booking",
      entityId: input.bookingId,
      userId: input.adminUserId,
      metadata: { oldStatus: booking.status, newStatus: input.newStatus, clientName: booking.name },
    }),
  ]);

  return updated;
}
