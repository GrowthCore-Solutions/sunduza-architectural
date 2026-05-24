import "server-only";

import { AuditAction, Prisma } from "@prisma/client";
import { db } from "@/backend/lib/db";

export interface WriteAuditLogParams {
  action: AuditAction;
  entityType: string;
  entityId: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Prisma.InputJsonValue;
}

export async function writeAuditLog(params: WriteAuditLogParams): Promise<void> {
  try {
    await db.auditLog.create({ data: params });
  } catch (err) {
    console.error("[audit] Failed to write audit log:", { params, err });
  }
}

const auditLogRowSelect = {
  id: true,
  action: true,
  entityType: true,
  entityId: true,
  userId: true,
  ipAddress: true,
  metadata: true,
  createdAt: true,
} as const;

export type AuditLogRow = Prisma.AuditLogGetPayload<{
  select: typeof auditLogRowSelect;
}>;

/**
 * Admin: paginated audit log, newest first. Optional filters by action and
 * entity type cover the common compliance queries ("show every booking
 * deletion last quarter", "every settings change by user X").
 */
export async function getAuditLog(opts: {
  page?: number;
  limit?: number;
  action?: AuditAction;
  entityType?: string;
}): Promise<{
  entries: AuditLogRow[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const page = opts.page ?? 1;
  const limit = opts.limit ?? 50;
  const skip = (page - 1) * limit;

  const where: Prisma.AuditLogWhereInput = {
    ...(opts.action && { action: opts.action }),
    ...(opts.entityType && { entityType: opts.entityType }),
  };

  const [entries, total] = await db.$transaction([
    db.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: auditLogRowSelect,
    }),
    db.auditLog.count({ where }),
  ]);

  return {
    entries,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}
