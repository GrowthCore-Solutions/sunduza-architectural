# Sunduza Architectural & Projects — System Redesign
## Industry-Level Analysis · Architecture · Implementation

> **Document type:** Living engineering reference  
> **Written for:** A developer who needs to understand, build, debug, and own this system  
> **Standard:** Senior engineer / systems architect review  
> **Date:** May 2026

---

## Read This First

This document exists because a system without understanding is a system that breaks and stays broken.

Every section answers three questions: **What** is this thing? **Why** does it exist? **How** does it work — and how do you know when it's broken?

Nothing in here is built to impress. Everything is built because the business needs it.

---

## Part 0 — System Identity

### What This System Is

Sunduza Architectural & Projects is a South African architectural firm. They plan houses, produce architectural drawings, do drafting, and manage development projects.

This system does exactly four things for that business:

1. **Shows the work** — portfolio of completed projects builds trust before a visitor picks up the phone
2. **Captures leads** — consultation booking form and contact form are the two revenue entry points
3. **Manages leads** — admin dashboard lets the owner see, track, and respond to every enquiry
4. **Builds proof** — client testimonials reduce the risk in a visitor's mind before they book

That is the entire system. Everything built must serve one of those four purposes. Anything that doesn't is waste.

### The Five Principles That Drive Every Technical Decision

**1. Every lead is money.**  
A booking that gets lost, corrupted, or silently fails is revenue that never existed. Bookings are stored immediately, confirmed to the visitor, and never hard-deleted. The admin is notified. The audit log records the event. This is non-negotiable.

**2. The admin is one person.**  
This is not a multi-tenant SaaS. There is one admin — the business owner. The system must be simple enough that someone who is not a developer can use it every day without confusion. Complexity must live in the code, not in the user's head.

**3. POPIA is law, not a feature.**  
South Africa's Protection of Personal Information Act applies to every piece of personal data this system collects. Consent must be explicit, recorded with a timestamp, and retrievable. Visitors must be able to request deletion of their data. The privacy policy must exist and be reachable. These are legal obligations.

**4. If it breaks, you find it in under five minutes.**  
Every operation that matters produces a trail. Request IDs on every response. Audit logs on every state change. Structured error codes so the client knows exactly what failed. Log enough context that a cold read of the logs reconstructs what happened.

**5. Build what the business needs. Nothing more.**  
No microservices. No event queues. No caching layers that aren't justified by an actual performance problem. One Next.js application, one PostgreSQL database, one admin user. Add complexity when the problem demands it, not before.

---

## Part 1 — Database Layer

### Current State: 92% Complete

The schema is the strongest part of the system. The data model is honest — it reflects what the business actually does. The decisions are documented in the schema itself. The weak points are implementation details, not design failures.

**What is correct:**
- Every mutable entity has `deleted_at` — no hard deletes
- `AuditLog` has no `updated_at`, no `deleted_at` — write-once by design
- `Booking` captures all 5 UTM dimensions — marketing attribution works from day one
- `Booking` stores POPIA consent fields — `consent_given` + `consent_given_at` — both required
- `Notification` as an outbox table — correct pattern for async email without coupling to the request
- `SiteSettings` as a bounded key-value store — config without redeployment
- Database sessions (`Session` table) — instant revocation, no JWT gymnastics
- Composite indexes match the actual query patterns admin pages will use

**What needs fixing:**

| Problem | File | Impact |
|---|---|---|
| `findUnique` not covered by soft-delete middleware | `lib/db.ts` | Soft-deleted records fetchable by ID |
| `dev.db` committed to git | `.gitignore` | Admin credentials exposed in repo |
| `rating` CHECK constraint not in migration SQL | `prisma/migrations/` | DB allows ratings outside 1–5 |
| No production seed file | `prisma/` | First deploy has no admin account |

---

### The Database Design — Table by Table

#### `users`

**What:** The single admin identity. One row. Ever.

**Why this structure:**
- `password`: stored as a bcrypt hash — never the plaintext value
- `failed_attempts` + `locked_until`: lockout state lives in the database, not in memory. This means a restart, a new instance, or a new server cannot bypass the lockout
- `email_verified`, `image`: required by the NextAuth Prisma adapter even though they are unused in v1 — they must exist or the adapter throws
- `deleted_at`: the admin account can be soft-deactivated without deleting the foreign key references it holds in `audit_logs` and `site_settings`

**How it works:** When a login attempt comes in, `auth.ts` reads this row. It checks `locked_until` before comparing passwords. On a failed attempt it increments `failed_attempts` and sets `locked_until` if the threshold is hit. On success it resets both fields. The password is never returned to the session — the `authorize` callback explicitly selects only `id`, `email`, `name`, and `role`.

**If it breaks:**
- Login always fails → check `locked_until` in the database directly: `SELECT locked_until FROM users WHERE email = 'admin@sunduza.co.za';`
- Session exists but user data missing → check the `sessions` table for an expired or missing row
- Password comparison fails after a server redeploy → confirm `BCRYPT_ROUNDS` env var matches what was used to hash the stored password

---

#### `sessions`

**What:** One row per active login session. Deleting the row ends the session immediately.

**Why database sessions, not JWT:**  
JWT tokens cannot be revoked without a denylist. If an admin's device is stolen, a JWT-based session cannot be terminated without either waiting for expiry or building a Redis denylist — which is the same complexity as database sessions but with more attack surface. Database sessions mean one `DELETE FROM sessions WHERE id = ?` ends access instantly.

**Why `expires` index:**  
Sessions accumulate over time. The `expires` index lets a cleanup job (or a future cron) efficiently find and delete expired rows: `WHERE expires < NOW()`. Without the index this is a full table scan.

**If it breaks:**
- Admin is logged out on every page refresh → check that `SESSION_MAX_AGE_SECONDS` is set and that `updateAge` (24h) is not less than the browser session timeout
- Login succeeds but redirect fails → check that `NEXTAUTH_URL` matches the actual deployment URL exactly

---

#### `bookings`

**What:** The core lead entity. Every consultation request creates one row.

**Why `status` is an enum, not a free string:**  
`BookingStatus` has exactly five values: `PENDING → CONTACTED → CONFIRMED → COMPLETED | REJECTED`. These are the actual stages of the Sunduza sales process. An enum enforces that the status can only be one of these values. A free string allows "pending", "Pending", "pENDING", "new", "fresh" — all meaning the same thing but breaking every filter query.

**Why UTM fields are on the booking row, not a separate table:**  
UTM attribution is a set of five values that belong to a single booking event. They do not repeat. They do not need to be queried independently of the booking. Normalising them into a separate `BookingAttribution` table would add a JOIN to every booking query with zero benefit. This is a justified denormalisation.

**Why `lead_score` is stored, not computed at query time:**  
Lead score is calculated once when the booking is created. The calculation uses booking fields that will never change (service type, description length, budget, UTM presence, meeting date). Computing it on every query would repeat the same calculation thousands of times. Storing it once and indexing it allows the admin to sort "bookings by priority" with a single index scan.

**Why `consent_given` is a boolean AND `consent_given_at` is a timestamp:**  
POPIA requires that consent is recorded with when it was given. `consent_given = true` alone does not prove when. `consent_given_at` proves the exact moment. Both fields together satisfy the legal requirement. The form uses `z.literal(true)` — the Zod schema rejects any submission where this field is not exactly `true`.

