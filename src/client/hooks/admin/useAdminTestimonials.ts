"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { TestimonialRow } from "@/types/db";
import type { TestimonialCreateInput, TestimonialUpdateInput } from "@/types/testimonial";
import { unwrapApiData, type ApiSuccess } from "@/src/client/lib/api-types";

export function useAdminTestimonials() {
  return useQuery({
    queryKey: ["admin", "testimonials"],
    queryFn: async () => {
      const res = await api.get<ApiSuccess<{ testimonials: TestimonialRow[] }>>(
        "/api/testimonials"
      );
      return unwrapApiData(res).testimonials;
    },
  });
}

export function useAdminTestimonialMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "testimonials"] });

  const create = useMutation({
    mutationFn: (data: TestimonialCreateInput) =>
      api.post<ApiSuccess<TestimonialRow>>("/api/testimonials", data),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TestimonialUpdateInput }) =>
      api.patch<ApiSuccess<TestimonialRow>>(`/api/testimonials/${id}`, data),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      api.delete<ApiSuccess<{ deleted: boolean }>>(`/api/testimonials/${id}`),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
