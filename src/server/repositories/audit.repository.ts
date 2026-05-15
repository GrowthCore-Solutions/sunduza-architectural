import "server-only";
import { AuditAction } from "@prisma/client";
import { db } from "@/lib/db";
import { createId } from "@paralleldrive/cuid2";

interface WriteAuditLogParams {
  action: AuditAction;
  entityType: string;
  entityId: string;
  userId?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
}

// Writes a single audit log row. Call inside a transaction when paired with a business write.
// AuditLog rows are NEVER updated or deleted (S2.62).
export function buildAuditLogCreate(params: WriteAuditLogParams) {
  return db.auditLog.create({
    data: {
      id: createId(),
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      userId: params.userId ?? null,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
      metadata: params.metadata ? (params.metadata as object) : undefined,
    },
    select: { id: true },
  });
}
