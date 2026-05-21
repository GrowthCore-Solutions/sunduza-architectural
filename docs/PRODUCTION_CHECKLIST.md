# Production readiness checklist

Use on staging or a production-like preview **before** merging `Dev` → `main`. See [INTEGRATION_STATUS.md](./INTEGRATION_STATUS.md) for what is already verified locally.

## Security

- [ ] All secrets in hosting env (never committed); `.env.local` gitignored
- [ ] Upstash Redis rate limiting active in production (not in-memory only)
- [ ] `AUTH_SECRET` or `NEXTAUTH_SECRET` — 32+ random characters
- [ ] `BCRYPT_ROUNDS` ≥ 12 in production
- [ ] Admin password changed from dev seed value
- [ ] `CRON_SECRET` set and validated on `/api/internal/notify`
- [ ] Unauthenticated `/admin/*` (except login) redirects via `proxy.ts`; APIs still reject without session

## Data

- [ ] `DATABASE_URL` points to PostgreSQL (Neon/Railway/etc.)
- [ ] `npx prisma migrate deploy` on production database
- [ ] Production admin seeded via `npx tsx prisma/seed.prod.ts`
- [ ] Connection pooling configured for serverless if needed (Neon pooler / PgBouncer)

## Application

- [ ] All public pages render real content
- [ ] All admin sections function (bookings, projects, testimonials, messages, settings)
- [ ] Booking form submits; admin notified (email/cron when configured)
- [ ] Contact form submits; message stored
- [ ] Booking status transitions persist; invalid transitions rejected
- [ ] Admin login and logout work
- [ ] Audit logs written for tracked actions
- [ ] Soft-deleted records not returned in normal queries
- [ ] `GET /api/v1/health` returns healthy database

## Tests & build

- [ ] `npm run test` passes
- [ ] `npm run test:e2e` passes (dev server running)
- [ ] `npm run build` completes without errors
- [ ] `npm run lint` — no errors

## Performance & SEO

- [ ] Pages have titles and meta descriptions where applicable
- [ ] OG metadata present on key pages
- [ ] Images use Next.js `<Image />` with alt text
- [ ] Lighthouse Performance ≥ 85 on homepage (target)
- [ ] Lighthouse Accessibility ≥ 90 (target)

## Legal (POPIA)

- [ ] `/privacy` live and linked from footer
- [ ] Booking consent required; `consentGivenAt` stored
- [ ] Admin can handle contact data erasure requests

## Monitoring

- [ ] `SENTRY_DSN` set if using Sentry
- [ ] Test error visible in Sentry before go-live

## Release

1. Complete this checklist on staging.
2. Open PR **`Dev` → `main`** after founder sign-off.
3. Run `prisma migrate deploy` and `seed.prod.ts` on production before traffic.

Details: [deployment.md](./deployment.md).
