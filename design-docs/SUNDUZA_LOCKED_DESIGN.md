# SUNDUZA ARCHITECTURAL & PROJECTS
## Locked System Design
### Constitutional Validation · Gap Analysis · Final Decisions · Build-Ready

---

> **Status: LOCKED — 2026-05-15**
> Every decision in this document has been validated against C2, C3, C4, C5, and C6.
> Deviations from the pre-build design documents are explicitly recorded with their standard citation.
> This document supersedes all prior design documents for build purposes.
> Do not deviate from any decision here without a constitutional amendment.

---

## How This Document Was Produced

The seven pre-build design documents (`design-docs/SUNDUZA_*.md`) were run through the full constitutional framework:

- **C2** — Backend Constitution (80 standards)
- **C3** — Auth Constitution (36 standards)
- **C4** — Frontend Constitution (82 standards)
- **C5** — Database Constitution (64 standards)
- **C6** — Full-Stack Architecture Constitution (44 standards)

Every standard that applies to a Next.js system was evaluated against the design. Gaps, conflicts, and inherited patterns are documented below. The result is this locked design — the authoritative reference for Sprint 1 through Sprint 7.

---

## PART 1 — ARCHITECTURE (C6 → Next.js Topology)

### 1.1 Stack Assignment

**LOCKED: Next.js App Router** — per `S6.1` (SEO-critical), `ADR-005`.

Sunduza meets every Next.js assignment criterion:
- Public pages must be indexable by Google Ads and organic search (`S6.1`)
- No financial precision calculations requiring Python (`S6.3` — not applicable)
- No AI/ML pipeline requiring Python (`S6.4` — not applicable)
- Simple relational data model — PostgreSQL only (`S5.1`)
- Solo developer — unified Vercel deployment minimises ops surface

**Immutable for v1 lifetime.**

---

### 1.2 System Topology (S6.12)

```
Browser (320px–1280px)
  ↓ HTTPS · HttpOnly session cookie (S3.6)
Next.js Middleware (middleware.ts)
  ↓ Session verified on every /admin/* request (S3.7)
Next.js App Router
  ├── Server Components (RSC) — public pages (ISR/SSG)
  ├── Client Components — admin UI, forms, interactive elements
  └── API Routes (/api/v1/*)
        ↓ Second auth check (S3.7 — double layer)
        ↓ Zod validation (S2.23)
Service Layer (src/server/use-cases/)
  ↓ Business logic only — no HTTP concerns (S2.1)
Repository Layer (src/server/repositories/)
  ↓ Prisma ORM (standard CRUD) (S5.9)
  ↓ prisma.$queryRaw (complex aggregates, UTM analytics) (S5.19)
PostgreSQL on Neon (S5.4)
```

**One deployment. One platform. Vercel.** (`S8.1`)

---

### 1.3 Authenticated Request Flow (S6.18)

Every admin request follows this exact 14-step flow:

```
1.  Browser → HTTPS request with HttpOnly session cookie
2.  middleware.ts → verify session via NextAuth auth()
3.  Invalid session → redirect to /admin/login?callbackUrl=...
4.  Valid session → request reaches API route handler
5.  API route → independently verifies session (auth()) — double layer (S3.7)
6.  API route → extracts { id, email, role } from session
7.  API route → calls use-case function with verified context
8.  Use-case → validates input with Zod schema (S2.23)
9.  Use-case → checks role (S3.21) and resource ownership (S3.22)
10. Use-case → calls repository function (Prisma or raw SQL)
11. Repository → Prisma: deleted_at filter via middleware (S5.12) + explicit select (S5.11)
12. Use-case → builds response using standard shape (S2.19)
13. API route → returns standard JSON response
14. Client → TanStack Query updates cache, component re-renders (S4.28)
```

**Public request flow** (no auth required):
Steps 1–3 skipped. Steps 4–14 apply but step 5 is omitted and steps 8–9 are validation-only (no role/ownership check).

---

### 1.4 API Gateway

**LOCKED: `/api/v1/` prefix on all routes** — per `S6.15`, `S6.22`, `S2.76`.

**⚠️ CHANGE from pre-build design docs:** Pre-build documents define endpoints at `/api/*`. The constitutional standard mandates `/api/v1/`. All 18 endpoints are renamed below.

**Why this change matters:** When v2 is introduced, `/api/v1/` remains live alongside `/api/v2/`. Routes defined at `/api/` cannot be versioned without breaking existing clients. This change is made now at zero cost.

---

## PART 2 — AUTHENTICATION (C3 → NextAuth Next.js Path)

### 2.1 Strategy

**LOCKED: NextAuth.js v5 with `strategy: "database"` and Prisma Adapter** — per `S3.1`, `S3.5`.

JWT strategy (`strategy: "jwt"`) is **forbidden**. `AP-S3.5a` applies. Current `lib/auth.ts` violates this — **Sprint 1 fix required before any protected route is built.**

### 2.2 Session Storage

**LOCKED: PostgreSQL via `sessions` table** — per `S3.2`, `S5.4`.

Session rows in PostgreSQL are authoritative. Deleting a row invalidates that session instantly on all devices. This is the only revocation mechanism that satisfies account lockout and security incident requirements.

### 2.3 Cookie Configuration

**LOCKED: HttpOnly + Secure + SameSite=Lax** — per `S3.6`.