**Why `ip_address` and `user_agent`:**  
These fields serve two purposes: fraud detection (same IP submitting many bookings) and legal compliance (can demonstrate the submission came from the visitor's device at a specific IP address and time).

**Critical indexes and why:**
- `(status, created_at DESC)` — the primary admin query: "show me all PENDING bookings, newest first"
- `(status, lead_score DESC)` — the priority admin query: "show me PENDING bookings, highest score first"
- `(email)` — duplicate detection: "has this email submitted before?"
- `(created_at DESC)` — the dashboard query: "show me the last N bookings"

**If it breaks:**
- Booking form submits but no database row created → check `POST /api/bookings` logs for the `X-Request-ID` header returned to the client. Search server logs for that ID. The error will be there.
- Lead score is always null → `server/lead-score.ts` is not being called in `createBooking()`. Check that `server/bookings.ts` calls `calculateLeadScore(data)` before the `db.booking.create()` call.
- Status filter returns wrong bookings → check that the soft-delete middleware is running. A booking with `deleted_at` set should never appear in filtered results.

---

#### `projects`

**What:** Portfolio items. Admin creates, edits, and reorders them.

**Why `sort_order` is an integer, not a timestamp:**  
Timestamps cannot be manually reordered without changing the row. An integer `sort_order` can be set to any value by the admin to control exactly what appears first. Lower number = first on the page.

**Why `is_featured` is a boolean on the project:**  
The homepage shows a subset of projects. The featured flag is the simplest mechanism that works — the admin ticks a checkbox. No separate `featured_projects` table, no ordering table, no configuration. The schema comment says "max 3 recommended" — this is a convention enforced by admin discipline, not by the database. A CHECK constraint would be too rigid (what if the admin wants 4?).

**Why `image_path` stores a relative path, not a URL:**  
Images are served from the `/public/images/projects/` directory. Storing `/images/projects/filename.jpg` means the image location is not tied to a specific domain. If the domain changes, or if images are served through a CDN later, the database row does not need to change. The component constructs the full URL from the relative path.

**If it breaks:**
- Project image 404 → the `image_path` value in the database does not match the actual file in `/public/images/projects/`. Check the exact stored value: `SELECT image_path FROM projects WHERE id = ?`
- Sort order not working → confirm the query uses `ORDER BY sort_order ASC`, not `ORDER BY created_at`
- Featured projects not showing on homepage → check that `is_featured = true` rows exist and that the query filters `WHERE is_featured = true AND deleted_at IS NULL`

---

#### `testimonials`

**What:** Client reviews. Admin creates them manually after project completion.

**Why `project_id` is nullable with `ON DELETE SET NULL`:**  
A testimonial can be either a general business review (no project reference) or tied to a specific project. When a project is soft-deleted, the testimonial should not be deleted — it still reflects a real client experience. `ON DELETE SET NULL` means the `project_id` becomes null if the linked project is removed, but the testimonial itself survives.

**Why `is_active` instead of relying on `deleted_at` for visibility:**  
`deleted_at` is permanent removal. `is_active` is a visibility toggle — the admin may want to temporarily hide a testimonial without deleting it. These are different intents and need different fields.

**The hard-delete bug:**  
`app/api/testimonials/[id]/route.ts` currently calls `db.testimonial.delete()`. This is the only hard delete in the entire system. It must be changed to `db.testimonial.update({ where: { id }, data: { deletedAt: new Date() } })`. A hard delete breaks the audit trail — the `AuditLog` row for `PROJECT_DELETE` references an `entity_id` that no longer exists.

**If it breaks:**
- Testimonials not appearing on public page → confirm `is_active = true` AND `deleted_at IS NULL`. Both conditions must be true.
- Rating outside 1–5 stored → the CHECK constraint in the migration SQL is missing. Add it manually: `ALTER TABLE testimonials ADD CONSTRAINT testimonials_rating_check CHECK (rating >= 1 AND rating <= 5);`

---

#### `contact_messages`

**What:** General enquiries from the `/contact` page. Separate from bookings — not a conversion event, just a message.

**Why separate from `bookings`:**  
A contact message and a booking are different business objects. A booking has a service, a budget, a meeting date, UTM attribution, a lead score, a lifecycle status, and POPIA consent fields. A contact message has a name, an email, a phone, and a free-text message. Putting them in the same table would require nullable columns for all booking-specific fields on message rows — structurally dishonest.

**Why `read` is a boolean with a `read_at` timestamp:**  
Same pattern as `consent_given` / `consent_given_at`. `read = true` says it happened. `read_at` says when. The admin inbox unread count queries `WHERE read = false AND deleted_at IS NULL` — fast because of the `(read, created_at DESC)` composite index.

**If it breaks:**
- Unread count badge wrong → the PATCH handler marking messages as read is not setting `read_at`. Confirm the update includes `data: { read: true, readAt: new Date() }`.
- Contact form submits but no row created → `POST /api/contact` is missing. This is BUG-001. See Part 3.

---

#### `site_settings`

**What:** Runtime configuration. Admin edits through the admin dashboard. No redeployment needed.

**Why a key-value table instead of environment variables:**  
Environment variables require a redeployment to change. The business owner needs to update the WhatsApp number, business hours, or admin email without calling a developer. This table allows those changes through the admin UI.

**v1 keys:**
| Key | Value | Purpose |
|---|---|---|
| `whatsapp_number` | `27786723364` | WhatsApp floating button |
| `admin_email` | `admin@sunduza.co.za` | Notification destination |
| `business_hours` | `Mon–Fri 8am–5pm` | Displayed on contact page |

**Why `updated_by` references `users`:**  
With one admin this seems redundant. It isn't — `updated_by` ties each settings change to the `audit_logs` trail. If a setting is wrong, you can check when it was changed and by whom (even if it is always the same person). Accountability is not only for teams.

**If it breaks:**
- WhatsApp button shows wrong number → `SELECT value FROM site_settings WHERE key = 'whatsapp_number'`. If the row exists and the value is correct, the layout cache (`unstable_cache`) may be stale — force revalidation or restart the server in development.
- Settings page throws on save → `PATCH /api/admin/settings/[key]` route is missing (GAP-004). It needs to be created.

---

#### `notifications`

**What:** An outbox queue. Rows are inserted on booking creation and contact message creation. A background worker reads the rows and sends emails.

**Why an outbox, not a direct email call in the route handler:**  
If `sendEmail()` is called directly inside the HTTP handler and the email provider is down, the entire booking request fails — the visitor gets an error even though their booking was saved. The outbox decouples the booking from the email. The booking saves. The notification row saves. If the email fails, it will be retried by the worker. If the provider is down for 10 minutes, the emails go out when it recovers — the bookings are never lost.

**Why `payload` is `Json` (not typed foreign keys):**  
The notification worker doesn't need full relational access to the booking. It needs enough information to write a useful email: the booking ID, the visitor's name and email, the service requested. All of that fits in the `payload` column. Typed foreign keys would create a dependency between `Notification` and `Booking` — if the booking is deleted, the notification breaks. The outbox should be independent.

**v1 state:** Rows are never inserted. The outbox exists in the schema but no route writes to it. This is GAP-003 — it must be fixed in Sprint 0.

**If it breaks:**
- Admin not receiving emails → check `notifications` table for `failed_at IS NOT NULL` rows. The `error` column will contain the Resend error message.
- Emails duplicating → the worker is not setting `sent_at` after dispatch. Confirm the worker updates `data: { sentAt: new Date() }` after a successful send.

---

#### `audit_logs`

**What:** An immutable event ledger. Every admin action and every significant system event creates one row. Rows are never updated. Never deleted.

**Why no `updated_at` or `deleted_at`:**  
These fields exist on mutable entities. `AuditLog` is not mutable. Adding them would send the wrong signal to any developer reading the schema — "this can be updated or deleted." It cannot. The absence of those columns is the documentation.

**Why polymorphic `entity_type` + `entity_id` instead of separate foreign keys:**  
A separate FK per entity type would mean: `booking_id`, `project_id`, `testimonial_id`, `contact_message_id`, `settings_key` — all nullable, all null except one per row. That is structural noise. A string pair `('Booking', 'clxyz123')` is honest: it says "this action happened to a Booking with this ID." If the booking is later deleted, the audit log row survives intact — the entity is gone but the record of what happened to it is permanent.

**Current state:** ZERO rows are ever written. The schema is complete. The `AuditAction` enum has 12 values. Not one route calls `writeAuditLog()`. This is GAP-002 — the most critical gap in the entire system.

**If it breaks:**
- Audit log rows not appearing → `server/audit.ts → writeAuditLog()` is not being called. Add a `console.error` inside `writeAuditLog()` to confirm it is being reached. If it is, check the `db.auditLog.create()` call for schema mismatch.
- Audit log query returning wrong rows → all four indexes should be checked. The most common audit queries are by `(entity_type, entity_id)` and by `(action, created_at DESC)`.

---

### Database Fixes Required Before Any Other Work

```sql
-- 1. Add the rating CHECK constraint that Prisma cannot generate
ALTER TABLE testimonials
  ADD CONSTRAINT testimonials_rating_check
  CHECK (rating >= 1 AND rating <= 5);

-- 2. Verify it works
INSERT INTO testimonials (id, client_name, review, rating)
VALUES ('test', 'Test', 'Test', 6);
-- Should fail with: ERROR: new row violates check constraint
```

```bash
# 3. Remove dev.db from git
echo "*.db\n*.db-shm\n*.db-wal" >> .gitignore
git rm --cached dev.db prisma/dev.db 2>/dev/null || true
git commit -m "fix: untrack dev.db and update .gitignore"
```

---

## Part 2 — Auth Layer

### Current State: 85% Complete

The auth strategy is correct. The weak points are implementation placement, not design.

### The Auth Design

#### The Double-Layer Approach

```
Request to /admin/*
       │
       ▼
┌─────────────────────────┐
│   middleware.ts          │  Layer 1: routing-level session check
│   auth() session check   │  Happens BEFORE the page or handler runs
│                          │  Unauthenticated → redirect to /admin/login
└───────────┬─────────────┘
            │ Session exists
            ▼
┌─────────────────────────┐
│   API Route Handler      │  Layer 2: independent session check
│   auth() called again    │  Even if middleware is misconfigured,
│                          │  the handler refuses unauthenticated requests
└─────────────────────────┘
```

**Why two checks?** Middleware runs on the Edge runtime in Next.js. If middleware is misconfigured or bypassed (a Next.js routing edge case), the API handler still rejects the request. One point of failure becomes two independent points. An attacker must bypass both.

#### The Login Flow

```
Visitor visits /admin/login
       │
Form submit → signIn("credentials", { email, password, redirect: false })
       │
       ▼
NextAuth → Credentials provider → authorize()
       │
       ├─ Check IP rate limit (in-memory, Layer 1)
       │   └─ > 10 attempts in 15 min → return null (silent fail)
       │
       ├─ db.user.findUnique({ where: { email } })
       │   └─ Not found → return null
       │
       ├─ Check account lockout (database, Layer 2)
       │   └─ locked_until > NOW() → return null (same error, no lockout hint)
       │
       ├─ bcrypt.compareSync(password, user.password)
       │   └─ Invalid → increment failed_attempts, set locked_until if ≥ 10, return null
       │
       └─ Valid → reset failed_attempts, return { id, email, name, role }
              │
              ▼
       NextAuth creates Session row in database
       Sets session cookie
       Client redirects to /admin
```

**Why `return null` for every failure, not a specific error:**  
The login form shows one error message regardless of failure reason: "Invalid email or password." This is intentional. If lockout shows a different error ("account locked"), an attacker knows they have the right email and can wait 15 minutes. Identical error messages prevent credential enumeration.

**Why `bcrypt.compareSync` not `bcrypt.compare`:**  
The `authorize` function runs inside NextAuth's credentials handler which is already async. `compareSync` is acceptable here — the comparison is CPU-bound, takes ~100ms at cost factor 12, and Next.js's serverless environment handles one request at a time per instance. If this becomes a bottleneck under load, switch to `bcrypt.compare` (async).

#### What Is Wrong Right Now

**Problem 1: `checkRateLimit` and `generateRequestId` live in `lib/auth.ts`**

`lib/auth.ts` is the NextAuth configuration file. It should contain exactly one thing: the NextAuth setup. When a route like `app/api/bookings/route.ts` imports `checkRateLimit` from `@/lib/auth`, it creates a dependency between a public booking route and the auth configuration module. If `lib/auth.ts` changes, every route that imports from it must be re-verified.

These utilities belong in separate files:
- `checkRateLimit` → `lib/rate-limit.ts`
- `generateRequestId` → `lib/request.ts`

**Problem 2: In-memory rate limiter is not production-safe**

```typescript
// This is the current implementation:
const requestCounts = new Map<string, { count: number; resetAt: number }>();
```

This `Map` lives in module scope. In Vercel's serverless environment, each function invocation may run in a different instance — the `Map` is empty in every new instance. An attacker who hits the login endpoint across multiple instances (which happens naturally under load) bypasses the IP rate limit entirely.

The fix is Upstash Redis — a persistent key-value store with a REST API that works from serverless functions. The database-level account lockout (`locked_until` in the `users` table) still provides real protection because it persists across all instances. The in-memory limiter is a supplementary layer that should be made durable before going live.

**Problem 3: Zero audit writes**

The `authorize` callback knows the result of every login attempt. It does not write to `audit_logs`. A successful login should write `LOGIN_SUCCESS`. A failed login should write `LOGIN_FAILURE`. A locked account check should write `LOGIN_FAILURE` with metadata indicating lockout. None of this happens.

---

### Auth File Responsibility Map

| File | Responsibility | Contains | Does NOT contain |
|---|---|---|---|
| `lib/auth.ts` | NextAuth configuration | `NextAuth({ ... })`, `authorize()` callback, session/page config | Rate limiting, request IDs, business logic |
| `lib/rate-limit.ts` | Rate limiting only | `bookingRateLimit`, `authRateLimit`, `contactRateLimit` (Upstash) | Auth logic, request IDs |
| `lib/request.ts` | Request utilities | `generateRequestId()`, `getClientIp()` | Auth logic, rate limiting |
| `middleware.ts` | Route protection | `export { auth as middleware }`, `config.matcher` | Any business logic |

---

### Auth Debugging Guide

| Symptom | Check | Fix |
|---|---|---|
| Login always fails with no error | `SELECT * FROM users WHERE email = 'admin@...'` — does the row exist? | Seed the admin account |
| Login fails: "locked" but no lockout | `SELECT locked_until FROM users WHERE email = 'admin@...'` | `UPDATE users SET locked_until = NULL, failed_attempts = 0 WHERE email = '...'` |
| Session cookie exists but /admin redirects to login | `SELECT * FROM sessions WHERE user_id = '...'` — is the session expired? | Check `SESSION_MAX_AGE_SECONDS` env var |
| Admin logged out after redeploy | Database session not found — session row exists but `NEXTAUTH_SECRET` changed | Keep `NEXTAUTH_SECRET` consistent across deploys. Store in Vercel env vars. |
| Rate limit triggered on first attempt | In-memory map from a previous request, or Upstash has stale data | Check Upstash console, flush the specific key |

---

## Part 3 — Backend Layer

### Current State: 60% Complete

The API structure is correct. The problem is that route handlers contain everything: schema definition, business logic, database queries, and HTTP response formatting. This means the same logic cannot be reused, cannot be tested in isolation, and cannot be reasoned about without reading an entire route file.

### The Problem Illustrated

This is what currently happens in `app/api/projects/route.ts`:

```typescript
// ❌ Schema defined inline — cannot be reused by forms or tests
const ProjectCreateSchema = z.object({ ... });

export async function POST(req: NextRequest) {
  const session = await auth();           // ← HTTP concern
  if (!session?.user) { ... }             // ← HTTP concern

  const body = await req.json();          // ← HTTP concern
  const parsed = ProjectCreateSchema.safeParse(body); // ← validation concern
  if (!parsed.success) { ... }            // ← HTTP concern

  const project = await db.project.create({ // ← business + database concern
    data: parsed.data,
  });

  return NextResponse.json(apiSuccess(project)); // ← HTTP concern
}
```

Everything is mixed together. You cannot call "create a project" from anywhere except an HTTP handler. You cannot test "create a project" without spinning up an HTTP server.

### The Target: Three Clean Layers

```
types/          → What does the data look like? (schemas + types)
server/         → What should happen? (business logic)
app/api/        → How does the HTTP request trigger it? (thin handlers)
```

The same POST handler, redesigned:

```typescript
// app/api/projects/route.ts — AFTER
import { ProjectCreateSchema } from "@/types/project";        // from types/
import { createProject } from "@/server/projects";            // from server/

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const body = await req.json();
  const parsed = ProjectCreateSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const project = await createProject(parsed.data, session.user.id);
  return NextResponse.json(apiSuccess(project), { status: 201 });
}
```

The route handler: authenticates, validates, delegates, responds. Four steps. Nothing else.

---

### Every File in the Backend — Its Job, Its Contracts

#### `lib/db.ts`

**What:** The Prisma client singleton.

**Why a singleton:** Next.js in development hot-reloads modules on every change. Without the singleton pattern, each hot-reload creates a new `PrismaClient` instance and a new connection pool. After ten hot-reloads you have ten connection pools and PostgreSQL starts rejecting connections. The `globalThis` trick stores the client across hot-reloads without creating duplicates.

**The soft-delete middleware:**
```typescript
client.$use(async (params, next) => {
  // Intercepts findMany, findFirst, findUnique, findUniqueOrThrow
  // Injects { deletedAt: null } into every WHERE clause
  // UNLESS the query explicitly passes { deletedAt: { not: null } }
  // This is the system-level guarantee — no route can accidentally return deleted data
});
```

**Current bug:** The middleware only intercepts `findMany` and `findFirst`. `findUnique` is not covered. This means `db.booking.findUnique({ where: { id } })` can return a soft-deleted booking. The fix is extending `SOFT_DELETE_ACTIONS` to include `findUnique` and `findUniqueOrThrow`.

**If it breaks:**
- `PrismaClient is not defined` → the import path is wrong or prisma generate has not been run. Run `npx prisma generate`.
- Soft-deleted records appearing → the middleware is not covering the action being used. Add a `console.log(params.action)` inside the middleware to see what is being intercepted.
- Connection pool exhaustion → multiple instances of `PrismaClient` are being created. Verify the `globalThis` pattern is correct and that `lib/db.ts` is the only place `PrismaClient` is instantiated.

---

#### `lib/api-response.ts`

**What:** The response contract. Every API route in the system returns one of these shapes and nothing else.

**Why a contract:** Without a contract, routes return whatever the developer felt like that day. Client code must handle every possible shape. Bugs hide in shape mismatches. With a contract, client code knows exactly what to expect:
- Success: `{ success: true, data: T }`
- List: `{ success: true, data: T[], count, page, totalPages }`
- Error: `{ success: false, error: { message, code, status } }`

**Why `ErrorCode` is a const object, not string literals:**  
String literals can be mistyped. `ErrorCode.VALIDATION_ERROR` is caught by TypeScript if the key doesn't exist. `"VALIDATON_ERROR"` (typo) is not caught by anything.

**If it breaks:**
- Client shows raw error strings → `api-client.ts` is swallowing the `code` field. The current implementation throws `new Error(err.message)`, discarding `code` and `status`. Fix: use `ApiClientError` class that preserves all three fields.
- TypeScript error on `apiError` call → the `code` argument must be an `ErrorCode` value, not an arbitrary string. Import `ErrorCode` from this file.

---

#### `lib/api-client.ts`

**What:** The typed HTTP client used by client components to call the API.

**Current bug:** Error responses are destructured incorrectly:
```typescript
// ❌ Current — loses code and status
throw new Error(err.message ?? `Request failed: ${res.status}`);

// ✅ Fixed — preserves the full error contract
throw new ApiClientError(message, code, status);
```

**Why this matters:** A client component that catches an error needs to know *what kind* of error it is. `RATE_LIMIT_EXCEEDED` → show "too many requests, try again in an hour." `VALIDATION_ERROR` → show field errors. `UNAUTHORIZED` → redirect to login. Without the `code` field, every error shows the same generic message.

**If it breaks:**
- All API errors show "undefined" → `err.message` is undefined because the response body is not JSON. Add `.catch(() => null)` to the `res.json()` call and check `err?.error?.message`.
- TypeScript complains about `ApiClientError` not being an `Error` → confirm the class extends `Error` and calls `super(message)` in the constructor.

---

#### `lib/request.ts` (to be created)

**What:** HTTP request utilities. Exactly two functions.

```typescript
// lib/request.ts

// generateRequestId()
// WHY: Every API response includes an X-Request-ID header.
// When a user reports an error, they give you this ID.
// You search logs for this ID. You find the exact request. You know what happened.
// Format: timestamp in base36 + random suffix = collision-resistant, time-sortable
export function generateRequestId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

// getClientIp()
// WHY: Rate limiting is keyed by IP address. The IP comes from x-forwarded-for
// when behind a proxy (Vercel always adds this header). Falls back to "unknown"
// if the header is absent — rate limiting still works, just less precise.
export function getClientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}
```

---

#### `lib/rate-limit.ts` (to be created)

**What:** All rate limiters for the system. One place. Named exports.

**Why named exports, not a factory:**  
Three different endpoints have three different rate limits. Naming them explicitly (`bookingRateLimit`, `authRateLimit`, `contactRateLimit`) means you can grep for the name to find every place a specific limit is applied. A generic factory produces anonymous limiters with no discoverability.

```typescript
// lib/rate-limit.ts
// WHY: Rate limiting protects against form spam, brute force auth,
// and automated booking submissions. Each limit is tuned to its endpoint's
// real usage pattern:
//   - Booking: 5/hour — a real user books once, maybe twice
//   - Auth: 10/15min — generous enough for typos, tight enough to prevent brute force
//   - Contact: 3/hour — a real user sends one message

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

**If it breaks:**
- Rate limit not enforced → `UPSTASH_REDIS_REST_URL` or `UPSTASH_REDIS_REST_TOKEN` env var is missing. The constructor throws. Check Vercel env vars.
- Rate limit triggers on first request → the Redis key has stale data from a previous test. Flush the specific prefix in the Upstash console.
- 429 for legitimate users → the window or limit is too tight. Adjust the `slidingWindow(count, window)` parameters in this file.

---

#### `server/audit.ts` (to be created)

**What:** One function. Writes one audit log row.

**Why a dedicated function instead of calling `db.auditLog.create()` directly in routes:**  
Audit logging must happen on every significant action. If you call `db.auditLog.create()` directly in twelve different route handlers, you repeat the same shape twelve times. When the shape changes, you update twelve places. One function → one place to change.

```typescript
// server/audit.ts
import "server-only"; // prevents this from being imported in client components
import { db } from "@/lib/db";
import { AuditAction } from "@prisma/client";

interface WriteAuditLogParams {
  action: AuditAction;
  entityType: string;   // "Booking", "Project", "Testimonial", etc.
  entityId: string;     // the cuid of the affected record
  userId?: string;      // the admin's user ID (null for system/public actions)
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>; // any extra context (previous status, new status, etc.)
}

export async function writeAuditLog(params: WriteAuditLogParams): Promise<void> {
  // WHY: Audit logging is fire-and-forget. If it fails, the booking
  // was still created. We log the failure but do not fail the request.
  // The booking is more important than the audit trail.
  try {
    await db.auditLog.create({ data: params });
  } catch (err) {
    // Log to console — future: send to error monitoring
    console.error("[audit] Failed to write audit log:", { params, err });
  }
}
```

**If it breaks:**
- Audit rows not appearing → add `console.log("[audit] Writing:", params)` at the top of `writeAuditLog`. Confirm it is being called. If it is called but no row appears, check `db.auditLog.create()` for a schema mismatch.
- `AuditAction` TypeScript error → the enum value used does not exist in `schema.prisma`. Run `npx prisma generate` after adding new values.

---

#### `server/lead-score.ts` (to be created)

**What:** One pure function. No database access. Takes booking input, returns a number 0–100.

**Why pure:** A pure function takes input and returns output. No side effects. This means it can be tested with a single line: `expect(calculateLeadScore(input)).toBe(45)`. No database mock needed. No HTTP setup needed.

```typescript
// server/lead-score.ts
import "server-only";
import { BookingInput } from "@/types/booking";

// Score signals — calibrated to Sunduza's actual sales patterns
// High-value signals: budget provided, meeting date set, detailed brief
// Attribution signals: UTM source (tracked campaign = warmer lead)
// Intent signals: long description = more considered enquiry

const SIGNALS = {
  hasBudget:          20, // Visitor thought about budget = serious
  largeBudget:        20, // Budget ≥ R500k = high-value project
  hasMeetingDate:     15, // Pre-selected a meeting date = ready to move
  longDescription:    10, // ≥ 100 chars = detailed brief = serious
  devProjectService:  15, // Development project planning = highest-value service
  hasUtmSource:       10, // Came via a tracked campaign = warm lead
  mobilePhone:        10, // Mobile format = directly reachable
} as const;

export function calculateLeadScore(data: BookingInput): number {
  let score = 0;

  if (data.budget) {
    score += SIGNALS.hasBudget;
    const amount = parseInt(data.budget.replace(/\D/g, ""), 10);
    if (!isNaN(amount) && amount >= 500_000) score += SIGNALS.largeBudget;
  }

  if (data.meetingDate) score += SIGNALS.hasMeetingDate;
  if (data.description.length >= 100) score += SIGNALS.longDescription;
  if (data.service === "dev_project_planning") score += SIGNALS.devProjectService;
  if (data.utmSource) score += SIGNALS.hasUtmSource;
  if (/^(\+27|0)[6-8][0-9]{8}$/.test(data.phone)) score += SIGNALS.mobilePhone;

  return Math.min(score, 100);
}
```

**If it breaks:**
- Score always 0 → the function is not being called in `server/bookings.ts → createBooking()`. Check that `calculateLeadScore(data)` is called before `db.booking.create()`.
- Score calculation wrong → each signal has a named constant. Change the constant value. The tests in `tests/unit/lead-score.test.ts` will catch regressions.

---

#### `server/bookings.ts` (to be created)

**What:** All booking business logic. The route handler calls these functions. Nothing else does database operations on bookings.

```typescript
// server/bookings.ts
import "server-only";
import { db } from "@/lib/db";
import { writeAuditLog } from "@/server/audit";
import { calculateLeadScore } from "@/server/lead-score";
import { BookingInput } from "@/types/booking";
import { BookingStatus, AuditAction } from "@prisma/client";

// createBooking()
// WHAT: Persists a new booking, calculates lead score, inserts notification.
// WHY here: The route handler should not know the implementation details.
//           If the lead score formula changes, only this file changes.
//           If notifications move to a different system, only this file changes.
export async function createBooking(
  data: BookingInput,
  meta: { ipAddress: string; userAgent: string }
) {
  const leadScore = calculateLeadScore(data);

  const booking = await db.booking.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      service: data.service,
      location: data.location,
      description: data.description,
      meetingDate: data.meetingDate ? new Date(data.meetingDate) : null,
      budget: data.budget ?? null,
      status: BookingStatus.PENDING,
      leadScore,
      consentGiven: true,
      consentGivenAt: new Date(),
      utmSource: data.utmSource ?? null,
      utmMedium: data.utmMedium ?? null,
      utmCampaign: data.utmCampaign ?? null,
      utmTerm: data.utmTerm ?? null,
      utmContent: data.utmContent ?? null,
      referrerUrl: data.referrerUrl ?? null,
      landingPage: data.landingPage ?? null,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    },
    select: { id: true, status: true, leadScore: true },
  });

  // Outbox: admin notification queued for next worker run
  await db.notification.create({
    data: {
      type: "BOOKING_NEW",
      channel: "email",
      recipient: process.env.ADMIN_EMAIL ?? "admin@sunduza.co.za",
      payload: {
        bookingId: booking.id,
        name: data.name,
        email: data.email,
        service: data.service,
        leadScore,
      },
    },
  });

  // Audit: system-level event (no userId — public submission)
  await writeAuditLog({
    action: AuditAction.BOOKING_CREATE,
    entityType: "Booking",
    entityId: booking.id,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
    metadata: { service: data.service, leadScore },
  });

  return booking;
}

