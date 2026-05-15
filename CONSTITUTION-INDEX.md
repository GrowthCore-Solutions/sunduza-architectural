# CONSTITUTION-INDEX — Sunduza Architectural & Projects

> **This file is required in this workspace before any Claude Code (Cursor) build session begins.**
> **Per S10.21 — load this file into Cursor context at the start of every session.**
> **Per S10.23 — update this file at the start of every sprint.**

---

| Attribute        | Value |
|------------------|-------|
| **System**       | Sunduza Architectural & Projects |
| **Client**       | Xivutiso Kevin Sunduza |
| **Stack**        | Next.js (App Router) |
| **Build Phase**  | Phase 1 — Sprint 1 (Foundation) |
| **Active Group** | G1 — Foundation |
| **Operating Mode** | SOLO |
| **Overlay**      | `system-design-template/overlays/solo-dev-overlay.md` |
| **Last Updated** | 2026-05-15 |
| **Sprint**       | Sprint 1 — Foundation: DB, Auth, Infra |

---

## Governance Files (Read Before Every Session)

| File | When |
|------|------|
| `system-design-template/AI-INSTRUCTIONS.md` | Every session — first |
| `system-design-template/system-contexts/sunduza-context.md` | Every build session |
| `system-design-template/overlays/solo-dev-overlay.md` | Every session — operating mode is SOLO |
| **`design-docs/SUNDUZA_LOCKED_DESIGN.md`** | **Every build session — this is the authoritative build reference** |
| `system-design-template/adrs/ADR-005-sunduza-stack.md` | Stack or auth decisions |
| `design-docs/SUNDUZA_PHYSICAL_SCHEMA.md` | Database schema details |
| `design-docs/SUNDUZA_API_DESIGN.md` | API contract details |
| `design-docs/SUNDUZA_COMPONENT_ARCHITECTURE.md` | Component spec details |

---

## Active Feature — Sprint 1

**Feature:** Foundation — Database + Auth + Infrastructure
**Sprint Goal:** All 9 database tables migrated to PostgreSQL, NextAuth v5 with database sessions operational, server-only layer established, security headers configured, Sentry wired.
**Layers in progress:** Interface (types) → Service (repositories/use-cases) → Component → UI
**Branch:** `cursor/database-schema-v2-b55c`

---

## Critical Standards for This System

> Sunduza is a **Next.js** system. Angular standards (`S4.53`, `S4.55`, `S4.30`) do not apply.

### Security — Always Active (C3)

| Standard | What It Governs | Why Critical for Sunduza |
|----------|----------------|--------------------------|
| `S3.1` | One auth strategy per system — stack determines strategy | Stack is Next.js → database sessions only |
| `S3.5` | **NextAuth database sessions — NEVER JWT strategy** | Sessions must be revocable (account lockout, device logout) |
| `S3.6` | No token in localStorage — HttpOnly cookies only | CF-01 if violated |
| `S3.22` | Ownership + role verification on every admin endpoint | Every `/api/admin/*` route |
| `S3.35` | On password change — invalidate ALL sessions | Admin password change must purge session table |

### Database — Always Active (C5)

| Standard | What It Governs | Why Critical for Sunduza |
|----------|----------------|--------------------------|
| `S5.5` | PostgreSQL only in production — never SQLite | Existing SQLite must be replaced in Sprint 1 |
| `S5.8` | **Soft delete only — never hard delete in production** | POPIA erasure handled at app layer, not DB DELETE |
| `S5.9` | Prisma is the primary ORM | All standard CRUD through Prisma |
| `S5.10` | Every table: `id` (cuid), `created_at`, `updated_at`, `deleted_at` | All 9 tables must follow this — audit_logs excepted (no updated_at/deleted_at) |
| `S5.11` | **Explicit `select` on every Prisma query — never `findMany()` without select** | Prevents password hash leaking on User queries |
| `S5.12` | `deleted_at: null` filter on every active-data query | Ghost records break admin counts and public listings |
| `S5.15` | Prisma transactions for multi-step writes | Booking create touches: bookings + audit_logs + notifications (3 tables) |
| `S5.19` | Raw SQL for complex aggregates — UTM attribution, lead score analytics | `prisma.$queryRaw` for GROUP BY + CTEs — not expressible cleanly in Prisma |
| `S5.21` | **Raw SQL always parameterised — never string-interpolated** | SQL injection — CF-06 if violated |

