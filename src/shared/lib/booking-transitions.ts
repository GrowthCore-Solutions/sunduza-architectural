// Booking lifecycle state machine — single source of truth.
//
// Pure data + pure functions. No I/O, no server-only imports. Safe to import
// from both server services and client components. The admin UI uses this to
// render available "Move to" buttons; the booking service uses it to reject
// invalid status transitions at write time.
//
// Lifecycle: PENDING → CONTACTED → CONFIRMED → COMPLETED | REJECTED
// Terminal states (COMPLETED, REJECTED) accept no further transitions.

import { BookingStatus } from "@prisma/client";

const VALID_TRANSITIONS: Record<BookingStatus, readonly BookingStatus[]> = {
  PENDING: ["CONTACTED", "REJECTED"],
  CONTACTED: ["CONFIRMED", "REJECTED"],
  CONFIRMED: ["COMPLETED", "REJECTED"],
  COMPLETED: [],
  REJECTED: [],
};

/** True when `next` is a permitted transition from `current`. */
export function canTransition(current: BookingStatus, next: BookingStatus): boolean {
  return VALID_TRANSITIONS[current].includes(next);
}

/** Statuses that `current` is allowed to move to. Empty array for terminal states. */
export function validNextStatuses(current: BookingStatus): readonly BookingStatus[] {
  return VALID_TRANSITIONS[current];
}
