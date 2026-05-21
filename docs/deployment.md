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

`vercel.json` runs `/api/internal/notify` every 5 minutes. Set `CRON_SECRET` and configure Vercel to send `Authorization: Bearer <CRON_SECRET>` on cron invocations (or use Vercel cron headers per your plan).

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
