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
          className="rounded-md border border-rule/75 bg-white p-4 shadow-sm shadow-ink/5"
        >
          <p className="text-sm font-semibold text-ink">{setting.key}</p>
          {setting.description && (
            <p className="text-xs text-muted mt-0.5">{setting.description}</p>
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

  if (isLoading) return <p className="text-muted">Loading...</p>;
  if (!settings?.length) return <p className="text-muted">No settings found.</p>;

  const settingsKey = settings.map((s) => `${s.key}:${s.value}`).join("|");

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          Site controls
        </p>
        <h1 className="mt-2 font-serif text-3xl font-black tracking-tight text-ink">
          Settings
        </h1>
      </div>
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
