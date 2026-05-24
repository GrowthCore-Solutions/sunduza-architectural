import "server-only";

import { db } from "@/backend/lib/db";
import {
  bookingRowSelect,
  leadRowSelect,
  type BookingRow,
  type LeadRow,
} from "@/shared/types/db";

export type { LeadRow };

/**
 * Upsert a lead by email within the caller's transaction client.
 *
 * - First submission: INSERT the lead row.
 * - Repeat submission: UPDATE last_seen_at only (name and phone stay frozen
 *   as the first-contact snapshot). booking_count is handled by the DB
 *   trigger on bookings; we do NOT increment it here to avoid a double-count
 *   on the same transaction flush.
 *
 * Always call this inside db.$transaction so the lead row and the booking
 * row are committed atomically.
 */
export async function upsertLead(
  tx: Parameters<Parameters<typeof db.$transaction>[0]>[0],
  input: { email: string; name: string; phone: string }
): Promise<LeadRow> {
  const now = new Date();

  const existing = await tx.lead.findUnique({
    where: { email: input.email },
    select: leadRowSelect,
  });

  if (existing) {
    return tx.lead.update({
      where: { email: input.email },
      data: { lastSeenAt: now },
      select: leadRowSelect,
    });
  }

  return tx.lead.create({
    data: {
      email: input.email,
      name: input.name,
      phone: input.phone,
      firstSeenAt: now,
      lastSeenAt: now,
      bookingCount: 0,
    },
    select: leadRowSelect,
  });
}

/** Admin: paginated lead list, sorted by most recent activity. */
export async function getLeads(opts: { page?: number; limit?: number } = {}): Promise<{
  leads: LeadRow[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const page = opts.page ?? 1;
  const limit = opts.limit ?? 20;
  const skip = (page - 1) * limit;

  const [rows, total] = await db.$transaction([
    db.lead.findMany({
      skip,
      take: limit,
      orderBy: { lastSeenAt: "desc" },
      select: leadRowSelect,
    }),
    db.lead.count(),
  ]);

  return {
    leads: rows,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

/** Admin: a single lead with its full booking history (most recent first). */
export async function getLeadWithBookings(
  id: string
): Promise<{ lead: LeadRow; bookings: BookingRow[] } | null> {
  const lead = await db.lead.findUnique({
    where: { id },
    select: leadRowSelect,
  });
  if (!lead) return null;

  const bookings = await db.booking.findMany({
    where: { leadId: id },
    orderBy: { createdAt: "desc" },
    select: bookingRowSelect,
  });

  return { lead, bookings };
}
