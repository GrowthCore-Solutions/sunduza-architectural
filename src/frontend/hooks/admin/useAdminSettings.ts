"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/frontend/lib/api-client";
import type { SettingRow } from "@/shared/types/db";
import type { ApiSuccess } from "@/frontend/lib/api-types";

export function useAdminSettings() {
  return useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async ({ signal }) => {
      const res = await api.get<ApiSuccess<SettingRow[]>>("/api/admin/settings", { signal });
      return res.data;
    },
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      api.patch<ApiSuccess<SettingRow>>("/api/admin/settings", { key, value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
  });
}