### Backend — Always Active (C2)

| Standard | What It Governs | Why Critical for Sunduza |
|----------|----------------|--------------------------|
| `S2.1` | Business logic in use-case layer only — not in API routes | Lead scoring, status transition validation, UTM capture all in use-cases |
| `S2.7` | **OpenAPI contract before any endpoint code** | All 18 endpoints defined in `design-docs/SUNDUZA_API_DESIGN.md` |
| `S2.19` | Standard response shape `{ success, data?, error? }` | Every API response — already in `lib/api-response.ts` |
| `S2.23` | Zod validation on every API boundary | Booking form: 8 fields. Contact form: 4 fields. All validated. |
| `S2.76` | `/api/v1/` prefix + versioning | All new endpoints under `/api/v1/` — Sprint 1 |

### Frontend — Active from Sprint 2 (C4)

| Standard | What It Governs | Why Critical for Sunduza |
|----------|----------------|--------------------------|
| `S4.2` | **320px mobile-first** | Kevin manages bookings from his phone. SA market is mobile-primary. |
| `S4.10` | Visual regression at 320px, 375px, 390px | Sprint 7 launch gate |
| `S4.11` | Every async state: loading + error + success | All admin pages, booking form, contact form |
| `S4.13` | Tailwind for layout and responsive utilities | All spacing, responsive breakpoints |
| `S4.14` | Custom CSS (`globals.css @theme`) for brand identity | `--color-primary: #b88b4a`, `--font-serif`, `--font-sans` |
| `S4.28` | TanStack Query for all admin server state | Bookings list, projects list, messages list — all cached |
| `S4.29` | Zustand for client state — admin UI only | Status filter, search, modal open/close state |
| `S4.46` | React Hook Form + Zod for all forms | Booking form, contact form, admin project/testimonial forms |
| `S4.69` | **Lighthouse mobile score ≥ 90** (launch gate) | Above constitutional minimum of 80 — Sunduza-specific requirement |
| `S4.79` | Layer build order: Interface → Service → Component → UI | Every feature in every sprint |
| `S4.80` | One commit per layer | Git discipline — Sprint 1 onwards |

### Testing — Active from Sprint 1 (C7)

| Standard | What It Governs | Why Critical for Sunduza |
|----------|----------------|--------------------------|
| `S7.1` | Tests written alongside code — same PR | No deferred test debt |
| `S7.2` | Jest + RTL (unit/integration), Playwright (E2E) | Stack is Next.js |
| `S7.7` | Every use-case function has unit tests | Lead scoring, status transitions, UTM capture |
| `S7.11` | Auth tests: 200, 401, 403 for every protected endpoint | All 12 admin endpoints |
| `S7.25` | Coverage minimum: 70% for Next.js | Sprint 7 gate |

---

## Approved Deviations (ADRs)

| Standard | Deviation | ADR Reference | Approved Alternative | Remediation |
|----------|-----------|---------------|---------------------|-------------|
| `S3.5a` | Current `lib/auth.ts` uses `strategy: 'jwt'` | ADR-005 | `strategy: 'database'` with Session model | **Sprint 1 — required before any protected routes** |
| `S5.5` | Current `prisma/schema.prisma` uses SQLite provider | ADR-005 | PostgreSQL on Neon | **Sprint 1 — before first migration** |

---

## Open Issues — Requires Founder Attention

