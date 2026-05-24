"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/frontend/lib/api-client";
import type { BookingRow, LeadRow } from "@/shared/types/db";
import type { ApiListSuccess, ApiSuccess } from "@/frontend/lib/api-types";

export function useAdminLeads(options?: { page?: number }) {
  const page = options?.page ?? 1;

  return useQuery({
    queryKey: ["admin", "leads", { page }],
    queryFn: async ({ signal }) => {
      const res = await api.get<ApiListSuccess<LeadRow>>("/api/admin/leads", {
        params: { page: String(page), limit: "20" },
        signal,
      });
      return {
        leads: res.data,
        total: res.count,
        page: res.page,
        totalPages: res.totalPages,
      };
    },
  });
}

export function useAdminLead(id: string | null) {
  return useQuery({
    queryKey: ["admin", "lead", id],
    enabled: Boolean(id),
    queryFn: async ({ signal }) => {
      const res = await api.get<ApiSuccess<{ lead: LeadRow; bookings: BookingRow[] }>>(
        `/api/admin/leads/${id}`,
        { signal }
      );
      return res.data;
    },
  });
}
