"use client";

import * as React from "react";
import { Save, Check } from "lucide-react";
import { Button } from "@/src/client/components/ui/button";
import { Input } from "@/src/client/components/ui/input";
import { Skeleton } from "@/src/client/components/ui/skeleton";
import { useAdminSettings, useUpdateSetting, type SiteSetting } from "@/src/client/hooks/use-admin-settings";

const SETTING_LABELS: Record<string, string> = {
  whatsapp_number: "WhatsApp Number",
  contact_email: "Contact Email",
  business_phone: "Business Phone",
  business_address: "Business Address",
  hero_tagline: "Hero Tagline",
  years_experience: "Years of Experience",
  projects_completed: "Projects Completed",
};

function SettingRow({ setting }: { setting: SiteSetting }) {
  const [value, setValue] = React.useState(setting.value);
  const [saved, setSaved] = React.useState(false);
  const update = useUpdateSetting();
  const isDirty = value !== setting.value;

  async function handleSave() {
    await update.mutateAsync({ key: setting.key, value });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="rounded-sm border border-[--color-rule] bg-white p-5">
      <div className="mb-1.5">
        <label htmlFor={setting.key} className="text-sm font-semibold text-[--color-ink]">
          {SETTING_LABELS[setting.key] ?? setting.key}
        </label>
        {setting.description && (
          <p className="text-xs text-[--color-muted] mt-0.5">{setting.description}</p>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          id={setting.key}
          value={value}
          onChange={(e) => { setValue(e.target.value); setSaved(false); }}
          className="font-mono text-sm"
        />
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!isDirty || update.isPending}
          variant={saved ? "outline" : "default"}
          className={saved ? "text-green-600 border-green-600" : ""}
        >
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? "Saved" : "Save"}
        </Button>
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const { data: settings, isLoading } = useAdminSettings();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[--color-ink]">Site Settings</h1>
        <p className="text-[--color-muted] mt-1">
          Changes take effect immediately — no redeployment required.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : (
        <div className="space-y-3 max-w-2xl">
          {(settings ?? []).map((s) => <SettingRow key={s.key} setting={s} />)}
        </div>
      )}
    </div>
  );
}
