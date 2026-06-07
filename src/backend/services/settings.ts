import "server-only";

import { AuditAction } from "@prisma/client";
import type { SettingRow } from "@/shared/types/db";
import { siteSettingsRepository } from "@/backend/repositories/site-settings.repository";
import { writeAuditLog } from "@/backend/services/audit";

export function getSettings(): Promise<SettingRow[]> {
  return siteSettingsRepository.findMany();
}

export function getSetting(key: string): Promise<string | null> {
  return siteSettingsRepository.findValueByKey(key);
}

export async function updateSetting(
  key: string,
  value: string,
  context: { userId: string }
): Promise<SettingRow | null> {
  if (!(await siteSettingsRepository.exists(key))) return null;

  const updated = await siteSettingsRepository.update(key, {
    value,
    updatedBy: context.userId,
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
