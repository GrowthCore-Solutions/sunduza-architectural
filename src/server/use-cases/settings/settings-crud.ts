import "server-only";
import { AuditAction } from "@prisma/client";
import { db } from "@/lib/db";
import { buildAuditLogCreate } from "@/src/server/repositories/audit.repository";

export async function getSettings() {
  return db.siteSettings.findMany({
    orderBy: { key: "asc" },
    select: { id: true, key: true, value: true, description: true, updatedAt: true },
  });
}

export async function updateSetting(key: string, value: string, adminUserId: string) {
  const existing = await db.siteSettings.findUnique({ where: { key }, select: { value: true } });

  const [setting] = await db.$transaction([
    db.siteSettings.update({
      where: { key },
      data: { value, updatedBy: adminUserId },
      select: { id: true, key: true, value: true, updatedAt: true },
    }),
    buildAuditLogCreate({
      action: AuditAction.SETTINGS_UPDATE,
      entityType: "SiteSettings",
      entityId: key,
      userId: adminUserId,
      metadata: { key, oldValue: existing?.value, newValue: value },
    }),
  ]);
  return setting;
}
