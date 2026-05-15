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
| **Build Phase**  | Phase 1 — Sprint 4 (Lead Capture) |
| **Active Group** | G2 — Public Experience |
| **Operating Mode** | SOLO |
| **Overlay**      | `system-design-template/overlays/solo-dev-overlay.md` |
| **Last Updated** | 2026-05-15 |
| **Sprint**       | Sprint 4 — Lead Capture: Booking API, Contact API, rate limiting, POPIA, UTM, lead scoring |

---

## Governance Files (Read Before Every Session)

| File | When |
|------|------|
| `system-design-template/AI-INSTRUCTIONS.md` | Every session — first |
| `system-design-template/system-contexts/sunduza-context.md` | Every build session |
| `system-design-template/overlays/solo-dev-overlay.md` | Every session — operating mode is SOLO |
| **`design-docs/SUNDUZA_LOCKED_DESIGN.md`** | **Every build session — this is the authoritative build reference** |
| `system-design-template/adrs/ADR-005-sunduza-stack.md` | Stack or auth decisions |
| `design-docs/SUNDUZA_API_DESIGN.md` | API contract details — Sprint 4 primary reference |
| `design-docs/SUNDUZA_COMPONENT_ARCHITECTURE.md` | Component spec details |

---

## Active Feature — Sprint 4

**Feature:** Lead Capture — Booking API + Contact API
**Sprint Goal:** A visitor can submit a consultation booking and it lands in the database with lead score, UTM attribution, POPIA consent recorded, and audit trail written — all in a single transaction.
**Layers in progress (S4.79):** Interface → Repository → Use-case → API route → Client hook
**Branch:** `ks/sprint-4-lead-capture`

---

## Sprint History

| Sprint | Status | Branch | Key Deliverable |
|--------|--------|--------|-----------------|
| Sprint 1 — Foundation | ✅ Merged | `ks/sprint-1-database` | PostgreSQL schema (12 models), NextAuth database sessions, Prisma middleware |
| Sprint 2 — Layout + Auth | ✅ Merged | `ks/sprint-2-layout-auth` | Header, Footer, Admin shell, Login page, Health endpoint |
| Sprint 3 — Public Pages | 🔀 PR #8 open | `ks/sprint-3-public-pages` | Homepage, Services, Projects, Testimonials, Contact, Booking UI, Sitemap |
| Sprint 4 — Lead Capture | 🔨 In progress | `ks/sprint-4-lead-capture` | Booking API, Contact API, lead scoring, UTM, POPIA |
| Sprint 5 — Admin Operations | ⬜ Pending | — | Admin dashboard, bookings table, project/testimonial CRUD |
| Sprint 6 — Marketing | ⬜ Pending | — | GA4, GTM, cookie consent |
| Sprint 7 — Polish + Launch | ⬜ Pending | — | Lighthouse ≥90, visual regression, accessibility |

---

## Structure Audit — 2026-05-15

### Aligned with locked design ✅

