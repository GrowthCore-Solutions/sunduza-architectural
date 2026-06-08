# Sunduza Architectural & Projects

**Sunduza Architectural & Projects (Pty) Ltd** — Professional house planning, architectural drawings, drafting services, and development projects across South Africa.

---

## What This Is

A full-stack lead-generation site for Sunduza Architectural:

- **Public** — services, portfolio, testimonials, contact, consultation booking (POPIA-aware)
- **Admin** — single-owner dashboard: bookings pipeline, projects, testimonials, messages, site settings

**Integration branch:** `Dev` (Sprints 0–4 merged). **`main`** is updated only via release PRs when staging is verified.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| Language | TypeScript (strict) |
| Database | PostgreSQL via Prisma 5 |
| Auth | NextAuth v5 — **JWT sessions** (Credentials provider) |
| Client data | TanStack Query, Zustand (admin UI) |
| Forms | react-hook-form + Zod |
| Email | Resend (Sprint 3 worker) |
| Rate limiting | Upstash Redis (in-memory fallback in dev) |
| Tests | Vitest + Playwright |
| Monitoring | Sentry (optional, env-gated) |

---

## Project Layout

```
app/              Next.js routes (public, admin, API)
src/frontend/     Browser UI, hooks, stores
src/backend/      lib (db, auth, …) · services · repositories
src/shared/       Zod schemas, types, constants, pure lib
prisma/           Schema, migrations, seed.ts
tests/            Unit + E2E
docs/             Setup, deploy, architecture, design specs (see docs/README.md)
```

---

## Public Routes

| Route | Purpose |
|-------|---------|
| `/` | Homepage |
| `/services` | Four services |
| `/projects`, `/projects/[id]` | Portfolio |
| `/testimonials` | Client reviews |
| `/contact` | Contact form → `POST /api/contact` |
| `/booking` | Consultation booking → `POST /api/bookings` |
| `/privacy` | POPIA privacy policy |

## Admin Routes

| Route | Purpose |
|-------|---------|
| `/admin/login` | Credentials sign-in |
| `/admin` | Dashboard |
| `/admin/bookings` | Pipeline + status state machine |
| `/admin/projects` | CRUD + featured |
| `/admin/testimonials` | CRUD + `isActive` |
| `/admin/messages` | Inbox |
| `/admin/settings` | Site settings (e.g. WhatsApp) |

## API (high level)

| Route | Notes |
|-------|--------|
| `/api/v1/health` | Canonical health check |
| `/api/bookings`, `/api/contact` | Public lead capture |
| `/api/projects`, `/api/testimonials` | Public read; admin mutations when session present |
| `/api/admin/*` | Protected admin APIs |
| `/api/internal/notify` | Cron worker (Resend) — `CRON_SECRET` |

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in **required** values:

- `DATABASE_URL` — PostgreSQL (local or Neon)
- `AUTH_SECRET` or `NEXTAUTH_SECRET` — random string, 32+ characters ([Auth.js requires this](https://errors.authjs.dev#missingsecret))
- `NEXTAUTH_URL` — `http://localhost:3000` locally
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` — for `npm run db:seed`

Full walkthrough: **`docs/LOCAL_SETUP.md`**.

Optional: `RESEND_*`, `CRON_SECRET`, `UPSTASH_*`, `SENTRY_DSN`.

---

## Getting Started

```bash
npm install
# Create .env.local first — see docs/LOCAL_SETUP.md
npx prisma generate
npx prisma migrate dev
npm run db:seed
npm run dev
```

Restart `npm run dev` after changing `.env.local`.

**Scripts:**

```bash
npm run build
npm run test              # Vitest unit tests
npm run test:e2e          # Playwright (dev server must be running)
npm run lint
```

**Admin (dev seed):** see `prisma/seed.ts` for credentials.

**Production first deploy:** `docs/deployment.md` and `npx tsx prisma/seed.prod.ts`.

---

## Documentation

All maintained docs are under **`docs/`** — see [docs/README.md](docs/README.md).

| Doc | Use |
|-----|-----|
| [docs/LOCAL_SETUP.md](docs/LOCAL_SETUP.md) | Environment and database setup |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Current layout, auth, `proxy.ts` |
| [docs/deployment.md](docs/deployment.md) | Vercel + Neon/Railway + cron |
| [docs/PRODUCTION_CHECKLIST.md](docs/PRODUCTION_CHECKLIST.md) | Pre–go-live checklist |
| [docs/design/ERD.md](docs/design/ERD.md) | Data model — mermaid ERD |
| [docs/design/DATA_ACCESS.md](docs/design/DATA_ACCESS.md) | Layering: UI → API → service → repository → DB |
| [docs/requirements/](docs/requirements/) | Functional & non-functional requirements |
| [docs/design/LOCKED_DESIGN.md](docs/design/LOCKED_DESIGN.md) | Product authority (historical spec) |
| `CONSTITUTION-INDEX.md` | Session orientation |

---

## Contact

**Xivutiso Kevin Sunduza**

- Phone: +27 78 672 3364
- Email: xivutisokevinsunduza@gmail.com
- Location: South Africa

---

*Design & Build by GrowthCore-Solutions*
