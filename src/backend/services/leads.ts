import "server-only";

import { db } from "@/backend/lib/db";

export type LeadRow = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  firstSeenAt: Date;
  lastSeenAt: Date;
  bookingCount: number;
  createdAt: Date;
};

const leadSelect = {
  id: true,
  email: true,
  name: true,
  phone: true,
  firstSeenAt: true,
  lastSeenAt: true,
  bookingCount: true,
  createdAt: true,
} as const;

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
    select: leadSelect,
  });

  if (existing) {
    return tx.lead.update({
      where: { email: input.email },
      data: { lastSeenAt: now },
      select: leadSelect,
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
    select: leadSelect,
  });
}

/** Admin: paginated lead list, sorted by most recent activity. */
export async function getLeads(opts: { page?: number; limit?: number } = {}) {
  const page = opts.page ?? 1;
  const limit = opts.limit ?? 20;
  const skip = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    db.lead.findMany({
      skip,
      take: limit,
      orderBy: { lastSeenAt: "desc" },
      select: leadSelect,
    }),
    db.lead.count(),
  ]);

  return { leads: rows, total, page, totalPages: Math.ceil(total / limit) };
}

/** Admin: all bookings for a single lead. */
export async function getLeadById(id: string): Promise<LeadRow | null> {
  return db.lead.findUnique({ where: { id }, select: leadSelect });
}
