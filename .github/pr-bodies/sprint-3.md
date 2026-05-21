## What this adds

This PR wires up production infrastructure: email notifications, stronger rate limiting, and deployment documentation.

When someone books a consultation or sends a contact message, a row is queued in the database. A scheduled job picks it up and sends the admin an email via Resend. Rate limits use Upstash Redis in production and fall back to in-memory limits locally when Redis is not configured.

## Included work

- Resend integration and email templates
- Internal notify endpoint protected by `CRON_SECRET`
- Vercel cron config (every 5 minutes)
- Upstash rate limiting on auth, booking, and contact routes
- Production seed script and deployment guide
- Updated `.env.example`

## Prerequisites

- #13 on `Dev`
- #14 and #15 recommended before testing deploy-related behaviour

## How to test

1. Run `npm run build`.
2. Submit a booking and a contact message; check that `notifications` rows are created.
3. Call `/api/internal/notify` without the cron secret and expect 401.
4. With Resend and `CRON_SECRET` set, run the worker and confirm the email arrives and `sent_at` is set.
5. With Upstash configured, confirm rate limits still apply after a cold start.

## Environment variables

`RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CRON_SECRET`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

## Merge order

Merge into `Dev` after Sprint 2.
