"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { TestimonialRow } from "@/types/db";
import { unwrapApiData, type ApiSuccess } from "@/src/client/lib/api-types";

type TestimonialsResponse = { testimonials: TestimonialRow[]; total: number };

export function useTestimonials() {
  return useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const res = await api.get<ApiSuccess<TestimonialsResponse>>("/api/testimonials");
      return unwrapApiData(res).testimonials;
    },
    staleTime: 5 * 60 * 1000,
  });
}
