# Sunduza Architectural & Projects — System Context

---

| Attribute          | Value |
|--------------------|-------|
| **System**         | Sunduza Architectural & Projects Platform |
| **Client**         | Xivutiso Kevin Sunduza — South African architectural professional |
| **Stack**          | Next.js (App Router) |
| **Build Phase**    | Phase 1 — Build Ready (design complete, 7 sprints defined) |
| **Current Group**  | G1 — Foundation (Sprint 1) |
| **Operating Mode** | SOLO |
| **Active Overlay** | `overlays/solo-dev-overlay.md` |
| **ADR**            | `adrs/ADR-005-sunduza-stack.md` |
| **Lock Date**      | 2026-05-15 |

---

## Problem Statement

Xivutiso Kevin Sunduza is a South African architectural professional with 5+ years of experience. He generates leads through social media and Google Ads but lacks a professional web platform — potential clients do not take him seriously because there is no system anchoring his authority. He has no portfolio showcase, no lead capture system, and no way to manage consultation requests without relying on WhatsApp manually.

## Primary Workflow

Visitor lands from Google Ad → views services and portfolio → fills booking form → booking scored and queued → Kevin reviews admin dashboard → updates status → WhatsApp link pre-filled for follow-up contact.

## v1 Done When

A visitor can submit a consultation booking from any device at any viewport (320px–1280px), Kevin can view it in the admin dashboard with its lead score, update its status through the pipeline, and the full audit trail is captured — all in production on Vercel with PostgreSQL on Neon.

---

## System Type

**Lead Generation + Portfolio Management + Admin Operations Platform**

Not a website. An operational system. Every design decision is evaluated against whether it converts visitors into booked consultations and gives Kevin the tools to run his business from his phone without a developer.

---

## Legal Jurisdiction

**South Africa — POPIA (Protection of Personal Information Act) compliant**

- Consent checkbox required on every booking form submission (`consent_given`, `consent_given_at`)
- Privacy policy page at `/privacy` — linked in footer
- Cookie consent banner — blocks GA4/GTM until visitor accepts
- IP addresses hashed (SHA-256 + salt) — never stored raw
- No PII in audit logs
- Data retention: 2 years for completed/rejected bookings
- Admin can hard-delete on written erasure request

---

## Technology Stack

| Layer | Technology | Standard |
|-------|-----------|---------|
| Framework | Next.js 16.x (App Router) | S6.1 — SEO-critical, content-driven |
| Language | TypeScript strict | S1.48 |
| Database | PostgreSQL 15 on Neon (serverless) | S5.1, S5.4 |
| ORM | Prisma 5 | S5.9 |
| Raw SQL | `prisma.$queryRaw` for complex aggregates | S5.19 |
| Auth | NextAuth.js v5 — Credentials + database sessions | S3.1, S3.5 |
| Styling | Tailwind CSS v4 + Custom CSS (brand tokens) | S4.13, S4.14 |
| Components | shadcn/ui (Radix UI primitives + cva) | S4.1 |
| Forms | React Hook Form + Zod v4 | S4.46, S2.23 |
| Server state | TanStack Query | S4.28 |
| Client state | Zustand (admin UI only) | S4.29 |
| Deployment | Vercel | S8.1 |
| Error capture | Sentry | S8.35 |
| Monitoring | UptimeRobot (health check `/api/health`) | S8.36 |
| Analytics | Google Analytics 4 + Google Tag Manager | BR-006 |

---

## Active Constitutions

All 11 constitutions apply. Stack-specific scope:

- **C3**: Next.js auth path — database sessions (S3.5–S3.12), NOT JWT. `AP-S3.5a` applies.
- **C4**: Next.js standards — shadcn/ui, TanStack Query, Zustand, React Hook Form + Zod
- **C5**: PostgreSQL only — no MongoDB, no ChromaDB, no SQLite in production
- **C6**: Next.js topology — unified Vercel deployment (S6.12)
- **C7**: Jest + RTL + Playwright (S7.2)
- **C8**: Vercel unified deployment (S8.1), Neon database
- **C9**: POPIA compliance is a Crown Jewel constraint — non-negotiable

