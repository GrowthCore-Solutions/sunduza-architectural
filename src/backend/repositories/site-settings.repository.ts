// Site-settings data access (key/value runtime configuration).
import "server-only";

import { db } from "@/backend/lib/db";
import { settingRowSelect, type SettingRow } from "@/shared/types/db";
import type { DbClient } from "@/backend/repositories/types";

interface SettingUpdateData {
  value: string;
  updatedBy: string;
}

export const siteSettingsRepository = {
  findMany(client: DbClient = db): Promise<SettingRow[]> {
    return client.siteSettings.findMany({ orderBy: { key: "asc" }, select: settingRowSelect });
  },

  async findValueByKey(key: string, client: DbClient = db): Promise<string | null> {
    const row = await client.siteSettings.findUnique({ where: { key }, select: { value: true } });
    return row?.value ?? null;
  },

  async exists(key: string, client: DbClient = db): Promise<boolean> {
    const row = await client.siteSettings.findUnique({ where: { key }, select: { key: true } });
    return row !== null;
  },

  update(key: string, data: SettingUpdateData, client: DbClient = db): Promise<SettingRow> {
    return client.siteSettings.update({ where: { key }, data, select: settingRowSelect });
  },
};
