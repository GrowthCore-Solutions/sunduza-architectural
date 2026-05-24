// Lead score classification — shared between server and client.
//
// The CALCULATION lives in src/backend/services/lead-score.ts (server-only,
// runs on booking submission). This file only defines the CLASSIFICATION
// thresholds used to bucket a score into a tone for display. Both the admin
// dashboard and any API response shaper can import this without pulling in
// any server-only code.
//
// Single source of truth — if the thresholds change, change them here and
// every consumer reflects it automatically.

export type LeadTone = "hot" | "warm" | "cold" | "dead";

export const LEAD_SCORE_HOT = 71;
export const LEAD_SCORE_WARM = 41;
export const LEAD_SCORE_MAX = 100;

/** Classify a stored lead score (0–100, or null when not scored) into a tone. */
export function leadTone(score: number | null): LeadTone {
  if (score === null) return "dead";
  if (score >= LEAD_SCORE_HOT) return "hot";
  if (score >= LEAD_SCORE_WARM) return "warm";
  return "cold";
}