| Issue | Type | Status | Sprint |
|-------|------|--------|--------|
| `S3.5` violation — `lib/auth.ts` uses JWT strategy | Security — must fix | 🔴 Open | Sprint 1 |
| `S5.5` violation — Prisma schema uses SQLite provider | Database — must fix | 🔴 Open | Sprint 1 |
| `prisma/schema.prisma` — 5-table schema vs 9-table design | Schema gap | 🔴 Open | Sprint 1 |
| `design-docs/` API routes use `/api/*` not `/api/v1/*` | API versioning `S2.76` | 🟡 Decision needed | Sprint 1 |
| Image strategy — `/images/projects/` local path vs Cloudinary | Pending client input | 🟡 Open | Sprint 3 |
| Real testimonials — placeholder text in current seed | Content | 🟡 Open | Sprint 3 |
| Kevin's GA4 property ID — not yet provided | Config | 🟡 Open | Sprint 6 |

---

## Current Sprint — Sprint 1 Commit Log

> Track layer commits for Sprint 1. Update as each layer is committed.

| Layer | Commit Hash | Commit Message | Status |
|-------|-------------|----------------|--------|
| Schema + enums | — | `feat(db): migrate prisma schema to 9-table postgresql design` | ⬜ |
| Seed data | — | `feat(db): update seed for new schema (admin + settings + projects + testimonials)` | ⬜ |
| Repository layer | — | `feat(server): add repository layer for all 9 models` | ⬜ |
| Auth (S3.5 fix) | — | `fix(auth): migrate nextauth to database session strategy` | ⬜ |
| Security headers | — | `feat(server): add security headers middleware` | ⬜ |
| Env validation | — | `feat(infra): add zod env validation` | ⬜ |
| Health endpoint | — | `feat(api): add /api/health endpoint` | ⬜ |
| Tests — Sprint 1 | — | `test(sprint1): unit tests for use-cases and repositories` | ⬜ |

---

## Critical Anti-Patterns for This System

> Sunduza is a **Next.js** system. These are the most dangerous anti-patterns for this stack.

| AP | What It Looks Like | Consequence |
|----|-------------------|-------------|
| `AP-S3.5a` | `session: { strategy: 'jwt' }` in NextAuth config | Unrevocable sessions — account lockout fails — CF-01 |
| `AP-S3.6a` | `localStorage.setItem('session', token)` | XSS vulnerability — CF-01 |
| `AP-S5.5a` | `provider = "sqlite"` in `schema.prisma` (production) | No concurrent write safety, no ENUM types, no JSONB |
| `AP-S5.11a` | `prisma.user.findMany()` without `select` | Exposes `password` hash to API response |
| `AP-S5.12a` | `prisma.booking.findMany()` without `where: { deletedAt: null }` | Soft-deleted records appear in public listings |
| `AP-S5.15a` | Sequential writes without `prisma.$transaction()` | Partial write: booking created but audit_log missing |
| `AP-S5.21a` | `` `SELECT * FROM bookings WHERE id = '${id}'` `` | SQL injection — CF-06 |
| `AP-S4.28a` | `useState(null) + useEffect(() => fetch(...))` in admin | No loading state, no error recovery, no cache — admin broken on slow network |
| `AP-S2.7a` | Endpoint coded before API contract written | Frontend blocked — CF-11 — all 18 endpoints already specified in design-docs/ |

---

## Relay Status

| Step | Engineer | Status | Notes |
|------|----------|--------|-------|
| Design (Phase 0) | Claude | ✅ Complete | 7 design documents in `design-docs/` |
| Constitutional mapping | Claude Code (Cursor) | ✅ Complete | This file + system context + ADR-005 |
| Build — Sprint 1 | Claude Code (Cursor) | ⬜ Ready | Awaiting Founder start signal |
| Debug/Style | ChatGPT | ⬜ Pending | After Sprint 2 layout complete |
| Logic (if needed) | DeepSeek | N/A | No complex algorithm work identified in v1 |
| Experiment (if needed) | Kimi | N/A | No experimental features in v1 |

---

> *Update this file at the start of every sprint and every session.*
> *Per S10.21 — Claude Code does not begin a build session without this file loaded in Cursor.*
> *Per S10.23 — A stale index is equivalent to no index.*
