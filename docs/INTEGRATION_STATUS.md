# Dev Integration Status

> Last verified: **2026-05-21** on branch `Dev` (commits through #17).

## Automated checks

| Check | Result | Notes |
|-------|--------|-------|
| `npm run test` | ✅ Pass | 6 unit tests (lead-score, booking-transitions, api-response) |
| `npm run build` | ✅ Pass | TypeScript clean; Prisma warnings if `DATABASE_URL` unset at build time |
| `npm run lint` | ⚠️ Warnings only | 6 warnings (e.g. `<img>` vs `next/image`); 0 errors after settings/input fixes |

## Merged to `Dev`

| PR | Sprint |
|----|--------|
| #13 | Sprint 0 — backend foundations |
| #14 | Sprint 1 — public site |
| #15 | Sprint 2 — admin dashboard |
| #16 | Sprint 3 — notifications + deploy |
| #17 | Sprint 4 — tests, SEO, Sentry |

## Manual checklist (founder / staging)

Run on a machine with `.env.local` pointing at PostgreSQL:

- [ ] `npm run dev` — all public URLs render real content
- [ ] `POST /api/contact` → `contact_messages` + `notifications` + `audit_logs`
- [ ] `POST /api/bookings` → booking + `leadScore` + notification + audit
- [ ] Admin login → bookings status machine → projects/testimonials/messages/settings
- [ ] Settings WhatsApp change reflects on public layout
- [ ] With Resend + `CRON_SECRET`: cron processes outbox → email received
- [ ] With Upstash: rate limits survive cold start
- [ ] `GET /api/v1/health` → `{ status: "ok", database: "connected" }`

## Not yet verified (requires staging env)

- [ ] Production Readiness Checklist — `redesign/SUNDUZA_BUILD_PLAN_v2.md` §14
- [ ] `npm run test:e2e` against running dev server
- [ ] Lighthouse ≥85 homepage
- [ ] Sentry test event in production dashboard

## Next steps

1. Deploy **Vercel preview** from `Dev` — see `docs/deployment.md`
2. Complete §14 checklist on staging
3. Optional hardening PRs: API tests, admin E2E, CI, per-page metadata
4. Open **`Dev` → `main`** release PR when founder approves (not started)