// updateBookingStatus()
// WHAT: Changes status and/or adminNotes. Records the state transition in audit log.
// WHY: The previous status is recorded in metadata so the audit trail shows
//      "PENDING → CONFIRMED" not just "status changed."
export async function updateBookingStatus(
  id: string,
  update: { status?: BookingStatus; adminNotes?: string },
  context: { userId: string; ipAddress: string }
) {
  const current = await db.booking.findUnique({
    where: { id },
    select: { id: true, status: true },
  });

  if (!current) return null;

  const updated = await db.booking.update({
    where: { id },
    data: {
      ...(update.status !== undefined && { status: update.status }),
      ...(update.adminNotes !== undefined && { adminNotes: update.adminNotes }),
    },
    select: { id: true, status: true, adminNotes: true, updatedAt: true },
  });

  await writeAuditLog({
    action: AuditAction.BOOKING_STATUS_UPDATE,
    entityType: "Booking",
    entityId: id,
    userId: context.userId,
    ipAddress: context.ipAddress,
    metadata: {
      previousStatus: current.status,
      newStatus: update.status,
    },
  });

  return updated;
}

// softDeleteBooking()
export async function softDeleteBooking(id: string, context: { userId: string }) {
  await db.booking.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await writeAuditLog({
    action: AuditAction.BOOKING_DELETE,
    entityType: "Booking",
    entityId: id,
    userId: context.userId,
  });
}
```

---

#### `server/contact.ts` (to be created)

**What:** Business logic for contact messages. Includes `createContactMessage()` — the function that `POST /api/contact` calls. This function is what BUG-001 needs.

```typescript
// server/contact.ts
import "server-only";
import { db } from "@/lib/db";
import { writeAuditLog } from "@/server/audit";
import { ContactMessageInput } from "@/types/contact";
import { AuditAction } from "@prisma/client";

