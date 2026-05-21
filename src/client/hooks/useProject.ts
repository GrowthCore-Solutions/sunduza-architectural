"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { ProjectRow } from "@/types/db";
import { unwrapApiData, type ApiSuccess } from "@/src/client/lib/api-types";

export function useProject(id: string) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const res = await api.get<ApiSuccess<{ project: ProjectRow }>>(`/api/projects/${id}`);
      return unwrapApiData(res).project;
    },
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
}
