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
