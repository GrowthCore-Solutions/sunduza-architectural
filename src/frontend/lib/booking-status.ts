import { BookingStatus } from "@prisma/client";

const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ["CONTACTED", "REJECTED"],
  CONTACTED: ["CONFIRMED", "REJECTED"],
  CONFIRMED: ["COMPLETED", "REJECTED"],
  COMPLETED: [],
  REJECTED: [],
};

export function validNextStatuses(current: BookingStatus): BookingStatus[] {
  return VALID_TRANSITIONS[current];
}

export function leadScoreColor(score: number | null): string {
  if (score === null) return "bg-gray-200 text-gray-700";
  if (score <= 40) return "bg-red-100 text-red-800";
  if (score <= 70) return "bg-amber-100 text-amber-800";
  return "bg-green-100 text-green-800";
}
