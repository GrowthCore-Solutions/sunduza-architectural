// Audit-log data access. The write path is fire-and-forget at the service
// layer (an audit failure must never break the user operation), so this module
// just performs the raw inserts and reads.
import "server-only";

import type { AuditAction, Prisma } from "@prisma/client";
import { db } from "@/backend/lib/db";
import type { DbClient } from "@/backend/repositories/types";

export const auditLogRowSelect = {
  id: true,
  action: true,
  entityType: true,
  entityId: true,
  userId: true,
  ipAddress: true,
  metadata: true,
  createdAt: true,
} as const;

export type AuditLogRow = Prisma.AuditLogGetPayload<{ select: typeof auditLogRowSelect }>;

interface AuditLogCreateData {
  action: AuditAction;
  entityType: string;
  entityId: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Prisma.InputJsonValue;
}

export const auditLogsRepository = {
  async create(data: AuditLogCreateData, client: DbClient = db): Promise<void> {
    await client.auditLog.create({ data });
  },

  async findPage(
    opts: { where: Prisma.AuditLogWhereInput; skip: number; take: number },
    client: DbClient = db
  ): Promise<{ rows: AuditLogRow[]; total: number }> {
    const [rows, total] = await Promise.all([
      client.auditLog.findMany({
        where: opts.where,
        skip: opts.skip,
        take: opts.take,
        orderBy: { createdAt: "desc" },
        select: auditLogRowSelect,
      }),
      client.auditLog.count({ where: opts.where }),
    ]);
    return { rows, total };
  },
};
