// Lead data access. The aggregate `leads` row is the de-duplicated identity
// behind every booking, keyed by email.
import "server-only";

import { db } from "@/backend/lib/db";
import { leadRowSelect, type LeadRow } from "@/shared/types/db";
import type { DbClient } from "@/backend/repositories/types";

interface LeadCreateData {
  email: string;
  name: string;
  phone: string;
  firstSeenAt: Date;
  lastSeenAt: Date;
  bookingCount: number;
}

export const leadsRepository = {
  findByEmail(email: string, client: DbClient = db): Promise<LeadRow | null> {
    return client.lead.findUnique({ where: { email }, select: leadRowSelect });
  },

  findById(id: string, client: DbClient = db): Promise<LeadRow | null> {
    return client.lead.findUnique({ where: { id }, select: leadRowSelect });
  },

  create(data: LeadCreateData, client: DbClient = db): Promise<LeadRow> {
    return client.lead.create({ data, select: leadRowSelect });
  },

  touchLastSeen(email: string, lastSeenAt: Date, client: DbClient = db): Promise<LeadRow> {
    return client.lead.update({
      where: { email },
      data: { lastSeenAt },
      select: leadRowSelect,
    });
  },

  async findPage(
    opts: { skip: number; take: number },
    client: DbClient = db
  ): Promise<{ rows: LeadRow[]; total: number }> {
    const [rows, total] = await Promise.all([
      client.lead.findMany({
        skip: opts.skip,
        take: opts.take,
        orderBy: { lastSeenAt: "desc" },
        select: leadRowSelect,
      }),
      client.lead.count(),
    ]);
    return { rows, total };
  },
};
