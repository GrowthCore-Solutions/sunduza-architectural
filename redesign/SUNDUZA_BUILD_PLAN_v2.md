# Sunduza Architectural & Projects — Full System Audit, Build Plan & Git Workflow

> **Authored:** May 2026
> **Scope:** Complete technical audit, gap analysis, fix register, sprint-by-sprint build plan, and GitHub workflow per sprint
> **Stack:** Next.js 16 · TypeScript · Prisma 5 · PostgreSQL · NextAuth v5 · Tailwind v4 · React Query · Zustand

---

## Table of Contents

1. [System Completion Scorecard](#1-system-completion-scorecard)
2. [Layer-by-Layer Audit](#2-layer-by-layer-audit)
3. [Bug Register — Things That Are Broken Right Now](#3-bug-register--things-that-are-broken-right-now)
4. [Gap Register — Things That Are Missing](#4-gap-register--things-that-are-missing)
5. [Improvement Register — Things That Exist But Need Upgrading](#5-improvement-register--things-that-exist-but-need-upgrading)
6. [Separation of Concerns — Current State vs Target State](#6-separation-of-concerns--current-state-vs-target-state)
7. [Target Folder Structure](#7-target-folder-structure)
8. [Repository Setup — One-Time Configuration](#8-repository-setup--one-time-configuration)
9. [Sprint 0 — Backend Fixes & Foundations](#9-sprint-0--backend-fixes--foundations)
10. [Sprint 1 — Public Site Frontend](#10-sprint-1--public-site-frontend)
11. [Sprint 2 — Admin Dashboard Frontend](#11-sprint-2--admin-dashboard-frontend)
12. [Sprint 3 — Notifications & Infrastructure](#12-sprint-3--notifications--infrastructure)
13. [Sprint 4 — Testing & Launch Polish](#13-sprint-4--testing--launch-polish)
14. [Production Readiness Checklist](#14-production-readiness-checklist)

---

## 1. System Completion Scorecard

| Layer | Current State | Completion | Target |
|---|---|---|---|
| **Database Schema** | Production-grade. All models, enums, indexes, soft deletes, audit trail | ✅ 92% | CHECK constraint confirmation + prod seed |
| **Auth & Security** | Database sessions, bcrypt, account lockout, double-layer middleware | ✅ 85% | Redis rate limiter, audit log writes |
| **API — Backend Logic** | Route structure exists, auth guards mostly correct | ⚠️ 60% | Fix bugs, add service layer, audit writes |
| **API — Missing Endpoints** | Several handlers stubbed or absent | ❌ 45% | Complete all CRUD + admin routes |
| **Frontend — Public Site** | Every page returns `null`. Layout shell only | ❌ 8% | All 7 public pages built |
| **Frontend — Admin Dashboard** | Login complete. All other pages return `null` | ❌ 10% | All 5 admin sections built |
| **Frontend — Components** | UI primitives + Header + Footer + AdminSidebar built, not connected | ⚠️ 30% | Wire into pages |
| **Client State** | Zustand store defined, React Query providers set up | ✅ 80% | Wire to actual data fetching |
| **Notifications / Email** | Outbox table exists, nothing writes or reads it | ❌ 0% | Booking + contact triggers + worker |
| **Tests** | Zero test files | ❌ 0% | API integration tests + E2E |
| **DevOps / Deployment** | `dev.db` committed to repo, no CI pipeline | ❌ 5% | `.env` hygiene, CI, Railway/Vercel deploy |

### Overall System Completion: ~42%

> The architecture and data layer are the strongest parts of this system. The frontend is almost entirely unbuilt. The backend has real bugs that must be fixed before any UI is wired to it.

---

## 2. Layer-by-Layer Audit

### 2.1 Database — 92/100

**What's excellent:**
- Soft deletes with `deletedAt` enforced via Prisma middleware — no hard deletes across the system
- `AuditLog` designed as an immutable append-only ledger. Correct: no `updatedAt`, no `deletedAt`, polymorphic `entityType + entityId` so logs survive record deletion
- `Notification` outbox pattern — the right architecture for future async email/WhatsApp via Resend/WATI
- `Booking` captures all 5 UTM dimensions, POPIA consent fields, `leadScore`, `ipAddress`, `userAgent`
- `SiteSettings` as a bounded key-value store avoids redeployments for runtime config changes
- Composite indexes on the most frequent admin query patterns (`status + createdAt`, `status + leadScore`, `read + createdAt`)
- NextAuth adapter tables (`Account`, `Session`, `VerificationToken`) correctly included

**What's incomplete:**
- The `rating` CHECK constraint (1–5) is noted in schema comments but Prisma does not generate CHECK constraints natively — verify in the migration SQL and add manually if absent
- No production seed file — only a dev seed. A `prisma/seed.prod.ts` is needed for first production deployment
- `dev.db` (SQLite) is committed to the repository — must be removed and added to `.gitignore`

---

### 2.2 Auth & Security — 85/100

**What's excellent:**
- Double-layer auth: middleware session check at routing layer + independent `auth()` call inside every API handler
- Database sessions, never JWT — session revocation works instantly by deleting the row
- Account lockout after 10 failed attempts, 15-minute window
- bcrypt with configurable cost factor via `BCRYPT_ROUNDS` env var
- Safe field selection — password hash never reaches the session object

**What's incomplete:**
- In-memory IP rate limiter resets on every serverless cold start — production-unsafe for auth endpoints
- `checkRateLimit` and `generateRequestId` are mixed into `lib/auth.ts` — wrong file, wrong concern
- Zero audit log writes exist anywhere in the codebase despite the full schema being ready
- No CSRF header validation on custom admin API mutations

---

### 2.3 API Layer — 60/100

**What's working:**
- Consistent `ApiSuccess / ApiError` response envelope
- Zod validation on all input bodies
- `X-Request-ID` header on booking route
- Correct HTTP status codes throughout
- Soft delete implemented on `DELETE /api/projects/[id]`
- Rate limiting on `POST /api/bookings`

**What's broken or missing:**
- `POST /api/contact` does not exist — the contact form has nowhere to submit
- `api-client.ts` swallows structured error codes — client gets a plain string, not machine-readable `ErrorCode`
- Inline Zod schemas in route files instead of `types/`
- No service layer — business logic embedded in HTTP handlers
- `leadScore` field never calculated
- `AuditLog` table has zero writes
- `Notification` outbox never triggered
- `SiteSettings` has no API routes

---

### 2.4 Frontend — Public Site — 8/100

Every page file returns `null`. Only the layout shell renders (Header, Footer, FloatingWhatsApp). Components exist in `src/client/` but are wired to nothing.

**Pages to build:** `/` · `/services` · `/projects` · `/projects/[id]` · `/testimonials` · `/contact` · `/booking` · `/privacy`

**What is done:** Root layout, design tokens, UI primitives, Header, Footer, FloatingWhatsApp — complete but connected to empty pages.

---

### 2.5 Frontend — Admin Dashboard — 10/100

Only the login page is complete. All dashboard pages return `null`. `AdminSidebar` is built but not wired into any layout that renders real content.

**Pages to build:** `/admin` · `/admin/bookings` · `/admin/projects` · `/admin/testimonials` · `/admin/messages` · `/admin/settings`

---

## 3. Bug Register — Things That Are Broken Right Now

Fix all of these in Sprint 0 before any frontend work begins.

---

### BUG-001 — Missing `POST /api/contact` (CRITICAL)

**File:** `app/api/contact/route.ts`
**Problem:** Only `GET` and `PATCH` exist (both admin-protected). No public submission handler. The contact form page has nowhere to POST to.
**Fix:** Add a rate-limited `POST` handler that validates input, creates a `ContactMessage` row, writes a `CONTACT_MESSAGE_CREATE` audit log, and inserts a `Notification` outbox row.

```typescript
export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const ip = req.headers.get("x-forwarded-for") ?? "default";

  if (!checkRateLimit(`contact:${ip}`, 3, 60 * 60 * 1000)) {
    return NextResponse.json(
      apiError("Too many requests.", ErrorCode.RATE_LIMIT_EXCEEDED, 429),
      { status: 429 }
    );
  }

  const body = await req.json();
  const parsed = ContactMessageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      apiError(parsed.error.issues.map(e => e.message).join(", "), ErrorCode.VALIDATION_ERROR, 400),
      { status: 400 }
    );
  }

  const message = await db.contactMessage.create({ data: parsed.data });

  await db.notification.create({
    data: {
      type: "CONTACT_MESSAGE",
      channel: "email",
      recipient: process.env.ADMIN_EMAIL ?? "admin@sunduza.co.za",
      payload: { messageId: message.id, name: message.name, email: message.email },
    },
  });

  return NextResponse.json(apiSuccess({ id: message.id }), { status: 201 });
}
```

---

### BUG-002 — `api-client.ts` Loses Structured Error Codes (HIGH)

**File:** `lib/api-client.ts`
**Problem:** Catches errors and throws `new Error(err.message)` — converts the structured `{ success: false, error: { message, code, status } }` envelope into a plain string. Client components cannot distinguish `VALIDATION_ERROR` from `UNAUTHORIZED`.
**Fix:**

```typescript
export class ApiClientError extends Error {
  code: string;
  status: number;
  constructor(message: string, code: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

// In request():
if (!res.ok) {
  const err = await res.json().catch(() => null);
  const message = err?.error?.message ?? res.statusText;
  const code = err?.error?.code ?? "UNKNOWN_ERROR";
  const status = err?.error?.status ?? res.status;
  throw new ApiClientError(message, code, status);
}
```

---

### BUG-003 — Inline Zod Schemas Not In `types/` (MEDIUM)

**Files:** `app/api/projects/route.ts`, `app/api/admin/bookings/route.ts`, `app/api/testimonials/[id]/route.ts`
**Problem:** `ProjectCreateSchema`, `ProjectUpdateSchema`, `TestimonialCreateSchema`, `TestimonialUpdateSchema`, `BookingUpdateSchema` all defined inline. Not reusable by the service layer, client forms, or tests.
**Fix:** Move all schemas to their respective `types/` files. Routes import from there.

---

### BUG-004 — `dev.db` Committed to Repository (HIGH)

**Problem:** `dev.db` and `prisma/dev.db` are tracked in git, exposing seeded admin credentials and test data.
**Fix:**
```bash
# Add to .gitignore
echo "*.db\n*.db-shm\n*.db-wal\nprisma/dev.db\ndev.db" >> .gitignore

# Untrack existing files
git rm --cached dev.db prisma/dev.db
git commit -m "fix: remove dev.db from version control"
```
Then rotate the dev admin password.

---

### BUG-005 — `testimonials/[id]` DELETE is a Hard Delete (MEDIUM)

**File:** `app/api/testimonials/[id]/route.ts`
**Problem:** Calls `db.testimonial.delete()` — permanent. Every other entity uses soft deletes. This loses the record and breaks audit trail linkage.
**Fix:**
```typescript
await db.testimonial.update({
  where: { id },
  data: { deletedAt: new Date() },
});
```

---

### BUG-006 — `checkRateLimit` Imported From `lib/auth.ts` (LOW — Architectural)

**Problem:** Rate limiting and request ID generation are infrastructure utilities mixed into the NextAuth config file. Public API routes importing from `lib/auth.ts` is a bad dependency.
**Fix:** Extract to `lib/rate-limit.ts` and `lib/request.ts`. Update all imports.

---

### BUG-007 — Two Health Endpoints With Inconsistent Response Shapes (LOW)

**Files:** `app/api/health/route.ts` (raw object), `app/api/v1/health/route.ts` (uses `apiSuccess`)
**Fix:** Delete `app/api/health/route.ts`. Keep only `/api/v1/health` as the canonical endpoint.

---

### BUG-008 — Soft Delete Middleware Misses `findUnique` (MEDIUM)

**File:** `lib/db.ts`
**Problem:** The Prisma middleware only intercepts `findMany` and `findFirst`. `findUnique` calls (used throughout for ID lookups) are not filtered — a soft-deleted record can still be fetched by ID.
**Fix:**
```typescript
const SOFT_DELETE_ACTIONS = ["findMany", "findFirst", "findUnique", "findUniqueOrThrow"];

client.$use(async (params, next) => {
  if (
    params.model &&
    SOFT_DELETE_MODELS.has(params.model) &&
    SOFT_DELETE_ACTIONS.includes(params.action)
  ) {
    params.args ??= {};
    params.args.where ??= {};
    if (!("deletedAt" in params.args.where)) {
      params.args.where.deletedAt = null;
    }
  }
  return next(params);
});
```

---

## 4. Gap Register — Things That Are Missing

---

### GAP-001 — No Service Layer (CRITICAL)

All business logic lives in route handlers. No shared functions. No testability. When two routes need the same logic there is no shared function to call.

**Target:**
```
server/
  bookings.ts      ← createBooking(), getBookings(), updateBookingStatus(), softDeleteBooking()
  projects.ts      ← createProject(), getProjects(), updateProject(), softDeleteProject()
  testimonials.ts  ← createTestimonial(), updateTestimonial(), softDeleteTestimonial()
  contact.ts       ← createContactMessage(), markMessageRead()
  audit.ts         ← writeAuditLog()
  settings.ts      ← getSetting(), updateSetting()
  lead-score.ts    ← calculateLeadScore()
```

Route handlers become: validate → call service → respond. Nothing else.

---

### GAP-002 — Audit Log Never Written (CRITICAL)

The `AuditLog` table exists with 13 action types defined. Not one line of code writes to it.

**Every action that must write a row:**

| Action | Location |
|---|---|
| `LOGIN_SUCCESS` | `lib/auth.ts` — authorize callback |
| `LOGIN_FAILURE` | `lib/auth.ts` — on failed/locked attempt |
| `LOGOUT` | NextAuth signout callback |
| `BOOKING_CREATE` | `POST /api/bookings` |
| `BOOKING_STATUS_UPDATE` | `PATCH /api/admin/bookings`, `PATCH /api/bookings/[id]` |
| `BOOKING_DELETE` | `DELETE /api/bookings/[id]` |
| `PROJECT_CREATE` | `POST /api/projects` |
| `PROJECT_UPDATE` | `PATCH /api/projects/[id]` |
| `PROJECT_DELETE` | `DELETE /api/projects/[id]` |
| `CONTACT_MESSAGE_CREATE` | `POST /api/contact` |
| `CONTACT_MESSAGE_READ` | `PATCH /api/contact` |
| `SETTINGS_UPDATE` | `PATCH /api/admin/settings/[key]` |

**`server/audit.ts`:**
```typescript
export async function writeAuditLog({
  action, entityType, entityId, userId, ipAddress, userAgent, metadata,
}: WriteAuditLogParams) {
  await db.auditLog.create({
    data: { action, entityType, entityId, userId, ipAddress, userAgent, metadata },
  });
}
```

---

### GAP-003 — Notification Outbox Never Triggered (HIGH)

The `Notification` table exists but nothing inserts into it and no worker processes it.

**Phase 1 — Insert triggers (Sprint 0):**
- `POST /api/bookings` → insert `Notification` row: type `BOOKING_NEW`, channel `email`
- `POST /api/contact` → insert `Notification` row: type `CONTACT_NEW`, channel `email`

**Phase 2 — Worker (Sprint 3):**
- `app/api/internal/notify/route.ts` — protected by `CRON_SECRET`
- Reads `sentAt: null` rows, dispatches via Resend
- On success: `sentAt = now()`. On failure: `failedAt = now()`, stores error, retries up to 3×

---

### GAP-004 — No `SiteSettings` API Routes (MEDIUM)

`SiteSettings` is read directly via `db` in `layout.tsx`. No admin can update settings through any interface.

**Needed:**
- `GET /api/admin/settings` — all settings as `{ key, value, description }[]`
- `PATCH /api/admin/settings/[key]` — update a single setting (admin-only, audit logged)

---

### GAP-005 — `leadScore` Calculation Missing (MEDIUM)

Every booking is created with `leadScore: null`. The scoring logic is referenced but never implemented.

**Proposed scoring — `server/lead-score.ts`:**

| Signal | Points |
|---|---|
| Budget provided | +20 |
| Budget ≥ R500,000 | +20 |
| `meetingDate` provided | +15 |
| Description ≥ 100 characters | +10 |
| Service = `dev_project_planning` | +15 |
| UTM source present | +10 |
| Mobile phone number format | +10 |
| **Max** | **100** |

---

### GAP-006 — `types/contact.ts` Missing (HIGH)

`ContactMessageSchema` doesn't exist. `POST /api/contact` cannot be built without it.

```typescript
// types/contact.ts
export const ContactMessageSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).optional(),
  message: z.string().min(10).max(2000),
});

export type ContactMessageInput = z.infer<typeof ContactMessageSchema>;
```

---

### GAP-007 — No Test Suite (HIGH)

Zero test files. No Vitest config. Going to production with no tests on auth, booking creation, or admin guards is a serious risk.

**Minimum before launch:**
```
tests/
  api/
    bookings.test.ts
    auth.test.ts
    admin-guard.test.ts
  unit/
    lead-score.test.ts
    api-response.test.ts
```

---

### GAP-008 — `types/project.ts` and `types/testimonial.ts` Are TS Interfaces Only (MEDIUM)

Both files contain TypeScript interfaces but no Zod schemas. Route-level schemas are inline and unreachable from outside the route.

**Fix:** Add `ProjectCreateSchema`, `ProjectUpdateSchema`, `TestimonialCreateSchema`, `TestimonialUpdateSchema` to their respective `types/` files.

---

### GAP-009 — No `DELETE /api/bookings/[id]` (LOW)

Admin needs to remove spam or test bookings. The endpoint doesn't exist.

**Fix:** Add a soft-delete DELETE handler (admin-protected, audit logged).

---

### GAP-010 — No Privacy Policy Page (MEDIUM — Legal / POPIA)

Footer links to `/privacy`. Page doesn't exist. POPIA legally requires a discoverable privacy policy for any South African business collecting personal data.

**Fix:** Create `app/privacy/page.tsx` covering: what data is collected, why, how it's stored, retention period, and data subject request contact.

---

## 5. Improvement Register — Things That Exist But Need Upgrading

---

### IMP-001 — Replace In-Memory Rate Limiter With Upstash Redis (CRITICAL — Pre-launch)

**Current:** `Map<string, { count, resetAt }>` stored in module scope.
**Problem:** Resets on every serverless cold start. Not shared across instances. Bypassable.
**Fix:**
```typescript
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const bookingRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  prefix: "rl:booking",
});

export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "15 m"),
  prefix: "rl:auth",
});

export const contactRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"),
  prefix: "rl:contact",
});
```

---

### IMP-002 — Import Path Aliases for `src/client/`

**Current:** `import { Button } from "@/src/client/components/ui/button"` — verbose, gets worse at scale.
**Fix — `tsconfig.json`:**
```json
{
  "compilerOptions": {
    "paths": {
      "@/components/*": ["./src/client/components/*"],
      "@/stores/*":     ["./src/client/stores/*"],
      "@/hooks/*":      ["./src/client/hooks/*"],
      "@/lib/*":        ["./lib/*"],
      "@/types/*":      ["./types/*"],
      "@/server/*":     ["./server/*"]
    }
  }
}
```
Imports become `@/components/ui/button`. Update `next.config.ts` to match.

---

### IMP-003 — Add `ADMIN_EMAIL` Environment Variable

**Fix:**
```env
ADMIN_EMAIL=xivutisokevinsunduza@gmail.com
```
Reference as `process.env.ADMIN_EMAIL` everywhere instead of hardcoded strings.

---

### IMP-004 — Pagination Defined But Never Implemented

`ApiListSuccess`, `BookingListQuerySchema` both support pagination. No route uses it. Admin booking list will return all records forever.
**Fix:** Implement `skip / take` in `GET /api/admin/bookings` using `BookingListQuerySchema`.

---

### IMP-005 — `layout.tsx` Makes Uncached DB Call on Every Request

`getWhatsAppNumber()` queries `db.siteSettings` on every page load.
**Fix:**
```typescript
import { unstable_cache } from "next/cache";

const getWhatsAppNumber = unstable_cache(
  async () => { /* db call */ },
  ["whatsapp-number"],
  { revalidate: 3600 }
);
```

---

### IMP-006 — `testimonials/[id]` PATCH Uses `featured` Field Not In Schema

`TestimonialUpdateSchema` references `featured` but the Prisma model has `isActive`. Mismatched field name — silent data loss.
**Fix:** Rename to `isActive` in the schema.

---

### IMP-007 — Add `X-Request-ID` to All Routes, Not Just Bookings

**Fix:** Add `generateRequestId()` at the top of every route handler and attach to all responses. Enables full log correlation.

---

## 6. Separation of Concerns — Current State vs Target State

### Current (Broken)

```
app/api/projects/route.ts
  ├── Validation schema definition   ← belongs in types/
  ├── Auth session check             ← correct here
  ├── DB query + business logic      ← belongs in server/
  └── Response formatting            ← correct here

lib/auth.ts
  ├── NextAuth configuration         ← correct here
  ├── Rate limiting logic            ← belongs in lib/rate-limit.ts
  └── Request ID generation          ← belongs in lib/request.ts
```

### Target (Clean)

```
types/     → Data contracts only. Zod schemas + inferred TS types. No logic. No DB.

lib/       → Infrastructure only. db singleton, auth config, rate limiter, utils.
             No business logic. No response formatting beyond helpers.

server/    → Business logic only. Pure functions. DB access via `db`.
             Knows nothing about HTTP, requests, or Next.js.
             Can be called from API routes, cron jobs, tests, or seed scripts.

app/api/   → HTTP layer only. Thin handlers: validate → call server/ → respond.
             Knows nothing about DB schema directly.

src/client/ → Browser only. No server-only imports. All data via API calls.
```

### Example Flow — Booking Creation (Target)

```
POST /api/bookings
  → validate with BookingSchema        (types/booking.ts)
  → call createBooking(data)           (server/bookings.ts)
      → calculateLeadScore(data)       (server/lead-score.ts)
      → db.booking.create(...)
      → db.notification.create(...)
      → writeAuditLog(...)             (server/audit.ts)
  → return apiSuccess(result)
```

---

## 7. Target Folder Structure

```
/
├── app/                                ← Next.js App Router — routes only
│   ├── globals.css                     ← ✅ Design tokens
│   ├── layout.tsx                      ← ✅ Root layout (fix: cache DB call)
│   ├── page.tsx                        ← ❌ STUB → BUILD Sprint 1
│   ├── services/page.tsx               ← ❌ STUB → BUILD Sprint 1
│   ├── projects/
│   │   ├── page.tsx                    ← ❌ STUB → BUILD Sprint 1
│   │   └── [id]/page.tsx               ← ❌ STUB → BUILD Sprint 1
│   ├── testimonials/page.tsx           ← ❌ STUB → BUILD Sprint 1
│   ├── contact/page.tsx                ← ❌ STUB → BUILD Sprint 1
│   ├── booking/page.tsx                ← ❌ STUB → BUILD Sprint 1
│   ├── privacy/page.tsx                ← ❌ MISSING → CREATE Sprint 1
│   ├── admin/
│   │   ├── login/page.tsx              ← ✅ Complete
│   │   └── (dashboard)/
│   │       ├── layout.tsx              ← ✅ Shell exists
│   │       ├── page.tsx                ← ❌ STUB → BUILD Sprint 2
│   │       ├── bookings/page.tsx       ← ❌ STUB → BUILD Sprint 2
│   │       ├── projects/page.tsx       ← ❌ STUB → BUILD Sprint 2
│   │       ├── testimonials/page.tsx   ← ❌ STUB → BUILD Sprint 2
│   │       ├── messages/page.tsx       ← ❌ STUB → BUILD Sprint 2
│   │       └── settings/page.tsx       ← ❌ STUB → BUILD Sprint 2
│   └── api/
│       ├── auth/[...nextauth]/         ← ✅ Complete
│       ├── health/                     ← ❌ DELETE (duplicate)
│       ├── v1/health/                  ← ✅ Keep as canonical
│       ├── bookings/
│       │   ├── route.ts                ← ⚠️ FIX: add audit + notification writes
│       │   └── [id]/route.ts           ← ⚠️ FIX: add DELETE handler
│       ├── contact/route.ts            ← ❌ FIX: add POST handler
│       ├── projects/
│       │   ├── route.ts                ← ⚠️ FIX: move schema to types/
│       │   └── [id]/route.ts           ← ⚠️ FIX: add audit writes
│       ├── testimonials/
│       │   ├── route.ts                ← ⚠️ FIX: move schema to types/
│       │   └── [id]/route.ts           ← ❌ FIX: hard delete → soft delete
│       └── admin/
│           ├── bookings/route.ts       ← ⚠️ FIX: add pagination + audit
│           ├── settings/               ← ❌ MISSING → CREATE Sprint 0
│           └── messages/               ← ❌ MISSING → CREATE Sprint 0
│
├── server/                             ← ❌ CREATE THIS LAYER — Sprint 0
│   ├── bookings.ts
│   ├── projects.ts
│   ├── testimonials.ts
│   ├── contact.ts
│   ├── settings.ts
│   ├── audit.ts
│   └── lead-score.ts
│
├── src/client/                         ← Browser-only code
│   ├── components/
│   │   ├── ui/                         ← ✅ Primitives built
│   │   ├── layout/                     ← ✅ Header, Footer, FloatingWhatsApp
│   │   ├── admin/                      ← ✅ AdminSidebar built
│   │   ├── features/                   ← ❌ CREATE Sprint 1+2
│   │   └── providers.tsx               ← ✅ Complete
│   ├── hooks/                          ← ❌ CREATE Sprint 1+2
│   └── stores/
│       └── admin-ui.ts                 ← ✅ Complete
│
├── lib/                                ← Infrastructure
│   ├── db.ts                           ← ⚠️ FIX: extend to findUnique
│   ├── auth.ts                         ← ⚠️ FIX: extract rate limiter + requestId
│   ├── rate-limit.ts                   ← ❌ CREATE Sprint 0
│   ├── request.ts                      ← ❌ CREATE Sprint 0
│   ├── api-response.ts                 ← ✅ Complete
│   ├── api-client.ts                   ← ⚠️ FIX: ApiClientError
│   └── utils.ts                        ← ✅ Complete
│
├── types/                              ← Data contracts
│   ├── booking.ts                      ← ⚠️ Add BookingUpdateSchema
│   ├── project.ts                      ← ⚠️ Add Zod schemas
│   ├── testimonial.ts                  ← ⚠️ Add Zod schemas
│   ├── contact.ts                      ← ❌ MISSING → CREATE Sprint 0
│   └── next-auth.d.ts                  ← ✅ Complete
│
├── prisma/
│   ├── schema.prisma                   ← ✅ Complete
│   ├── migrations/                     ← ✅ Init migration exists
│   ├── seed.ts                         ← Dev seed
│   └── seed.prod.ts                    ← ❌ MISSING → CREATE Sprint 3
│
├── tests/                              ← ❌ CREATE Sprint 4
│   ├── api/
│   └── unit/
│
├── middleware.ts                        ← ✅ Complete
└── .gitignore                           ← ⚠️ Add *.db entries
```

---

## 8. Repository Setup — One-Time Configuration

Do this once before any sprint begins.

### 8.1 Branch Structure

```
main
└── dev
    ├── feature/*
    ├── fix/*
    ├── refactor/*
    ├── docs/*
    └── hotfix/*
```

### 8.2 Create Base Branches

```bash
# On GitHub — create main (default), then:
git checkout -b dev
git push -u origin dev
```

### 8.3 Branch Protection Rules

**Protect `main`:**
- Require PR before merging
- Require 1 approval (even if solo — review your own work)
- Require status checks to pass
- Prevent direct pushes
- Prevent force pushes
- Prevent deletion

**Protect `dev`:**
- Require PR before merging
- Prevent direct pushes
- Prevent deletion

### 8.4 GitHub Labels to Create

**Technical:**
`backend` `frontend` `database` `devops` `documentation` `testing`

**Status:**
`blocked` `in-progress` `ready-for-review` `urgent`

**Phase:**
`sprint-0` `sprint-1` `sprint-2` `sprint-3` `sprint-4`

**Type:**
`bug` `feature` `refactor` `improvement`

### 8.5 Repository Settings

```
Settings → General:
  ✅ Issues
  ✅ Pull Requests
  ✅ Squash merging only
  ❌ Merge commits (disable)
  ❌ Rebase merging (disable)
  ✅ Automatically delete head branches after merge
```

### 8.6 Merge Strategy

**Always use Squash Merge.**

One PR = one clean commit on `dev`. Clean history. Easy rollback.

Example squashed commit message:
```
fix: remove dev.db from version control and update .gitignore (#3)
```

---

## 9. Sprint 0 — Backend Fixes & Foundations

**Goal:** System is correct. No broken routes. Service layer exists. All schemas centralised. Import aliases clean.
**Branch base:** `dev`
**Merges into:** `dev`

---

### Issues to Create First

Create these GitHub Issues before writing a single line of code. Label each with `sprint-0`.

```
#1  [BUG] Remove dev.db from git repository                      bug, database, sprint-0
#2  [BUG] Add POST /api/contact — public contact submission       bug, backend, sprint-0
#3  [BUG] Fix api-client.ts — ApiClientError with code field      bug, backend, sprint-0
#4  [BUG] Fix testimonials DELETE — hard delete → soft delete     bug, backend, sprint-0
#5  [BUG] Fix soft-delete middleware to cover findUnique          bug, database, sprint-0
#6  [REFACTOR] Extract rate limiter to lib/rate-limit.ts          refactor, backend, sprint-0
#7  [REFACTOR] Extract generateRequestId to lib/request.ts        refactor, backend, sprint-0
#8  [FEATURE] Create types/contact.ts — ContactMessageSchema      feature, backend, sprint-0
#9  [FEATURE] Move inline schemas to types/ (project, testimonial) refactor, backend, sprint-0
#10 [FEATURE] Create server/audit.ts — writeAuditLog()            feature, backend, sprint-0
#11 [FEATURE] Create server/lead-score.ts — calculateLeadScore()  feature, backend, sprint-0
#12 [FEATURE] Create server/bookings.ts service                   feature, backend, sprint-0
#13 [FEATURE] Create server/projects.ts service                   feature, backend, sprint-0
#14 [FEATURE] Create server/testimonials.ts service               feature, backend, sprint-0
#15 [FEATURE] Create server/contact.ts service                    feature, backend, sprint-0
#16 [FEATURE] Create server/settings.ts service                   feature, backend, sprint-0
#17 [FEATURE] Wire audit logs into all routes                     feature, backend, sprint-0
#18 [FEATURE] Wire notification inserts into booking + contact     feature, backend, sprint-0
#19 [FEATURE] Add DELETE /api/bookings/[id]                       feature, backend, sprint-0
#20 [FEATURE] Add GET + PATCH /api/admin/settings                 feature, backend, sprint-0
#21 [FEATURE] Add GET + PATCH /api/admin/messages                 feature, backend, sprint-0
#22 [FEATURE] Add pagination to GET /api/admin/bookings           feature, backend, sprint-0
#23 [BUG] Delete duplicate /api/health endpoint                   bug, backend, sprint-0
#24 [IMPROVEMENT] Add tsconfig path aliases                       improvement, sprint-0
#25 [IMPROVEMENT] Cache getWhatsAppNumber() in layout.tsx         improvement, backend, sprint-0
#26 [IMPROVEMENT] Add ADMIN_EMAIL env var                         improvement, devops, sprint-0
#27 [BUG] Fix isActive/featured field mismatch in testimonial     bug, backend, sprint-0
#28 [IMPROVEMENT] Add X-Request-ID to all routes                  improvement, backend, sprint-0
```

---

### Feature Branches & Workflow

Sprint 0 is grouped into logical feature branches. Each branch closes one or more related Issues.

---

#### Branch: `fix/s0-db-hygiene` → Closes #1, #5

```bash
git checkout dev
git pull origin dev
git checkout -b fix/s0-db-hygiene
```

**Work:**
- Add `*.db`, `*.db-shm`, `*.db-wal`, `prisma/dev.db`, `dev.db` to `.gitignore`
- Run `git rm --cached dev.db prisma/dev.db`
- Extend Prisma middleware in `lib/db.ts` to cover `findUnique` and `findUniqueOrThrow`

**Commits:**
```bash
git commit -m "fix: untrack dev.db and update .gitignore (#1)"
git commit -m "fix: extend soft-delete middleware to cover findUnique (#5)"
```

**PR:**
```
Title: fix: DB hygiene — remove dev.db and fix soft-delete middleware
Branch: fix/s0-db-hygiene → dev
Closes #1
Closes #5
```

---

#### Branch: `refactor/s0-lib-separation` → Closes #6, #7, #24, #26

```bash
git checkout dev
git pull origin dev
git checkout -b refactor/s0-lib-separation
```

**Work:**
- Create `lib/rate-limit.ts` — move `checkRateLimit`, stub Upstash interface
- Create `lib/request.ts` — move `generateRequestId`
- Remove both from `lib/auth.ts`
- Update all imports across the codebase
- Add path aliases to `tsconfig.json` (`@/components`, `@/server`, `@/hooks`, `@/stores`)
- Update `next.config.ts` to match aliases
- Add `ADMIN_EMAIL` to `.env.example`

**Commits:**
```bash
git commit -m "refactor: extract checkRateLimit to lib/rate-limit.ts (#6)"
git commit -m "refactor: extract generateRequestId to lib/request.ts (#7)"
git commit -m "refactor: add tsconfig path aliases for components, server, hooks (#24)"
git commit -m "chore: add ADMIN_EMAIL env var to .env.example (#26)"
```

**PR:**
```
Title: refactor: lib separation — rate-limit, request, path aliases
Branch: refactor/s0-lib-separation → dev
Closes #6, #7, #24, #26
```

---

#### Branch: `feature/s0-types-and-schemas` → Closes #8, #9, #27

```bash
git checkout dev
git pull origin dev
git checkout -b feature/s0-types-and-schemas
```

**Work:**
- Create `types/contact.ts` — `ContactMessageSchema`, `ContactMessageInput`
- Move `ProjectCreateSchema`, `ProjectUpdateSchema` to `types/project.ts`
- Move `TestimonialCreateSchema`, `TestimonialUpdateSchema` to `types/testimonial.ts`
- Add `BookingUpdateSchema` to `types/booking.ts`
- Fix `isActive` / `featured` field mismatch in testimonial schema
- Update route files to import from `types/`

**Commits:**
```bash
git commit -m "feat: add ContactMessageSchema to types/contact.ts (#8)"
git commit -m "refactor: move ProjectCreateSchema and ProjectUpdateSchema to types/project.ts (#9)"
git commit -m "refactor: move TestimonialCreateSchema and TestimonialUpdateSchema to types/testimonial.ts (#9)"
git commit -m "refactor: add BookingUpdateSchema to types/booking.ts (#9)"
git commit -m "fix: rename featured to isActive in TestimonialUpdateSchema (#27)"
```

**PR:**
```
Title: feature: centralise all Zod schemas in types/
Branch: feature/s0-types-and-schemas → dev
Closes #8, #9, #27
```

---

#### Branch: `feature/s0-service-layer` → Closes #10, #11, #12, #13, #14, #15, #16

```bash
git checkout dev
git pull origin dev
git checkout -b feature/s0-service-layer
```

**Work:**
- Create `server/audit.ts` — `writeAuditLog()`
- Create `server/lead-score.ts` — `calculateLeadScore()`
- Create `server/bookings.ts` — `createBooking()`, `getBookings()`, `getBookingById()`, `updateBookingStatus()`, `softDeleteBooking()`
- Create `server/projects.ts` — full CRUD service functions
- Create `server/testimonials.ts` — full CRUD service functions
- Create `server/contact.ts` — `createContactMessage()`, `markMessageRead()`
- Create `server/settings.ts` — `getSetting()`, `getSettings()`, `updateSetting()`

**Commits:**
```bash
git commit -m "feat: add server/audit.ts — writeAuditLog service (#10)"
git commit -m "feat: add server/lead-score.ts — calculateLeadScore (#11)"
git commit -m "feat: add server/bookings.ts — booking service layer (#12)"
git commit -m "feat: add server/projects.ts — project service layer (#13)"
git commit -m "feat: add server/testimonials.ts — testimonial service layer (#14)"
git commit -m "feat: add server/contact.ts — contact message service layer (#15)"
git commit -m "feat: add server/settings.ts — site settings service (#16)"
```

**PR:**
```
Title: feature: create server/ service layer
Branch: feature/s0-service-layer → dev
Closes #10, #11, #12, #13, #14, #15, #16
```

---

#### Branch: `fix/s0-api-fixes` → Closes #2, #3, #4, #17, #18, #19, #20, #21, #22, #23, #25, #28

```bash
git checkout dev
git pull origin dev
git checkout -b fix/s0-api-fixes
```

**Work:**
- Add `POST /api/contact` using `server/contact.ts`
- Fix `api-client.ts` — add `ApiClientError` class
- Fix `testimonials/[id]` DELETE — soft delete via service layer
- Wire `writeAuditLog()` into all routes (bookings POST, projects POST/PATCH/DELETE, testimonials, contact)
- Wire `db.notification.create()` in booking POST and contact POST
- Add `DELETE /api/bookings/[id]` (admin-protected, soft delete)
- Add `GET /api/admin/settings` and `PATCH /api/admin/settings/[key]`
- Add `GET /api/admin/messages` and `PATCH /api/admin/messages` (move from contact route)
- Implement pagination in `GET /api/admin/bookings`
- Delete `app/api/health/route.ts`
- Refactor all routes to call service layer functions instead of `db` directly
- Add `unstable_cache` to `getWhatsAppNumber()` in `app/layout.tsx`
- Add `X-Request-ID` to all route responses

**Commits:**
```bash
git commit -m "fix: add POST /api/contact — public contact form submission (#2)"
git commit -m "fix: add ApiClientError to preserve error code and status (#3)"
git commit -m "fix: replace hard delete with soft delete on testimonials/[id] (#4)"
git commit -m "feat: wire writeAuditLog into all API routes (#17)"
git commit -m "feat: wire notification inserts after booking and contact creation (#18)"
git commit -m "feat: add DELETE /api/bookings/[id] with soft delete and audit (#19)"
git commit -m "feat: add GET and PATCH /api/admin/settings (#20)"
git commit -m "feat: add GET and PATCH /api/admin/messages (#21)"
git commit -m "feat: add pagination to GET /api/admin/bookings (#22)"
git commit -m "fix: remove duplicate /api/health endpoint (#23)"
git commit -m "perf: cache getWhatsAppNumber in layout with unstable_cache (#25)"
git commit -m "feat: add X-Request-ID header to all route responses (#28)"
```

**PR:**
```
Title: fix: complete API layer — contact POST, soft deletes, audit writes, pagination
Branch: fix/s0-api-fixes → dev
Closes #2, #3, #4, #17, #18, #19, #20, #21, #22, #23, #25, #28
```

---

### Sprint 0 → dev Integration

After all Sprint 0 branches are merged into `dev`:

```bash
git checkout dev
git pull origin dev

# Run the full app locally
npm run dev

# Verify:
# ✅ POST /api/contact returns 201
# ✅ POST /api/bookings returns 201 and audit log row created
# ✅ GET /api/admin/bookings returns paginated results
# ✅ DELETE /api/testimonials/[id] sets deletedAt, not destroyed
# ✅ Soft-deleted records not returned by findUnique
# ✅ All route files import schemas from types/, not inline
# ✅ dev.db no longer tracked by git
```

**Sprint 0 does NOT merge to `main`.** Only full sprint releases go to `main`.

---

## 10. Sprint 1 — Public Site Frontend

**Goal:** Public visitors can browse, make contact, and book a consultation. Every public page renders real content.
**Branch base:** `dev` (after Sprint 0 is merged)
**Merges into:** `dev`

---

### Issues to Create

```
#29 [FEATURE] Build homepage — hero, stats, services preview, CTA       feature, frontend, sprint-1
#30 [FEATURE] Build /services page                                       feature, frontend, sprint-1
#31 [FEATURE] Build /projects portfolio grid with category filter        feature, frontend, sprint-1
#32 [FEATURE] Build /projects/[id] detail page                           feature, frontend, sprint-1
#33 [FEATURE] Build /testimonials reviews grid                           feature, frontend, sprint-1
#34 [FEATURE] Build /contact page with form wired to POST /api/contact   feature, frontend, sprint-1
#35 [FEATURE] Build /booking page with full consultation form            feature, frontend, sprint-1
#36 [FEATURE] Create /privacy POPIA-compliant privacy policy page        feature, frontend, sprint-1
#37 [FEATURE] Create React Query hooks for public data (useProjects etc) feature, frontend, sprint-1
#38 [FEATURE] Add loading skeletons and error boundaries on data pages   feature, frontend, sprint-1
```

---

### Feature Branches & Workflow

---

#### Branch: `feature/s1-public-hooks` → Closes #37

```bash
git checkout dev
git pull origin dev
git checkout -b feature/s1-public-hooks
```

**Work:**
- Create `src/client/hooks/useProjects.ts` — React Query hook, fetches `GET /api/projects`
- Create `src/client/hooks/useTestimonials.ts` — fetches `GET /api/testimonials`
- Create `src/client/hooks/useProject.ts` — fetches `GET /api/projects/[id]`

**Commits:**
```bash
git commit -m "feat: add useProjects React Query hook (#37)"
git commit -m "feat: add useTestimonials React Query hook (#37)"
git commit -m "feat: add useProject hook for detail page (#37)"
```

**PR:**
```
Title: feature: public data-fetching hooks with React Query
Branch: feature/s1-public-hooks → dev
Closes #37
```

---

#### Branch: `feature/s1-homepage` → Closes #29

```bash
git checkout dev
git pull origin dev
git checkout -b feature/s1-homepage
```

**Work:**
- Hero section: brand statement, CTA buttons (Book Consultation, View Projects)
- Stats bar: projects completed, years experience, services offered
- Services preview: 4 cards (House Planning, Arch Drawings, Drafting, Development)
- Featured projects row: uses `useProjects()` filtered by `isFeatured: true`
- CTA strip: "Ready to start your project?" with booking link

**Commits:**
```bash
git commit -m "feat: add hero section to homepage (#29)"
git commit -m "feat: add stats bar to homepage (#29)"
git commit -m "feat: add services preview section (#29)"
git commit -m "feat: add featured projects row with React Query (#29)"
git commit -m "feat: add CTA strip to homepage (#29)"
```

**PR:**
```
Title: feature: build homepage
Branch: feature/s1-homepage → dev
Closes #29
```

---

#### Branch: `feature/s1-services-page` → Closes #30

```bash
git checkout dev
git pull origin dev
git checkout -b feature/s1-services-page
```

**Work:**
- Full service listing: each of the 4 services with feature bullets, description, and per-service CTA

**Commits:**
```bash
git commit -m "feat: build /services page with full service listings (#30)"
```

**PR:**
```
Title: feature: build /services page
Branch: feature/s1-services-page → dev
Closes #30
```

---

#### Branch: `feature/s1-projects` → Closes #31, #32, #38

```bash
git checkout dev
git pull origin dev
git checkout -b feature/s1-projects
```

**Work:**
- `/projects` — Portfolio grid with category filter tabs, skeleton loading, empty state
- `/projects/[id]` — Project detail: image, title, category badge, full description, back link
- Loading skeletons and error boundaries on both pages

**Commits:**
```bash
git commit -m "feat: build /projects portfolio grid with category filter (#31)"
git commit -m "feat: build /projects/[id] detail page (#32)"
git commit -m "feat: add loading skeletons and error boundaries to project pages (#38)"
```

**PR:**
```
Title: feature: build projects portfolio pages
Branch: feature/s1-projects → dev
Closes #31, #32, #38
```

---

#### Branch: `feature/s1-testimonials` → Closes #33

```bash
git checkout dev
git pull origin dev
git checkout -b feature/s1-testimonials
```

**Work:**
- `/testimonials` — Star rating cards grid, featured testimonials highlighted, skeleton loading

**Commits:**
```bash
git commit -m "feat: build /testimonials page with star ratings grid (#33)"
```

**PR:**
```
Title: feature: build /testimonials page
Branch: feature/s1-testimonials → dev
Closes #33
```

---

#### Branch: `feature/s1-contact-form` → Closes #34

```bash
git checkout dev
git pull origin dev
git checkout -b feature/s1-contact-form
```

**Work:**
- `/contact` — Contact form with react-hook-form + Zod, wired to `POST /api/contact`
- Success state: "Message sent — we'll be in touch within 24 hours"
- Error state: field-level validation messages, network error fallback

**Commits:**
```bash
git commit -m "feat: build /contact page with form and submission handling (#34)"
```

**PR:**
```
Title: feature: build /contact page with working form submission
Branch: feature/s1-contact-form → dev
Closes #34
```

---

#### Branch: `feature/s1-booking-form` → Closes #35

```bash
git checkout dev
git pull origin dev
git checkout -b feature/s1-booking-form
```

**Work:**
- `/booking` — Full multi-field consultation form: name, email, phone, service (select), location, description, meetingDate, budget (optional)
- POPIA consent checkbox (non-submittable without it)
- Success confirmation with booking reference ID
- UTM params captured from query string before submission

**Commits:**
```bash
git commit -m "feat: build /booking form with all fields and Zod validation (#35)"
git commit -m "feat: add POPIA consent checkbox to booking form (#35)"
git commit -m "feat: add success confirmation with booking reference ID (#35)"
git commit -m "feat: capture UTM params from query string on booking submit (#35)"
```

**PR:**
```
Title: feature: build /booking consultation form
Branch: feature/s1-booking-form → dev
Closes #35
```

---

#### Branch: `feature/s1-privacy-page` → Closes #36

```bash
git checkout dev
git pull origin dev
git checkout -b feature/s1-privacy-page
```

**Work:**
- `/privacy` — POPIA-compliant privacy policy: what data is collected, why, how it's stored, retention period, data subject request contact, last updated date

**Commits:**
```bash
git commit -m "feat: add POPIA-compliant privacy policy page (#36)"
```

**PR:**
```
Title: feature: add /privacy page (POPIA compliance)
Branch: feature/s1-privacy-page → dev
Closes #36
```

---

### Sprint 1 → dev Integration

```bash
git checkout dev
git pull origin dev
npm run dev

# Verify:
# ✅ Homepage renders hero, stats, services, featured projects, CTA
# ✅ /services shows all 4 services with feature breakdowns
# ✅ /projects grid loads from API with category filter working
# ✅ /projects/[id] shows project detail
# ✅ /testimonials renders star ratings from API
# ✅ /contact form submits and shows success message
# ✅ /booking form submits, shows confirmation, POPIA checkbox required
# ✅ /privacy page is live and linked from footer
# ✅ Skeleton loading shows on data fetch
# ✅ Error boundary shows on API failure
npm run build  # must pass with zero TypeScript errors
```

**Sprint 1 does NOT merge to `main` yet.** Waits for Sprint 2.

---

## 11. Sprint 2 — Admin Dashboard Frontend

**Goal:** Admin can manage all incoming work through the dashboard.
**Branch base:** `dev` (after Sprint 1 is merged)
**Merges into:** `dev`

---

### Issues to Create

```
#39 [FEATURE] Build admin dashboard — stats cards and quick-nav          feature, frontend, sprint-2
#40 [FEATURE] Build /admin/bookings — filterable table with status mgmt  feature, frontend, sprint-2
#41 [FEATURE] Build /admin/projects — CRUD with featured toggle          feature, frontend, sprint-2
#42 [FEATURE] Build /admin/testimonials — CRUD with isActive toggle      feature, frontend, sprint-2
#43 [FEATURE] Build /admin/messages — inbox with mark-as-read            feature, frontend, sprint-2
#44 [FEATURE] Build /admin/settings — SiteSettings key-value editor      feature, frontend, sprint-2
#45 [FEATURE] Create admin React Query hooks                              feature, frontend, sprint-2
#46 [FEATURE] Wire mobile sidebar toggle to Zustand useAdminUI store     feature, frontend, sprint-2
```

---

### Feature Branches & Workflow

---

#### Branch: `feature/s2-admin-hooks` → Closes #45

```bash
git checkout dev
git pull origin dev
git checkout -b feature/s2-admin-hooks
```

**Work:**
- `src/client/hooks/useAdminBookings.ts` — React Query, fetches `GET /api/admin/bookings` with status filter + pagination
- `src/client/hooks/useAdminProjects.ts` — fetches `GET /api/projects` (admin view, all fields)
- `src/client/hooks/useAdminTestimonials.ts`
- `src/client/hooks/useAdminMessages.ts` — fetches `GET /api/admin/messages`
- `src/client/hooks/useAdminSettings.ts`
- Mutation hooks: `useUpdateBookingStatus`, `useUpdateProject`, `useDeleteProject`, etc.

**Commits:**
```bash
git commit -m "feat: add admin data-fetching hooks with React Query (#45)"
git commit -m "feat: add admin mutation hooks for CRUD operations (#45)"
```

**PR:**
```
Title: feature: admin React Query hooks and mutations
Branch: feature/s2-admin-hooks → dev
Closes #45
```

---

#### Branch: `feature/s2-admin-layout-sidebar` → Closes #46

```bash
git checkout dev
git pull origin dev
git checkout -b feature/s2-admin-layout-sidebar
```

**Work:**
- Wire mobile sidebar toggle in admin layout to `useAdminUI()` Zustand store (already defined)
- Ensure `AdminSidebar` receives `adminEmail` and `adminName` from session in the layout

**Commits:**
```bash
git commit -m "feat: wire AdminSidebar to useAdminUI Zustand store for mobile toggle (#46)"
git commit -m "feat: pass session user data to AdminSidebar from dashboard layout (#46)"
```

**PR:**
```
Title: feature: wire admin layout sidebar to Zustand store
Branch: feature/s2-admin-layout-sidebar → dev
Closes #46
```

---

#### Branch: `feature/s2-admin-dashboard` → Closes #39

```bash
git checkout dev
git pull origin dev
git checkout -b feature/s2-admin-dashboard
```

**Work:**
- Stats cards: total bookings, pending bookings, new this week, unread messages, total projects
- Quick-nav tiles to bookings, projects, testimonials, messages sections
- Recent bookings preview (last 5)

**Commits:**
```bash
git commit -m "feat: build admin dashboard with stats cards (#39)"
git commit -m "feat: add quick-nav tiles and recent bookings to dashboard (#39)"
```

**PR:**
```
Title: feature: build admin dashboard page
Branch: feature/s2-admin-dashboard → dev
Closes #39
```

---

#### Branch: `feature/s2-admin-bookings` → Closes #40

```bash
git checkout dev
git pull origin dev
git checkout -b feature/s2-admin-bookings
```

**Work:**
- Booking table: sortable by date and lead score
- Status filter tabs (All / Pending / Contacted / Confirmed / Completed / Rejected)
- Search by name or email
- Expandable row: full booking details, admin notes textarea, status change dropdown
- Lead score indicator (colour-coded: 0–40 low, 41–70 medium, 71–100 high)
- Pagination controls

**Commits:**
```bash
git commit -m "feat: build admin bookings table with status filter and search (#40)"
git commit -m "feat: add expandable booking row with admin notes and status actions (#40)"
git commit -m "feat: add lead score indicator and pagination to bookings table (#40)"
```

**PR:**
```
Title: feature: build /admin/bookings management page
Branch: feature/s2-admin-bookings → dev
Closes #40
```

---

#### Branch: `feature/s2-admin-projects` → Closes #41

```bash
git checkout dev
git pull origin dev
git checkout -b feature/s2-admin-projects
```

**Work:**
- Project list with image thumbnail, title, category, featured badge
- Add project modal/form
- Edit project inline or via modal
- Delete with confirmation dialog (soft delete)
- Featured toggle (instant PATCH)
- Sort order input

**Commits:**
```bash
git commit -m "feat: build admin projects list with add and edit forms (#41)"
git commit -m "feat: add delete confirmation and featured toggle to projects (#41)"
```

**PR:**
```
Title: feature: build /admin/projects CRUD page
Branch: feature/s2-admin-projects → dev
Closes #41
```

---

#### Branch: `feature/s2-admin-testimonials` → Closes #42

```bash
git checkout dev
git pull origin dev
git checkout -b feature/s2-admin-testimonials
```

**Work:**
- Testimonial list with star rating display
- Add / edit testimonial form
- `isActive` toggle (show/hide without deleting)
- Delete with confirmation

**Commits:**
```bash
git commit -m "feat: build admin testimonials list with CRUD and isActive toggle (#42)"
```

**PR:**
```
Title: feature: build /admin/testimonials management page
Branch: feature/s2-admin-testimonials → dev
Closes #42
```

---

#### Branch: `feature/s2-admin-messages` → Closes #43

```bash
git checkout dev
git pull origin dev
git checkout -b feature/s2-admin-messages
```

**Work:**
- Message inbox: unread/read tabs, unread count badge
- Message row: sender name, email, preview, timestamp
- Click to expand: full message, mark as read on open
- Reply via `mailto:` link (v1)

**Commits:**
```bash
git commit -m "feat: build admin messages inbox with unread/read tabs (#43)"
git commit -m "feat: add mark-as-read on message open (#43)"
```

**PR:**
```
Title: feature: build /admin/messages inbox
Branch: feature/s2-admin-messages → dev
Closes #43
```

---

#### Branch: `feature/s2-admin-settings` → Closes #44

```bash
git checkout dev
git pull origin dev
git checkout -b feature/s2-admin-settings
```

**Work:**
- Settings form: one field per `SiteSettings` key
- Current keys: `whatsapp_number`, `admin_email`, `business_hours`
- Inline save with success/error feedback
- Description label from `SiteSettings.description` column

**Commits:**
```bash
git commit -m "feat: build admin settings page wired to /api/admin/settings (#44)"
```

**PR:**
```
Title: feature: build /admin/settings SiteSettings editor
Branch: feature/s2-admin-settings → dev
Closes #44
```

---

### Sprint 2 → dev Integration + Release to main

After all Sprint 2 branches are merged into `dev`:

```bash
git checkout dev
git pull origin dev
npm run dev

# Full integration test:
# ✅ Admin login → dashboard → all sections navigate correctly
# ✅ Bookings: filter, search, status update, admin notes all persist
# ✅ Projects: add, edit, delete (soft), featured toggle all work
# ✅ Testimonials: add, edit, delete (soft), isActive toggle work
# ✅ Messages: inbox loads, mark-as-read updates unread count
# ✅ Settings: WhatsApp number update reflects on public site layout
# ✅ Mobile sidebar opens/closes via Zustand store
# ✅ Public site still works end-to-end
npm run build  # must pass
```

**After integration passes — open PR: `dev → main`**

```
PR Title: release: Sprint 0 + Sprint 1 + Sprint 2 — public site and admin dashboard
Branch: dev → main

Description:
- Sprint 0: Backend fixes, service layer, audit writes, notification triggers
- Sprint 1: Full public site (7 pages + privacy)
- Sprint 2: Full admin dashboard (6 sections)

All tests passing. Build passing. Integration verified.
```

**This is the first `main` release. The system is live-deployable after this merge.**

---

## 12. Sprint 3 — Notifications & Infrastructure

**Goal:** Admin receives email on new bookings and messages. System is production-deployable with durable rate limiting.
**Branch base:** `dev`
**Merges into:** `dev` → then `main` after testing

---

### Issues to Create

```
#47 [FEATURE] Install Upstash Redis and replace in-memory rate limiter   feature, backend, devops, sprint-3
#48 [FEATURE] Install Resend and create lib/email.ts with templates      feature, backend, sprint-3
#49 [FEATURE] Build /api/internal/notify outbox processor                feature, backend, sprint-3
#50 [FEATURE] Configure Vercel/Railway cron for notify endpoint           feature, devops, sprint-3
#51 [FEATURE] New booking admin email notification template               feature, backend, sprint-3
#52 [FEATURE] New contact message admin email template                    feature, backend, sprint-3
#53 [FEATURE] Create prisma/seed.prod.ts for first production deploy      feature, database, sprint-3
#54 [FEATURE] Configure Railway (DB) + Vercel (app) deployment            feature, devops, sprint-3
#55 [FEATURE] Set all production environment variables                    feature, devops, sprint-3
```

---

### Feature Branches & Workflow

---

#### Branch: `feature/s3-redis-rate-limit` → Closes #47

```bash
git checkout dev
git pull origin dev
git checkout -b feature/s3-redis-rate-limit
```

**Work:**
- `npm install @upstash/ratelimit @upstash/redis`
- Replace in-memory `checkRateLimit` in `lib/rate-limit.ts` with Upstash sliding window
- Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to `.env.example`
- Update auth, booking, and contact routes to use the new rate limiters

**Commits:**
```bash
git commit -m "feat: install Upstash Redis and replace in-memory rate limiter (#47)"
git commit -m "feat: update auth, booking, contact routes to use Upstash rate limits (#47)"
```

**PR:**
```
Title: feature: replace in-memory rate limiter with Upstash Redis
Branch: feature/s3-redis-rate-limit → dev
Closes #47
```

---

#### Branch: `feature/s3-email-notifications` → Closes #48, #49, #51, #52

```bash
git checkout dev
git pull origin dev
git checkout -b feature/s3-email-notifications
```

**Work:**
- `npm install resend`
- Create `lib/email.ts` with `sendEmail()` wrapper
- Create email templates: `newBookingNotification()`, `newContactMessageNotification()`
- Create `app/api/internal/notify/route.ts`:
  - Protected by `CRON_SECRET` header check
  - Reads `Notification` rows where `sentAt: null`
  - Dispatches via `sendEmail()`
  - On success: sets `sentAt = now()`
  - On failure: sets `failedAt = now()`, stores error, retries up to 3×

**Commits:**
```bash
git commit -m "feat: install Resend and add lib/email.ts (#48)"
git commit -m "feat: add new booking admin email template (#51)"
git commit -m "feat: add new contact message admin email template (#52)"
git commit -m "feat: build /api/internal/notify outbox processor (#49)"
```

**PR:**
```
Title: feature: email notifications via Resend and outbox processor
Branch: feature/s3-email-notifications → dev
Closes #48, #49, #51, #52
```

---

#### Branch: `feature/s3-deployment` → Closes #50, #53, #54, #55

```bash
git checkout dev
git pull origin dev
git checkout -b feature/s3-deployment
```

**Work:**
- Create `prisma/seed.prod.ts` — creates production admin account (reads credentials from env, does not hardcode)
- Configure Vercel Cron in `vercel.json`:
  ```json
  {
    "crons": [{ "path": "/api/internal/notify", "schedule": "*/5 * * * *" }]
  }
  ```
- Document Railway PostgreSQL setup in `docs/deployment.md`
- Document all required env vars with descriptions in `.env.example`
- Set `DATABASE_URL` to Neon/Railway PostgreSQL connection string
- Configure `prisma migrate deploy` as a build step

**Commits:**
```bash
git commit -m "feat: add prisma/seed.prod.ts for production admin seeding (#53)"
git commit -m "feat: configure Vercel Cron for notify endpoint (#50)"
git commit -m "docs: add deployment guide for Railway + Vercel (#54)"
git commit -m "chore: document all required production env vars in .env.example (#55)"
```

**PR:**
```
Title: feature: production deployment configuration
Branch: feature/s3-deployment → dev
Closes #50, #53, #54, #55
```

---

### Sprint 3 → dev → main

```bash
# After all branches merged to dev:
npm run build

# Verify in staging/production:
# ✅ New booking → admin receives email within 5 minutes
# ✅ New contact message → admin receives email within 5 minutes
# ✅ Rate limiting survives serverless cold starts (test with multiple instances)
# ✅ /api/v1/health returns { status: "ok", database: "connected" }
# ✅ prisma migrate deploy ran cleanly on production DB
```

**Open PR: `dev → main`**
```
PR Title: release: Sprint 3 — notifications, Redis rate limiting, production deployment
```

---

## 13. Sprint 4 — Testing & Launch Polish

**Goal:** Confidence to go live. Tests cover critical paths. Accessibility and SEO complete.
**Branch base:** `dev`
**Merges into:** `dev` → then `main`

---

### Issues to Create

```
#56 [FEATURE] Set up Vitest + testing-library                            feature, testing, sprint-4
#57 [TEST] API integration tests: booking creation, rate limit, Zod      testing, backend, sprint-4
#58 [TEST] API integration tests: auth flows and account lockout         testing, backend, sprint-4
#59 [TEST] API integration tests: all admin routes return 401 without session  testing, backend, sprint-4
#60 [TEST] Unit tests: lead score calculation                            testing, backend, sprint-4
#61 [TEST] Unit tests: apiSuccess and apiError shapes                    testing, backend, sprint-4
#62 [FEATURE] Set up Playwright E2E                                      feature, testing, sprint-4
#63 [TEST] E2E: booking form submission flow                             testing, frontend, sprint-4
#64 [TEST] E2E: admin login, booking status update                       testing, frontend, sprint-4
#65 [IMPROVEMENT] Accessibility audit and fixes                          improvement, frontend, sprint-4
#66 [IMPROVEMENT] Add OG image and full SEO metadata to all pages        improvement, frontend, sprint-4
#67 [IMPROVEMENT] Lighthouse audit — target score ≥ 85 on homepage       improvement, frontend, sprint-4
#68 [FEATURE] Add error monitoring (Sentry or Axiom)                     feature, devops, sprint-4
```

---

### Feature Branches & Workflow

---

#### Branch: `feature/s4-test-setup` → Closes #56, #62

```bash
git checkout dev
git pull origin dev
git checkout -b feature/s4-test-setup
```

**Work:**
- Install and configure Vitest + `@testing-library/react` + `msw`
- Install and configure Playwright
- Add `tests/` directory structure
- Add `npm run test` and `npm run test:e2e` scripts to `package.json`

**Commits:**
```bash
git commit -m "feat: set up Vitest and testing-library (#56)"
git commit -m "feat: set up Playwright E2E test runner (#62)"
```

**PR:**
```
Title: feature: test infrastructure setup — Vitest + Playwright
Branch: feature/s4-test-setup → dev
Closes #56, #62
```

---

#### Branch: `test/s4-api-tests` → Closes #57, #58, #59, #60, #61

```bash
git checkout dev
git pull origin dev
git checkout -b test/s4-api-tests
```

**Work:**
- `tests/api/bookings.test.ts` — POST creates booking, rate limit enforced, Zod rejects invalid input
- `tests/api/auth.test.ts` — Login success, login failure, lockout after 10 attempts
- `tests/api/admin-guard.test.ts` — Every admin route returns 401 without session
- `tests/unit/lead-score.test.ts` — Score calculation for all signal combinations
- `tests/unit/api-response.test.ts` — Shape of `apiSuccess` and `apiError`

**Commits:**
```bash
git commit -m "test: add booking API integration tests (#57)"
git commit -m "test: add auth flow and account lockout tests (#58)"
git commit -m "test: add admin route guard tests — 401 without session (#59)"
git commit -m "test: add lead score unit tests (#60)"
git commit -m "test: add apiSuccess and apiError unit tests (#61)"
```

**PR:**
```
Title: test: API integration tests and unit tests
Branch: test/s4-api-tests → dev
Closes #57, #58, #59, #60, #61
```

---

#### Branch: `test/s4-e2e-tests` → Closes #63, #64

```bash
git checkout dev
git pull origin dev
git checkout -b test/s4-e2e-tests
```

**Work:**
- `tests/e2e/booking.spec.ts` — Fill and submit booking form, verify success message
- `tests/e2e/admin.spec.ts` — Login, navigate to bookings, change booking status, verify update

**Commits:**
```bash
git commit -m "test: add E2E test for booking form submission flow (#63)"
git commit -m "test: add E2E test for admin login and booking status update (#64)"
```

**PR:**
```
Title: test: E2E tests for booking and admin flows
Branch: test/s4-e2e-tests → dev
Closes #63, #64
```

---

#### Branch: `feature/s4-seo-a11y` → Closes #65, #66, #67

```bash
git checkout dev
git pull origin dev
git checkout -b feature/s4-seo-a11y
```

**Work:**
- Add unique `metadata` exports to all public pages (title, description, OG image, canonical URL)
- Add `<Image />` alt text audit across all pages
- Add keyboard navigation to all interactive components
- Fix focus management on forms and modals
- Run Lighthouse, fix issues until homepage scores ≥ 85 across all categories

**Commits:**
```bash
git commit -m "feat: add full SEO metadata and OG images to all public pages (#66)"
git commit -m "fix: keyboard navigation and focus management accessibility fixes (#65)"
git commit -m "perf: Lighthouse optimisations — images, fonts, CLS (#67)"
```

**PR:**
```
Title: feat: SEO metadata, accessibility fixes, Lighthouse optimisation
Branch: feature/s4-seo-a11y → dev
Closes #65, #66, #67
```

---

#### Branch: `feature/s4-monitoring` → Closes #68

```bash
git checkout dev
git pull origin dev
git checkout -b feature/s4-monitoring
```

**Work:**
- Install Sentry (`@sentry/nextjs`)
- Configure `sentry.client.config.ts`, `sentry.server.config.ts`
- Add `SENTRY_DSN` to `.env.example`
- Verify errors appear in Sentry dashboard

**Commits:**
```bash
git commit -m "feat: add Sentry error monitoring (#68)"
```

**PR:**
```
Title: feat: add Sentry error monitoring
Branch: feature/s4-monitoring → dev
Closes #68
```

---

### Sprint 4 → dev → main (Final Production Release)

```bash
git checkout dev
git pull origin dev

npm run test       # all unit + integration tests pass
npm run test:e2e   # all Playwright tests pass
npm run build      # zero TypeScript errors
```

**Open final PR: `dev → main`**
```
PR Title: release: Sprint 4 — tests, SEO, accessibility, monitoring — PRODUCTION READY

Description:
- Full test suite: unit, integration, E2E
- SEO metadata and OG images on all public pages
- Accessibility audit complete
- Lighthouse score ≥ 85
- Sentry error monitoring active

System is production-ready.
```

---

## 14. Production Readiness Checklist

### Security
- [ ] `dev.db` removed from git history and `.gitignore` updated
- [ ] All environment variables in `.env.local`, never committed
- [ ] Upstash Redis rate limiting active (not in-memory)
- [ ] `NEXTAUTH_SECRET` is a strong random string (32+ chars)
- [ ] `BCRYPT_ROUNDS` set to 12 or higher in production
- [ ] Admin password changed from dev seed value
- [ ] `CRON_SECRET` set and validated in `/api/internal/notify`

### Data
- [ ] `DATABASE_URL` points to Neon PostgreSQL (not SQLite)
- [ ] `prisma migrate deploy` run on production database
- [ ] Production admin account seeded via `seed.prod.ts` (not hardcoded)
- [ ] Prisma connection pooling configured for serverless (PgBouncer or Neon pooler)

### Application
- [ ] All public pages render real content
- [ ] All admin pages render and function
- [ ] Booking form submits and admin receives email within 5 minutes
- [ ] Contact form submits and admin receives email within 5 minutes
- [ ] Admin can update booking status and changes persist
- [ ] Admin login and logout work
- [ ] Unauthenticated access to `/admin/*` redirects to login
- [ ] Audit logs written for all tracked actions
- [ ] Soft-deleted records not returned by any query
- [ ] `/api/v1/health` returns `{ status: "ok", database: "connected" }`

### Tests
- [ ] All unit tests pass (`npm run test`)
- [ ] All E2E tests pass (`npm run test:e2e`)
- [ ] `npm run build` completes with zero errors

### Performance & SEO
- [ ] All pages have unique `<title>` and `<meta name="description">`
- [ ] OG images configured for social sharing
- [ ] All images use Next.js `<Image />` with alt text
- [ ] Lighthouse Performance ≥ 85 on homepage
- [ ] Lighthouse Accessibility ≥ 90

### Legal (POPIA — South Africa)
- [ ] `/privacy` page live and linked from footer
- [ ] Booking form POPIA consent checkbox required before submission
- [ ] `consentGivenAt` timestamp recorded on every booking
- [ ] Admin can view and delete any contact message (right to erasure)

### Monitoring
- [ ] Sentry DSN configured in production
- [ ] Test error appears in Sentry dashboard before go-live

---

## Appendix — Complete Branch List by Sprint

```
Sprint 0 (Backend Fixes)
  fix/s0-db-hygiene
  refactor/s0-lib-separation
  feature/s0-types-and-schemas
  feature/s0-service-layer
  fix/s0-api-fixes

Sprint 1 (Public Site)
  feature/s1-public-hooks
  feature/s1-homepage
  feature/s1-services-page
  feature/s1-projects
  feature/s1-testimonials
  feature/s1-contact-form
  feature/s1-booking-form
  feature/s1-privacy-page

Sprint 2 (Admin Dashboard)
  feature/s2-admin-hooks
  feature/s2-admin-layout-sidebar
  feature/s2-admin-dashboard
  feature/s2-admin-bookings
  feature/s2-admin-projects
  feature/s2-admin-testimonials
  feature/s2-admin-messages
  feature/s2-admin-settings

Sprint 3 (Notifications & Infrastructure)
  feature/s3-redis-rate-limit
  feature/s3-email-notifications
  feature/s3-deployment

Sprint 4 (Testing & Polish)
  feature/s4-test-setup
  test/s4-api-tests
  test/s4-e2e-tests
  feature/s4-seo-a11y
  feature/s4-monitoring
```

---

## Appendix — GitHub Issues Summary (All 68)

| # | Title | Sprint | Labels |
|---|---|---|---|
| 1 | Remove dev.db from git | 0 | bug, database |
| 2 | Add POST /api/contact | 0 | bug, backend |
| 3 | Fix ApiClientError | 0 | bug, backend |
| 4 | Fix testimonials hard delete | 0 | bug, backend |
| 5 | Fix soft-delete middleware | 0 | bug, database |
| 6 | Extract rate limiter | 0 | refactor, backend |
| 7 | Extract generateRequestId | 0 | refactor, backend |
| 8 | Create types/contact.ts | 0 | feature, backend |
| 9 | Move inline schemas to types/ | 0 | refactor, backend |
| 10 | Create server/audit.ts | 0 | feature, backend |
| 11 | Create server/lead-score.ts | 0 | feature, backend |
| 12 | Create server/bookings.ts | 0 | feature, backend |
| 13 | Create server/projects.ts | 0 | feature, backend |
| 14 | Create server/testimonials.ts | 0 | feature, backend |
| 15 | Create server/contact.ts | 0 | feature, backend |
| 16 | Create server/settings.ts | 0 | feature, backend |
| 17 | Wire audit logs into all routes | 0 | feature, backend |
| 18 | Wire notification inserts | 0 | feature, backend |
| 19 | Add DELETE /api/bookings/[id] | 0 | feature, backend |
| 20 | Add /api/admin/settings routes | 0 | feature, backend |
| 21 | Add /api/admin/messages routes | 0 | feature, backend |
| 22 | Add pagination to admin bookings | 0 | feature, backend |
| 23 | Delete duplicate /api/health | 0 | bug, backend |
| 24 | Add tsconfig path aliases | 0 | improvement |
| 25 | Cache getWhatsAppNumber | 0 | improvement, backend |
| 26 | Add ADMIN_EMAIL env var | 0 | improvement, devops |
| 27 | Fix isActive/featured mismatch | 0 | bug, backend |
| 28 | Add X-Request-ID to all routes | 0 | improvement, backend |
| 29 | Build homepage | 1 | feature, frontend |
| 30 | Build /services page | 1 | feature, frontend |
| 31 | Build /projects grid | 1 | feature, frontend |
| 32 | Build /projects/[id] | 1 | feature, frontend |
| 33 | Build /testimonials | 1 | feature, frontend |
| 34 | Build /contact form | 1 | feature, frontend |
| 35 | Build /booking form | 1 | feature, frontend |
| 36 | Build /privacy page | 1 | feature, frontend |
| 37 | Public React Query hooks | 1 | feature, frontend |
| 38 | Skeletons and error boundaries | 1 | feature, frontend |
| 39 | Admin dashboard page | 2 | feature, frontend |
| 40 | Admin bookings management | 2 | feature, frontend |
| 41 | Admin projects CRUD | 2 | feature, frontend |
| 42 | Admin testimonials CRUD | 2 | feature, frontend |
| 43 | Admin messages inbox | 2 | feature, frontend |
| 44 | Admin settings editor | 2 | feature, frontend |
| 45 | Admin React Query hooks | 2 | feature, frontend |
| 46 | Wire mobile sidebar to Zustand | 2 | feature, frontend |
| 47 | Upstash Redis rate limiter | 3 | feature, backend, devops |
| 48 | Resend email setup | 3 | feature, backend |
| 49 | Notify outbox processor | 3 | feature, backend |
| 50 | Configure cron job | 3 | feature, devops |
| 51 | Booking email template | 3 | feature, backend |
| 52 | Contact email template | 3 | feature, backend |
| 53 | prisma/seed.prod.ts | 3 | feature, database |
| 54 | Railway + Vercel deployment | 3 | feature, devops |
| 55 | Production env vars | 3 | feature, devops |
| 56 | Vitest setup | 4 | feature, testing |
| 57 | Booking API tests | 4 | testing, backend |
| 58 | Auth flow tests | 4 | testing, backend |
| 59 | Admin guard tests | 4 | testing, backend |
| 60 | Lead score unit tests | 4 | testing, backend |
| 61 | apiSuccess/apiError unit tests | 4 | testing, backend |
| 62 | Playwright setup | 4 | feature, testing |
| 63 | Booking E2E test | 4 | testing, frontend |
| 64 | Admin E2E test | 4 | testing, frontend |
| 65 | Accessibility audit | 4 | improvement, frontend |
| 66 | OG images and SEO metadata | 4 | improvement, frontend |
| 67 | Lighthouse optimisation | 4 | improvement, frontend |
| 68 | Sentry monitoring | 4 | feature, devops |

---

*Build plan v2 — authored against commit state: `sunduza-architectural-main` — 15 May 2026*
*Next review: after Sprint 0 is complete and merged to dev*
