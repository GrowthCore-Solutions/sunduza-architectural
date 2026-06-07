import "server-only";

import type { BookingRow, LeadRow } from "@/shared/types/db";
import { leadsRepository } from "@/backend/repositories/leads.repository";
import { bookingsRepository } from "@/backend/repositories/bookings.repository";
import type { DbClient } from "@/backend/repositories/types";

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
  tx: DbClient,
  input: { email: string; name: string; phone: string }
): Promise<LeadRow> {
  const now = new Date();

  const existing = await leadsRepository.findByEmail(input.email, tx);
  if (existing) {
    return leadsRepository.touchLastSeen(input.email, now, tx);
  }

  return leadsRepository.create(
    {
      email: input.email,
      name: input.name,
      phone: input.phone,
      firstSeenAt: now,
      lastSeenAt: now,
      bookingCount: 0,
    },
    tx
  );
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

  const { rows, total } = await leadsRepository.findPage({ skip, take: limit });

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
  const lead = await leadsRepository.findById(id);
  if (!lead) return null;

  const bookings = await bookingsRepository.findByLeadId(id);

  return { lead, bookings };
}
