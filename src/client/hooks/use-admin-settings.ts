"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface SiteSetting {
  id: string;
  key: string;
  value: string;
  description: string | null;
  updatedAt: string;
}

export function useAdminSettings() {
  return useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      const res = await fetch("/api/v1/admin/settings");
      const json = await res.json();
      if (!json.success || !json.data) throw new Error("Failed to load settings");
      return json.data.settings as SiteSetting[];
    },
  });
}

export function useUpdateSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const res = await fetch("/api/v1/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "Update failed");
      return json.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "settings"] }),
  });
}
