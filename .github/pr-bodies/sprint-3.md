## Summary

Implements **Sprint 3 — Notifications and production infrastructure**.

- Upstash Redis rate limiting (in-memory fallback when env unset)
- Resend email helpers (`lib/email.ts`)
- Notification worker: `GET /api/internal/notify` (cron + `CRON_SECRET`)
- `vercel.json` cron (every 5 minutes)
- `prisma/seed.prod.ts`, `docs/deployment.md`, extended `.env.example`

## Depends on

- #13 — Sprint 0
- #14, #15 — Sprints 1–2 merged to `Dev` (recommended before deploy testing)

## Test plan

- [ ] `npm run build` passes
- [ ] `POST /api/bookings` and `POST /api/contact` create `notifications` rows
- [ ] Cron endpoint returns 401 without `Authorization: Bearer <CRON_SECRET>`
- [ ] With Resend configured: cron sets `sent_at` and email is received
- [ ] With Upstash configured: rate limit survives cold start / restart

## Env (preview/production)

`RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CRON_SECRET`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

## Merge note

Merge **after** Sprint 2. Target: **`Dev`**.
