"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface AdminProject {
  id: string;
  title: string;
  description: string;
  imagePath: string;
  category: string | null;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
}

async function fetchProjects(): Promise<{ projects: AdminProject[]; total: number }> {
  const res = await fetch("/api/v1/admin/projects");
  const json = await res.json();
  if (!json.success || !json.data) throw new Error(json.error?.message ?? "Failed to load projects");
  return json.data;
}

export function useAdminProjects() {
  return useQuery({ queryKey: ["admin", "projects"], queryFn: fetchProjects });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<AdminProject, "id" | "createdAt">) => {
      const res = await fetch("/api/v1/admin/projects", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "Create failed");
      return json.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "projects"] }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<AdminProject> & { id: string }) => {
      const res = await fetch(`/api/v1/admin/projects/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "Update failed");
      return json.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "projects"] }),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/v1/admin/projects/${id}`, { method: "DELETE" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "projects"] }),
  });
}
