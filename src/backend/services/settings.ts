import "server-only";

import { AuditAction } from "@prisma/client";
import { db } from "@/backend/lib/db";
import { settingRowSelect, type SettingRow } from "@/shared/types/db";
import { writeAuditLog } from "@/backend/services/audit";
import { CONTACT } from "@/shared/constants/contact";

const PUBLIC_SETTING_KEYS = [
  "business_address",
  "business_phone",
  "contact_email",
  "whatsapp_number",
  "hero_tagline",
  "projects_completed",
  "years_experience",
] as const;

export type PublicSiteSettings = {
  address: string;
  phone: string;
  phoneE164: string;
  email: string;
  whatsappNumber: string;
  heroTagline: string | null;
  projectsCompleted: string | null;
  yearsExperience: string | null;
};

const FALLBACK_PUBLIC_SETTINGS: PublicSiteSettings = {
  address: CONTACT.LOCATION,
  phone: CONTACT.PHONE_DISPLAY,
  phoneE164: CONTACT.PHONE_E164,
  email: CONTACT.EMAIL,
  whatsappNumber: CONTACT.WHATSAPP_NUMBER,
  heroTagline: null,
  projectsCompleted: null,
  yearsExperience: null,
};

/**
 * Batches the SiteSettings rows every public page needs (contact details,
 * marketing stats) into one query, falling back to the CONTACT constants
 * when a row is missing. This is the single source of truth admin edits in
 * /admin/settings actually flow through — pages must not read CONTACT.* or
 * hardcoded stats directly for values that have a settings row.
 *
 * Never throws: several public pages call this during static generation
 * (`next build`), including in CI where there is no reachable database —
 * a connection failure must degrade to the CONTACT-constant fallback, not
 * fail the build (matches the resilience `deployment.md` already promises:
 * "missing DB logs warnings but build can complete").
 */
export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  try {
    const rows = await db.siteSettings.findMany({
      where: { key: { in: [...PUBLIC_SETTING_KEYS] } },
      select: { key: true, value: true },
    });
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));

    const phone = map.business_phone ?? CONTACT.PHONE_DISPLAY;

    return {
      address: map.business_address ?? CONTACT.LOCATION,
      phone,
      phoneE164: phone.replace(/[^\d+]/g, ""),
      email: map.contact_email ?? CONTACT.EMAIL,
      whatsappNumber: map.whatsapp_number ?? CONTACT.WHATSAPP_NUMBER,
      heroTagline: map.hero_tagline ?? null,
      projectsCompleted: map.projects_completed ?? null,
      yearsExperience: map.years_experience ?? null,
    };
  } catch (err) {
    console.error("[settings] Failed to load public site settings, using fallback:", err);
    return FALLBACK_PUBLIC_SETTINGS;
  }
}

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
