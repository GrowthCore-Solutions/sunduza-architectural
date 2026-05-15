"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookingStatus } from "@prisma/client";

export interface AdminBooking {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  location: string;
  description: string;
  meetingDate: string | null;
  budget: string | null;
  status: BookingStatus;
  leadScore: number | null;
  adminNotes: string | null;
  consentGiven: boolean;
  utmSource: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BookingsResponse {
  success: boolean;
  data?: { bookings: AdminBooking[]; total: number; page: number; totalPages: number };
  error?: { message: string };
}

async function fetchBookings(params: { status?: string; search?: string; sort?: string; page?: number }) {
  const sp = new URLSearchParams();
  if (params.status && params.status !== "all") sp.set("status", params.status);
  if (params.search) sp.set("search", params.search);
  if (params.sort) sp.set("sort", params.sort);
  if (params.page) sp.set("page", String(params.page));

  const res = await fetch(`/api/v1/admin/bookings?${sp}`);
  const json: BookingsResponse = await res.json();
  if (!json.success || !json.data) throw new Error(json.error?.message ?? "Failed to load bookings");
  return json.data;
}

export function useBookings(params: { status?: string; search?: string; sort?: string; page?: number } = {}) {
  return useQuery({
    queryKey: ["admin", "bookings", params],
    queryFn: () => fetchBookings(params),
  });
}

interface UpdateStatusVars { id: string; status: BookingStatus; adminNotes?: string }

export function useUpdateBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, adminNotes }: UpdateStatusVars) => {
      const res = await fetch(`/api/v1/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "Update failed");
      return json.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "bookings"] }),
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/v1/admin/bookings");
      const json = await res.json();
      if (!json.success || !json.data) throw new Error("Failed to load stats");
      const bookings: AdminBooking[] = json.data.bookings;
      return {
        total: bookings.length,
        pending: bookings.filter((b) => b.status === "PENDING").length,
        contacted: bookings.filter((b) => b.status === "CONTACTED").length,
        confirmed: bookings.filter((b) => b.status === "CONFIRMED").length,
        completed: bookings.filter((b) => b.status === "COMPLETED").length,
        rejected: bookings.filter((b) => b.status === "REJECTED").length,
      };
    },
  });
}
