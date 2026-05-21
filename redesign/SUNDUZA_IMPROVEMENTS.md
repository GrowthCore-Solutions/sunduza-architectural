# Sunduza — Professional Improvements
## Eight Targeted Upgrades · Full Code · Full Reasoning

> **Document type:** Implementation reference  
> **Prerequisite:** Sprint 0 from the System Redesign doc is complete  
> **Standard:** Industry-level production code  
> **Date:** May 2026

---

## Read This First

This document covers eight improvements. Every one of them has a specific problem it solves. None of them are added because they look good. None of them add complexity for its own sake.

For each improvement you will find:

- **The problem** — what is actually wrong right now
- **The solution** — what exactly changes and why
- **The code** — exact, production-ready, works with this codebase
- **Where it lives** — the file path
- **How to verify it works** — the check you run
- **How to debug it** — what to look for when it breaks
- **The sprint branch** — where this belongs in the git workflow

The eight improvements in order of impact:

1. [Typed Environment Validation — `lib/env.ts`](#1-typed-environment-validation)
2. [`server-only` Boundaries — Every Server File](#2-server-only-boundaries)
3. [`withAuth()` Route Wrapper — Kill the Boilerplate](#3-withauth-route-wrapper)
4. [Prisma Typed Selects — Schema-Driven Types](#4-prisma-typed-selects)
5. [Route-Level Loading, Error, Not-Found Files](#5-route-level-loading-error-not-found)
6. [`$transaction` for Atomic Operations](#6-transaction-for-atomic-operations)
7. [`<FormField>` Component — One Composable Unit](#7-formfield-component)
8. [Booking Status State Machine](#8-booking-status-state-machine)

---

## 1. Typed Environment Validation

### The Problem

Right now `process.env.ADMIN_EMAIL` and `process.env.RESEND_API_KEY` and `process.env.UPSTASH_REDIS_REST_URL` are accessed directly in route handlers and service files. If any of these are missing in production the application still starts. It accepts a booking, tries to queue a notification, fails silently, and the admin never finds out.

The developer finds out three days later when a client calls asking why nobody responded.

Environment variables are configuration. Configuration must be validated at startup, not at runtime.

### The Solution

`lib/env.ts` validates every required environment variable when the module is first imported — which happens at application startup. If any required variable is missing the application throws an error with a clear message and refuses to start. You catch the problem at deploy time.

Zod is already installed. This is a 40-line file that closes an entire class of production bugs.

### The Code

```typescript
// lib/env.ts
//
// WHAT: Validates and exports all environment variables as typed values.
//       This is the single source of truth for configuration.
//
// WHY:  process.env values are always `string | undefined` in TypeScript.
//       Every call site would need a null check. Without this file,
//       missing env vars cause silent runtime failures — not startup failures.
//       With this file, a missing variable throws at startup with a clear message.
//
// HOW:  Zod parses process.env on first import. If validation fails,
//       the error is thrown immediately and the application does not start.
//       All other files import from here, never from process.env directly.
//
// USAGE: import { env } from "@/lib/env";
//        env.DATABASE_URL  // string, guaranteed to exist

import { z } from "zod";

const envSchema = z.object({
  // ── Node ──────────────────────────────────────────────────────────────────
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  // ── Database ──────────────────────────────────────────────────────────────
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // ── NextAuth ──────────────────────────────────────────────────────────────
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL"),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, "NEXTAUTH_SECRET must be at least 32 characters"),

  // ── Auth Tuning ───────────────────────────────────────────────────────────
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(14).default(12),
  SESSION_MAX_AGE_SECONDS: z.coerce.number().int().positive().default(2592000),

  // ── Upstash Redis (rate limiting) ─────────────────────────────────────────
  UPSTASH_REDIS_REST_URL: z
    .string()
    .url("UPSTASH_REDIS_REST_URL must be a valid URL"),
  UPSTASH_REDIS_REST_TOKEN: z
    .string()
    .min(1, "UPSTASH_REDIS_REST_TOKEN is required"),

  // ── Resend (email) ────────────────────────────────────────────────────────
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),

  // ── Business config ───────────────────────────────────────────────────────
  ADMIN_EMAIL: z.string().email("ADMIN_EMAIL must be a valid email address"),
  CRON_SECRET: z
    .string()
    .min(32, "CRON_SECRET must be at least 32 characters"),
});

// Parse once at module load.
// If this throws, the application does not start.
// The error message names every missing or invalid variable.
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const missing = parsed.error.issues
    .map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  throw new Error(
    `\n\n❌ Environment validation failed. Fix the following:\n\n${missing}\n\nSee .env.example for reference.\n`
  );
}

export const env = parsed.data;
```

### Where It Lives

```
lib/env.ts      ← new file
```

### How Every Other File Uses It

Replace every `process.env.*` call across the codebase:

```typescript
// ❌ Before — undefined is possible, TypeScript cannot help you
const adminEmail = process.env.ADMIN_EMAIL ?? "admin@sunduza.co.za";

// ✅ After — string guaranteed, TypeScript knows the type
import { env } from "@/lib/env";
const adminEmail = env.ADMIN_EMAIL;
```

Files that need to be updated:
- `lib/auth.ts` — `BCRYPT_ROUNDS`, `SESSION_MAX_AGE_SECONDS`
- `lib/rate-limit.ts` — `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- `server/bookings.ts` — `ADMIN_EMAIL`
- `server/contact.ts` — `ADMIN_EMAIL`
- `server/settings.ts` — fallback email
- `lib/email.ts` — `RESEND_API_KEY`
- `app/api/internal/notify/route.ts` — `CRON_SECRET`

### How to Verify

```bash
# Remove a required var temporarily
unset ADMIN_EMAIL
npm run dev

# You should see this in the terminal — app refuses to start:
# ❌ Environment validation failed. Fix the following:
#   ADMIN_EMAIL: ADMIN_EMAIL must be a valid email address

# Restore it
export ADMIN_EMAIL="admin@sunduza.co.za"
npm run dev  # starts normally
```

### How to Debug

**App fails to start with env error:** Read the error message exactly. It lists every missing or invalid variable by name. Fix them in `.env.local`.

**TypeScript doesn't recognise `env.ADMIN_EMAIL`:** Confirm `lib/env.ts` is imported in the file using it. The `env` export is a plain object — no special handling needed.

**`NEXTAUTH_URL` fails in development:** Set it to `http://localhost:3000` in `.env.local`. In production it must be `https://yourdomain.com`.

### Sprint Branch

```bash
git checkout dev && git pull origin dev
git checkout -b feature/s0-env-validation

git commit -m "feat: add lib/env.ts — typed environment variable validation (#new-issue)"
git commit -m "refactor: replace process.env calls with env imports across all files"
git push -u origin feature/s0-env-validation
```

---

## 2. `server-only` Boundaries

### The Problem

`server-only` is in `package.json` but not used anywhere. It is doing nothing.

The risk: Next.js has two execution environments — the server and the browser. `lib/db.ts`, `lib/auth.ts`, `server/bookings.ts`, and every file in `server/` must never run in the browser. If a client component accidentally imports any of these files, it either fails at runtime with a cryptic error or — worse — silently leaks server secrets into the browser bundle.

Without `server-only`, TypeScript will not warn you. The build will not warn you. You will find out in production.

### The Solution

Add `import "server-only"` as the first line of every file that must stay on the server. If a client component imports that file, the build fails immediately with a clear error:

```
Error: This module cannot be imported from a Client Component module.
It should only be used from a Server Component.
```

One line per file. Zero new dependencies — the package is already installed.

### The Code

Add this as the **first line** of each of the following files. Nothing else changes.

```typescript
// lib/db.ts — line 1
import "server-only";
// ... rest of file unchanged

// lib/auth.ts — line 1
import "server-only";
// ... rest of file unchanged

// lib/rate-limit.ts — line 1
import "server-only";
// ... rest of file unchanged

// lib/request.ts — line 1
import "server-only";
// ... rest of file unchanged

// lib/email.ts — line 1 (when created in Sprint 3)
import "server-only";
// ... rest of file unchanged

// lib/env.ts — line 1
import "server-only";
// ... rest of file unchanged

// server/audit.ts — line 1
import "server-only";
// ... rest of file unchanged

// server/bookings.ts — line 1
import "server-only";
// ... rest of file unchanged

// server/projects.ts — line 1
import "server-only";
// ... rest of file unchanged

// server/testimonials.ts — line 1
import "server-only";
// ... rest of file unchanged

// server/contact.ts — line 1
import "server-only";
// ... rest of file unchanged

// server/settings.ts — line 1
import "server-only";
// ... rest of file unchanged

// server/lead-score.ts — line 1
import "server-only";
// ... rest of file unchanged
```

### Files That Must NOT Have `server-only`

These run in both environments or only in the browser:

```
lib/api-response.ts    — types and helpers used by api-client.ts (browser)
lib/api-client.ts      — browser HTTP client
lib/utils.ts           — cn(), formatDate() used in client components
types/*                — Zod schemas shared between client forms and API routes
src/client/**          — everything under here is client code
```

### How to Verify

```bash
# Temporarily add a server-only file import to a client component
# In src/client/components/layout/Header.tsx, add at the top:
# import { db } from "@/lib/db"

npm run build

# You should see:
# Error: This module cannot be imported from a Client Component module.
# It should only be used from a Server Component.

# Remove the test import. Build passes again.
```

### How to Debug

**Build error you did not expect:** A client component is importing a server file. The error message shows the import chain. Follow the chain to find which client component is the culprit. Remove or restructure the import.

**`server-only` not catching an import:** The file importing the server module is not marked `"use client"`. Next.js only enforces the boundary for Client Components. If a Server Component imports a server file, that is correct and not an error.

### Sprint Branch

This belongs in the same branch as `lib/env.ts`. Commit separately for clarity:

```bash
git commit -m "feat: add server-only import boundaries to all server-side files (#new-issue)"
```

---

## 3. `withAuth()` Route Wrapper

### The Problem

Every admin API route repeats this exact block:

```typescript
const session = await auth();
if (!session?.user) {
  return NextResponse.json(
    apiError("Unauthorized", ErrorCode.UNAUTHORIZED, 401),
    { status: 401 }
  );
}
```

That is six lines in every admin handler. There are ten admin route handlers. Sixty lines of identical code. When auth logic changes — adding role checks, logging 401 attempts, adding IP to the response — you update ten files.

This is not just repetition. It is a maintenance trap.

### The Solution

A `withAuth()` higher-order function that wraps any route handler. It performs the session check, then calls your handler with the verified session injected. The handler only handles its actual job.

### The Code

```typescript
// lib/with-auth.ts
//
// WHAT: Higher-order function that wraps admin route handlers.
//       Performs session verification before calling the handler.
//
// WHY:  Ten admin routes repeat the same six-line auth check.
//       This replaces all ten with one function.
//       When auth behaviour needs to change, one file changes.
//
// HOW:  Accepts a handler function typed to receive a verified session.
//       Returns a Next.js-compatible route handler function.
//       If no session exists, returns 401 immediately without calling the handler.
//
// USAGE:
//   export const GET = withAuth(async (req, session) => {
//     // session.user is guaranteed here — no check needed
//     const bookings = await getAdminBookings();
//     return NextResponse.json(apiSuccess(bookings));
//   });

import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { apiError, ErrorCode } from "@/lib/api-response";
import type { Session } from "next-auth";

// The shape of a handler that receives a verified session
type AuthenticatedHandler = (
  req: NextRequest,
  session: Session,
  context?: { params: Promise<Record<string, string>> }
) => Promise<NextResponse>;

// withAuth wraps a handler, injects the session, and handles 401 uniformly
export function withAuth(handler: AuthenticatedHandler) {
  return async function (
    req: NextRequest,
    context?: { params: Promise<Record<string, string>> }
  ): Promise<NextResponse> {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        apiError("Unauthorized", ErrorCode.UNAUTHORIZED, 401),
        { status: 401 }
      );
    }

    return handler(req, session, context);
  };
}
```

### How Every Admin Route Changes

```typescript
// app/api/admin/bookings/route.ts
//
// BEFORE — auth check repeated manually

import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      apiError("Unauthorized", ErrorCode.UNAUTHORIZED, 401),
      { status: 401 }
    );
  }
  // ... actual logic
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      apiError("Unauthorized", ErrorCode.UNAUTHORIZED, 401),
      { status: 401 }
    );
  }
  // ... actual logic
}
```

```typescript
// app/api/admin/bookings/route.ts
//
// AFTER — clean, focused handlers

import { withAuth } from "@/lib/with-auth";
import { apiSuccess, apiError, ErrorCode } from "@/lib/api-response";
import { getAdminBookings, updateBookingStatus } from "@/server/bookings";
import { BookingListQuerySchema } from "@/types/booking";

export const GET = withAuth(async (req, session) => {
  const { searchParams } = new URL(req.url);
  const query = BookingListQuerySchema.parse(
    Object.fromEntries(searchParams)
  );

  const result = await getAdminBookings(query);
  return NextResponse.json(apiSuccess(result));
});

export const PATCH = withAuth(async (req, session) => {
  const body = await req.json();
  const parsed = BookingUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      apiError(
        parsed.error.issues.map((e) => e.message).join(", "),
        ErrorCode.VALIDATION_ERROR,
        400
      ),
      { status: 400 }
    );
  }

  const booking = await updateBookingStatus(
    parsed.data.id,
    { status: parsed.data.status, adminNotes: parsed.data.adminNotes },
    { userId: session.user.id, ipAddress: "unknown" }
  );

  if (!booking) {
    return NextResponse.json(
      apiError("Booking not found", ErrorCode.NOT_FOUND, 404),
      { status: 404 }
    );
  }

  return NextResponse.json(apiSuccess(booking));
});
```

### Routes That Get `withAuth` Applied

```
app/api/admin/bookings/route.ts         — GET, PATCH
app/api/bookings/[id]/route.ts          — GET, PATCH, DELETE
app/api/projects/route.ts               — POST
app/api/projects/[id]/route.ts          — PATCH, DELETE
app/api/testimonials/route.ts           — POST
app/api/testimonials/[id]/route.ts      — PATCH, DELETE
app/api/contact/route.ts                — GET, PATCH (admin only)
app/api/admin/settings/route.ts         — GET, PATCH
app/api/admin/messages/route.ts         — GET, PATCH
app/api/internal/notify/route.ts        — uses CRON_SECRET not session — exclude
app/api/bookings/route.ts               — public POST — exclude
app/api/contact/route.ts (POST)         — public — exclude
```

### Where It Lives

```
lib/with-auth.ts    ← new file
```

### How to Verify

```bash
# Start the dev server
npm run dev

# Try an admin route without a session cookie
curl -X GET http://localhost:3000/api/admin/bookings \
  -H "Content-Type: application/json"

# Should return:
# { "success": false, "error": { "message": "Unauthorized", "code": "UNAUTHORIZED", "status": 401 } }

# Confirm a valid session still works normally by logging in first
```

### How to Debug

**Wrapped handler receives `undefined` session:** This cannot happen — `withAuth` only calls the handler when `session?.user` is truthy. If TypeScript shows session as possibly undefined, the type annotation in `AuthenticatedHandler` is wrong. Confirm `Session` is imported from `next-auth`.

**Dynamic route params not accessible:** For routes with `[id]`, use `context`:
```typescript
export const GET = withAuth(async (req, session, context) => {
  const { id } = await context!.params;
  // ...
});
```

**Admin middleware passes but `withAuth` still returns 401:** The session cookie exists but `auth()` cannot read it. Check `NEXTAUTH_SECRET` is identical between the server that set the cookie and the one reading it.

### Sprint Branch

```bash
git checkout dev && git pull origin dev
git checkout -b feature/s0-with-auth

git commit -m "feat: add withAuth higher-order function for admin route handlers"
git commit -m "refactor: apply withAuth to all admin API routes"
git push -u origin feature/s0-with-auth
```

---

## 4. Prisma Typed Selects

### The Problem

In `server/bookings.ts` and every other service file, select objects are written inline and return types are either implicit (TypeScript infers `any`) or manually typed (TypeScript drift when the schema changes).

```typescript
// This is the current pattern — return type is inferred as any
const booking = await db.booking.create({
  data: { ... },
  select: { id: true, status: true, leadScore: true },
});
// booking is: { id: string; status: BookingStatus; leadScore: number | null }
// But TypeScript inferred this — if you add a field to select, you must update every
// component that consumes this type manually
```

When the schema changes, nothing breaks at compile time. Components that consume these types break at runtime.

### The Solution

Prisma generates exact payload types from your select objects using `Prisma.BookingGetPayload`. Define the select object once as a constant. Derive the TypeScript type from it. Every component that uses that data gets an automatically correct type.

```typescript
// The select is defined once
// The type is derived from it automatically
// If the select changes, the type changes — no manual sync

import { Prisma } from "@prisma/client";

const bookingRowSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  service: true,
  location: true,
  status: true,
  leadScore: true,
  adminNotes: true,
  createdAt: true,
} satisfies Prisma.BookingSelect;

type BookingRow = Prisma.BookingGetPayload<{ select: typeof bookingRowSelect }>;
```

### The Code — `types/db.ts`

Centralise all Prisma payload types in one file. Every service file and every component imports from here.

```typescript
// types/db.ts
//
// WHAT: Typed select definitions and derived payload types for all Prisma models.
//
// WHY:  Prisma generates exact TypeScript types from select objects.
//       Defining selects once and deriving types from them means:
//       — No manual type definitions that drift from the schema
//       — TypeScript catches field mismatches at compile time
//       — Components know exactly what shape they will receive
//
// HOW:  Each model has:
//       1. A `*Select` constant — the select object passed to Prisma queries
//       2. A `*Row` type — derived from the select using Prisma.ModelGetPayload
//
// RULE: Never add a field to a select without considering every
//       component that consumes that type. TypeScript will tell you.

import { Prisma } from "@prisma/client";

// ── Booking ────────────────────────────────────────────────────────────────────

// Admin list view — all fields the admin table needs
export const bookingRowSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  service: true,
  location: true,
  description: true,
  meetingDate: true,
  budget: true,
  status: true,
  leadScore: true,
  adminNotes: true,
  consentGiven: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.BookingSelect;

export type BookingRow = Prisma.BookingGetPayload<{
  select: typeof bookingRowSelect;
}>;

// Public confirmation — minimal fields returned to the visitor after submit
export const bookingConfirmSelect = {
  id: true,
  status: true,
  leadScore: true,
} satisfies Prisma.BookingSelect;

export type BookingConfirm = Prisma.BookingGetPayload<{
  select: typeof bookingConfirmSelect;
}>;

// ── Project ────────────────────────────────────────────────────────────────────

// Public list and admin list — same fields
export const projectRowSelect = {
  id: true,
  title: true,
  description: true,
  imagePath: true,
  category: true,
  sortOrder: true,
  isFeatured: true,
  createdAt: true,
} satisfies Prisma.ProjectSelect;

export type ProjectRow = Prisma.ProjectGetPayload<{
  select: typeof projectRowSelect;
}>;

// ── Testimonial ────────────────────────────────────────────────────────────────

export const testimonialRowSelect = {
  id: true,
  clientName: true,
  review: true,
  rating: true,
  projectId: true,
  isActive: true,
  createdAt: true,
} satisfies Prisma.TestimonialSelect;

export type TestimonialRow = Prisma.TestimonialGetPayload<{
  select: typeof testimonialRowSelect;
}>;

// ── Contact Message ────────────────────────────────────────────────────────────

export const contactMessageRowSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  message: true,
  read: true,
  readAt: true,
  createdAt: true,
} satisfies Prisma.ContactMessageSelect;

export type ContactMessageRow = Prisma.ContactMessageGetPayload<{
  select: typeof contactMessageRowSelect;
}>;

// Minimal type for the submission confirmation
export const contactConfirmSelect = {
  id: true,
} satisfies Prisma.ContactMessageSelect;

export type ContactConfirm = Prisma.ContactMessageGetPayload<{
  select: typeof contactConfirmSelect;
}>;

// ── Site Settings ──────────────────────────────────────────────────────────────

export const settingRowSelect = {
  key: true,
  value: true,
  description: true,
  updatedAt: true,
} satisfies Prisma.SiteSettingsSelect;

export type SettingRow = Prisma.SiteSettingsGetPayload<{
  select: typeof settingRowSelect;
}>;
```

### How Service Files Use It

```typescript
// server/bookings.ts — AFTER using types/db.ts
import { bookingRowSelect, bookingConfirmSelect } from "@/types/db";
import type { BookingRow, BookingConfirm } from "@/types/db";

export async function getAdminBookings(
  query: BookingListQuery
): Promise<{ bookings: BookingRow[]; total: number; page: number; totalPages: number }> {
  const skip = (query.page - 1) * query.limit;

  const [bookings, total] = await db.$transaction([
    db.booking.findMany({
      where: query.status ? { status: query.status } : undefined,
      orderBy: { createdAt: "desc" },
      select: bookingRowSelect,   // ← uses the shared select
      skip,
      take: query.limit,
    }),
    db.booking.count({
      where: query.status ? { status: query.status } : undefined,
    }),
  ]);

  return {
    bookings,                                     // type: BookingRow[]
    total,
    page: query.page,
    totalPages: Math.ceil(total / query.limit),
  };
}
```

### Where It Lives

```
types/db.ts    ← new file
```

### How to Verify

```typescript
// In any file, import a type and check TypeScript catches mismatches:
import type { BookingRow } from "@/types/db";

function renderBooking(booking: BookingRow) {
  // TypeScript knows exactly what fields exist
  // Try accessing booking.nonExistentField — TypeScript error immediately
  return booking.name; // ✅
}
```

### How to Debug

**`Prisma.BookingGetPayload` not found:** Run `npx prisma generate`. The Prisma client types must be generated before these types exist.

**Type mismatch after schema change:** Run `npx prisma generate` again. The generated types update automatically. Then check `types/db.ts` — if you removed a field from the schema, remove it from the select object. TypeScript will tell you everywhere it was used.

**`satisfies Prisma.BookingSelect` error:** A field in the select object does not exist in the Prisma model. Check the field name in `schema.prisma`.

### Sprint Branch

```bash
git checkout dev && git pull origin dev
git checkout -b feature/s0-typed-selects

git commit -m "feat: add types/db.ts — Prisma typed selects and payload types"
git commit -m "refactor: use typed selects in all server/ service functions"
git push -u origin feature/s0-typed-selects
```

---

## 5. Route-Level Loading, Error, Not-Found Files

### The Problem

Root-level `app/loading.tsx`, `app/error.tsx`, and `app/not-found.tsx` already exist. They handle the root fallback.

What does not exist: route-specific versions. Every page in `app/projects/`, `app/booking/`, `app/admin/(dashboard)/bookings/` etc. falls back to the root files, which show a generic grid skeleton that makes no sense in context.

The admin bookings page falling back to a six-card project grid skeleton during load is wrong. A broken project detail page showing an error boundary with no way to navigate back is poor UX. A requested booking ID that does not exist should show a contextual 404 — not the generic one.

### The Solution

Next.js resolves `loading.tsx`, `error.tsx`, and `not-found.tsx` from the closest ancestor. Add route-specific versions where the UX benefit is real. These are standard Next.js conventions — zero new libraries, zero new dependencies.

### The Code

#### `app/projects/loading.tsx`

```tsx
// app/projects/loading.tsx
//
// WHAT: Loading state for the /projects page while data fetches.
// WHY:  The projects page shows a grid. The loading state shows the same
//       grid structure with skeletons. No layout shift when data arrives.
// HOW:  Next.js renders this automatically while the page's async work resolves.

import { Skeleton } from "@/src/client/components/ui/skeleton";

export default function ProjectsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      {/* Page heading skeleton */}
      <div className="mb-10 space-y-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-9 w-64" />
      </div>

      {/* Category filter skeleton */}
      <div className="mb-8 flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>

      {/* Project grid skeleton — matches real grid layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-56 w-full rounded-sm" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### `app/projects/[id]/not-found.tsx`

```tsx
// app/projects/[id]/not-found.tsx
//
// WHAT: Shown when notFound() is called in the project detail page.
// WHY:  The root not-found has no navigation context. A visitor who lands
//       on a dead project URL needs a direct path back to the portfolio.
// HOW:  Call notFound() in the page when db.project.findUnique returns null.

import Link from "next/link";
import { Button } from "@/src/client/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ProjectNotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-[--color-primary] mb-4">
          Project not found
        </p>
        <h1 className="font-serif text-4xl font-black text-[--color-ink] mb-4">
          This project doesn't exist
        </h1>
        <p className="text-[--color-muted] mb-8 leading-relaxed">
          The project you are looking for may have been removed or the link
          may be incorrect.
        </p>
        <Button asChild>
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4" />
            View all projects
          </Link>
        </Button>
      </div>
    </div>
  );
}
```

How the page uses it:
```typescript
// app/projects/[id]/page.tsx
import { notFound } from "next/navigation";
import { getProjectById } from "@/server/projects";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id);

  // notFound() triggers app/projects/[id]/not-found.tsx automatically
  if (!project) notFound();

  return ( /* render project */ );
}
```

#### `app/admin/(dashboard)/error.tsx`

```tsx
// app/admin/(dashboard)/error.tsx
//
// WHAT: Catches any uncaught error in any admin dashboard page.
// WHY:  Without this, an admin page that throws shows a white screen
//       with no recovery path and no way back to the dashboard.
//       With this, the admin sees a recovery UI with navigation intact.
// HOW:  Must be "use client" — Next.js error boundaries are client components.
//       The reset() function rerenders the page segment — no full page reload.

"use client";

import * as React from "react";
import { Button } from "@/src/client/components/ui/button";
import { RefreshCw, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // In production this would send to Sentry
    console.error("[admin error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-red-600 mb-4">
          Admin error
        </p>
        <h2 className="font-serif text-3xl font-black text-[--color-ink] mb-4">
          Something went wrong
        </h2>
        <p className="text-[--color-muted] mb-2 leading-relaxed">
          An unexpected error occurred in this section.
        </p>
        {error.digest && (
          <p className="text-xs text-[--color-muted] mb-8 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

#### `app/admin/(dashboard)/bookings/loading.tsx`

```tsx
// app/admin/(dashboard)/bookings/loading.tsx
//
// WHAT: Loading state for the admin bookings page.
// WHY:  The bookings page is a table. The skeleton shows the table structure.
//       The root loading.tsx shows a project grid — completely wrong for this page.

import { Skeleton } from "@/src/client/components/ui/skeleton";

export default function AdminBookingsLoading() {
  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-8 w-24 rounded-sm" />
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 border-b border-[--color-rule] pb-0">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24" />
        ))}
      </div>

      {/* Table rows */}
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-sm border border-[--color-rule] bg-white p-4"
          >
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Complete File Map for This Improvement

```
app/projects/loading.tsx                         ← new
app/projects/[id]/not-found.tsx                  ← new
app/projects/[id]/loading.tsx                    ← new (single skeleton card)
app/contact/loading.tsx                          ← new (form skeleton)
app/booking/loading.tsx                          ← new (form skeleton)
app/testimonials/loading.tsx                     ← new (grid skeleton)
app/admin/(dashboard)/error.tsx                  ← new
app/admin/(dashboard)/loading.tsx                ← new (dashboard skeleton)
app/admin/(dashboard)/bookings/loading.tsx       ← new (table skeleton)
app/admin/(dashboard)/projects/loading.tsx       ← new (list skeleton)
app/admin/(dashboard)/messages/loading.tsx       ← new (inbox skeleton)
```

### How to Verify

```bash
npm run dev

# Throttle network in browser DevTools to "Slow 3G"
# Navigate to /projects
# Should see the grid skeleton — not the root page skeleton
# When data loads, skeleton replaced by real content with no layout shift

# For not-found:
# Navigate to /projects/nonexistent-id
# Should see "This project doesn't exist" with "View all projects" button
```

### How to Debug

**Loading state never shows:** The page is not async or the data loads fast enough that the skeleton is never visible. Use DevTools network throttling to confirm it exists.

**`error.tsx` not catching errors:** Confirm it has `"use client"` at the top. Server components cannot be error boundaries.

**`notFound()` not showing the route-level not-found:** Confirm the `not-found.tsx` file is in the correct directory — it must be a sibling of `page.tsx`, not in a parent directory.

### Sprint Branch

```bash
git checkout dev && git pull origin dev
git checkout -b feature/s1-route-conventions

git commit -m "feat: add route-level loading skeletons for public pages"
git commit -m "feat: add project not-found page"
git commit -m "feat: add admin error boundary with recovery UI"
git commit -m "feat: add admin section loading skeletons"
git push -u origin feature/s1-route-conventions
```

---

## 6. `$transaction` for Atomic Operations

### The Problem

`createBooking()` in `server/bookings.ts` does three separate writes in sequence:

```typescript
// Write 1: the booking
const booking = await db.booking.create({ data: bookingData });

// Write 2: the notification (what if this fails?)
await db.notification.create({ data: notificationData });

// Write 3: the audit log
await writeAuditLog({ ... });
```

If Write 2 fails after Write 1 succeeds: the booking exists, no notification was queued, the admin will never know about it. A lead is lost silently.

The booking and notification must either both succeed or both fail. If they fail together, the user sees an error and can try again. If only the booking succeeds, the failure is invisible.

### The Solution

Wrap the booking creation and notification insertion in `db.$transaction()`. Both writes succeed or both roll back. If the transaction fails the visitor sees an error and retries — the booking is not half-created.

The audit log stays **outside** the transaction intentionally. The audit log is fire-and-forget by design — it should not cause a booking to fail. A booking without an audit log is better than a failed booking.

### The Code

```typescript
// server/bookings.ts
//
// The createBooking function — updated to use $transaction

export async function createBooking(
  data: BookingInput,
  meta: { ipAddress: string; userAgent: string }
): Promise<BookingConfirm> {
  const leadScore = calculateLeadScore(data);

  // $transaction: booking + notification succeed together or fail together.
  // If Postgres is mid-write when it crashes, neither row is committed.
  // The visitor gets an error. They retry. No silent partial data.
  const [booking] = await db.$transaction([
    db.booking.create({
      data: {
        name:          data.name,
        email:         data.email,
        phone:         data.phone,
        service:       data.service,
        location:      data.location,
        description:   data.description,
        meetingDate:   data.meetingDate ? new Date(data.meetingDate) : null,
        budget:        data.budget ?? null,
        status:        BookingStatus.PENDING,
        leadScore,
        consentGiven:  true,
        consentGivenAt: new Date(),
        utmSource:     data.utmSource ?? null,
        utmMedium:     data.utmMedium ?? null,
        utmCampaign:   data.utmCampaign ?? null,
        utmTerm:       data.utmTerm ?? null,
        utmContent:    data.utmContent ?? null,
        referrerUrl:   data.referrerUrl ?? null,
        landingPage:   data.landingPage ?? null,
        ipAddress:     meta.ipAddress,
        userAgent:     meta.userAgent,
      },
      select: bookingConfirmSelect,
    }),

    db.notification.create({
      data: {
        type:      "BOOKING_NEW",
        channel:   "email",
        recipient: env.ADMIN_EMAIL,
        payload: {
          name:      data.name,
          email:     data.email,
          service:   data.service,
          leadScore,
        },
      },
    }),
  ]);

  // Audit log: outside the transaction — fire-and-forget.
  // A booking without an audit row is better than a failed booking.
  await writeAuditLog({
    action:     AuditAction.BOOKING_CREATE,
    entityType: "Booking",
    entityId:   booking.id,
    ipAddress:  meta.ipAddress,
    userAgent:  meta.userAgent,
    metadata:   { service: data.service, leadScore },
  });

  return booking;
}
```

```typescript
// server/contact.ts
//
// Same pattern for contact message creation

export async function createContactMessage(
  data: ContactMessageInput,
  meta: { ipAddress: string }
): Promise<ContactConfirm> {
  // Message + notification are atomic — both or neither
  const [message] = await db.$transaction([
    db.contactMessage.create({
      data: {
        name:    data.name,
        email:   data.email,
        phone:   data.phone ?? null,
        message: data.message,
      },
      select: contactConfirmSelect,
    }),

    db.notification.create({
      data: {
        type:      "CONTACT_NEW",
        channel:   "email",
        recipient: env.ADMIN_EMAIL,
        payload: {
          name:    data.name,
          email:   data.email,
          message: data.message.slice(0, 200), // preview only in payload
        },
      },
    }),
  ]);

  // Audit log: outside the transaction
  await writeAuditLog({
    action:     AuditAction.CONTACT_MESSAGE_CREATE,
    entityType: "ContactMessage",
    entityId:   message.id,
    ipAddress:  meta.ipAddress,
  });

  return message;
}
```

### When to Use `$transaction` and When Not To

| Operation | Use transaction? | Reason |
|---|---|---|
| Booking + notification | ✅ Yes | Both must exist or neither |
| Contact message + notification | ✅ Yes | Both must exist or neither |
| Settings update + audit log | ❌ No | Audit is fire-and-forget |
| Project create + audit log | ❌ No | Audit is fire-and-forget |
| Booking status update + audit | ❌ No | Audit is fire-and-forget |
| Admin bookings count + list | ✅ Yes | Reads should be consistent snapshot |

### How to Verify

```bash
# In development, temporarily make the notification.create fail
# by passing an invalid payload type, then submit a booking.
# Verify that NO booking row is created in the database.
# The transaction rolled back both writes.

# In the database:
# SELECT COUNT(*) FROM bookings;  ← should not have increased
# SELECT COUNT(*) FROM notifications;  ← should not have increased
```

### How to Debug

**Transaction times out:** Default Prisma transaction timeout is 5 seconds. `db.$transaction()` accepts a timeout option: `db.$transaction([...], { timeout: 10000 })`. Only increase this if the writes genuinely need more time.

**`db.$transaction` type error:** Each item in the array must be a Prisma operation (the return value of `db.model.create()` etc.), not an awaited result. Do not `await` inside the array — pass the operation directly.

**Booking fails but you expected a partial success:** This is the correct behaviour. The transaction rolled back. The visitor will see an error and can retry. Check the server logs for the underlying database error.

### Sprint Branch

This belongs in `feature/s0-service-layer`:

```bash
git commit -m "refactor: wrap booking and contact creation in db transaction for atomicity"
```

---

## 7. `<FormField>` Component

### The Problem

Every form in the system builds the same three-part structure manually:

```tsx
{/* This pattern is repeated in every field in every form */}
<div className="space-y-1.5">
  <Label htmlFor="email" required>
    Email address
  </Label>
  <Input
    id="email"
    type="email"
    {...register("email")}
  />
  {errors.email && (
    <p className="text-xs text-red-600">{errors.email.message}</p>
  )}
</div>
```

The booking form has nine fields. The contact form has four. The admin project form has six. That is nineteen copies of this pattern across three forms. When the error style changes, nineteen places change.

### The Solution

A single `<FormField>` component that owns the label-input-error structure. The input is passed as a child — the component stays generic and composable.

```tsx
<FormField label="Email address" error={errors.email?.message} required>
  <Input id="email" type="email" {...register("email")} />
</FormField>
```

One component. Consistent structure everywhere. One place to change.

### The Code

```tsx
// src/client/components/ui/form-field.tsx
//
// WHAT: Composable label + input + error wrapper for all form fields.
//
// WHY:  Every form needs a label above, an input in the middle, and an
//       error message below. This three-part structure must be consistent
//       across every form in the system — same spacing, same error style,
//       same required indicator. A shared component enforces that.
//
// HOW:  The input is passed as children, keeping the component agnostic
//       to which input type is used (Input, Textarea, Select, etc.).
//       The id prop is passed to Label's htmlFor — label and input are
//       always correctly associated for accessibility.
//
// USAGE:
//   <FormField label="Email address" error={errors.email?.message} required>
//     <Input id="email" type="email" {...register("email")} />
//   </FormField>
//
//   <FormField label="Message" error={errors.message?.message} required>
//     <Textarea id="message" {...register("message")} />
//   </FormField>

import * as React from "react";
import { Label } from "@/src/client/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  // The label text displayed above the input
  label: string;

  // The error message — shown in red below the input when truthy
  error?: string;

  // Marks the field as required — adds the red asterisk via Label
  required?: boolean;

  // Optional hint text shown below the label, above the input
  hint?: string;

  // className applied to the outer wrapper div
  className?: string;

  // The input element (Input, Textarea, Select, etc.)
  children: React.ReactElement<{ id?: string }>;
}

export function FormField({
  label,
  error,
  required,
  hint,
  className,
  children,
}: FormFieldProps) {
  // Derive the input id from children's id prop for htmlFor binding.
  // If no id is on the child, label and input are still rendered —
  // just without the accessibility association.
  const inputId = children.props.id;

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={inputId} required={required}>
        {label}
      </Label>

      {hint && (
        <p className="text-xs text-[--color-muted] -mt-0.5">{hint}</p>
      )}

      {children}

      {error && (
        <p className="text-xs text-red-600" role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}
```

### How the Booking Form Uses It

```tsx
// app/booking/page.tsx — AFTER

import { FormField } from "@/src/client/components/ui/form-field";
import { Input } from "@/src/client/components/ui/input";
import { Textarea } from "@/src/client/components/ui/textarea";

// Inside the form JSX:

<FormField label="Full name" error={errors.name?.message} required>
  <Input
    id="name"
    type="text"
    autoComplete="name"
    placeholder="Your full name"
    {...register("name")}
  />
</FormField>

<FormField label="Email address" error={errors.email?.message} required>
  <Input
    id="email"
    type="email"
    autoComplete="email"
    placeholder="your@email.com"
    {...register("email")}
  />
</FormField>

<FormField
  label="Project description"
  error={errors.description?.message}
  hint="Describe what you need — the more detail, the better we can prepare."
  required
>
  <Textarea
    id="description"
    rows={5}
    placeholder="Describe your project..."
    {...register("description")}
  />
</FormField>
```

### Where It Lives

```
src/client/components/ui/form-field.tsx    ← new file
```

### How to Verify

```tsx
// Render a field with an error and confirm:
<FormField label="Test" error="This field is required" required>
  <Input id="test" />
</FormField>

// Expect to see:
// — "Test" label with red asterisk
// — Input element
// — "This field is required" in red with role="alert"
```

### How to Debug

**Label not associated with input:** The `id` prop on the child element is missing. `FormField` derives `htmlFor` from `children.props.id`. Add `id="field-name"` to the input.

**Error message not showing:** The `error` prop is `undefined` not a string. Confirm `errors.fieldName?.message` evaluates to a string when there is a validation error. Add `console.log(errors)` inside the form to inspect the error object.

**Hint text appearing at wrong position:** The `hint` renders between the label and the input. This is intentional — hints explain what to enter before the user types. If you need a hint below the input, add a second `hint` variant or a `footer` prop.

### Sprint Branch

```bash
git checkout dev && git pull origin dev
git checkout -b feature/s1-form-field

git commit -m "feat: add FormField component — composable label + input + error wrapper"
git push -u origin feature/s1-form-field
```

---

## 8. Booking Status State Machine

### The Problem

The `updateBookingStatus()` service function accepts any `BookingStatus` value and writes it. A booking that is `COMPLETED` can be moved back to `PENDING`. A `REJECTED` booking can be moved to `CONFIRMED`. None of these transitions make business sense — but the system allows them silently.

The audit log records "status changed" but cannot record whether the change was valid. The admin sees status history that contradicts the actual sales process.

### The Solution

A 10-line function that defines valid transitions and rejects invalid ones before any database write. If the transition is invalid, `updateBookingStatus()` returns an error that the route handler surfaces to the admin as a clear message.

### The Code

```typescript
// server/booking-transitions.ts
//
// WHAT: Defines and enforces valid booking status transitions.
//
// WHY:  The booking status follows the actual Sunduza sales process:
//       PENDING → CONTACTED when the admin first reaches out
//       CONTACTED → CONFIRMED when the client commits
//       CONFIRMED → COMPLETED when the project is done
//       Any status → REJECTED when the lead is not viable
//
//       Without this, the admin can move any status to any other status.
//       COMPLETED → PENDING makes no sense. REJECTED → CONFIRMED makes no sense.
//       Invalid transitions produce corrupt audit trails and confuse reporting.
//
// HOW:  VALID_TRANSITIONS maps each current status to its allowed next statuses.
//       canTransition() checks if a transition is in the allowed set.
//       updateBookingStatus() calls canTransition() before the db.update() call.
//       If the transition is invalid, it returns null — the route handler returns 400.

import { BookingStatus } from "@prisma/client";

// The valid transitions — mirrors the actual sales pipeline
// Any path not listed here is rejected
const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING:    ["CONTACTED", "REJECTED"],
  CONTACTED:  ["CONFIRMED", "REJECTED"],
  CONFIRMED:  ["COMPLETED", "REJECTED"],
  COMPLETED:  [],             // terminal state — no transitions out
  REJECTED:   [],             // terminal state — no transitions out
};

// Returns true if moving from `current` to `next` is a valid transition
export function canTransition(
  current: BookingStatus,
  next: BookingStatus
): boolean {
  return VALID_TRANSITIONS[current].includes(next);
}

// Returns a human-readable description of valid next steps from a given status
// Used in API error messages and admin UI tooltips
export function validNextStatuses(current: BookingStatus): BookingStatus[] {
  return VALID_TRANSITIONS[current];
}
```

```typescript
// server/bookings.ts — updateBookingStatus — updated to use the state machine

import { canTransition, validNextStatuses } from "@/server/booking-transitions";

export async function updateBookingStatus(
  id: string,
  update: { status?: BookingStatus; adminNotes?: string },
  context: { userId: string; ipAddress: string }
): Promise<{ booking: BookingRow; error: null } | { booking: null; error: string }> {
  // Fetch current state before any update
  const current = await db.booking.findUnique({
    where: { id },
    select: { id: true, status: true },
  });

  if (!current) {
    return { booking: null, error: "Booking not found" };
  }

  // Validate the transition if a new status is requested
  if (update.status !== undefined && update.status !== current.status) {
    if (!canTransition(current.status, update.status)) {
      const allowed = validNextStatuses(current.status);
      return {
        booking: null,
        error:
          allowed.length === 0
            ? `Booking is ${current.status.toLowerCase()} — no further status changes are allowed.`
            : `Cannot move from ${current.status} to ${update.status}. Allowed: ${allowed.join(", ")}.`,
      };
    }
  }

  // Transition is valid — proceed with the update
  const updated = await db.booking.update({
    where: { id },
    data: {
      ...(update.status !== undefined && { status: update.status }),
      ...(update.adminNotes !== undefined && { adminNotes: update.adminNotes }),
    },
    select: bookingRowSelect,
  });

  await writeAuditLog({
    action:     AuditAction.BOOKING_STATUS_UPDATE,
    entityType: "Booking",
    entityId:   id,
    userId:     context.userId,
    ipAddress:  context.ipAddress,
    metadata:   {
      previousStatus: current.status,
      newStatus:      update.status,
    },
  });

  return { booking: updated, error: null };
}
```

The route handler now handles the typed result:

```typescript
// app/api/admin/bookings/[id]/route.ts — PATCH handler

export const PATCH = withAuth(async (req, session, context) => {
  const { id } = await context!.params;
  const body = await req.json();
  const parsed = BookingUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      apiError(
        parsed.error.issues.map((e) => e.message).join(", "),
        ErrorCode.VALIDATION_ERROR,
        400
      ),
      { status: 400 }
    );
  }

  const result = await updateBookingStatus(
    id,
    { status: parsed.data.status, adminNotes: parsed.data.adminNotes },
    { userId: session.user.id, ipAddress: "unknown" }
  );

  // Invalid transition — tell the admin exactly why
  if (result.error) {
    return NextResponse.json(
      apiError(result.error, ErrorCode.BAD_REQUEST, 400),
      { status: 400 }
    );
  }

  return NextResponse.json(apiSuccess(result.booking));
});
```

### How the Admin UI Uses It

The status dropdown on the bookings page should only show valid next statuses:

```tsx
// In the admin booking row — status dropdown
import { validNextStatuses } from "@/server/booking-transitions"; // server import
// Or expose the allowed transitions via the API response and keep it client-side

// The API can include valid_next_statuses in the booking response:
// { id, status, ..., validNextStatuses: ["CONTACTED", "REJECTED"] }
// The dropdown renders only those options
```

### Where It Lives

```
server/booking-transitions.ts    ← new file
```

### How to Verify

```bash
# Create a booking (status: PENDING)
# PATCH /api/admin/bookings/[id] with status: COMPLETED
# Should return 400: "Cannot move from PENDING to COMPLETED. Allowed: CONTACTED, REJECTED."

# PATCH with status: CONTACTED
# Should return 200 — valid transition

# PATCH with status: COMPLETED (now CONTACTED)
# Should return 400 — must go through CONFIRMED first
```

### How to Debug

**Admin cannot move a booking to a status they expect to be valid:** Check `VALID_TRANSITIONS` in `server/booking-transitions.ts`. If the business process changes — for example, if the owner wants to allow CONFIRMED → PENDING for rescheduling — update that file. One file. The entire system follows.

**`validNextStatuses` returns empty array:** The booking is in a terminal state (`COMPLETED` or `REJECTED`). The API error message handles this: "no further status changes are allowed." The admin UI status dropdown should hide itself or show a disabled state when the array is empty.

### Sprint Branch

```bash
git checkout dev && git pull origin dev
git checkout -b feature/s0-status-machine

git commit -m "feat: add server/booking-transitions.ts — booking status state machine"
git commit -m "refactor: apply state machine validation in updateBookingStatus"
git push -u origin feature/s0-status-machine
```

---

## Implementation Order

These eight improvements do not all belong in the same sprint. Here is where each one fits:

### Sprint 0 — Infrastructure & Backend Correctness

These must exist before any frontend page is built. They affect every layer.

| # | Improvement | Branch |
|---|---|---|
| 1 | `lib/env.ts` — typed env validation | `feature/s0-env-validation` |
| 2 | `server-only` boundaries | same branch as env validation |
| 3 | `withAuth()` route wrapper | `feature/s0-with-auth` |
| 4 | Prisma typed selects — `types/db.ts` | `feature/s0-typed-selects` |
| 6 | `$transaction` for atomic operations | `feature/s0-service-layer` |
| 8 | Booking status state machine | `feature/s0-status-machine` |

### Sprint 1 — Public Site Frontend

| # | Improvement | Branch |
|---|---|---|
| 5 | Route-level loading/error/not-found (public pages) | `feature/s1-route-conventions` |
| 7 | `<FormField>` component | `feature/s1-form-field` |

### Sprint 2 — Admin Dashboard Frontend

| # | Improvement | Branch |
|---|---|---|
| 5 | Admin route-level error and loading files | `feature/s2-admin-conventions` |

---

## What This Does Not Include — And Why

These are things a developer might suggest adding. None of them are in this document because none of them serve this system at its current scale.

**Redis caching beyond rate limiting** — The database is PostgreSQL on a managed host. Queries with proper indexes return in under 10ms. Caching adds invalidation complexity. The problem it solves does not exist here yet.

**A job queue (BullMQ, Inngest, etc.)** — The outbox pattern covers this system's notification needs. A job queue is the right solution when you have multiple worker types, retry strategies, and priority queues. One email type does not justify that infrastructure.

**Monorepo** — One application, one team (one person), one deployment. Monorepos solve coordination problems between teams and packages. That problem does not exist here.

**GraphQL** — REST with a consistent response contract covers everything this system needs. GraphQL solves data over-fetching and client-driven queries. The admin dashboard has fixed data requirements. This does not apply.

**Complex state management** — Zustand is already in the project and correctly used for UI state. React Query handles server state. Adding Redux, Jotai, or XState for state that is already managed is addition without justification.

**Feature flags** — One admin, one environment, one deployment. Feature flags exist for gradual rollouts across multiple user segments. The concept does not apply.

**Containerisation (Docker)** — Vercel and Railway handle the deployment environment. Docker adds a layer of complexity with no benefit for a Vercel-deployed Next.js application.

---

## Summary — What Changes and Where

| File | Status | Sprint |
|---|---|---|
| `lib/env.ts` | Create | Sprint 0 |
| `lib/with-auth.ts` | Create | Sprint 0 |
| `lib/db.ts` | Add `server-only` | Sprint 0 |
| `lib/auth.ts` | Add `server-only` | Sprint 0 |
| `lib/rate-limit.ts` | Add `server-only` | Sprint 0 |
| `lib/request.ts` | Add `server-only` | Sprint 0 |
| `lib/api-client.ts` | No change | — |
| `lib/api-response.ts` | No change | — |
| `types/db.ts` | Create | Sprint 0 |
| `server/audit.ts` | Add `server-only` | Sprint 0 |
| `server/bookings.ts` | Add `server-only` + `$transaction` + state machine | Sprint 0 |
| `server/contact.ts` | Add `server-only` + `$transaction` | Sprint 0 |
| `server/projects.ts` | Add `server-only` | Sprint 0 |
| `server/testimonials.ts` | Add `server-only` | Sprint 0 |
| `server/settings.ts` | Add `server-only` | Sprint 0 |
| `server/lead-score.ts` | Add `server-only` | Sprint 0 |
| `server/booking-transitions.ts` | Create | Sprint 0 |
| `app/api/admin/*/route.ts` | Apply `withAuth()` | Sprint 0 |
| `app/api/bookings/[id]/route.ts` | Apply `withAuth()` | Sprint 0 |
| `app/projects/loading.tsx` | Create | Sprint 1 |
| `app/projects/[id]/not-found.tsx` | Create | Sprint 1 |
| `app/contact/loading.tsx` | Create | Sprint 1 |
| `app/booking/loading.tsx` | Create | Sprint 1 |
| `app/testimonials/loading.tsx` | Create | Sprint 1 |
| `src/client/components/ui/form-field.tsx` | Create | Sprint 1 |
| `app/admin/(dashboard)/error.tsx` | Create | Sprint 2 |
| `app/admin/(dashboard)/bookings/loading.tsx` | Create | Sprint 2 |
| `app/admin/(dashboard)/projects/loading.tsx` | Create | Sprint 2 |
| `app/admin/(dashboard)/messages/loading.tsx` | Create | Sprint 2 |

---

*This document is written against the exact codebase state of `sunduza-architectural-main`, May 2026.*  
*Every code example uses the actual imports, types, and conventions present in this project.*  
*Update this document when the system changes.*
