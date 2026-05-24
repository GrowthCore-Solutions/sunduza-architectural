"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/frontend/lib/api-client";
import type { ApiSuccess } from "@/frontend/lib/api-types";
import type { ServiceRow } from "@/shared/types/db";

export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: async ({ signal }) => {
      const res = await api.get<ApiSuccess<ServiceRow[]>>("/api/services", { signal });
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
