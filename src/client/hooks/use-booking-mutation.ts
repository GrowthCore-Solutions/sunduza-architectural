"use client";

import { useMutation } from "@tanstack/react-query";
import type { CreateBookingInput } from "@/src/shared/schemas/booking.schema";

interface BookingResult {
  id: string;
  status: string;
  leadScore: number;
}

interface BookingResponse {
  success: boolean;
  data?: BookingResult;
  error?: { message: string; code: string };
}

async function submitBooking(input: CreateBookingInput): Promise<BookingResult> {
  const res = await fetch("/api/v1/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const json: BookingResponse = await res.json();

  if (!res.ok || !json.success || !json.data) {
    throw new Error(json.error?.message ?? "Submission failed. Please try again.");
  }

  return json.data;
}

export function useBookingMutation() {
  return useMutation({
    mutationFn: submitBooking,
  });
}
