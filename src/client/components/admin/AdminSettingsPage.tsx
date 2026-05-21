"use client";

import * as React from "react";
import { useAdminSettings, useUpdateSetting } from "@/src/client/hooks/admin/useAdminSettings";
import { Button } from "@/src/client/components/ui/button";
import { Input } from "@/src/client/components/ui/input";

function settingsToMap(settings: { key: string; value: string }[]) {
  return Object.fromEntries(settings.map((s) => [s.key, s.value]));
}

function SettingsFields({
  settings,
  onSave,
  isSaving,
}: {
  settings: { key: string; value: string; description?: string | null }[];
  onSave: (key: string, value: string) => Promise<void>;
  isSaving: boolean;
}) {
  const [values, setValues] = React.useState(() => settingsToMap(settings));
  const [savedKey, setSavedKey] = React.useState<string | null>(null);

  async function save(key: string) {
    await onSave(key, values[key] ?? "");
    setSavedKey(key);
    setTimeout(() => setSavedKey(null), 2000);
  }

  return (
    <div className="space-y-4 max-w-lg">
      {settings.map((setting) => (
        <div
          key={setting.key}
          className="rounded-sm border border-[--color-rule] bg-white p-4"
        >
          <p className="text-sm font-medium text-[--color-ink]">{setting.key}</p>
          {setting.description && (
            <p className="text-xs text-[--color-muted] mt-0.5">{setting.description}</p>
          )}
          <div className="flex gap-2 mt-3">
            <Input
              value={values[setting.key] ?? ""}
              onChange={(e) =>
                setValues((v) => ({ ...v, [setting.key]: e.target.value }))
              }
            />
            <Button size="sm" onClick={() => save(setting.key)} disabled={isSaving}>
              {savedKey === setting.key ? "Saved" : "Save"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminSettingsPage() {
  const { data: settings, isLoading } = useAdminSettings();
  const updateSetting = useUpdateSetting();

  if (isLoading) return <p className="text-[--color-muted]">Loading…</p>;
  if (!settings?.length) return <p className="text-[--color-muted]">No settings found.</p>;

  const settingsKey = settings.map((s) => `${s.key}:${s.value}`).join("|");

  return (
    <div>
      <h1 className="font-serif text-2xl font-black mb-6">Settings</h1>
      <SettingsFields
        key={settingsKey}
        settings={settings}
        onSave={async (key, value) => {
          await updateSetting.mutateAsync({ key, value });
        }}
        isSaving={updateSetting.isPending}
      />
    </div>
  );
}
