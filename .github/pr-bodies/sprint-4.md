## Summary

Implements **Sprint 4 — Tests, SEO, accessibility baseline, monitoring**.

- Vitest unit tests (lead score, booking transitions, API response helpers)
- Playwright e2e specs (homepage, booking/contact forms visible)
- Root layout Open Graph metadata
- Optional Sentry (`instrumentation.ts`, env-gated `next.config`)
- `npm run test`, `test:watch`, `test:e2e` scripts

## Depends on

- #13 — Sprint 0
- #14, #15, #16 — Sprints 1–3 merged to `Dev` (full app surface for e2e)

## Test plan

- [ ] `npm run test` — all unit tests pass
- [ ] `npm run build` passes
- [ ] `npm run test:e2e` (with `npm run dev` + DB)
- [ ] Lighthouse spot-check on `/` and `/booking` (target ≥85 when content stable)
- [ ] Optional: `SENTRY_DSN` set → errors reported in Sentry

## Merge note

Merge **last** (after Sprint 3). May need to resolve `package.json` / `.env.example` with Sprint 3. Target: **`Dev`**.
