# Dev branch — integration status

Last checked: **24 August 2026**, on branch `fix/admin-login-and-real-data-wiring` (PR #69).

## Automated checks (local, this session)

| Check | Result |
|-------|--------|
| `npm run test` (unit, Vitest) | Passed — 41 tests |
| `npx playwright test` (e2e) | Passed — 11 tests, against a real local Postgres |
| `npm run build` | Passed |
| `npm run lint` | Passed, no errors |
| `governova enforce .` | 0 blocking violations |
| `npm audit` | 0 vulnerabilities (after regenerating a corrupted lockfile — see PR #69) |

CI now runs all of the above except `governova enforce` (which runs as its own gate) on every pull request — `.github/workflows/ci.yml`. The e2e job provisions a real `postgres:16` service container; it is not a no-database run.

## What was found and fixed this session (see PR #69 for full detail)

- Admin login was completely broken end to end (Credentials + database-session strategy is an unsupported combination in Auth.js v5 — silent bounce, no session ever created). Fixed with a dedicated `/api/auth/login` route.
- `/admin/settings` edits never reached the public site — only `whatsapp_number` was wired. All public pages now read live settings, with `revalidatePath` so edits appear immediately.
- The contact form crashed (500) and silently dropped the message whenever a visitor left the phone field blank — a real Postgres CHECK constraint violation that only a real end-to-end test against a real database could catch. Fixed, and now regression-tested at both the unit and e2e level.
- `package-lock.json` was corrupted (missing `@prisma/engines`, silently breaking `npm ci` on a fresh clone) — regenerated.
- 5 fictional demo projects were duplicating images with real portfolio projects — removed.
- Hero image was fetched twice on every homepage load (two `<Image priority>` elements, CSS-toggled, both byte-identical) — consolidated to one.

## What is already on Dev / this branch

See git log for the full sprint history (PRs #6–#68). This file previously listed PRs #13–#17 from the original Sprint 0–4 build; that work is long since merged and superseded by later hardening (RBAC/CSRF, DB tier work, this session's fixes).

## Still to do before production

These need the founder's own accounts/credentials — fully wired in code, inert until configured:

- **Email notifications**: `RESEND_API_KEY` unset — bookings/contact messages queue in the `notifications` table but nothing sends. See `docs/PRODUCTION_CHECKLIST.md`.
- **Error monitoring**: `SENTRY_DSN` unset — Sentry is fully wired (`instrumentation.ts`, `sentry.*.config.ts`) but inactive.
- **Rate limiting**: `UPSTASH_REDIS_REST_URL`/`_TOKEN` unset — falls back to in-memory, which resets on every deploy/restart.
- **Actual deployment**: nothing has been deployed to Vercel/Neon yet. Everything above is local-dev-verified only.
- **Cron frequency**: currently daily (Hobby plan limit) — worth a Pro upgrade before launch so booking notifications don't sit for up to 24h. See `docs/deployment.md`.

## Recommended next steps

1. Merge PR #69 after review.
2. Get `RESEND_API_KEY`, `SENTRY_DSN`, `UPSTASH_REDIS_REST_URL`/`_TOKEN` from their respective (free-tier) dashboards and set them in Vercel's project env vars.
3. Deploy a Vercel preview, walk `docs/PRODUCTION_CHECKLIST.md` for real on that preview.
4. Open a release PR when the founder is happy with staging.