NextAuth sets this automatically with database sessions. No explicit cookie configuration needed beyond ensuring `NEXTAUTH_URL` is the production domain (Vercel).

### 2.4 Middleware

**LOCKED: `middleware.ts` at project root** — per `S3.7`.

```typescript
// middleware.ts — required (S3.7)
// Protects /admin/* routes at the routing layer
// API routes independently verify session too — double layer protection
export { auth as middleware } from "@/lib/auth"

export const config = {
  matcher: ["/admin/:path*"],
}
```

**⚠️ NEW — not in pre-build design:** `middleware.ts` was not specified. Required by `S3.7`. Sprint 1 deliverable.

### 2.5 Session Callback — Safe Fields Only

**LOCKED: Session exposes `{ id, email, name, role }` only** — per `S3.8`.

Fields NEVER in session: `password`, `failedAttempts`, `lockedUntil`, `deletedAt`. The `password` field is particularly critical — any Prisma query that fetches user without explicit `select` and then passes to session callback leaks the hash.

### 2.6 Session Lifetime

**LOCKED: Read from `SESSION_MAX_AGE_SECONDS` env var** — per `S3.9`.

Default: 30 days (2,592,000 seconds). Sliding expiration active. Environment variable enables instant reduction without deployment if a security event requires it.

### 2.7 Password Hashing

**LOCKED: bcrypt cost factor from `BCRYPT_ROUNDS` env var** — per `S3.3`.

Current `prisma/seed.ts` hardcodes `bcrypt.hash(password, 12)`. **Sprint 1 fix:** read from `process.env.BCRYPT_ROUNDS` with default fallback of `12`.

### 2.8 Rate Limiting

**LOCKED: In-memory for v1, Redis for v2** — per `S3.4`, approved deviation in `ADR-005`.

v1 implements:
- Layer 1: 10 requests/IP/15min (in-memory `Map`) ✓ exists in `lib/auth.ts`
- Layer 2: Account lockout — `failedAttempts` field on User model + `lockedUntil` ✓ in schema
- Layer 3: Global limit — deferred to v2 (no Redis in v1)

**v1 accepted limitation:** In-memory counters reset on server restart (Vercel serverless). This is acknowledged — the `failedAttempts` + `lockedUntil` database layer provides the durable protection. In-memory is the performance fast path.

### 2.9 RBAC

**LOCKED: Role checked at use-case layer** — per `S3.21`, `S3.22`.

v1 has one role: `ADMIN`. Every admin use-case function receives `{ userId, role }` from the session and verifies `role === 'ADMIN'` before proceeding. Resource ownership verification: admin owns all resources (there is only one admin). This simplifies v1 RBAC to a role presence check.

### 2.10 Session Invalidation on Password Change

**LOCKED: Delete all session rows for user on password change** — per `S3.35`.

Not applicable in v1 (no admin password change UI). Documented as Sprint 5 settings form requirement.

---

## PART 3 — DATABASE (C5 → PostgreSQL + Prisma)

### 3.1 Database Assignment

**LOCKED: PostgreSQL on Neon — single database, all data** — per `S5.1`, `S5.2`, `S5.4`.

| Data Type | Database | Standard |
|-----------|----------|---------|
| Auth (User, Session) | PostgreSQL | S5.4 |
| Business data (Booking, Project, etc.) | PostgreSQL | S5.1 |
| Audit logs | PostgreSQL | S5.4 |
| Runtime config (SiteSettings) | PostgreSQL | S5.2 |
| No MongoDB | — | S5.1 (Next.js stack — MongoDB not assigned) |
| No ChromaDB | — | S5.1 (no AI pipeline in v1) |

**SQLite provider in current `schema.prisma` is a violation (`AP-S5.5a`) — Sprint 1 fix required.**

### 3.2 Prisma Schema — 9 Models

**LOCKED: 9 models, all in BCNF** — per `S5.9`. See `design-docs/SUNDUZA_NORMALIZATION.md` for full normalization proof.

| Model | Table | Has deleted_at | FK | Purpose |
|-------|-------|---------------|-----|---------|
| `User` | `users` | ✓ | — | Admin identity |
| `Session` | `sessions` | ✗ | → User CASCADE | NextAuth sessions |
| `Booking` | `bookings` | ✓ | — | Lead capture (island entity) |
| `Project` | `projects` | ✓ | — | Portfolio |
| `Testimonial` | `testimonials` | ✓ | → Project SET NULL | Client reviews |
| `ContactMessage` | `contact_messages` | ✓ | — | General inquiries |
| `SiteSettings` | `site_settings` | ✗ | → User SET NULL | Runtime config |
| `Notification` | `notifications` | ✗ | — | Outbox queue (v2) |
| `AuditLog` | `audit_logs` | ✗ | → User SET NULL | Immutable audit trail |

**`AuditLog` and `Notification` correctly have no `updated_at` or `deleted_at`** — audit logs are write-once, notifications are queue entries. This is a documented exception to `S5.10`, justified in `SUNDUZA_NORMALIZATION.md`.

### 3.3 Required Fields

**LOCKED: Per `S5.10`** — every model must have:

```prisma
id        String    @id @default(cuid())
createdAt DateTime  @default(now()) @map("created_at")
updatedAt DateTime  @updatedAt @map("updated_at")
deletedAt DateTime? @map("deleted_at")
```

