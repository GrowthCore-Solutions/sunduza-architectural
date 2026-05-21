"use client";

import * as React from "react";
import { useAdminSettings, useUpdateSetting } from "@/src/client/hooks/admin/useAdminSettings";
import { Button } from "@/src/client/components/ui/button";
import { Input } from "@/src/client/components/ui/input";

export function AdminSettingsPage() {
  const { data: settings, isLoading } = useAdminSettings();
  const updateSetting = useUpdateSetting();
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [savedKey, setSavedKey] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (settings) {
      const map: Record<string, string> = {};
      for (const s of settings) map[s.key] = s.value;
      setValues(map);
    }
  }, [settings]);

  async function save(key: string) {
    await updateSetting.mutateAsync({ key, value: values[key] ?? "" });
    setSavedKey(key);
    setTimeout(() => setSavedKey(null), 2000);
  }

  if (isLoading) return <p className="text-[--color-muted]">Loading…</p>;

  return (
    <div>
      <h1 className="font-serif text-2xl font-black mb-6">Settings</h1>
      <div className="space-y-4 max-w-lg">
        {settings?.map((setting) => (
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
              <Button
                size="sm"
                onClick={() => save(setting.key)}
                disabled={updateSetting.isPending}
              >
                {savedKey === setting.key ? "Saved" : "Save"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
