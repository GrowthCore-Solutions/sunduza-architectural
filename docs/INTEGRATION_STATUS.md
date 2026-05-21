# Dev branch — integration status

Last checked: **21 May 2026** on `Dev` (through PR #17).

## Automated checks (local)

These were run after pulling the latest `Dev`:

| Check | Result |
|-------|--------|
| `npm run test` | Passed — 6 unit tests |
| `npm run build` | Passed |
| `npm run lint` | Passed with warnings only (no errors) |

If `DATABASE_URL` is missing at build time, Prisma may log warnings during static generation. The build still completes. That is expected without a local `.env.local`.

## What is already on Dev

| PR | What it delivered |
|----|-------------------|
| #13 | Backend foundations — service layer, APIs, audit log, notifications |
| #14 | Public website |
| #15 | Admin dashboard |
| #16 | Email worker, rate limits, deployment docs |
| #17 | Tests, SEO metadata, optional Sentry |

## What you should test manually

Use a machine with `.env.local` pointed at PostgreSQL:

1. Run `npm run dev` and open each public page — content should load, not a blank shell.
2. Submit the contact form and confirm a row appears in the database (and a notification if Sprint 3 env is set).
3. Submit a booking and confirm lead score, notification, and audit log are written.
4. Log into admin and walk through bookings, projects, testimonials, messages, and settings.
5. Change the WhatsApp number in settings and confirm it updates on the public site.
6. If Resend and `CRON_SECRET` are configured, confirm the cron job sends email and marks notifications as sent.
7. If Upstash is configured, confirm rate limiting still works after a restart or cold start.
8. Call `GET /api/v1/health` and expect a healthy database response.

## Still to do before production

These need a staging or preview environment:

- Full pass through [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)
- Playwright e2e tests with the dev server running
- Lighthouse score on the homepage (target 85+)
- A test error in Sentry if you enable monitoring

## Recommended next steps

1. Deploy a Vercel preview from `Dev` — see `docs/deployment.md`.
2. Work through the staging checks above.
3. Add more tests or CI later if you want extra confidence.
4. Open a `Dev` → `main` release PR when you are happy with staging. `main` has not been updated for this work yet.
