"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/frontend/lib/api-client";
import type { TestimonialRow } from "@/shared/types/db";
import { unwrapApiData, type ApiSuccess } from "@/frontend/lib/api-types";

type TestimonialsResponse = { testimonials: TestimonialRow[]; total: number };

export function useTestimonials() {
  return useQuery({
    queryKey: ["testimonials"],
    queryFn: async ({ signal }) => {
      const res = await api.get<ApiSuccess<TestimonialsResponse>>("/api/testimonials", { signal });
      return unwrapApiData(res).testimonials;
    },
    staleTime: 5 * 60 * 1000,
  });
}