export async function createContactMessage(
  data: ContactMessageInput,
  meta: { ipAddress: string }
) {
  const message = await db.contactMessage.create({
    data: { name: data.name, email: data.email, phone: data.phone, message: data.message },
    select: { id: true },
  });

  await db.notification.create({
    data: {
      type: "CONTACT_NEW",
      channel: "email",
      recipient: process.env.ADMIN_EMAIL ?? "admin@sunduza.co.za",
      payload: { messageId: message.id, name: data.name, email: data.email },
    },
  });

  await writeAuditLog({
    action: AuditAction.CONTACT_MESSAGE_CREATE,
    entityType: "ContactMessage",
    entityId: message.id,
    ipAddress: meta.ipAddress,
  });

  return message;
}

export async function markMessageRead(id: string, userId: string) {
  const updated = await db.contactMessage.update({
    where: { id },
    data: { read: true, readAt: new Date() },
    select: { id: true, read: true, readAt: true },
  });

  await writeAuditLog({
    action: AuditAction.CONTACT_MESSAGE_READ,
    entityType: "ContactMessage",
    entityId: id,
    userId,
  });

  return updated;
}
```

---

#### `types/contact.ts` (to be created)

**What:** The Zod schema for contact form input. Referenced by the route, the service, and the client form.

```typescript
// types/contact.ts
import { z } from "zod";

export const ContactMessageSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().min(10, "Phone must be at least 10 digits").optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

export type ContactMessageInput = z.infer<typeof ContactMessageSchema>;
```

---

### Complete Backend File Responsibility Map

| File | Layer | Responsibility | Imports from | Imported by |
|---|---|---|---|---|
| `lib/db.ts` | Infrastructure | Prisma singleton + soft-delete middleware | `@prisma/client` | `server/*`, `app/api/*`, `app/layout.tsx` |
| `lib/auth.ts` | Infrastructure | NextAuth config, session, credentials provider | `lib/db.ts` | `app/api/*`, `middleware.ts` |
| `lib/rate-limit.ts` | Infrastructure | Named Upstash rate limiters | `@upstash/*` | `app/api/bookings`, `app/api/contact` |
| `lib/request.ts` | Infrastructure | `generateRequestId()`, `getClientIp()` | nothing | `app/api/*` |
| `lib/api-response.ts` | Infrastructure | Response types + helper functions | nothing | `app/api/*`, `lib/api-client.ts` |
| `lib/api-client.ts` | Infrastructure | Typed HTTP client | `lib/api-response.ts` | `src/client/hooks/*` |
| `types/booking.ts` | Contract | `BookingSchema`, booking types, service labels | `zod` | `app/api/bookings/*`, `server/bookings.ts`, client forms |
| `types/project.ts` | Contract | `ProjectCreateSchema`, `ProjectUpdateSchema`, types | `zod` | `app/api/projects/*`, `server/projects.ts` |
| `types/testimonial.ts` | Contract | `TestimonialCreateSchema`, `TestimonialUpdateSchema`, types | `zod` | `app/api/testimonials/*`, `server/testimonials.ts` |
| `types/contact.ts` | Contract | `ContactMessageSchema`, types | `zod` | `app/api/contact/route.ts`, `server/contact.ts` |
| `server/audit.ts` | Business logic | `writeAuditLog()` | `lib/db.ts` | `server/bookings.ts`, `server/projects.ts`, `server/testimonials.ts`, `server/contact.ts`, `server/settings.ts` |
| `server/lead-score.ts` | Business logic | `calculateLeadScore()` | `types/booking.ts` | `server/bookings.ts` |
| `server/bookings.ts` | Business logic | `createBooking()`, `updateBookingStatus()`, `softDeleteBooking()` | `lib/db.ts`, `server/audit.ts`, `server/lead-score.ts` | `app/api/bookings/*`, `app/api/admin/bookings/*` |
| `server/projects.ts` | Business logic | `createProject()`, `updateProject()`, `softDeleteProject()`, `getProjects()` | `lib/db.ts`, `server/audit.ts` | `app/api/projects/*` |
| `server/testimonials.ts` | Business logic | `createTestimonial()`, `updateTestimonial()`, `softDeleteTestimonial()` | `lib/db.ts`, `server/audit.ts` | `app/api/testimonials/*` |
| `server/contact.ts` | Business logic | `createContactMessage()`, `markMessageRead()` | `lib/db.ts`, `server/audit.ts` | `app/api/contact/route.ts` |
| `server/settings.ts` | Business logic | `getSetting()`, `getSettings()`, `updateSetting()` | `lib/db.ts`, `server/audit.ts` | `app/api/admin/settings/*`, `app/layout.tsx` |
| `app/api/bookings/route.ts` | HTTP | Public booking submission | `server/bookings.ts`, `lib/rate-limit.ts`, `lib/request.ts`, `types/booking.ts` | Next.js router |
| `app/api/contact/route.ts` | HTTP | Admin contact list + public submission | `server/contact.ts`, `lib/rate-limit.ts` | Next.js router |
| `app/api/admin/bookings/route.ts` | HTTP | Admin booking management | `server/bookings.ts`, `lib/auth.ts` | Next.js router |
| `middleware.ts` | HTTP | Route-level session guard for `/admin/*` | `lib/auth.ts` | Next.js |

---

### Backend Bugs — Exact Fix for Each

#### BUG-001: Missing `POST /api/contact`

**Root cause:** `app/api/contact/route.ts` was written with only admin GET/PATCH handlers. The public submission handler was never added.

**Exact fix:**
```typescript
// Add to app/api/contact/route.ts:
export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const ip = getClientIp(req);

  const { success } = await contactRateLimit.limit(ip);
  if (!success) {
    return NextResponse.json(
      apiError("Too many requests. Please try again later.", ErrorCode.RATE_LIMIT_EXCEEDED, 429),
      { status: 429, headers: { "X-Request-ID": requestId } }
    );
  }

  try {
    const body = await req.json();
    const parsed = ContactMessageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        apiError(parsed.error.issues.map(e => e.message).join(", "), ErrorCode.VALIDATION_ERROR, 400),
        { status: 400, headers: { "X-Request-ID": requestId } }
      );
    }

    const message = await createContactMessage(parsed.data, { ipAddress: ip });
    return NextResponse.json(apiSuccess({ id: message.id }), { status: 201 });
  } catch (err) {
    console.error(`[${requestId}] Contact POST error:`, err);
    return NextResponse.json(
      apiError("Something went wrong. Please try again.", ErrorCode.INTERNAL_ERROR, 500),
      { status: 500, headers: { "X-Request-ID": requestId } }
    );
  }
}
```

**How to verify the fix:** `curl -X POST http://localhost:3000/api/contact -H "Content-Type: application/json" -d '{"name":"Test","email":"test@test.com","message":"Hello from test"}' -v` — should return `201` with `{ success: true, data: { id: "..." } }`.

#### BUG-002: Hard delete on testimonials

**File:** `app/api/testimonials/[id]/route.ts`
**Replace:**
```typescript
await db.testimonial.delete({ where: { id } });
```
**With:**
```typescript
await db.testimonial.update({ where: { id }, data: { deletedAt: new Date() } });
```

#### BUG-003: `findUnique` not soft-deleted

**File:** `lib/db.ts`
**Replace the middleware action check:**
```typescript
// Before
params.action === "findMany"
params.action === "findFirst"

// After — single check covering all read operations
const SOFT_DELETE_READ_ACTIONS = new Set(["findMany", "findFirst", "findUnique", "findUniqueOrThrow"]);
if (params.model && SOFT_DELETE_MODELS.has(params.model) && SOFT_DELETE_READ_ACTIONS.has(params.action)) {
```

---

## Part 4 — Frontend Layer

### Current State: 8% Complete

**What exists and works:**
- Root layout (`app/layout.tsx`) — fonts, metadata, Header, Footer, FloatingWhatsApp, Providers
- Design tokens in `globals.css` — the visual system is defined
- Admin login page (`app/admin/login/page.tsx`) — complete and functional
- UI primitives in `src/client/components/ui/` — Button, Input, Label, Badge, Card, Skeleton, Sheet, Textarea
- Header with mobile Sheet navigation — complete
- Footer — complete
- AdminSidebar with all nav items — complete
- `Providers` — SessionProvider + QueryClientProvider configured correctly
- `useAdminUI` Zustand store — sidebar state, booking filter state, both ready

**What does not exist:**
- Every public page (7 pages) — `return null`
- Every admin dashboard page (6 pages) — `return null`
- All React Query data hooks — 0 files
- Feature components (booking form, project grid, testimonial grid, etc.) — 0 files

---

### The Design System

The visual identity is already decided and implemented in `globals.css`. Every component must use these tokens — never hardcoded hex values.

```css
--color-primary:      #b88b4a  /* Gold — CTAs, active states, brand accent */
--color-primary-dark: #a07740  /* Gold dark — hover states on primary */
--color-ink:          #0f172a  /* Near-black — headings, body text */
--color-paper:        #faf8f2  /* Warm white — page backgrounds */
--color-paper2:       #f5f0e8  /* Warm cream — card backgrounds, hover states */
--color-rule:         #e8ddd0  /* Warm grey — borders, dividers */
--color-muted:        #8a7a60  /* Brown-grey — secondary text, placeholders */

