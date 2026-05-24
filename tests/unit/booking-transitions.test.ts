import { describe, it, expect } from "vitest";
import { BookingStatus } from "@prisma/client";
import { canTransition, validNextStatuses } from "@/shared/lib/booking-transitions";

describe("booking transitions", () => {
  it("allows PENDING to CONTACTED", () => {
    expect(canTransition(BookingStatus.PENDING, BookingStatus.CONTACTED)).toBe(true);
  });

  it("blocks COMPLETED to PENDING", () => {
    expect(canTransition(BookingStatus.COMPLETED, BookingStatus.PENDING)).toBe(false);
    expect(validNextStatuses(BookingStatus.COMPLETED)).toEqual([]);
  });
});
