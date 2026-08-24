import "server-only";

import { AuditAction } from "@prisma/client";
import type { SettingRow } from "@/shared/types/db";
import { siteSettingsRepository } from "@/backend/repositories/site-settings.repository";
import { writeAuditLog } from "@/backend/services/audit";
import { CONTACT } from "@/shared/constants/contact";

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
 * marketing stats), falling back to the CONTACT constants when a row is
 * missing. This is the single source of truth admin edits in
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
    const rows = await siteSettingsRepository.findMany();
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
