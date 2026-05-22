import "server-only";

import { AuditAction } from "@prisma/client";
import { db } from "@/backend/lib/db";
import { settingRowSelect, type SettingRow } from "@/shared/types/db";
import { writeAuditLog } from "@/backend/services/audit";

export async function getSettings(): Promise<SettingRow[]> {
  return db.siteSettings.findMany({
    orderBy: { key: "asc" },
    select: settingRowSelect,
  });
}

export async function getSetting(key: string): Promise<string | null> {
  const row = await db.siteSettings.findUnique({
    where: { key },
    select: { value: true },
  });
  return row?.value ?? null;
}

export async function updateSetting(
  key: string,
  value: string,
  context: { userId: string }
): Promise<SettingRow | null> {
  const existing = await db.siteSettings.findUnique({ where: { key } });
  if (!existing) return null;

  const updated = await db.siteSettings.update({
    where: { key },
    data: { value, updatedBy: context.userId },
    select: settingRowSelect,
  });

  await writeAuditLog({
    action: AuditAction.SETTINGS_UPDATE,
    entityType: "SiteSettings",
    entityId: key,
    userId: context.userId,
    metadata: { key, value },
  });

  return updated;
}
