import "server-only";

import type { BookingInput } from "@/shared/types/booking";

const SIGNALS = {
  hasBudget: 20,
  largeBudget: 20,
  hasMeetingDate: 15,
  longDescription: 10,
  devProjectService: 15,
  hasUtmSource: 10,
  mobilePhone: 10,
} as const;

export function calculateLeadScore(data: BookingInput): number {
  let score = 0;

  if (data.budget) {
    score += SIGNALS.hasBudget;
    const amount = parseInt(data.budget.replace(/\D/g, ""), 10);
    if (!isNaN(amount) && amount >= 500_000) score += SIGNALS.largeBudget;
  }

  if (data.meetingDate) score += SIGNALS.hasMeetingDate;
  if (data.description.length >= 100) score += SIGNALS.longDescription;
  if (data.service === "dev_project_planning") score += SIGNALS.devProjectService;
  if (data.utmSource) score += SIGNALS.hasUtmSource;
  if (/^(\+27|0)[6-8][0-9]{8}$/.test(data.phone)) score += SIGNALS.mobilePhone;

  return Math.min(score, 100);
}
