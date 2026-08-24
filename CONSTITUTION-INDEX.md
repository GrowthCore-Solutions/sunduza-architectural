# Project Index — Sunduza Architectural & Projects

A fast orientation for anyone (human or AI) starting a session in this repo.
Keep it current; a stale index is worse than none.

| Attribute | Value |
|-----------|-------|
| System | Sunduza Architectural & Projects |
| Client | Xivutiso Kevin Sunduza |
| Stack | Next.js 16 (App Router), React 19, TypeScript, PostgreSQL/Prisma |
| Phase | **v1 complete on `Dev`** — release-readiness & hardening |
| Branch model | feature branches → `Dev`; release PRs `Dev` → `main` |
| Operating mode | Solo, single-admin system |

## Read first

| File | Why |
|------|-----|
| [docs/README.md](./docs/README.md) | Map of all documentation |
| [docs/governance/SYSTEM_CONTEXT.md](./docs/governance/SYSTEM_CONTEXT.md) | Why the system exists; POPIA constraints; launch criteria |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Current layout, auth model, request flow (with diagrams) |
| [docs/design/DATA_ACCESS.md](./docs/design/DATA_ACCESS.md) | The layering rule: only repositories touch Prisma |
| [docs/design/LOCKED_DESIGN.md](./docs/design/LOCKED_DESIGN.md) | Product authority (historical spec; see v1 reality notes) |
| [AGENTS.md](./AGENTS.md) | Next.js 16 breaking-change note — read before writing code |

## Current architecture

```
app/                 Routes — public, /admin/*, /api/*
src/
  frontend/          Browser only — components, hooks, stores
  backend/
    lib/             db, auth, csrf, rate-limit, email, env
    services/        Business logic (validation, scoring, transitions, audit)
    repositories/    The only layer that imports the Prisma client
  shared/            types · zod schemas · constants · pure lib
prisma/              schema, migrations, seed.ts
tests/               Vitest (unit) + Playwright (e2e)
proxy.ts             Admin cookie guard + API CSRF origin check
```

## Status — what's done (v1)

- Public site (home, services, projects, testimonials, booking, contact, privacy) + SEO.
- Admin console (auth with lockout, dashboard, projects, bookings, messages, leads, testimonials, settings).
- Lead capture with POPIA consent, lead scoring, UTM attribution, idempotency, rate limiting.
- Append-only audit log; notification outbox (delivery worker is v2).
- **Hardening pass:** repository layer enforcing the data-access boundary; repo hygiene; full documentation overhaul with diagrams.

## Auth model (important)

Sessions are **JWT** (Auth.js v5 Credentials provider cannot use database
sessions). The `sessions`/`accounts` tables remain as adapter scaffolding for
future OAuth. Any older doc that says "database sessions, never JWT" predates
PR #60 — see [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

## Open items (v2 / founder input)

| Item | Type |
|------|------|
| Notification delivery worker (drain the outbox via Resend) | Feature (v2) |
| API versioning under `/api/v1/*` (only health is versioned today) | Decision |
| CI pipeline | DevOps |
| GA4 property + real testimonial content | Content/config |
| Image hosting strategy (local vs CDN) | Content |

> Update this file when the architecture or status materially changes.
