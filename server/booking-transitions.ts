import "server-only";

import { BookingStatus } from "@prisma/client";

const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ["CONTACTED", "REJECTED"],
  CONTACTED: ["CONFIRMED", "REJECTED"],
  CONFIRMED: ["COMPLETED", "REJECTED"],
  COMPLETED: [],
  REJECTED: [],
};

export function canTransition(current: BookingStatus, next: BookingStatus): boolean {
  return VALID_TRANSITIONS[current].includes(next);
}

export function validNextStatuses(current: BookingStatus): BookingStatus[] {
  return VALID_TRANSITIONS[current];
}