| Path | Standard |
|------|---------|
| `src/client/components/ui/` | S4.1, S4.13 |
| `src/client/components/layout/` | S4.4 |
| `src/client/components/admin/` | S4.4 |
| `src/client/components/features/` | S4.4 |
| `src/client/components/sections/` | S4.4 |
| `src/client/stores/admin-ui.ts` | S4.29 |
| `src/shared/constants/services.ts` | S2.3 |
| `app/admin/(dashboard)/` — route groups | S3.7 |
| `app/api/v1/health/` | S6.23 |
| `prisma/schema.prisma` — PostgreSQL, 12 models | S5.1, S5.9 |
| `lib/auth.ts` — database sessions + PrismaAdapter | S3.5 |
| `lib/db.ts` — Prisma singleton + deleted_at middleware | S5.9, S5.12 |
| `middleware.ts` — route protection at /admin/* | S3.7 |

### Structural debt (cleanup sprint) ⚠️

| Gap | Standard | Priority |
|-----|---------|----------|
| `lib/` → `src/server/` migration (auth, db, api-response, api-client, utils) | S5.7 | Low — working, not violating |
| `types/` → `src/shared/types/` migration | S2.3 | Low — working, not violating |
| Old `/api/*` routes → `/api/v1/*` (admin/bookings, contact, projects, testimonials) | S2.76 | Medium — Sprint 5 |
| `src/client/hooks/` — empty, TanStack Query hooks not yet written | S4.28 | Sprint 4 (booking mutation) |

### Sprint 4 must-build ❌→✅

| Path | Standard | Sprint |
|------|---------|--------|
| `src/server/repositories/booking.repository.ts` | S2.1, S5.9, S5.11 | Sprint 4 |
| `src/server/repositories/contact.repository.ts` | S2.1, S5.9 | Sprint 4 |
| `src/server/repositories/audit.repository.ts` | S2.62 | Sprint 4 |
| `src/server/use-cases/booking/create-booking.ts` | S2.1 | Sprint 4 — lead scoring, UTM, POPIA |
| `src/server/use-cases/contact/create-contact.ts` | S2.1 | Sprint 4 |
| `app/api/v1/bookings/route.ts` | S2.76, S2.19 | Sprint 4 |
| `app/api/v1/contact/route.ts` | S2.76, S2.19 | Sprint 4 |
| `src/client/hooks/use-booking-mutation.ts` | S4.28 | Sprint 4 |

---

## Critical Standards — Sprint 4 Focus

### Security — Always Active (C3)

| Standard | What It Governs | Sprint 4 Application |
|----------|----------------|---------------------|
| `S3.5` | Database sessions — ✅ Fixed in Sprint 1 | Sessions working |
| `S3.6` | HttpOnly cookies | NextAuth handles — no action |
| `S3.7` | Middleware + double layer auth | Admin routes protected |
| `S3.22` | Role verification on admin endpoints | All admin API routes check role |

### Database — Sprint 4 Critical (C5)

| Standard | What It Governs | Sprint 4 Application |
|----------|----------------|---------------------|
| `S5.11` | Explicit `select` on every query | Every Prisma call in repositories |
| `S5.12` | `deleted_at: null` filter | Auto-applied via db.ts middleware |
| `S5.15` | **Transactions for multi-step writes** | Booking create: bookings + audit_logs + notifications in one transaction |
| `S5.19` | Raw SQL for complex aggregates | Lead score calculation stays in TypeScript (not SQL) |
| `S5.21` | Parameterised raw SQL | Any raw SQL must use tagged template literals |

### Backend — Sprint 4 Critical (C2)

| Standard | What It Governs | Sprint 4 Application |
|----------|----------------|---------------------|
| `S2.1` | **Business logic in use-cases only** | Lead scoring, UTM capture, POPIA recording in `src/server/use-cases/booking/` |
| `S2.19` | Standard response shape | `apiSuccess()` / `apiError()` from `lib/api-response.ts` |
| `S2.23` | Zod validation on every boundary | `BookingSchema` from `types/booking.ts` at API route entry |
| `S2.76` | `/api/v1/` prefix | New routes at `/api/v1/bookings` and `/api/v1/contact` |

### Frontend — Sprint 4 (C4)

| Standard | What It Governs | Sprint 4 Application |
|----------|----------------|---------------------|
| `S4.11` | Loading + error + success states | BookingForm: isSubmitting, serverError, submitted states |
| `S4.28` | TanStack Query for server data | `use-booking-mutation.ts` — mutation hook |
| `S4.46` | React Hook Form + Zod | BookingForm already uses RHF + Zod |

---

## Approved Deviations

| Standard | Deviation | ADR Reference | Status |
|----------|-----------|---------------|--------|
| `S3.5a` | Was JWT strategy | ADR-005 | ✅ **Fixed Sprint 1** — database sessions active |
| `S5.5` | Was SQLite | ADR-005 | ✅ **Fixed Sprint 1** — PostgreSQL on Neon |
| `lib/` structure | Should be `src/server/` | Architecture debt | 🟡 **Cleanup sprint** — working correctly |
| Old `/api/*` routes | Should be `/api/v1/*` | S2.76 | 🟡 **Sprint 5 cleanup** |

---

## Sprint 4 Layer Build Order (S4.79)

```
1. Interface / Types    src/shared/schemas/booking.schema.ts (align with DB enums)
2. Repository          src/server/repositories/booking.repository.ts
                       src/server/repositories/audit.repository.ts
                       src/server/repositories/contact.repository.ts
3. Use-case            src/server/use-cases/booking/create-booking.ts
                          → calculateLeadScore()
                          → captureUTM()
                          → writeAuditLog()
                          → prisma.$transaction()
                       src/server/use-cases/contact/create-contact.ts
4. API routes          app/api/v1/bookings/route.ts  (POST)
                       app/api/v1/contact/route.ts   (POST)
5. Client hook         src/client/hooks/use-booking-mutation.ts
6. Wire to form        src/client/components/features/BookingForm.tsx (connect onSubmit)
```

---

## Critical Anti-Patterns — Sprint 4

| AP | What It Looks Like | Consequence |
|----|-------------------|-------------|
| `AP-S2.1a` | Lead scoring logic inside `route.ts` handler | Untestable, not in service layer — violates S2.1 |
| `AP-S5.15a` | `db.booking.create()` then `db.auditLog.create()` sequentially | Partial write if second call fails — use `prisma.$transaction()` |
| `AP-S5.21a` | String-interpolated raw SQL | SQL injection — CF-06 |
| `AP-S5.11a` | `db.booking.findMany()` without `select` | Exposes all fields unnecessarily |
| `AP-S4.28a` | `useState + useEffect + fetch` in BookingForm | No loading state, no error recovery — use mutation hook |

---

## Open Issues

| Issue | Type | Status | Sprint |
|-------|------|--------|--------|
| Image strategy — `/images/projects/` local path vs Cloudinary | Content | 🟡 Pending client input | Sprint 5 |
| Real testimonials — placeholder reviews in seed | Content | 🟡 Pending Kevin's real clients | Sprint 5 |
| Kevin's GA4 property ID — not yet provided | Config | 🟡 Pending | Sprint 6 |
| IP address hashing — SHA-256 not yet implemented | Security | 🟡 Sprint 4 | Sprint 4 |

---

## Relay Status

| Step | Engineer | Status | Notes |
|------|----------|--------|-------|
| Design (Phase 0) | Claude | ✅ Complete | 7 design documents in `design-docs/` |
| Constitutional mapping | Claude Code (Cursor) | ✅ Complete | This file + system context + ADR-005 |
| Sprint 1 — Foundation | Claude Code (Cursor) | ✅ Complete | DB, Auth, Prisma, migrations |
| Sprint 2 — Layout + Auth | Claude Code (Cursor) | ✅ Complete | Header, Footer, Admin shell |
| Sprint 3 — Public Pages | Claude Code (Cursor) | ✅ Complete | All 6 public pages, sitemap, robots |
| Sprint 4 — Lead Capture | Claude Code (Cursor) | 🔨 In progress | This sprint |
| Sprint 5 — Admin Operations | Claude Code (Cursor) | ⬜ Pending | — |
| Sprint 6 — Marketing | Claude Code (Cursor) | ⬜ Pending | — |
| Sprint 7 — Polish + Launch | Claude Code (Cursor) | ⬜ Pending | — |

---

> *Updated: 2026-05-15 — Sprint 4 active*
> *Per S10.21 — Claude Code does not begin a build session without this file loaded in Cursor.*
> *Per S10.23 — A stale index is equivalent to no index.*
