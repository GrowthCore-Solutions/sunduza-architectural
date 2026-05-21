"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookingStatus } from "@prisma/client";
import { api, ApiClientError } from "@/lib/api-client";
import type { BookingRow } from "@/types/db";
import type { ApiListSuccess } from "@/src/client/lib/api-types";

export function useAdminBookings(options?: {
  status?: BookingStatus | "all";
  page?: number;
}) {
  const status = options?.status;
  const page = options?.page ?? 1;

  return useQuery({
    queryKey: ["admin", "bookings", { status, page }],
    queryFn: async () => {
      const params: Record<string, string> = { page: String(page), limit: "20" };
      if (status && status !== "all") params.status = status;

      const res = await api.get<ApiListSuccess<BookingRow>>("/api/admin/bookings", { params });
      return {
        bookings: res.data,
        total: res.count,
        page: res.page,
        totalPages: res.totalPages,
      };
    },
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      adminNotes,
    }: {
      id: string;
      status?: BookingStatus;
      adminNotes?: string;
    }) => {
      return api.patch<{ success: true; data: BookingRow }>("/api/admin/bookings", {
        id,
        status,
        adminNotes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
    },
    onError: (err) => {
      if (err instanceof ApiClientError) throw err;
      throw new ApiClientError("Update failed", "INTERNAL_ERROR", 500);
    },
  });
}
