"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface AdminTestimonial {
  id: string;
  clientName: string;
  review: string;
  rating: number | null;
  isActive: boolean;
  projectId: string | null;
  createdAt: string;
  project: { id: string; title: string } | null;
}

async function fetchTestimonials() {
  const res = await fetch("/api/v1/admin/testimonials");
  const json = await res.json();
  if (!json.success || !json.data) throw new Error("Failed to load testimonials");
  return json.data as { testimonials: AdminTestimonial[]; total: number };
}

export function useAdminTestimonials() {
  return useQuery({ queryKey: ["admin", "testimonials"], queryFn: fetchTestimonials });
}

export function useCreateTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<AdminTestimonial, "id" | "createdAt" | "project">) => {
      const res = await fetch("/api/v1/admin/testimonials", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "Create failed");
      return json.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "testimonials"] }),
  });
}

export function useUpdateTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<AdminTestimonial> & { id: string }) => {
      const res = await fetch(`/api/v1/admin/testimonials/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "Update failed");
      return json.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "testimonials"] }),
  });
}

export function useDeleteTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/v1/admin/testimonials/${id}`, { method: "DELETE" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "testimonials"] }),
  });
}