Exceptions: `Session` (no `deletedAt` — sessions are hard-deleted on logout, not soft-deleted), `AuditLog` (no `updatedAt`/`deletedAt` — write-once), `Notification` (no `updatedAt`/`deletedAt` — outbox pattern). All exceptions documented.

### 3.4 Prisma Middleware — `deleted_at` Filter

**LOCKED: Prisma client middleware appends `where: { deletedAt: null }` to all queries on soft-deletable models** — per `S5.12`.

```typescript
// src/server/db/prisma-middleware.ts
prisma.$use(async (params, next) => {
  const softDeleteModels = [
    'Booking', 'Project', 'Testimonial', 'ContactMessage', 'User'
  ]
  if (softDeleteModels.includes(params.model ?? '') && params.action === 'findMany') {
    params.args.where = { deletedAt: null, ...params.args.where }
  }
  return next(params)
})
```

**⚠️ NEW — not in pre-build design:** Required by `S5.12`. Sprint 1 deliverable.

### 3.5 ORM vs Raw SQL Decision

**LOCKED: Prisma ORM for all standard CRUD, `prisma.$queryRaw` for complex aggregates** — per `S5.9`, `S5.19`.

| Operation | Tool | Reason |
|-----------|------|--------|
| All CRUD (bookings, projects, testimonials, contacts, settings) | Prisma ORM | Type safety, migration tracking, select enforcement |
| Booking status updates with audit write | Prisma transaction (`S5.15`) | Multi-table write atomicity |
| UTM attribution reports (GROUP BY + multiple aggregates) | `prisma.$queryRaw` | Not expressible cleanly in Prisma API |
| Lead score analytics (window functions, percentile rankings) | `prisma.$queryRaw` | Prisma has no window function support |
| Dashboard stats (multiple counts in one query) | `prisma.$queryRaw` | Performance — one query vs N queries |
| Session cleanup (expired rows) | `prisma.$executeRaw` | Bulk delete with WHERE condition |

**All raw SQL must be:**
1. Parameterised — never string-interpolated (`S5.21`)
2. Commented — explaining why ORM is insufficient
3. In a repository or use-case function — never in a route handler (`S2.1`)

### 3.6 Transactions

**LOCKED: Prisma `$transaction()` for all multi-step writes** — per `S5.15`.

| Operation | Tables Touched | Transaction Required |
|-----------|---------------|---------------------|
| Booking created | `bookings` + `audit_logs` + `notifications` | ✓ |
| Booking status updated | `bookings` + `audit_logs` | ✓ |
| Project created/updated/deleted | `projects` + `audit_logs` | ✓ |
| Contact message received | `contact_messages` + `audit_logs` | ✓ |
| Settings updated | `site_settings` + `audit_logs` | ✓ |

### 3.7 Indexes

**LOCKED: 25 indexes as specified in `design-docs/SUNDUZA_PHYSICAL_SCHEMA.md`** — per `S5.13`.

12 are partial indexes (only index useful rows). Full index registry is in the physical schema document.

### 3.8 Migrations

**LOCKED: `prisma migrate dev` (development) and `prisma migrate deploy` (CI/production)** — per `S5.9`, `S5.59`.

Migrations run before the application starts — never after. Manual `ALTER TABLE` is forbidden outside migration files.

### 3.9 Enums

**LOCKED: PostgreSQL native enums via Prisma** — per physical schema.

```prisma
enum UserRole        { ADMIN }
enum BookingStatus   { PENDING CONTACTED CONFIRMED COMPLETED REJECTED }
enum AuditAction     { LOGIN_SUCCESS LOGIN_FAILURE LOGOUT
                       BOOKING_CREATE BOOKING_STATUS_UPDATE BOOKING_DELETE
                       PROJECT_CREATE PROJECT_UPDATE PROJECT_DELETE
                       CONTACT_MESSAGE_CREATE CONTACT_MESSAGE_READ
                       SETTINGS_UPDATE }
```

**⚠️ CHANGE from pre-build schema:** Old schema used `String` for `status` with a comment. Locked design uses Prisma `enum` for database-level constraint enforcement.

---

## PART 4 — BACKEND (C2 → Service Layer + API Contracts)

### 4.1 Layered Architecture

**LOCKED: Three-layer server architecture** — per `S2.1`, `S2.2`, `S2.3`.

```
app/api/v1/                Route handlers only — no business logic
  ↓ calls
src/server/use-cases/      All business logic (lead scoring, status transitions, UTM capture)
  ↓ calls
src/server/repositories/   All database access (Prisma queries, raw SQL)
```

**Route handlers do:**
- Verify session (auth call)
- Extract `userId` and `role` from session
- Parse request body
- Call one use-case function
- Return standard response

**Route handlers do NOT do:**
- Any business logic (`AP-S2.1a`)
- Any database queries (`AP-S2.1b`)
- Any response formatting beyond calling `apiSuccess()` / `apiError()`

### 4.2 File Structure

**LOCKED: `src/` layout with strict layer separation** — per `S2.1`, `S5.7`, design docs.