--font-serif:  Playfair Display — headings, brand name, large display text
--font-sans:   IBM Plex Sans — body, labels, UI text
```

**Why these choices fit the business:** An architectural firm sells trust, taste, and expertise. Gold (`#b88b4a`) conveys quality without ostentation. Warm white paper tones feel like architectural drawings and presentation boards. Playfair Display is a serif that reads as professional and considered — not cold, not cute.

---

### Frontend File Responsibility Map

#### Providers and Infrastructure

| File | What | Why |
|---|---|---|
| `src/client/components/providers.tsx` | `SessionProvider` + `QueryClientProvider` | One place wraps the entire client tree. New providers added here only. |
| `src/client/stores/admin-ui.ts` | Zustand store for booking filter, sidebar open state | UI state that needs to survive navigation but doesn't need to be in the URL |

**`useAdminUI` store — what each piece is for:**
- `bookingStatusFilter` — the currently active status tab on the admin bookings page
- `bookingSearch` — the search query string
- `sidebarOpen` — mobile sidebar open/closed state
- `toggleSidebar` — called by the hamburger button in the mobile admin header

---

#### Layout Components

| File | What | How it works |
|---|---|---|
| `src/client/components/layout/Header.tsx` | Public site top nav | Sticky, transparent blur background, `usePathname()` for active state, Sheet for mobile menu |
| `src/client/components/layout/Footer.tsx` | Public site footer | Contact details, nav links, privacy link, business registration |
| `src/client/components/layout/FloatingWhatsApp.tsx` | WhatsApp CTA bubble | Fixed position bottom-right, phone number from layout via props |
| `src/client/components/admin/AdminSidebar.tsx` | Admin left navigation | `usePathname()` for active state, `signOut()` button, "View Site" link |

**The admin layout pattern:**
```
app/admin/(dashboard)/layout.tsx
  ├── Gets session → passes adminEmail, adminName to AdminSidebar
  ├── Renders AdminSidebar (desktop: always visible)
  ├── Renders mobile hamburger (calls useAdminUI().toggleSidebar)
  └── Renders {children} in the main content area
```

The `(dashboard)` route group means the login page does not share this layout. `/admin/login` renders directly without the sidebar.

---

#### Public Pages — What Each Page Does and Why

**`app/page.tsx` — Homepage**

**Business purpose:** First contact. The visitor has arrived, probably from Google or a referral. They know nothing. This page must communicate: what Sunduza does, that they are credible, and what the visitor should do next.

**Structure:**
1. Hero — brand statement + two CTAs: "Book Consultation" (primary) and "View Projects" (secondary)
2. Stats bar — "X projects completed · Y years experience · Z services" — proof of track record
3. Services preview — four cards: House Planning, Arch Drawings, Drafting, Dev Project Planning — each links to `/services`
4. Featured projects — three cards from `useProjects({ featured: true })` — visual proof of quality
5. CTA strip — "Ready to start your project?" → `/booking`

**React Query hook:** `useProjects(options?: { featured?: boolean })` fetches `GET /api/projects?featured=true`

---

**`app/services/page.tsx` — Services**

**Business purpose:** Visitor wants more detail on what Sunduza offers before committing to a booking. This page answers "what exactly do I get?"

**Structure:** Four service sections, one per service type. Each has: service name, description, what's included (3–5 bullet points), and a CTA → `/booking?service=house_planning` (pre-selects the service in the booking form).

**No data fetch needed** — service content is static. No API call, no loading state. Fast.

---

**`app/projects/page.tsx` — Projects**

**Business purpose:** Portfolio showcase. A visitor who is not yet convinced wants to see the actual work.

**Structure:**
- Category filter tabs — "All · House Planning · Architectural Drawings · Drafting · Development"
- Project card grid — image, title, category badge
- Loading skeleton — same grid layout while data loads
- Empty state — "No projects in this category yet" — doesn't break

**React Query hook:** `useProjects()` fetches `GET /api/projects`. Category filtering happens client-side — no separate API call per category because the full project list is small enough to filter in memory.

**`app/projects/[id]/page.tsx` — Project Detail**

- Full project image
- Title, category badge
- Full description
- "Back to Projects" link
- If project not found: 404 page

**React Query hook:** `useProject(id)` fetches `GET /api/projects/[id]`

---

**`app/contact/page.tsx` — Contact**

**Business purpose:** Lower-commitment option for visitors who are not ready to book. "I just want to ask a question."

**Structure:**
- Contact form: name, email, phone (optional), message
- Business contact details sidebar: phone, email, address, business hours (from `SiteSettings`)
- Submission calls `POST /api/contact`
- Success: "Your message has been sent. We'll be in touch within 24 hours."
- Error: field-level validation messages

**React Query:** Uses `useMutation()` for the form submission. No data-fetch hook needed.

---

**`app/booking/page.tsx` — Booking Form**

**Business purpose:** The primary revenue conversion point. Every design decision serves completion rate — if the form is confusing or long, visitors abandon.

**Structure:**
- Service select (pre-populated from query param: `/booking?service=house_planning`)
- Name, email, phone
- Location (site address of the project)
- Description ("Tell us about your project") — textarea, min 20 characters
- Meeting date (optional) — date picker
- Budget (optional) — dropdown ranges: "Under R100k · R100k–R300k · R300k–R500k · R500k+"
- POPIA consent checkbox — required, cannot submit without it
- UTM params captured from `useSearchParams()` silently before submission
- Success: booking reference ID displayed, "We'll contact you within one business day"

**Form implementation:** `react-hook-form` + `zodResolver(BookingSchema)`. The same `BookingSchema` from `types/booking.ts` validates both client and server. One schema. Two uses.

**If the form breaks:**
- Submit button disabled → `consentGiven` field is false. Zod `z.literal(true)` will reject.
- 400 from API → the form data is not matching `BookingSchema`. Check browser network tab for the response body — it will list the specific Zod validation errors.
- 429 from API → rate limit triggered. The form should show "Too many requests" and not a generic error.

---

**`app/testimonials/page.tsx` — Testimonials**

**Business purpose:** Social proof. Visitors who are close to booking but need one more confirmation.

**Structure:**
- Grid of testimonial cards — client name, review text, star rating (1–5), linked project if present
- Featured testimonials highlighted slightly
- Loading skeleton matches grid layout

**React Query hook:** `useTestimonials()` fetches `GET /api/testimonials`

---

**`app/privacy/page.tsx` — Privacy Policy**

**Business purpose:** POPIA legal requirement. A South African business collecting personal data must have a discoverable, accurate privacy policy. The booking form's consent checkbox references this page.

**Content (static, no API call):**
- What data is collected (name, email, phone, IP address)
- Why it is collected (to process consultation requests)
- How long it is kept (bookings retained for 2 years from last status change)
- Who can access it (only the business owner)
- How to request deletion (contact email in the policy)
- Last updated date

---

#### Admin Pages — What Each Page Does and Why

**`app/admin/(dashboard)/page.tsx` — Dashboard**

**Business purpose:** The admin opens this page every morning. In 5 seconds they should know: how many new bookings, how many unread messages, anything urgent.

**Structure:**
- Stats cards: pending bookings count, new bookings this week, unread messages, total projects
- Recent bookings list (last 5) — name, service, status badge, lead score indicator
- Quick-nav tiles to each section

**Data:** Two React Query calls — `useAdminBookings({ status: 'PENDING' })` and `useAdminMessages({ unread: true })`. Both calls happen in parallel.

---

**`app/admin/(dashboard)/bookings/page.tsx` — Bookings**

**Business purpose:** The admin's primary work tool. Every lead that comes in needs to be reviewed, contacted, and moved through the pipeline.

**Structure:**
- Status filter tabs: All · Pending · Contacted · Confirmed · Completed · Rejected
  - Wired to `useAdminUI().setBookingStatusFilter()`
- Search input — `useAdminUI().setBookingSearch()`
- Booking table — sortable columns: date, lead score
  - Each row: name, service, status badge, lead score bar, created date
  - Click to expand: full booking detail (all fields), admin notes textarea, status dropdown
- Pagination — page size 20, next/prev controls
- Lead score colour: `0–40` = red, `41–70` = amber, `71–100` = green

**Critical behaviour:** When status is changed via the dropdown, a `PATCH` is sent to `/api/admin/bookings`. On success the row updates in place — the table does not reload. React Query `invalidateQueries` refreshes the count in the dashboard stats card.

---

**`app/admin/(dashboard)/projects/page.tsx` — Projects**

- Project list: image thumbnail, title, category, featured badge, sort order
- Add project button → form modal (title, description, image path, category, is_featured, sort_order)
- Edit: click pencil icon → same form modal, pre-populated
- Delete: confirmation dialog → soft delete (the row gets `deleted_at`, does not disappear from the table until page refreshes)
- Featured toggle: single click → immediate PATCH, no modal
- Sort order input: number field → PATCH on blur

---

**`app/admin/(dashboard)/testimonials/page.tsx` — Testimonials**
**`app/admin/(dashboard)/messages/page.tsx` — Messages**
**`app/admin/(dashboard)/settings/page.tsx` — Settings**

These follow the same patterns as the above. Settings page is the simplest: one editable field per `SiteSettings` key, save button per field, success/error inline feedback.

---

### React Query Hooks — Pattern

Every data-fetching hook follows this pattern. No exceptions.

```typescript
// src/client/hooks/useProjects.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

// WHAT: Fetches the public projects list
// WHY useQuery: Automatic caching (staleTime 60s), background refetch, loading/error states
// HOW: Calls GET /api/projects. Optional featured filter passed as query param.

export function useProjects(options?: { featured?: boolean }) {
  return useQuery({
    queryKey: ["projects", options],        // cache key — changes when options change
    queryFn: () => api.get("/api/projects", {
      params: options?.featured ? { featured: "true" } : undefined,
    }),
    staleTime: 5 * 60 * 1000,             // data is fresh for 5 minutes
  });
}
```

**queryKey convention:**
- `["projects"]` — all projects
- `["projects", { featured: true }]` — featured projects only
- `["admin", "bookings", { status: "PENDING" }]` — admin filtered list
- `["admin", "booking", bookingId]` — single booking

When a mutation (create, update, delete) succeeds, call `queryClient.invalidateQueries({ queryKey: ["projects"] })` to force a refetch. This keeps the UI consistent without a page reload.

---

## Part 5 — Sprint Implementation Plan

### Repository Setup (One Time)

```bash
# Create and push dev branch
git checkout -b dev
git push -u origin dev

# Protect main: Settings → Branches → Add rule
#   Branch name pattern: main
#   ✅ Require a pull request before merging
#   ✅ Require approvals: 1
#   ✅ Require status checks to pass before merging
#   ✅ Do not allow bypassing the above settings
#   ✅ Restrict who can push to matching branches

# Protect dev: Settings → Branches → Add rule
#   Branch name pattern: dev
#   ✅ Require a pull request before merging
#   ✅ Do not allow direct pushes
```

