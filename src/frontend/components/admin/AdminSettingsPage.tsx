"use client";

import * as React from "react";
import { Check, Settings } from "lucide-react";
import {
  useAdminSettings,
  useUpdateSetting,
} from "@/frontend/hooks/admin/useAdminSettings";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";

type Setting = { key: string; value: string; description?: string | null };

function groupSettings(settings: Setting[]): Record<string, Setting[]> {
  const groups: Record<string, Setting[]> = {};
  for (const s of settings) {
    const group = s.key.includes(".") ? s.key.split(".")[0] : "general";
    if (!groups[group]) groups[group] = [];
    groups[group].push(s);
  }
  return groups;
}

function groupTitle(key: string): string {
  const map: Record<string, string> = {
    site: "Site identity",
    contact: "Contact &amp; channels",
    business: "Business information",
    booking: "Booking pipeline",
    seo: "SEO &amp; metadata",
    general: "General",
  };
  return map[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

function groupSub(key: string): string | null {
  const map: Record<string, string> = {
    site: "How the studio shows up in headers, footers, and titles.",
    contact: "Email, phone, WhatsApp, and other client-facing channels.",
    business: "Legal name, registration, and address details.",
    booking: "Lead scoring thresholds and pipeline behaviour.",
    seo: "Default meta description, social share image, and structured data.",
    general: "Miscellaneous studio configuration.",
  };
  return map[key] ?? null;
}

function SettingRow({
  setting,
  onSave,
  isSaving,
}: {
  setting: Setting;
  onSave: (key: string, value: string) => Promise<void>;
  isSaving: boolean;
}) {
  const [value, setValue] = React.useState(setting.value);
  const [savedAt, setSavedAt] = React.useState<number | null>(null);
  const dirty = value !== setting.value;

  async function save() {
    await onSave(setting.key, value);
    setSavedAt(Date.now());
  }

  React.useEffect(() => {
    if (!savedAt) return;
    const t = setTimeout(() => setSavedAt(null), 2400);
    return () => clearTimeout(t);
  }, [savedAt]);

  const longText = value.length > 80 || /\n/.test(value);

  return (
    <div className="admin-setting-card">
      <div className="admin-setting-card-head">
        <div style={{ minWidth: 0, flex: 1 }}>
          <span className="admin-setting-card-key">{setting.key}</span>
          {setting.description && (
            <p className="admin-setting-card-desc">{setting.description}</p>
          )}
        </div>
        {savedAt && (
          <span className="admin-setting-saved">
            <Check size={11} strokeWidth={2.5} />
            Saved
          </span>
        )}
      </div>

      <div className="admin-setting-card-actions">
        {longText ? (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={3}
            className="flex w-full rounded border border-rule/90 bg-white px-3.5 py-2 text-sm text-ink focus:border-primary focus:outline-none"
          />
        ) : (
          <Input value={value} onChange={(e) => setValue(e.target.value)} />
        )}
        <Button size="sm" onClick={save} disabled={isSaving || !dirty}>
          {isSaving ? "Saving…" : dirty ? "Save" : "Saved"}
        </Button>
      </div>
    </div>
  );
}

export function AdminSettingsPage() {
  const { data: settings, isLoading } = useAdminSettings();
  const updateSetting = useUpdateSetting();

  const grouped = settings ? groupSettings(settings) : {};
  const groups = Object.keys(grouped).sort();

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <p className="admin-page-head-eyebrow">Site controls</p>
          <h1 className="admin-page-head-title">
            Studio<br />
            <em>settings.</em>
          </h1>
          <p className="admin-page-head-sub">
            Configuration that drives the public site &mdash; contact details,
            business info, booking thresholds, and SEO defaults.
          </p>
        </div>
      </header>

      {isLoading && (
        <div className="admin-list-empty">
          <span className="admin-list-empty-icon">
            <Settings size={18} strokeWidth={1.75} />
          </span>
          <p>Loading settings…</p>
        </div>
      )}

      {!isLoading && !settings?.length && (
        <div
          className="admin-list-empty"
          style={{
            background: "#fff",
            border: "1px dashed var(--color-rule)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <span className="admin-list-empty-icon">
            <Settings size={18} strokeWidth={1.75} />
          </span>
          <p>No settings configured yet.</p>
        </div>
      )}

      {groups.map((group) => (
        <section key={group} className="admin-settings-section">
          <h2
            className="admin-settings-section-title"
            dangerouslySetInnerHTML={{ __html: groupTitle(group) }}
          />
          {groupSub(group) && (
            <p className="admin-settings-section-sub">{groupSub(group)}</p>
          )}
          {grouped[group].map((setting) => (
            <SettingRow
              key={setting.key}
              setting={setting}
              onSave={async (key, value) => {
                await updateSetting.mutateAsync({ key, value });
              }}
              isSaving={updateSetting.isPending}
            />
          ))}
        </section>
      ))}
    </div>
  );
}
