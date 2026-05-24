// Presentation mapping for booking status — single source of truth for the
// admin UI. Pure data, no logic. Lives in the frontend layer because the
// "tone" vocabulary (warning / info / success / danger / neutral) is a UI
// concept consumed by the data-tone CSS attribute. The state machine itself
// (allowed transitions) lives in src/shared/lib/booking-transitions.ts.

import { BookingStatus } from "@prisma/client";

export type DisplayTone = "warning" | "info" | "success" | "danger" | "neutral";

export const BOOKING_STATUS_TONE: Record<BookingStatus, DisplayTone> = {
  PENDING: "warning",
  CONTACTED: "info",
  CONFIRMED: "success",
  COMPLETED: "neutral",
  REJECTED: "danger",
};