---

## Database — 9 Tables, All in BCNF

| Table | Purpose | Type |
|-------|---------|------|
| `users` | Single admin identity — authentication | Core |
| `sessions` | NextAuth database sessions — one per device | Core |
| `bookings` | Core lead entity — every consultation request | Core |
| `projects` | Portfolio items — admin-managed | Core |
| `testimonials` | Client reviews — linked or standalone | Core |
| `contact_messages` | General inquiries — separate from bookings | Core |
| `site_settings` | Runtime configuration — no redeployment needed | Core |
| `notifications` | v2-ready outbox queue | Infrastructure |
| `audit_logs` | Immutable event log — every admin + system action | Infrastructure |

**Relationships:** 4 typed FKs, 0 M:N relationships, 0 junction tables.
**Denormalizations:** 7, all documented and justified in `design-docs/SUNDUZA_NORMALIZATION.md`.

---

## Booking Status Lifecycle

```
PENDING → CONTACTED → CONFIRMED → COMPLETED
                                 ↘ REJECTED (from any active stage)
```

Five states only. No other values permitted. Enforced by DB CHECK constraint.

---

## API — 18 Endpoints

| Access | Count | Notes |
|--------|-------|-------|
| Public | 6 | Health, login, create booking, list projects, create contact, get settings |
| Admin (protected) | 12 | All booking/project/message/settings management + logout |

All responses use `{ success, data?, error? }` envelope (S2.19).

---

## v1 Feature Set — 7 Sprints

| Sprint | Days | Group | Goal | Status |
|--------|------|-------|------|--------|
| S1 — Foundation | 5 | G1 | Repo setup, all 9 DB tables, env validation, Prisma migrations, security headers, Sentry | ⬜ |
| S2 — Layout + Auth | 4 | G1 | Navbar, footer, WhatsApp button, admin login, session management, health endpoint, 404/loading/error pages | ⬜ |
| S3 — Public Pages | 4 | G2 | Homepage (ISR 60s), Services (static), Projects (ISR 300s), Privacy policy — JSON-LD, SEO metadata | ⬜ |
| S4 — Lead Capture | 5 | G2 | Booking form + API (UTM, POPIA consent, lead scoring), contact form + API, rate limiting, honeypot | ⬜ |
| S5 — Admin Operations | 5 | G3 | Dashboard, bookings table, project manager, message inbox, site settings form, CSV export | ⬜ |
| S6 — Marketing | 2 | G4 | GA4 + GTM setup, conversion events, cookie consent banner | ⬜ |
| S7 — Polish + Launch | 4 | G4 | Visual regression 320–1280px, Lighthouse ≥90, accessibility audit, bundle analysis, staging validation | ⬜ |

**Total: ~29 solo build days**

---

## File Structure

```
src/
├── app/               Next.js routing only — no business logic
├── client/            Frontend exclusively
│   ├── components/    UI components
│   ├── hooks/         TanStack Query hooks
│   └── services/      API call functions
├── server/            Backend exclusively — server-only guard on every file
│   ├── db/            Prisma client singleton
│   ├── repositories/  All database access
│   ├── use-cases/     All business logic
│   ├── middleware/     Rate limiting, auth, security headers
│   └── errors/        Typed error classes
└── shared/            Safe for both contexts
    ├── types/         TypeScript interfaces
    ├── schemas/       Zod schemas
    └── constants/     Shared constants
```

`server-only` package on every server module. If a client component accidentally imports a database file, the build crashes immediately.

---

## Critical Standards for This System