**GitHub Labels:**

| Label | Colour | Use |
|---|---|---|
| `bug` | `#d73a4a` | Something is broken |
| `feature` | `#0075ca` | New capability |
| `refactor` | `#e4e669` | Restructuring without behaviour change |
| `improvement` | `#a2eeef` | Existing thing made better |
| `backend` | `#7057ff` | Server-side |
| `frontend` | `#008672` | Client-side |
| `database` | `#e4e669` | Schema or data |
| `devops` | `#0075ca` | Deployment, CI, environment |
| `testing` | `#d876e3` | Tests |
| `sprint-0` through `sprint-4` | various | Phase tracking |

---

### Sprint 0 — Backend Correctness

**Goal:** The backend is honest. No bugs. No mixed concerns. Every route delegates to a service function. The audit log is written. The contact form has a backend.

**This sprint merges to `dev` only. Not to `main`.**

---

#### Issues (create all before starting any code)

```
#1  [bug]        Remove dev.db from git, update .gitignore            database, sprint-0
#2  [bug]        Fix soft-delete middleware — add findUnique coverage  database, sprint-0
#3  [bug]        Fix testimonials [id] DELETE — hard → soft delete     backend, sprint-0
#4  [bug]        Fix api-client.ts — ApiClientError preserving code    backend, sprint-0
#5  [refactor]   Extract rate limiter to lib/rate-limit.ts             backend, sprint-0
#6  [refactor]   Extract generateRequestId/getClientIp to lib/request  backend, sprint-0
#7  [feature]    Create types/contact.ts — ContactMessageSchema        backend, sprint-0
#8  [refactor]   Move ProjectCreateSchema/UpdateSchema to types/project backend, sprint-0
#9  [refactor]   Move TestimonialSchemas to types/testimonial.ts        backend, sprint-0
#10 [feature]    Create server/audit.ts — writeAuditLog                backend, sprint-0
#11 [feature]    Create server/lead-score.ts — calculateLeadScore      backend, sprint-0
#12 [feature]    Create server/bookings.ts service layer               backend, sprint-0
#13 [feature]    Create server/projects.ts service layer               backend, sprint-0
#14 [feature]    Create server/testimonials.ts service layer           backend, sprint-0
#15 [feature]    Create server/contact.ts service layer                backend, sprint-0
#16 [feature]    Create server/settings.ts service layer               backend, sprint-0
#17 [feature]    Add POST /api/contact — public submission             backend, sprint-0
#18 [feature]    Add DELETE /api/bookings/[id] — admin soft delete     backend, sprint-0
#19 [feature]    Add GET+PATCH /api/admin/settings                     backend, sprint-0
#20 [feature]    Add GET+PATCH /api/admin/messages                     backend, sprint-0
#21 [feature]    Wire audit logs into all route handlers               backend, sprint-0
#22 [feature]    Wire notification inserts into bookings + contact     backend, sprint-0
#23 [feature]    Add pagination to GET /api/admin/bookings             backend, sprint-0
#24 [bug]        Delete duplicate /api/health endpoint                 backend, sprint-0
#25 [improvement] Add tsconfig path aliases @/components @/server      sprint-0
#26 [improvement] Cache getWhatsAppNumber() in layout.tsx              backend, sprint-0
```

---

#### Branch: `fix/s0-repo-hygiene` → Closes #1

```bash
git checkout dev && git pull origin dev
git checkout -b fix/s0-repo-hygiene
```

Work:
- Add `*.db`, `*.db-shm`, `*.db-wal`, `prisma/dev.db`, `dev.db` to `.gitignore`
- `git rm --cached dev.db prisma/dev.db`
- Add the `rating` CHECK constraint to migration SQL (or new migration)

```bash
git add .gitignore
git commit -m "fix: add *.db to .gitignore (#1)"
git rm --cached dev.db prisma/dev.db 2>/dev/null
git commit -m "fix: untrack dev.db from version control (#1)"
git push -u origin fix/s0-repo-hygiene
```

PR: `fix/s0-repo-hygiene → dev` | Closes #1

---

#### Branch: `fix/s0-db-middleware` → Closes #2

```bash
git checkout dev && git pull origin dev
git checkout -b fix/s0-db-middleware
```

Work: extend `lib/db.ts` middleware to cover `findUnique` and `findUniqueOrThrow`

```bash
git commit -m "fix: extend soft-delete middleware to cover findUnique and findUniqueOrThrow (#2)"
git push -u origin fix/s0-db-middleware
```

PR: `fix/s0-db-middleware → dev` | Closes #2

---

#### Branch: `refactor/s0-lib-structure` → Closes #3, #4, #5, #6, #24, #25

```bash
git checkout dev && git pull origin dev
git checkout -b refactor/s0-lib-structure
```

Work:
- Create `lib/rate-limit.ts` with Upstash rate limiters
- Create `lib/request.ts` with `generateRequestId()` and `getClientIp()`
- Remove `generateRequestId` and `checkRateLimit` from `lib/auth.ts`
- Update all import sites
- Fix `lib/api-client.ts` — add `ApiClientError` class
- Fix `app/api/testimonials/[id]/route.ts` — hard delete → soft delete
- Delete `app/api/health/route.ts` (duplicate)
- Add path aliases to `tsconfig.json`:
  ```json
  "@/components/*": ["./src/client/components/*"],
  "@/hooks/*":      ["./src/client/hooks/*"],
  "@/stores/*":     ["./src/client/stores/*"],
  "@/server/*":     ["./server/*"]
  ```

```bash
git commit -m "refactor: create lib/rate-limit.ts with Upstash rate limiters (#5)"
git commit -m "refactor: create lib/request.ts with generateRequestId and getClientIp (#6)"
git commit -m "fix: add ApiClientError to api-client.ts preserving code and status (#4)"
git commit -m "fix: testimonials DELETE — hard delete to soft delete (#3)"
git commit -m "fix: remove duplicate /api/health endpoint (#24)"
git commit -m "refactor: add tsconfig path aliases for components, hooks, stores, server (#25)"
git push -u origin refactor/s0-lib-structure
```

PR: `refactor/s0-lib-structure → dev` | Closes #3, #4, #5, #6, #24, #25

---

#### Branch: `feature/s0-types` → Closes #7, #8, #9

```bash
git checkout dev && git pull origin dev
git checkout -b feature/s0-types
```

Work:
- Create `types/contact.ts` with `ContactMessageSchema`
- Move `ProjectCreateSchema`, `ProjectUpdateSchema` into `types/project.ts`
- Move `TestimonialCreateSchema`, `TestimonialUpdateSchema` into `types/testimonial.ts`
- Fix `TestimonialUpdateSchema` — rename `featured` → `isActive`
- Update route files to import from `types/` instead of inline

```bash
git commit -m "feat: create types/contact.ts with ContactMessageSchema (#7)"
git commit -m "refactor: move ProjectCreateSchema and ProjectUpdateSchema to types/project.ts (#8)"
git commit -m "refactor: move TestimonialSchemas to types/testimonial.ts, fix isActive field (#9)"
git push -u origin feature/s0-types
```

PR: `feature/s0-types → dev` | Closes #7, #8, #9

---

#### Branch: `feature/s0-service-layer` → Closes #10, #11, #12, #13, #14, #15, #16

```bash
git checkout dev && git pull origin dev
git checkout -b feature/s0-service-layer
```

Work: Create all files under `server/`:
- `server/audit.ts` — `writeAuditLog()`
- `server/lead-score.ts` — `calculateLeadScore()`
- `server/bookings.ts` — `createBooking()`, `updateBookingStatus()`, `softDeleteBooking()`, `getAdminBookings()`
- `server/projects.ts` — `createProject()`, `getProjects()`, `getProjectById()`, `updateProject()`, `softDeleteProject()`
- `server/testimonials.ts` — `createTestimonial()`, `getTestimonials()`, `updateTestimonial()`, `softDeleteTestimonial()`
- `server/contact.ts` — `createContactMessage()`, `getMessages()`, `markMessageRead()`
- `server/settings.ts` — `getSetting()`, `getSettings()`, `updateSetting()`

```bash
git commit -m "feat: create server/audit.ts — writeAuditLog service (#10)"
git commit -m "feat: create server/lead-score.ts — calculateLeadScore (#11)"
git commit -m "feat: create server/bookings.ts — booking service layer (#12)"
git commit -m "feat: create server/projects.ts — project service layer (#13)"
git commit -m "feat: create server/testimonials.ts — testimonial service layer (#14)"
git commit -m "feat: create server/contact.ts — contact message service layer (#15)"
git commit -m "feat: create server/settings.ts — site settings service (#16)"
git push -u origin feature/s0-service-layer
```

PR: `feature/s0-service-layer → dev` | Closes #10–16

---

#### Branch: `feature/s0-api-completion` → Closes #17, #18, #19, #20, #21, #22, #23, #26

```bash
git checkout dev && git pull origin dev
git checkout -b feature/s0-api-completion
```