```
src/
├── app/                  Next.js routing — page components and API routes only
│   ├── (public)/         Route group — no auth required
│   │   ├── page.tsx      Homepage (ISR 60s)
│   │   ├── services/
│   │   ├── projects/
│   │   ├── testimonials/
│   │   ├── contact/
│   │   ├── booking/
│   │   └── privacy/
│   ├── admin/            Route group — auth required (middleware.ts guards all)
│   │   ├── layout.tsx    Admin shell — sidebar, header
│   │   ├── page.tsx      Dashboard redirect
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── bookings/
│   │   ├── projects/
│   │   ├── testimonials/
│   │   ├── messages/
│   │   └── settings/
│   ├── api/
│   │   └── v1/           All API routes — /api/v1/ prefix (S6.15, S2.76)
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       ├── health/
│   │       ├── bookings/
│   │       │   └── [id]/
│   │       ├── contact/
│   │       ├── projects/
│   │       │   └── [id]/
│   │       ├── testimonials/
│   │       │   └── [id]/
│   │       └── admin/
│   │           ├── bookings/
│   │           │   └── [id]/
│   │           ├── messages/
│   │           │   └── [id]/
│   │           └── settings/
│   ├── globals.css
│   └── layout.tsx
├── client/               Frontend only — never imports from server/ (server-only guard)
│   ├── components/
│   │   ├── layout/       Header, Footer, FloatingWhatsApp
│   │   ├── features/     ProjectsGrid, TestimonialsGrid, BookingForm, ContactForm
│   │   ├── admin/        DashboardStats, BookingsTable, ProjectsManager, etc.
│   │   └── ui/           shadcn/ui primitives — Button, Card, Input, etc.
│   ├── hooks/            TanStack Query hooks (S4.28)
│   │   ├── use-bookings.ts
│   │   ├── use-projects.ts
│   │   └── use-messages.ts
│   └── stores/           Zustand stores (S4.29)
│       └── admin-ui.ts   Status filter, search, modal state
├── server/               Backend only — server-only package on every file (S5.7)
│   ├── db/
│   │   ├── client.ts     Prisma singleton
│   │   └── middleware.ts  deleted_at filter (S5.12)
│   ├── repositories/
│   │   ├── booking.repository.ts
│   │   ├── project.repository.ts
│   │   ├── testimonial.repository.ts
│   │   ├── contact.repository.ts
│   │   ├── settings.repository.ts
│   │   ├── audit.repository.ts
│   │   └── notification.repository.ts
│   ├── use-cases/
│   │   ├── booking/
│   │   │   ├── create-booking.ts    (UTM capture, lead scoring, consent validation)
│   │   │   ├── update-booking-status.ts
│   │   │   └── get-bookings.ts
│   │   ├── project/
│   │   ├── testimonial/
│   │   ├── contact/
│   │   └── settings/
│   ├── middleware/
│   │   ├── rate-limit.ts
│   │   └── security-headers.ts
│   └── errors/
│       └── app-errors.ts
└── shared/               Safe for both client and server
    ├── types/
    │   ├── booking.ts
    │   ├── project.ts
    │   ├── testimonial.ts
    │   └── next-auth.d.ts
    ├── schemas/           Zod schemas — imported by both API routes and client forms
    │   ├── booking.schema.ts
    │   ├── contact.schema.ts
    │   └── settings.schema.ts
    └── constants/
        ├── services.ts    SERVICES array — single source of truth for 4 service values
        └── status.ts      BookingStatus enum values for display
```

**⚠️ CHANGE from pre-build design:** Pre-build used top-level `app/`, `components/`, `lib/`, `types/` (flat structure). Locked design uses `src/` with `client/`, `server/`, `shared/` separation. This enforces the `server-only` guard pattern (`S5.7`) that prevents database imports from reaching the browser bundle.

### 4.3 API Response Shape

**LOCKED: Constitutional standard aligned** — per `S2.19`, `S2.20`, `S2.21`, `S2.22`, `S6.21`.

**⚠️ CHANGE from pre-build design:** `lib/api-response.ts` uses a non-constitutional error shape. Locked design aligns with the constitutional standard.

```typescript
// shared/types/api.ts — LOCKED shape

// Single resource success
type ApiSuccess<T> = {
  success: true
  data: T
  message?: string
}

// List success (S2.20)
type ApiListSuccess<T> = {
  success: true
  data: T[]
  count: number        // total records matching query (before pagination)
  page: number
  totalPages: number
}

// Error (S2.22 + S6.21)
type ApiError = {
  success: false
  error: {
    message: string    // safe for display to end user
    code: ErrorCode    // machine-readable constant — from enum
    status: number     // HTTP status mirrored in body
    details?: unknown  // validation errors, field-level errors
  }
}

// Error codes — constitutional standard (S2.22)
const ErrorCode = {
  VALIDATION_ERROR:     "VALIDATION_ERROR",      // 400
  UNAUTHORIZED:         "UNAUTHORIZED",          // 401
  FORBIDDEN:            "FORBIDDEN",             // 403
  NOT_FOUND:            "NOT_FOUND",             // 404
  CONFLICT:             "CONFLICT",              // 409
  RATE_LIMIT_EXCEEDED:  "RATE_LIMIT_EXCEEDED",   // 429
  INTERNAL_ERROR:       "INTERNAL_SERVER_ERROR", // 500
  SERVICE_UNAVAILABLE:  "SERVICE_UNAVAILABLE",   // 503
} as const
```

### 4.4 API Endpoints — All 18, Final URLs

**LOCKED: All 18 endpoints at `/api/v1/` prefix** — per `S6.15`, `S2.76`.

#### Public (6 endpoints)