| Standard | Why Critical for Sunduza |
|----------|--------------------------|
| `S3.5` | NextAuth database sessions — NOT JWT. Sessions must be revocable. |
| `S3.22` | Ownership verification — admin endpoints must verify session + role |
| `S4.2` | 320px mobile-first — Kevin manages bookings from his phone |
| `S4.11` | Every async state must have loading + error + success |
| `S4.28` | TanStack Query for admin data — caching prevents double-fetching |
| `S4.46` | React Hook Form + Zod — booking form has 8 validated fields |
| `S5.5` | PostgreSQL on Neon — SQLite never in production |
| `S5.8` | Soft delete only — POPIA erasure requests handled at app layer |
| `S5.10` | All tables: id (cuid), created_at, updated_at, deleted_at |
| `S5.11` | Explicit select on every Prisma query |
| `S5.12` | `deleted_at: null` filter on every query |
| `S5.15` | Transactions for multi-step writes (booking create + audit + notification) |
| `S5.19` | Raw SQL for UTM attribution reports, lead score analytics |
| `S5.21` | Parameterised raw SQL — never string-interpolated |
| `S2.1` | Business logic in use-case layer — not in API routes |
| `S2.7` | OpenAPI contract before any endpoint code |
| `S2.19` | `{ success, data?, error? }` on every response |
| `S2.23` | Zod validation on every API boundary |
| `S4.69` | Lighthouse mobile score ≥ 90 (above constitutional minimum — launch criteria) |

---

## Special Design Constraints

- **POPIA compliance is non-negotiable** — every booking captures consent. A booking without `consent_given = TRUE` is invalid.
- **Lead scoring on every booking** — calculated on creation from service, budget, meeting_date, and description length. Stored as materialised computed value.
- **UTM capture on every booking** — utm_source, utm_medium, utm_campaign, utm_term, utm_content, referrer_url, landing_page all captured from query params.
- **WhatsApp as first-class channel** — every booking detail view shows pre-filled WhatsApp link.
- **SiteSettings runtime config** — Kevin changes WhatsApp number, hero tagline, stats, contact email through admin UI. No redeployment.
- **Service-contextual booking prompts** — description field placeholder changes dynamically based on selected service.
- **Honeypot field on booking form** — silent bot rejection without CAPTCHA friction.

---

## Design Documents (in `design-docs/`)

| Document | Lines | Content |
|----------|-------|---------|
| `SUNDUZA_PROJECT_SUMMARY.md` | ~480 | Full project overview, tech stack, database, API, build plan |
| `SUNDUZA_SYSTEM_DESIGN.md` | ~2,743 | Architecture, security model, file structure, all business rules |
| `SUNDUZA_ERD_ANALYSIS.md` | ~1,009 | 9 entities examined, 4 FK relationships, 0 M:N confirmed |
| `SUNDUZA_NORMALIZATION.md` | ~800 | All 9 entities through BCNF, 7 denormalizations documented |
| `SUNDUZA_PHYSICAL_SCHEMA.md` | ~700 | Full DDL, 25 indexes, 10 CHECK constraints, seed data |
| `SUNDUZA_API_DESIGN.md` | ~900 | All 18 endpoints with request/response/error examples |
| `SUNDUZA_COMPONENT_ARCHITECTURE.md` | ~900 | All 32 components with props, state, rules, GA4 events |

**Total: ~7,000 lines of design before the first line of production code.**

---

## 20 Launch Criteria (All Must Pass)

1. Visitor submits booking — success message shown
2. Booking appears in admin with correct data and lead score
3. POPIA consent stored on every booking
4. Admin updates booking through all valid status transitions
5. Invalid transition returns 409 with clear message
6. Admin add / edit / delete projects works
7. Projects page reflects changes (ISR revalidation)
8. Contact message appears with unread badge
9. WhatsApp button opens pre-filled chat on every page
10. Admin updates WhatsApp number — button reflects new number instantly
11. Site correct at 320px, 375px, 390px, 768px, 1280px
12. Lighthouse mobile score ≥ 90
13. Zero console errors on any public page
14. All CI tests passing on main branch
15. Sentry receiving events in production
16. UptimeRobot monitoring health endpoint
17. Security headers present (securityheaders.com scan)
18. GA4 receiving conversion events
19. Lead score populated on every booking
20. No raw IP addresses in database

---

*Last updated: 2026-05-15*
*Status: Design complete · Build ready · Sprint 1 next*
*System: Sunduza Architectural & Projects · South Africa · POPIA Compliant*