Work:
- Add `POST /api/contact` using `server/contact.ts`
- Add `DELETE /api/bookings/[id]` using `server/bookings.ts`
- Create `app/api/admin/settings/route.ts` — GET + PATCH using `server/settings.ts`
- Create `app/api/admin/messages/route.ts` — GET + PATCH using `server/contact.ts`
- Refactor ALL route handlers to call service layer functions
- Wire `writeAuditLog()` into every route (via service functions — routes don't call it directly)
- Wire `db.notification.create()` into `createBooking()` and `createContactMessage()` (already in the service designs above)
- Implement pagination in `GET /api/admin/bookings` using `BookingListQuerySchema`
- Add `unstable_cache` to `getWhatsAppNumber()` in `app/layout.tsx`
- Add `X-Request-ID` header to all route responses

```bash
git commit -m "feat: add POST /api/contact public submission handler (#17)"
git commit -m "feat: add DELETE /api/bookings/[id] admin soft delete (#18)"
git commit -m "feat: add GET and PATCH /api/admin/settings (#19)"
git commit -m "feat: add GET and PATCH /api/admin/messages (#20)"
git commit -m "refactor: wire all routes through service layer with audit logging (#21)"
git commit -m "feat: wire notification inserts via service layer (#22)"
git commit -m "feat: add pagination to GET /api/admin/bookings (#23)"
git commit -m "perf: cache getWhatsAppNumber with unstable_cache in layout (#26)"
git push -u origin feature/s0-api-completion
```

PR: `feature/s0-api-completion → dev` | Closes #17–23, #26

---

#### Sprint 0 Integration Checkpoint

```bash
git checkout dev && git pull origin dev
npm run dev

# Manual checks:
# curl -X POST http://localhost:3000/api/contact -H "Content-Type: application/json" \
#   -d '{"name":"Test","email":"t@t.com","message":"Hello"}' -v
# → 201, { success: true, data: { id: "..." } }

# Verify notification row created:
# SELECT * FROM notifications ORDER BY created_at DESC LIMIT 1;

# Verify audit log row created:
# SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 1;

# Verify soft-deleted testimonial not returned:
# UPDATE testimonials SET deleted_at = NOW() WHERE id = (SELECT id FROM testimonials LIMIT 1);
# curl http://localhost:3000/api/testimonials → should not include the deleted row

npm run build  # must pass with zero TypeScript errors
```

**Sprint 0 does NOT merge to `main`.**

---

### Sprint 1 — Public Site

**Goal:** Every public page renders real content. Visitors can browse, make contact, and book.

**Branch base:** `dev` (after Sprint 0 merged)

---

#### Issues

```
#27 [feature] Create public data hooks (useProjects, useTestimonials, useProject)  frontend, sprint-1
#28 [feature] Build homepage — hero, stats, services preview, featured projects, CTA  frontend, sprint-1
#29 [feature] Build /services — four service sections with CTA links               frontend, sprint-1
#30 [feature] Build /projects — grid with category filter and skeletons             frontend, sprint-1
#31 [feature] Build /projects/[id] — project detail page                           frontend, sprint-1
#32 [feature] Build /testimonials — star rating grid with skeletons                frontend, sprint-1
#33 [feature] Build /contact — form wired to POST /api/contact                     frontend, sprint-1
#34 [feature] Build /booking — full consultation form with POPIA consent           frontend, sprint-1
#35 [feature] Create /privacy — POPIA-compliant privacy policy (static)            frontend, sprint-1
#36 [feature] Add error boundaries and empty states to all data pages              frontend, sprint-1
```

---

#### Branch: `feature/s1-data-hooks` → Closes #27

```bash
git checkout dev && git pull origin dev
git checkout -b feature/s1-data-hooks
```

Work: Create `src/client/hooks/`:
- `useProjects.ts`
- `useProject.ts`
- `useTestimonials.ts`

Each file: one `useQuery` call, typed return, correct `queryKey`, appropriate `staleTime`.

```bash
git commit -m "feat: add useProjects, useProject, useTestimonials React Query hooks (#27)"
git push -u origin feature/s1-data-hooks
```

PR: `feature/s1-data-hooks → dev` | Closes #27

---

#### Branch: `feature/s1-homepage` → Closes #28

```bash
git checkout dev && git pull origin dev
git checkout -b feature/s1-homepage
```

Work: Build `app/page.tsx` — five sections. All use design tokens. Featured projects section calls `useProjects({ featured: true })`.

```bash
git commit -m "feat: add hero section to homepage (#28)"
git commit -m "feat: add stats bar to homepage (#28)"
git commit -m "feat: add services preview section (#28)"
git commit -m "feat: add featured projects section using useProjects (#28)"
git commit -m "feat: add CTA strip to homepage (#28)"
git push -u origin feature/s1-homepage
```

PR: `feature/s1-homepage → dev` | Closes #28

---

#### Branch: `feature/s1-services` → Closes #29

One branch, one page. Services content is static — no API call, no hook.

```bash
git checkout dev && git pull origin dev
git checkout -b feature/s1-services
git commit -m "feat: build /services page with four service sections (#29)"
git push -u origin feature/s1-services
```

PR: `feature/s1-services → dev` | Closes #29

---

#### Branch: `feature/s1-projects` → Closes #30, #31, #36

```bash
git checkout dev && git pull origin dev
git checkout -b feature/s1-projects
```

Work: Both project pages + loading skeletons + error boundaries + empty states.

```bash
git commit -m "feat: build /projects portfolio grid with category filter (#30)"
git commit -m "feat: build /projects/[id] detail page (#31)"
git commit -m "feat: add loading skeletons and error boundaries to project pages (#36)"
git push -u origin feature/s1-projects
```

PR: `feature/s1-projects → dev` | Closes #30, #31, #36

---

#### Branch: `feature/s1-testimonials` → Closes #32

```bash
git checkout dev && git pull origin dev
git checkout -b feature/s1-testimonials
git commit -m "feat: build /testimonials page with star rating grid (#32)"
git push -u origin feature/s1-testimonials
```

PR: `feature/s1-testimonials → dev` | Closes #32

---

#### Branch: `feature/s1-contact` → Closes #33

```bash
git checkout dev && git pull origin dev
git checkout -b feature/s1-contact
git commit -m "feat: build /contact page with form wired to POST /api/contact (#33)"
git push -u origin feature/s1-contact
```

PR: `feature/s1-contact → dev` | Closes #33

---

#### Branch: `feature/s1-booking` → Closes #34

```bash
git checkout dev && git pull origin dev
git checkout -b feature/s1-booking
```

Work: Full booking form. `react-hook-form` + `zodResolver(BookingSchema)`. UTM capture from `useSearchParams()`. Service pre-select from query param. POPIA checkbox. Success confirmation with booking ID.

```bash
git commit -m "feat: build /booking consultation form with all fields (#34)"
git commit -m "feat: add POPIA consent checkbox — required before submission (#34)"
git commit -m "feat: capture UTM params from query string on booking submit (#34)"
git commit -m "feat: pre-select service from URL query param on booking form (#34)"
git push -u origin feature/s1-booking
```

PR: `feature/s1-booking → dev` | Closes #34

---

#### Branch: `feature/s1-privacy` → Closes #35

```bash
git checkout dev && git pull origin dev
git checkout -b feature/s1-privacy
git commit -m "feat: add POPIA-compliant privacy policy page (#35)"
git push -u origin feature/s1-privacy
```

PR: `feature/s1-privacy → dev` | Closes #35

---

#### Sprint 1 Integration Checkpoint

```bash
git checkout dev && git pull origin dev
npm run dev

# Verify:
# / — Hero visible, featured projects load, no layout shift
# /services — All four services visible, CTA links work
# /projects — Grid loads, category filter works, skeleton shows
# /projects/[id] — Detail page loads for a real project ID
# /testimonials — Star rating grid loads
# /contact — Form submits, success message appears, contact_messages row created
# /booking — Form submits with all fields, consent required, booking row created
# /privacy — Page renders

npm run build  # zero TypeScript errors
```

**Sprint 1 does NOT merge to `main` yet.**

---

### Sprint 2 — Admin Dashboard

**Goal:** Admin can manage all business operations through the dashboard.

**Branch base:** `dev` (after Sprint 1 merged)

---

#### Issues

```
#37 [feature] Create admin data hooks (useAdminBookings, mutations, etc.) frontend, sprint-2
#38 [feature] Wire AdminSidebar mobile toggle to useAdminUI Zustand store  frontend, sprint-2
#39 [feature] Build admin dashboard — stats cards and recent bookings       frontend, sprint-2
#40 [feature] Build /admin/bookings — table, filter, status actions         frontend, sprint-2
#41 [feature] Build /admin/projects — CRUD with featured toggle             frontend, sprint-2
#42 [feature] Build /admin/testimonials — CRUD with isActive toggle         frontend, sprint-2
#43 [feature] Build /admin/messages — inbox with unread/read                frontend, sprint-2
#44 [feature] Build /admin/settings — SiteSettings key-value editor         frontend, sprint-2
```

---

#### Branch: `feature/s2-admin-hooks` → Closes #37

```bash
git checkout dev && git pull origin dev
git checkout -b feature/s2-admin-hooks
```

Work: Create `src/client/hooks/admin/`:
- `useAdminBookings.ts` — query + mutation (update status)
- `useAdminProjects.ts` — query + mutations (create, update, delete, featured toggle)
- `useAdminTestimonials.ts` — query + mutations
- `useAdminMessages.ts` — query + mark-read mutation
- `useAdminSettings.ts` — query + update mutation

Each mutation hook: calls `queryClient.invalidateQueries()` on success to keep UI fresh.

```bash
git commit -m "feat: add admin React Query hooks and mutation hooks (#37)"
git push -u origin feature/s2-admin-hooks
```

PR: `feature/s2-admin-hooks → dev` | Closes #37

---

#### Branch: `feature/s2-admin-layout` → Closes #38

```bash
git checkout dev && git pull origin dev
git checkout -b feature/s2-admin-layout
```

Work:
- Wire mobile hamburger button in admin layout to `useAdminUI().toggleSidebar()`
- Pass session user data (`adminEmail`, `adminName`) from layout server component to `AdminSidebar`

```bash
git commit -m "feat: wire AdminSidebar mobile toggle to useAdminUI Zustand store (#38)"
git push -u origin feature/s2-admin-layout
```

PR: `feature/s2-admin-layout → dev` | Closes #38

---

#### Branch: `feature/s2-admin-dashboard` → Closes #39

```bash
git checkout dev && git pull origin dev
git checkout -b feature/s2-admin-dashboard
git commit -m "feat: build admin dashboard with stats cards and recent bookings (#39)"
git push -u origin feature/s2-admin-dashboard
```

PR: `feature/s2-admin-dashboard → dev` | Closes #39

---

#### Branch: `feature/s2-admin-bookings` → Closes #40

```bash
git checkout dev && git pull origin dev
git checkout -b feature/s2-admin-bookings
```

Work: Bookings table with all features — status filter tabs wired to Zustand, search, sortable columns, expandable rows, lead score colour coding, pagination, status change dropdown.

```bash
git commit -m "feat: build admin bookings table with filter, search, and status actions (#40)"
git commit -m "feat: add lead score indicator and pagination to bookings (#40)"
git push -u origin feature/s2-admin-bookings
```

PR: `feature/s2-admin-bookings → dev` | Closes #40

---

#### Branch: `feature/s2-admin-content` → Closes #41, #42, #43, #44

```bash
git checkout dev && git pull origin dev
git checkout -b feature/s2-admin-content
```

Work: Projects CRUD, Testimonials CRUD, Messages inbox, Settings editor — all in one branch because they follow identical patterns.

```bash
git commit -m "feat: build admin projects CRUD with featured toggle (#41)"
git commit -m "feat: build admin testimonials CRUD with isActive toggle (#42)"
git commit -m "feat: build admin messages inbox with mark-as-read (#43)"
git commit -m "feat: build admin settings editor for SiteSettings (#44)"
git push -u origin feature/s2-admin-content
```

PR: `feature/s2-admin-content → dev` | Closes #41, #42, #43, #44

---

#### Sprint 2 → `dev` Integration + **First `main` Release**

```bash
git checkout dev && git pull origin dev
npm run dev

# Full integration walkthrough:
# Admin login → Dashboard → all stats correct
# Bookings → filter by PENDING → change status → status updates in row
# Projects → create → appears in list → toggle featured → check homepage
# Testimonials → create → appears on /testimonials
# Messages → submit contact form on /contact → appears in inbox → mark read
# Settings → update WhatsApp number → check floating button on public site
# Logout → /admin redirects to login

npm run build
```

**Open PR: `dev → main`**
```
Title: release: Sprint 0 + 1 + 2 — working system, public site, admin dashboard

What this includes:
- Sprint 0: Backend corrected — service layer, audit logging, notification outbox, all bugs fixed
- Sprint 1: Full public site — 7 pages, all functional
- Sprint 2: Full admin dashboard — 6 sections, all functional

Build: passing
Integration: verified
```

**This is the first production-ready state of the system.**

---

### Sprint 3 — Notifications & Deployment

**Goal:** Admin receives email when bookings or messages arrive. System is live on Railway + Vercel.

---

#### Issues

```
#45 [feature] Install Resend, create lib/email.ts, email templates       backend, sprint-3
#46 [feature] Build /api/internal/notify outbox processor                backend, sprint-3
#47 [feature] Configure Vercel Cron for notify endpoint                  devops,  sprint-3
#48 [feature] Create prisma/seed.prod.ts for first production deploy     database, sprint-3
#49 [feature] Configure Railway PostgreSQL + Vercel deployment           devops, sprint-3
#50 [feature] Set all production environment variables, document them    devops, sprint-3
```

---

#### Branch: `feature/s3-email` → Closes #45, #46, #47

```bash
git checkout dev && git pull origin dev
git checkout -b feature/s3-email
```

Work:
- `npm install resend`
- Create `lib/email.ts` — `sendEmail()` wrapper with typed `EmailTemplate` type
- Create email templates: `newBookingEmail({ name, service, leadScore, bookingId })` and `newContactEmail({ name, email, message })`
- Create `app/api/internal/notify/route.ts`:
  ```typescript
  // Protected by CRON_SECRET header — only the cron job can call this
  // Reads notifications WHERE sent_at IS NULL, ordered by created_at ASC
  // For each row: sends email via Resend, sets sent_at = NOW()
  // On Resend failure: sets failed_at = NOW(), stores error string, skips to next row
  // After 3 failures (failed_at IS NOT NULL): skip permanently
  ```
- Add `vercel.json`:
  ```json
  {
    "crons": [{ "path": "/api/internal/notify", "schedule": "*/5 * * * *" }]
  }
  ```

```bash
git commit -m "feat: install Resend and create lib/email.ts with templates (#45)"
git commit -m "feat: build /api/internal/notify outbox processor (#46)"
git commit -m "feat: configure Vercel Cron for notify endpoint (#47)"
git push -u origin feature/s3-email
```

PR: `feature/s3-email → dev` | Closes #45, #46, #47

---

#### Branch: `feature/s3-deployment` → Closes #48, #49, #50

```bash
git checkout dev && git pull origin dev
git checkout -b feature/s3-deployment
```

Work:
- Create `prisma/seed.prod.ts` — creates admin account from `ADMIN_EMAIL` and `ADMIN_PASSWORD` env vars (never hardcoded credentials)
- Create `docs/deployment.md` — Railway PostgreSQL setup, Vercel project config, env var list
- Update `.env.example` with all required production variables and descriptions
- Add `prisma migrate deploy` to the Vercel build command

**Complete `.env.example`:**
```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/sunduza

# NextAuth
NEXTAUTH_URL=https://sunduza.co.za
NEXTAUTH_SECRET=           # openssl rand -base64 32

# Auth tuning
BCRYPT_ROUNDS=12
SESSION_MAX_AGE_SECONDS=2592000

# Upstash Redis (rate limiting)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Resend (email)
RESEND_API_KEY=

# Admin notification
ADMIN_EMAIL=admin@sunduza.co.za

# Internal cron protection
CRON_SECRET=               # openssl rand -hex 32
```

```bash
git commit -m "feat: create prisma/seed.prod.ts for production admin seeding (#48)"
git commit -m "feat: configure Railway and Vercel deployment, document env vars (#49, #50)"
git push -u origin feature/s3-deployment
```

PR: `feature/s3-deployment → dev` | Closes #48, #49, #50

---

#### Sprint 3 → `dev` → `main`

```bash
# After both branches merged to dev:
npm run build

# Production smoke test:
# Submit booking on /booking → admin email arrives within 5 minutes
# Submit contact on /contact → admin email arrives within 5 minutes
# GET /api/v1/health → { status: "ok", database: "connected" }
# Check notifications table — sent_at IS NOT NULL for processed rows
```

**PR: `dev → main`**
```
Title: release: Sprint 3 — email notifications and production deployment
```

---

### Sprint 4 — Tests and Polish

**Goal:** Confidence before go-live. Tests cover every critical path.

---

#### Issues

```
#51 [feature]  Set up Vitest + testing-library                    testing, sprint-4
#52 [test]     API tests: booking creation, rate limit, Zod       testing, backend, sprint-4
#53 [test]     API tests: auth flows, lockout after 10 attempts   testing, backend, sprint-4
#54 [test]     API tests: all admin routes 401 without session    testing, backend, sprint-4
#55 [test]     Unit tests: lead score calculation                 testing, backend, sprint-4
#56 [test]     Unit tests: apiSuccess and apiError shapes         testing, backend, sprint-4
#57 [feature]  Set up Playwright E2E                              testing, sprint-4
#58 [test]     E2E: booking form submission                       testing, frontend, sprint-4
#59 [test]     E2E: admin login and booking status update         testing, frontend, sprint-4
#60 [improvement] Accessibility audit and keyboard navigation fixes  frontend, sprint-4
#61 [improvement] OG images and full SEO metadata on all pages    frontend, sprint-4
#62 [improvement] Lighthouse audit — target ≥ 85 on homepage      frontend, sprint-4
#63 [feature]  Add Sentry error monitoring                        devops, sprint-4
```

#### Branch structure:

```
feature/s4-test-setup     → Closes #51, #57
test/s4-api-tests         → Closes #52, #53, #54, #55, #56
test/s4-e2e-tests         → Closes #58, #59
feature/s4-seo-a11y       → Closes #60, #61, #62
feature/s4-monitoring     → Closes #63
```

Each branch follows the same git workflow: `checkout dev` → `checkout -b branch` → commits → PR → squash merge → delete branch.

---

#### Sprint 4 → `dev` → `main` (Final Release)

```bash
npm run test      # all unit + integration tests pass
npm run test:e2e  # all Playwright tests pass
npm run build     # zero TypeScript errors and zero warnings
```

**PR: `dev → main`**
```
Title: release: Sprint 4 — test suite, SEO, accessibility, monitoring — PRODUCTION READY
```

---

## Part 6 — What Breaks and How to Find It

### Checklist: "Something stopped working"

**1. Get the Request ID first**  
Every API response includes `X-Request-ID`. If you have the ID, search server logs for it. The error will be in the log with that ID.

**2. Check the database state directly**  
Most bugs are state bugs — a field has an unexpected value. `psql $DATABASE_URL` and query the table directly. Do not trust what the UI shows you.

**3. Check the audit log**  
`SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 20`. The last N entries will show you exactly what happened and when.

**4. Check the notification outbox**  
`SELECT * FROM notifications WHERE failed_at IS NOT NULL ORDER BY created_at DESC`. Failed notifications have the Resend error message in the `error` column.

**5. Check the session**  
If admin pages are misbehaving: `SELECT * FROM sessions WHERE user_id = '...'`. If the row is missing or `expires` is in the past, the session is invalid.

---

### Dependency Map: What Breaks What

```
lib/db.ts broken → everything breaks (all server/ files, all api routes)
lib/auth.ts broken → admin login broken, all admin API routes return 401
lib/rate-limit.ts broken → bookings and contact may return 500 (if Upstash credentials wrong)
lib/request.ts broken → X-Request-ID missing from responses (cosmetic only)
server/audit.ts broken → audit logs stop writing (fire-and-forget — does not break requests)
server/lead-score.ts broken → lead_score is 0 or null on new bookings (does not break booking creation)
server/bookings.ts broken → POST /api/bookings returns 500
server/contact.ts broken → POST /api/contact returns 500
types/booking.ts broken → TypeScript compilation fails in any file that imports from it
app/api/bookings/route.ts broken → public booking form fails
app/api/contact/route.ts broken → public contact form fails
app/api/admin/bookings/route.ts broken → admin bookings page shows error state
middleware.ts broken → /admin/* no longer protected (critical security failure)
```

---

## Appendix — Complete File Inventory

### What Exists Now

```
✅ prisma/schema.prisma            — Production-grade. Keep.
✅ prisma/migrations/20260515../   — Init migration exists.
✅ lib/db.ts                       — Keep. Fix: add findUnique to middleware.
✅ lib/auth.ts                     — Keep. Fix: remove rate-limit + requestId functions.
✅ lib/api-response.ts             — Keep as-is.
⚠️ lib/api-client.ts               — Fix: add ApiClientError.
✅ middleware.ts                   — Keep as-is.
✅ types/booking.ts                — Keep. Add BookingUpdateSchema.
✅ app/layout.tsx                  — Keep. Fix: cache getWhatsAppNumber.
✅ app/globals.css                 — Keep as-is.
✅ app/admin/login/page.tsx        — Keep as-is.
✅ app/api/bookings/route.ts       — Refactor to use server/bookings.ts
✅ app/api/bookings/[id]/route.ts  — Refactor. Add DELETE.
✅ app/api/projects/route.ts       — Refactor. Move schema to types/.
✅ app/api/projects/[id]/route.ts  — Refactor. Move schema.
⚠️ app/api/contact/route.ts        — Add POST handler.
⚠️ app/api/testimonials/route.ts   — Move schema to types/.
⚠️ app/api/testimonials/[id]/route.ts — Fix hard delete. Fix isActive/featured.
⚠️ app/api/admin/bookings/route.ts — Move schema. Add pagination.
❌ app/api/health/route.ts         — DELETE (duplicate).
✅ app/api/v1/health/route.ts      — Keep as canonical.
✅ src/client/components/providers.tsx   — Keep as-is.
✅ src/client/components/layout/Header.tsx — Keep. Fix import path after alias.
✅ src/client/components/layout/Footer.tsx — Keep.
✅ src/client/components/layout/FloatingWhatsApp.tsx — Keep.
✅ src/client/components/admin/AdminSidebar.tsx — Keep. Fix import paths.
✅ src/client/components/ui/*      — Keep all. Fix import paths.
✅ src/client/stores/admin-ui.ts   — Keep as-is.
```

### What Gets Created

```
lib/rate-limit.ts              — Upstash rate limiters
lib/request.ts                 — generateRequestId, getClientIp
types/contact.ts               — ContactMessageSchema
types/project.ts               — Add Zod schemas (currently TS interface only)
types/testimonial.ts           — Add Zod schemas
server/audit.ts                — writeAuditLog
server/lead-score.ts           — calculateLeadScore
server/bookings.ts             — booking service
server/projects.ts             — project service
server/testimonials.ts         — testimonial service
server/contact.ts              — contact service
server/settings.ts             — settings service
app/api/admin/settings/route.ts  — new
app/api/admin/messages/route.ts  — new (moved from contact/route.ts)
app/api/internal/notify/route.ts — new (Sprint 3)
app/page.tsx                   — build (Sprint 1)
app/services/page.tsx          — build (Sprint 1)
app/projects/page.tsx          — build (Sprint 1)
app/projects/[id]/page.tsx     — build (Sprint 1)
app/testimonials/page.tsx      — build (Sprint 1)
app/contact/page.tsx           — build (Sprint 1)
app/booking/page.tsx           — build (Sprint 1)
app/privacy/page.tsx           — build (Sprint 1)
app/admin/(dashboard)/page.tsx — build (Sprint 2)
app/admin/(dashboard)/bookings/page.tsx — build (Sprint 2)
app/admin/(dashboard)/projects/page.tsx — build (Sprint 2)
app/admin/(dashboard)/testimonials/page.tsx — build (Sprint 2)
app/admin/(dashboard)/messages/page.tsx — build (Sprint 2)
app/admin/(dashboard)/settings/page.tsx — build (Sprint 2)
src/client/hooks/useProjects.ts      — Sprint 1
src/client/hooks/useProject.ts       — Sprint 1
src/client/hooks/useTestimonials.ts  — Sprint 1
src/client/hooks/admin/*.ts          — Sprint 2
lib/email.ts                         — Sprint 3
prisma/seed.prod.ts                  — Sprint 3
vercel.json                          — Sprint 3
docs/deployment.md                   — Sprint 3
tests/                               — Sprint 4
```

### What Gets Deleted

```
app/api/health/route.ts   — duplicate of /api/v1/health
dev.db                    — untracked from git (file stays locally, not in repo)
prisma/dev.db             — untracked from git
```

---

*This document was written against the exact code in `sunduza-architectural-main` as of May 2026.*  
*Update it when the system changes. A stale reference document is worse than no document.*
