import "server-only";

import type { AuditAction, Prisma } from "@prisma/client";
import {
  auditLogsRepository,
  type AuditLogRow,
} from "@/backend/repositories/audit-logs.repository";
import { pageMeta, pageOffset } from "@/shared/lib/pagination";

export type { AuditLogRow };

export interface WriteAuditLogParams {
  action: AuditAction;
  entityType: string;
  entityId: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Prisma.InputJsonValue;
}

/**
 * Fire-and-forget audit write. A failure here must never break the user
 * operation that triggered it, so the error is swallowed after logging.
 */
export async function writeAuditLog(params: WriteAuditLogParams): Promise<void> {
  try {
    await auditLogsRepository.create(params);
  } catch (err) {
    console.error("[audit] Failed to write audit log:", { params, err });
  }
}

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

  const where: Prisma.AuditLogWhereInput = {
    ...(opts.action && { action: opts.action }),
    ...(opts.entityType && { entityType: opts.entityType }),
  };

  const { rows, total } = await auditLogsRepository.findPage({
    where,
    skip: pageOffset(page, limit),
    take: limit,
  });

  return { entries: rows, ...pageMeta(total, page, limit) };
}
