"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/frontend/lib/api-client";
import type { ProjectRow } from "@/shared/types/db";
import { unwrapApiData, type ApiSuccess } from "@/frontend/lib/api-types";

export function useProject(id: string) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: async ({ signal }) => {
      const res = await api.get<ApiSuccess<{ project: ProjectRow }>>(`/api/projects/${id}`, { signal });
      return unwrapApiData(res).project;
    },
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
}