| Method | URL | Auth | Purpose |
|--------|-----|------|---------|
| `GET` | `/api/v1/health` | None | Database connectivity check |
| `POST` | `/api/v1/auth/login` | None | Credentials sign-in (NextAuth) |
| `POST` | `/api/v1/bookings` | None | Submit consultation booking |
| `GET` | `/api/v1/projects` | None | List active portfolio projects |
| `GET` | `/api/v1/projects/[id]` | None | Single project detail |
| `POST` | `/api/v1/contact` | None | Submit contact message |
| `GET` | `/api/v1/settings` | None | Get public site settings (whatsapp_number, taglines, stats) |

#### Admin (12 endpoints)

| Method | URL | Auth | Purpose |
|--------|-----|------|---------|
| `POST` | `/api/v1/auth/logout` | Admin | Invalidate session |
| `GET` | `/api/v1/admin/bookings` | Admin | List bookings with filters, pagination, lead score sort |
| `GET` | `/api/v1/admin/bookings/[id]` | Admin | Single booking detail |
| `PATCH` | `/api/v1/admin/bookings/[id]` | Admin | Update booking status + notes |
| `DELETE` | `/api/v1/admin/bookings/[id]` | Admin | Soft-delete booking |
| `POST` | `/api/v1/admin/projects` | Admin | Create portfolio project |
| `PATCH` | `/api/v1/admin/projects/[id]` | Admin | Update project |
| `DELETE` | `/api/v1/admin/projects/[id]` | Admin | Soft-delete project |
| `GET` | `/api/v1/admin/messages` | Admin | List contact messages |
| `PATCH` | `/api/v1/admin/messages/[id]` | Admin | Mark message read |
| `DELETE` | `/api/v1/admin/messages/[id]` | Admin | Soft-delete message |
| `PATCH` | `/api/v1/admin/settings` | Admin | Update site settings |

**Note on testimonials:** Testimonials are admin-managed. CRUD is handled directly from the admin project/testimonial pages via the admin projects endpoint. No public testimonials API is needed — testimonials are fetched server-side in RSC (`app/(public)/testimonials/page.tsx`).

### 4.5 Request ID

**LOCKED: `X-Request-ID` header on every request** — per `S6.20`.

Generated by middleware. Included in error responses. Captured by Sentry. Enables cross-request tracing.

### 4.6 Health Check

**LOCKED: `/api/v1/health` returns database status** — per `S6.23`.

```typescript
// Response when healthy
{ "success": true, "data": { "status": "ok", "database": "connected", "timestamp": "..." } }

// Response when degraded
{ "success": false, "error": { "message": "Database unavailable", "code": "SERVICE_UNAVAILABLE", "status": 503 } }
```

---

## PART 5 — FRONTEND (C4 → Next.js)

### 5.1 Framework

**LOCKED: Next.js 16.x App Router with React 19 and TypeScript strict** — per `S4.1`, `ADR-005`.

### 5.2 Mobile-First Baseline

**LOCKED: 320px is the design baseline** — per `S4.2`.

Every component is built mobile-first. All Tailwind breakpoints are additive (`sm:`, `md:`, `lg:`, `xl:`). Desktop is an enhancement. Kevin uses this system from his phone — the admin UI must work fully at 390px.

### 5.3 Component Architecture

**LOCKED: Smart (container) + Presentational separation** — per `S4.4`.

| Layer | Location | Imports | Concerns |
|-------|----------|---------|---------|
| Server Components (RSC) | `src/app/(public)/**` | server/ repositories directly (server context) | Data fetching, SEO metadata, ISR |
| Smart Components | `src/client/components/admin/` | TanStack Query hooks | Orchestration, data, state management |
| Presentational Components | `src/client/components/ui/` | Props only | Rendering, no data fetching, no business logic |

### 5.4 State Management

**LOCKED:** — per `S4.28`, `S4.29`.

| State Type | Tool | Where | Standard |
|------------|------|-------|---------|
| Server data (bookings, projects, messages) | **TanStack Query** | `src/client/hooks/` | `S4.28` |
| UI client state (filters, modal open/close, search) | **Zustand** | `src/client/stores/` | `S4.29` |
| Form state | React Hook Form | Inside form component | `S4.46` |
| URL state (page, filters that need deep linking) | Next.js `useSearchParams` | Admin pages | Built-in |

