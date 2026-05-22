"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/frontend/lib/api-client";
import type { ProjectRow } from "@/shared/types/db";
import type { ProjectCreateInput, ProjectUpdateInput } from "@/shared/types/project";
import { unwrapApiData, type ApiSuccess } from "@/frontend/lib/api-types";

export function useAdminProjects() {
  return useQuery({
    queryKey: ["admin", "projects"],
    queryFn: async () => {
      const res = await api.get<ApiSuccess<{ projects: ProjectRow[]; total: number }>>(
        "/api/projects"
      );
      return unwrapApiData(res).projects;
    },
  });
}

export function useAdminProjectMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });

  const create = useMutation({
    mutationFn: (data: ProjectCreateInput) =>
      api.post<ApiSuccess<ProjectRow>>("/api/projects", data),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProjectUpdateInput }) =>
      api.patch<ApiSuccess<ProjectRow>>(`/api/projects/${id}`, data),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete<ApiSuccess<{ deleted: boolean }>>(`/api/projects/${id}`),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
