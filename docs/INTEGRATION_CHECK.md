# Integration check (without live database)

Last run: local dev server with `.env.local` present but PostgreSQL credentials not verified.

## Layer status

| Layer | Status | Evidence |
|-------|--------|----------|
| **Frontend (pages)** | OK | `/`, `/services`, `/contact`, `/booking`, `/admin/login` → HTTP 200 |
| **Backend (auth API)** | OK | `GET /api/auth/session` → 200 |
| **Backend (data APIs)** | Blocked on DB | `GET /api/projects` → 500, `GET /api/v1/health` → 503 |
| **Database** | Not connected | Prisma: authentication failed to `localhost` |
| **Frontend ↔ Backend (auth)** | OK | Session endpoint responds; no config error |
| **Frontend ↔ Backend (data)** | Blocked | Home/projects call APIs that require PostgreSQL |
| **Admin login / dashboard** | Blocked on DB | Credentials auth reads `users` table |
| **Unit tests (server logic)** | OK | 6 tests pass (lead score, transitions, api-response) |
| **Production build** | OK | `npm run build` completes |

## What works today (no DB fix)

- Public page shells and layouts render.
- Contact and booking **forms render** (submit will fail until DB works).
- Auth.js configuration loads (no MissingSecret).
- `proxy.ts` protects `/admin/*` routes (session cookie check; Layer 1).

## What needs PostgreSQL

- Featured projects on homepage (`GET /api/projects`).
- Project list/detail, testimonials list.
- `POST /api/contact`, `POST /api/bookings`.
- Admin login and all `/admin/*` data screens.
- Health check reporting `database: connected`.

## Architecture (when DB is connected)

```
Browser (src/client hooks + pages)
    → fetch /api/*
        → app/api route handlers
            → server/* business logic
                → Prisma (lib/db)
                    → PostgreSQL
```

## Quick re-check commands

```bash
npm run test
npm run build
npm run dev
```

Then open:

- http://localhost:3000 — frontend
- http://localhost:3000/api/auth/session — auth backend
- http://localhost:3000/api/v1/health — DB connectivity (needs working `DATABASE_URL`)

When ready for full integration: `npm run db:check` → `npx prisma migrate dev` → `npm run db:seed`.