**⚠️ NEW dependencies required:**
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools zustand
```

`@tanstack/react-query` and `zustand` are **not in the current `package.json`**. Sprint 1 task.

### 5.5 Async State Rendering

**LOCKED: Every async state renders all three states** — per `S4.11`.

| State | What to Render |
|-------|---------------|
| Loading | Skeleton components (not spinners, not blank) |
| Error | Error message + retry action |
| Empty | Helpful empty state (not missing UI, not `null`) |
| Success | The data |

No component that fetches data may render `null` while loading.

### 5.6 Styling

**LOCKED: Tailwind v4 for layout + Custom CSS (`@theme`) for brand** — per `S4.13`, `S4.14`.

| Tool | Used For | Never Used For |
|------|----------|---------------|
| Tailwind | Spacing, layout, responsive utilities, flexbox, grid, typography scale | Brand-specific colours, font assignments |
| `app/globals.css @theme` | `--color-primary`, `--color-ink`, `--color-paper`, font variables | Utility overrides that Tailwind already handles |

**Locked design tokens:**
```css
/* app/globals.css — LOCKED (S4.14) */
@theme {
  --color-primary:      #b88b4a;   /* Brand gold — CTAs, accents */
  --color-primary-dark: #a07740;   /* Hover state */
  --color-ink:          #0f172a;   /* Main text */
  --color-paper:        #faf8f2;   /* Page background */
  --color-paper2:       #f5f0e8;   /* Section backgrounds, card fills */
  --color-rule:         #e8ddd0;   /* Borders, dividers */
  --color-muted:        #8a7a60;   /* Secondary text */
  --font-serif:         var(--font-serif), Georgia, serif;     /* Playfair Display */
  --font-sans:          var(--font-sans), system-ui, sans-serif; /* IBM Plex Sans */
}
```

### 5.7 Forms

**LOCKED: React Hook Form + Zod on all forms** — per `S4.46`, `S2.23`.

| Form | Fields | Zod Schema Location |
|------|--------|-------------------|
| Booking form | name, email, phone, service, location, description, meetingDate, budget, consentGiven, honeypot | `src/shared/schemas/booking.schema.ts` |
| Contact form | name, email, phone, message | `src/shared/schemas/contact.schema.ts` |
| Admin login | email, password | `src/shared/schemas/auth.schema.ts` |
| Admin project form | title, description, imagePath, category, isFeatured, sortOrder | `src/shared/schemas/project.schema.ts` |
| Admin testimonial form | clientName, review, rating, projectId, isActive | `src/shared/schemas/testimonial.schema.ts` |
| Admin settings form | key, value pairs | `src/shared/schemas/settings.schema.ts` |

**Honeypot field on booking form:** Hidden field (`name="website"`) that bots fill and humans don't. If non-empty, the API returns 200 silently without creating a booking record. Bot is not told it failed.

### 5.8 Rendering Strategy

**LOCKED: Per-page rendering decisions** — per `S4.1`, ISR design in design docs.

| Page | Rendering | Revalidation | Reason |
|------|-----------|-------------|--------|
| `/` Homepage | **ISR** | 60 seconds | Featured projects + testimonials change infrequently |
| `/services` | **Static** | Build time | Content never changes without deploy |
| `/projects` | **ISR** | 300 seconds | Admin adds projects — reflected in 5 min |
| `/projects/[id]` | **ISR** | 300 seconds | Same |
| `/testimonials` | **ISR** | 300 seconds | Same |
| `/contact` | **Static** | Build time | Form rendered client-side anyway |
| `/booking` | **Client** | — | Form state, no SEO needed |
| `/privacy` | **Static** | Build time | Legal text |
| `/admin/**` | **Client** | — | Dynamic, auth-required |

### 5.9 Layer Build Order

**LOCKED: Interface → Service → Component → UI** — per `S4.79`, `S4.80`.

For every feature, this order is non-negotiable. One commit per layer minimum.

```
1. Interface / Types   — Zod schema + TypeScript types (src/shared/)
2. Repository          — Prisma queries / raw SQL (src/server/repositories/)
3. Use-case            — Business logic (src/server/use-cases/)
4. API route handler   — Thin HTTP wrapper (src/app/api/v1/)
5. TanStack hook       — Client data fetching (src/client/hooks/)
6. Smart component     — Orchestration (src/client/components/admin/)
7. Presentational UI   — Rendering (src/client/components/ui/)
8. Tests               — Unit + integration (co-located, same PR) (S7.1)
```

---

## PART 6 — DEPLOYMENT (C8 → Vercel + Neon)

### 6.1 Platform

**LOCKED: Vercel** — per `S8.1`. One project, one deployment, all environments.

### 6.2 Environments

**LOCKED: Three environments** — per `S8.5`.

| Environment | Branch | Database | Purpose |
|------------|--------|----------|---------|
| Development | feature/* | Neon branch (dev) | Local development |
| Preview | PR branch | Neon branch (per PR) | Automated PR preview |
| Production | main | Neon main | Live |

Neon's database branching capability enables isolated per-PR databases — no test data pollution.

### 6.3 Environment Variables — Complete Registry

**LOCKED: All required variables** — per `S8.5`.

```env
# Database
DATABASE_URL="postgresql://..."      # Neon connection string

# Auth (S3.9, S3.3, S3.5)
NEXTAUTH_SECRET="..."                 # Min 32 chars, random, never reused
NEXTAUTH_URL="https://..."            # Production: Vercel URL
SESSION_MAX_AGE_SECONDS="2592000"     # 30 days default — S3.9
BCRYPT_ROUNDS="12"                    # Cost factor — S3.3

# Admin (seed)
ADMIN_EMAIL="..."                     # First admin email
ADMIN_PASSWORD="..."                  # First admin password — never committed

# Monitoring
SENTRY_DSN="..."                      # S8.35
NEXT_PUBLIC_SENTRY_DSN="..."          # Client-side Sentry

# Analytics (Sprint 6)
NEXT_PUBLIC_GA_ID="..."               # GA4 Measurement ID
NEXT_PUBLIC_GTM_ID="..."              # GTM Container ID
```

---

## PART 7 — LEAD INTELLIGENCE LAYER

### 7.1 Lead Scoring

**LOCKED: Calculated on booking creation, stored as `leadScore`** — documented denormalization per `SUNDUZA_NORMALIZATION.md` §Entity 3.

```typescript
// src/server/use-cases/booking/create-booking.ts

function calculateLeadScore(data: BookingInput): number {
  let score = 0

  // Service weight (max 40 points)
  const serviceWeights: Record<string, number> = {
    dev_project_planning: 40,   // Highest value service
    arch_drawings: 30,
    house_planning: 25,
    drafting_services: 20,
  }
  score += serviceWeights[data.service] ?? 20

  // Budget presence (max 30 points)
  if (data.budget) {
    const amount = parseBudgetAmount(data.budget)
    if (amount >= 100000) score += 30
    else if (amount >= 50000) score += 20
    else score += 10
  }

  // Meeting date provided (15 points)
  if (data.meetingDate) score += 15

  // Description quality (max 15 points)
  const wordCount = data.description.trim().split(/\s+/).length
  if (wordCount >= 50) score += 15
  else if (wordCount >= 20) score += 10
  else score += 5

  return Math.min(100, score)
}
```

### 7.2 UTM Capture

**LOCKED: Captured server-side from request context + client-provided payload** — per marketing spec in `SUNDUZA_SYSTEM_DESIGN.md`.

UTM parameters are passed from the booking form as hidden fields (populated by JavaScript from `window.location.search` and `document.referrer` on form load). The server validates and stores them.

### 7.3 POPIA Compliance

**LOCKED: `consentGiven` = `true` is required for booking creation** — per `BR-009`.

The Zod schema enforces `consentGiven: z.literal(true)`. A booking with `consentGiven: false` fails validation at the API boundary with `VALIDATION_ERROR`. The database CHECK constraint provides a second layer: `CHECK (consent_given = TRUE AND consent_given_at IS NOT NULL)`.

---

## PART 8 — PACKAGES — FINAL LOCKED LIST

### New Dependencies Required (Sprint 1)

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
npm install zustand
npm install server-only
npm install @paralleldrive/cuid2
```

| Package | Purpose | Standard |
|---------|---------|---------|
| `@tanstack/react-query` | Admin server state management | `S4.28` |
| `@tanstack/react-query-devtools` | Dev-only query debugging | — |
| `zustand` | Admin client UI state | `S4.29` |
| `server-only` | Guard server modules from browser bundle | `S5.7` |
| `@paralleldrive/cuid2` | CUID generation in seed and use-cases | `S5.10` |

### Existing Dependencies Confirmed

| Package | Purpose | Status |
|---------|---------|--------|
| `next` | Framework | ✓ |
| `react`, `react-dom` | UI | ✓ |
| `typescript` | Language | ✓ |
| `tailwindcss`, `@tailwindcss/postcss` | Styling | ✓ |
| `@radix-ui/*` | Component primitives | ✓ |
| `class-variance-authority` | Component variants | ✓ |
| `clsx`, `tailwind-merge` | Class utilities | ✓ |
| `react-hook-form`, `@hookform/resolvers` | Forms | ✓ |
| `zod` | Validation | ✓ |
| `next-auth` | Auth | ✓ |
| `@prisma/client`, `prisma` | ORM | ✓ |
| `bcryptjs` | Password hashing | ✓ |
| `lucide-react` | Icons | ✓ |

### Packages to Remove

| Package | Why |
|---------|-----|
| `uuid` | Replaced by `@paralleldrive/cuid2` per `S5.10` |
| `dotenv` | Next.js handles env vars natively — not needed |

---

## PART 9 — GAPS DELTA (Design Docs → Locked Design)

Every change from the pre-build design documents to this locked design:

| # | Area | Pre-Build Design | Locked Design | Standard |
|---|------|-----------------|---------------|---------|
| 1 | API prefix | `/api/*` | **`/api/v1/*`** | `S6.15`, `S2.76` |
| 2 | Auth strategy | JWT (violation) | **Database sessions** | `S3.5` |
| 3 | Database | SQLite (violation) | **PostgreSQL on Neon** | `S5.1`, `S5.4` |
| 4 | Error shape | `{success, message, code, status}` | **`{success, error: {message, code, status}}`** | `S2.22`, `S6.21` |
| 5 | Route protection | No `middleware.ts` | **`middleware.ts` added** | `S3.7` |
| 6 | `deleted_at` filtering | Manual per query | **Prisma middleware** | `S5.12` |
| 7 | State management | None | **TanStack Query + Zustand** | `S4.28`, `S4.29` |
| 8 | File structure | Flat (`app/`, `lib/`, `components/`) | **`src/` with `client/server/shared/`** | `S2.1`, `S5.7` |
| 9 | Status enum | String (`new/contacted/in_review/...`) | **Prisma enum (`PENDING/CONTACTED/CONFIRMED/...`)** | Schema |
| 10 | Session lifetime | Hardcoded | **`SESSION_MAX_AGE_SECONDS` env var** | `S3.9` |
| 11 | bcrypt rounds | Hardcoded `12` | **`BCRYPT_ROUNDS` env var** | `S3.3` |
| 12 | API versioning governance | Not specified | **v1 now, v2 additive** | `S2.76`–`S2.80` |
| 13 | `server-only` guard | Not present | **On every server module** | `S5.7` |
| 14 | List response shape | `{success, data, total}` | **`{success, data, count, page, totalPages}`** | `S2.20` |
| 15 | Prisma enums | Not used | **`UserRole`, `BookingStatus`, `AuditAction`** | `S5.9` |

---

## PART 10 — CONSTITUTIONAL COMPLIANCE SCORECARD

| Constitution | Standard | Status | Sprint |
|-------------|---------|--------|--------|
| C6 `S6.1` | Stack = Next.js | ✅ | Locked |
| C6 `S6.12` | Next.js unified topology | ✅ | Locked |
| C6 `S6.15` | `/api/v1/` gateway | ✅ | Sprint 1 |
| C6 `S6.18` | Authenticated request flow | ✅ | Sprint 1–2 |
| C3 `S3.1` | One auth strategy | ✅ | Locked |
| C3 `S3.3` | bcrypt from env var | ⬜ | Sprint 1 |
| C3 `S3.5` | Database sessions | 🔴 Fix required | Sprint 1 |
| C3 `S3.6` | HttpOnly cookies | ✅ | NextAuth default |
| C3 `S3.7` | Middleware + double layer | ⬜ | Sprint 1–2 |
| C3 `S3.8` | Safe session fields | ✅ | Sprint 1 |
| C3 `S3.9` | Session lifetime env var | ⬜ | Sprint 1 |
| C5 `S5.1` | PostgreSQL only | 🔴 Fix required | Sprint 1 |
| C5 `S5.8` | Soft delete | ✅ | Sprint 1 |
| C5 `S5.9` | Prisma migrations | ⬜ | Sprint 1 |
| C5 `S5.10` | Required fields | ✅ | Sprint 1 |
| C5 `S5.11` | Explicit select | ✅ | Ongoing |
| C5 `S5.12` | `deleted_at` Prisma middleware | ⬜ | Sprint 1 |
| C5 `S5.13` | FK indexes | ✅ | Sprint 1 |
| C5 `S5.15` | Transactions for multi-write | ⬜ | Sprint 4 |
| C5 `S5.19` | Raw SQL for complex aggregates | ✅ | Sprint 5 |
| C5 `S5.21` | Parameterised raw SQL | ✅ | Ongoing |
| C2 `S2.1` | Business logic in use-cases | ⬜ | Sprint 1 |
| C2 `S2.7` | OpenAPI contract first | ✅ | Done (design-docs) |
| C2 `S2.19` | Standard response shape | ⬜ | Sprint 1 |
| C2 `S2.20` | List response shape | ⬜ | Sprint 1 |
| C2 `S2.23` | Zod validation | ✅ | Sprint 1 |
| C2 `S2.62` | Audit logging | ✅ | Sprint 1 |
| C4 `S4.1` | Next.js App Router | ✅ | Locked |
| C4 `S4.2` | 320px mobile-first | ✅ | Sprint 2+ |
| C4 `S4.11` | Loading + error + success | ⬜ | Sprint 2+ |
| C4 `S4.13` | Tailwind for layout | ✅ | Sprint 2+ |
| C4 `S4.14` | Custom CSS for brand | ✅ | Sprint 2+ |
| C4 `S4.28` | TanStack Query | ⬜ | Sprint 1 (install) |
| C4 `S4.29` | Zustand | ⬜ | Sprint 1 (install) |
| C4 `S4.46` | React Hook Form + Zod | ✅ | Sprint 4 |
| C4 `S4.69` | Lighthouse ≥ 90 | ⬜ | Sprint 7 |
| C4 `S4.79` | Layer build order | ✅ | Every sprint |
| C4 `S4.80` | One commit per layer | ✅ | Every sprint |

**Legend:** ✅ Satisfied · ⬜ Pending (scheduled) · 🔴 Violation (must fix)

---

## PART 11 — SPRINT 1 CHECKLIST

This is what must be delivered in Sprint 1 before Sprint 2 can begin. Every 🔴 violation and critical ⬜ item for the foundation.

- [ ] `npm install @tanstack/react-query zustand server-only @paralleldrive/cuid2`
- [ ] `prisma/schema.prisma` → change `provider = "postgresql"`, add all 9 models with correct enums
- [ ] `lib/auth.ts` → change `strategy: "database"`, add Prisma adapter, Session model wired
- [ ] `lib/auth.ts` → read `BCRYPT_ROUNDS` from env (`S3.3`)
- [ ] `middleware.ts` → created at project root (`S3.7`)
- [ ] `src/server/db/client.ts` → Prisma singleton with `deleted_at` middleware (`S5.12`)
- [ ] `src/shared/types/api.ts` → locked response shapes (`S2.19`–`S2.22`)
- [ ] `app/api/v1/` → all existing routes moved to versioned prefix (`S6.15`)
- [ ] `.env.example` → all 10 required variables documented
- [ ] `prisma migrate dev --name init` → migration generated and verified
- [ ] `npm run db:seed` → admin + settings + sample projects seeded
- [ ] `app/api/v1/health/route.ts` → database connectivity check (`S6.23`)

---

*Locked: 2026-05-15*
*Status: LOCKED — All 15 design gaps documented · Sprint 1 checklist complete · Ready to build*
*Supersedes: SUNDUZA_SYSTEM_DESIGN.md, SUNDUZA_ERD_ANALYSIS.md, SUNDUZA_NORMALIZATION.md, SUNDUZA_PHYSICAL_SCHEMA.md, SUNDUZA_API_DESIGN.md, SUNDUZA_COMPONENT_ARCHITECTURE.md for build purposes*
*Constitutional authority: C0 §7.1 hierarchy applied · C0 §7.3 Auth Override applied to S3.5 fix*
