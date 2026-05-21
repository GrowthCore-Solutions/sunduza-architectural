"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { ProjectRow } from "@/types/db";
import { unwrapApiData, type ApiSuccess } from "@/src/client/lib/api-types";

type ProjectsResponse = { projects: ProjectRow[]; total: number };

export function useProjects(options?: { featured?: boolean }) {
  return useQuery({
    queryKey: ["projects", options],
    queryFn: async () => {
      const res = await api.get<ApiSuccess<ProjectsResponse>>("/api/projects", {
        params: options?.featured ? { featured: "true" } : undefined,
      });
      return unwrapApiData(res).projects;
    },
    staleTime: 5 * 60 * 1000,
  });
}
