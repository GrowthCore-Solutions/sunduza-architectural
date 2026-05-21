## What this adds

This PR adds automated tests, basic SEO metadata, and optional error monitoring.

Unit tests cover lead scoring, booking status rules, and API response helpers. Playwright checks that key pages load and forms are visible. Open Graph tags are set on the root layout. Sentry only activates when `SENTRY_DSN` is present.

## Included work

- Vitest setup and unit tests
- Playwright config and starter e2e specs
- `npm run test`, `test:watch`, and `test:e2e` scripts
- Root layout Open Graph metadata
- Optional Sentry via `instrumentation.ts` and `next.config`

## Prerequisites

- #13 on `Dev`
- #14, #15, and #16 merged for a meaningful end-to-end surface

## How to test

1. Run `npm run test` and confirm all unit tests pass.
2. Run `npm run build`.
3. With the dev server running, run `npm run test:e2e`.
4. Optionally set `SENTRY_DSN` and confirm errors appear in Sentry.

## Merge order

Merge into `Dev` last, after Sprint 3. You may need to resolve `package.json` or `.env.example` conflicts with Sprint 3.
