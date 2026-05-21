# Architecture (current codebase)

Last updated: May 2026. Describes the **implemented** layout on `Dev`, not pre-sprint audit docs.

## Request flow

```
Browser (src/client)
  → fetch /api/* or Server Components
    → app/api/* route handlers
      → server/* (business logic, server-only)
        → lib/db (Prisma) → PostgreSQL
```

Public pages use React Query hooks in `src/client/hooks/`. Admin UI uses the same pattern plus Zustand for shell state.

## Route protection (admin)

**Layer 1 — `proxy.ts` (project root)**  
Next.js 16 uses a root `proxy.ts` export instead of `middleware.ts`. It runs on `/admin/*` (except `/admin/login`) and checks for an Auth.js session cookie (`authjs.session-token` or `__Secure-authjs.session-token`). No database call on this layer.

**Layer 2 — API handlers**  
Every protected route calls `auth()` from `lib/auth.ts`, which loads the **database session** via PrismaAdapter. API routes must not rely on the proxy alone.

## Auth modules

| File | Role |
|------|------|
| `lib/auth.config.ts` | Shared `NextAuthConfig`: `trustHost`, sign-in pages (`/admin/login`) |
| `lib/auth.ts` | Full NextAuth setup: Credentials + stub Google provider, Prisma adapter, database sessions, lockout |
| `lib/load-env.ts` | Loads `.env.local` early when modules evaluate before Next boot |
| `app/api/auth/[...nextauth]/route.ts` | Auth.js HTTP handlers |

Secrets: `AUTH_SECRET` or `NEXTAUTH_SECRET` (either works). Session max age: `SESSION_MAX_AGE_SECONDS`.

## Key directories

```
app/              Routes (public, admin, API)
server/           Business logic (import "server-only")
src/client/       UI, hooks, stores (browser only)
lib/              db, auth, email, rate-limit, load-env
types/            Zod schemas
prisma/           Schema, migrations, seed.ts, seed.prod.ts
tests/            Vitest + Playwright
proxy.ts          Admin route cookie guard (Layer 1)
```

## Environment

See [LOCAL_SETUP.md](./LOCAL_SETUP.md) and `.env.example`. Required locally: `DATABASE_URL`, auth secret, `NEXTAUTH_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (for seed).

Optional: Upstash (rate limits), Resend + `CRON_SECRET` (notify worker), Sentry.

## Health & versioning

- Canonical health: `GET /api/v1/health`
- Most APIs: `/api/*` (not versioned except health)

## Further reading

- Product authority: [design/LOCKED_DESIGN.md](./design/LOCKED_DESIGN.md)
- Deploy: [deployment.md](./deployment.md)
- Go-live: [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)
