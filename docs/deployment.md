# Sunduza — Deployment Guide

> **Status:** Application code for Sprints 0–4 is on `Dev`. Use this guide for staging/preview and production. See `INTEGRATION_STATUS.md` for verification checklist.

## Stack

- **App:** Vercel (Next.js 16)
- **Database:** Neon or Railway PostgreSQL
- **Email:** Resend
- **Rate limiting:** Upstash Redis (optional; falls back to in-memory in dev)

## Environment variables

Copy `.env.example` to Vercel project settings. Required for production:

- `DATABASE_URL`
- `NEXTAUTH_URL` (production domain)
- `NEXTAUTH_SECRET` (32+ chars)
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD` (for initial seed only)
- `CRON_SECRET` (protects `/api/internal/notify`)
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL` (verified sender domain)
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (recommended)

## Database

```bash
npx prisma migrate deploy
npx tsx prisma/seed.prod.ts
```

## Vercel Cron

`vercel.json` runs `/api/internal/notify` once daily (`0 8 * * *`, i.e. 08:00 UTC) — the Hobby plan's cron limit is once per day. A booking or contact message can wait up to ~24h for its admin email under this schedule. If that's too slow for the business (it likely is — the site promises "we respond within one business day"), upgrade to a Vercel Pro plan and tighten the schedule (e.g. `*/15 * * * *` for every 15 minutes). Set `CRON_SECRET` and configure Vercel to send `Authorization: Bearer <CRON_SECRET>` on cron invocations.

## Build

Default build: `npm run build`. Ensure `DATABASE_URL` is set for layout caching; missing DB logs warnings but build can complete.

## Monitoring (optional)

Set `SENTRY_DSN` (and optionally `NEXT_PUBLIC_SENTRY_DSN`) to enable Sentry via `instrumentation.ts`. Omit in local dev if not needed.

## Tests

```bash
npm run test
npm run test:e2e   # requires dev server: npm run dev
```

## Release to `main`

1. Complete [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) on staging (preview or production-like env).
2. Open PR **`Dev` → `main`** only after founder sign-off.
3. Run `prisma migrate deploy` and `seed.prod.ts` on production DB before traffic.

Do not merge to `main` until staging email, auth, and admin walkthrough pass.
