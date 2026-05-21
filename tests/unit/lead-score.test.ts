import { describe, it, expect } from "vitest";
import { calculateLeadScore } from "@/server/lead-score";
import type { BookingInput } from "@/types/booking";

const base: BookingInput = {
  name: "Test User",
  email: "test@example.com",
  phone: "0821234567",
  service: "house_planning",
  location: "Johannesburg",
  description: "A".repeat(100),
  consentGiven: true,
};

describe("calculateLeadScore", () => {
  it("scores higher with budget and meeting date", () => {
    const low = calculateLeadScore(base);
    const high = calculateLeadScore({
      ...base,
      budget: "R600,000",
      meetingDate: "2026-06-01",
      utmSource: "google",
      service: "dev_project_planning",
    });
    expect(high).toBeGreaterThan(low);
  });

  it("caps at 100", () => {
    const score = calculateLeadScore({
      ...base,
      budget: "R800,000",
      meetingDate: "2026-06-01",
      utmSource: "ads",
      service: "dev_project_planning",
    });
    expect(score).toBeLessThanOrEqual(100);
  });
});
