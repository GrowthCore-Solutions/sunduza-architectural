# SUNDUZA ARCHITECTURAL & PROJECTS
## Complete System Design Document
### Version 2.0 — Production Grade · Industry Scalable · Security First

---

> "Build for today. Design for tomorrow. Extend without rewriting."

---

## TABLE OF CONTENTS

1. [System Identity & Purpose](#1-system-identity--purpose)
2. [Client Business Rules](#2-client-business-rules)
3. [Threat Model & Security Architecture](#3-threat-model--security-architecture)
4. [Complete System Architecture](#4-complete-system-architecture)
5. [Technology Stack](#5-technology-stack)
6. [Complete File Structure](#6-complete-file-structure)
7. [Database Design & ERD](#7-database-design--erd)
8. [Prisma Schema](#8-prisma-schema)
9. [Repository & Use Case Layer](#9-repository--use-case-layer)
10. [API Contracts](#10-api-contracts)
11. [User Flows](#11-user-flows)
12. [Business Logic & Validation Rules](#12-business-logic--validation-rules)
13. [Status Lifecycles](#13-status-lifecycles)
14. [Error Handling Architecture](#14-error-handling-architecture)
15. [Observability & Monitoring](#15-observability--monitoring)
16. [Performance Architecture](#16-performance-architecture)
17. [Marketing Integration Layer](#17-marketing-integration-layer)
18. [Legal & Compliance (POPIA)](#18-legal--compliance-popia)
19. [Transaction Management](#19-transaction-management)
20. [Testing Strategy](#20-testing-strategy)
21. [Deployment Architecture](#21-deployment-architecture)
22. [Environment Configuration](#22-environment-configuration)
23. [The Solo Developer's Laws](#23-the-solo-developers-laws)
24. [Build Order & Sprints](#24-build-order--sprints)
25. [Success Criteria](#25-success-criteria)
26. [Design Decisions Log](#26-design-decisions-log)
27. [Future Extension Points](#27-future-extension-points)

---

## 1. SYSTEM IDENTITY & PURPOSE

### 1.1 What This System Is

| Property | Value |
|---|---|
| System Name | Sunduza Architectural & Projects Platform |
| Client | Xivutiso Kevin Sunduza — 5+ years architectural experience |
| System Type | Lead Generation + Portfolio Management + Admin Operations |
| Primary Goal | Convert anonymous visitors into qualified consultation bookings |
| Secondary Goal | Showcase portfolio to build credibility and professional authority |
| Legal Jurisdiction | South Africa — POPIA compliant |
| Target Users | Visitors (public, no login) + Admin (solo owner) |

### 1.2 What This System Does

| Capability | Description |
|---|---|
| Showcase services | Display 4 architectural services with clear, compelling CTAs |
| Display portfolio | Grid of past projects with images, titles, descriptions, categories |
| Capture leads | Booking form — 8 fields with service-contextual prompts |
| Contact capture | General inquiry form with admin read/unread management |
| WhatsApp integration | Floating button opens pre-filled WhatsApp chat |
| Admin operations | View bookings, update status, manage projects, read messages |
| Marketing attribution | Capture UTM parameters, referrer, landing page on every booking |
| Lead intelligence | Automatic lead scoring for priority surfacing |
| Site configuration | Runtime-editable settings without code deployment |
| Legal compliance | POPIA consent capture, privacy policy, data retention |

### 1.3 What This System Does NOT Do (v1)

| Exclusion | Reason | Target Version |
|---|---|---|
| User accounts for visitors | Not needed — booking is anonymous | v2 |
| Online payments | Not requested | v3 |
| Automated email notifications | Requires external service setup | v2 |
| File uploads for project images | Requires storage service | v2 |
| Blog / News section | Not requested | v2 |
| Multi-admin support | Only one admin exists | v2 |
| Analytics dashboard (built-in) | Marketing uses GA4 + GTM external | v2 |
| WhatsApp API automation | Manual in v1, automated in v2 | v2 |
| Client portal | Not requested | v3 |
| Online payments | Not requested | v3 |

### 1.4 Brand Personality Targets

| Trait | How the System Delivers It |
|---|---|
| Trust | No broken elements, professional design, social proof, clear contact info, POPIA compliance |
| Luxury | Clean design, ample whitespace, high-quality imagery, gold accent color |
| Innovation | Modern layout, smooth interactions, unique service-specific booking prompts |
| Simplicity | Easy navigation, clear CTAs, minimal cognitive load |
| Authority | Portfolio of real work, 5+ years highlighted, professional copy |
| Friendliness | WhatsApp access on every page, clear help paths, human language |
| Premium | Consistent spacing, polished interactions, no broken states |

---

## 2. CLIENT BUSINESS RULES

### 2.1 Core Rules (From Client Intake)

| Rule ID | Business Rule | Source |
|---|---|---|
| BR-001 | Visitors can book without logging in | "Main action on homepage → Book a Service" |
| BR-002 | Website must generate qualified leads | "Generate Leads" is #1 goal |
| BR-003 | Website must look professional and credible | "Some didn't take me serious because I'm not famous" |
| BR-004 | Past project images must be shown | "They already have pictures of past projects" |
| BR-005 | WhatsApp is primary contact channel | Selected WhatsApp in intake form |
| BR-006 | SEO and Google Ads required | Selected SEO, Google Ads, Social Ads |
| BR-007 | Brand must feel premium and trustworthy | Selected Trust, Luxury, Premium, Authority |
| BR-008 | Four specific services must be displayed | House Planning, Architectural Drawings, Drafting Services, Development Project Planning |
| BR-009 | POPIA consent must be captured at booking | Legal requirement — South African business |
| BR-010 | Admin must be able to manage everything without a developer | Admin UI must cover all operational needs |

### 2.2 Services Offered

| Service Key | Display Name | Description |
|---|---|---|
| `house_planning` | House Planning | Thoughtful layouts designed for comfort, functionality, and modern living |
| `arch_drawings` | Architectural Drawings | Professional architectural drawings for confident planning and building |
| `drafting_services` | Drafting Services | Accurate drafting to match your project requirements and documentation needs |
| `dev_project_planning` | Development Project Planning | Planning support for development projects with clarity, structure, and direction |

### 2.3 Service-Specific Booking Prompts

When a visitor selects a service in the booking form, the description field placeholder changes dynamically:

| Service | Description Prompt |
|---|---|
| House Planning | "Describe your plot size, number of rooms, preferred style (modern, traditional, contemporary), and any special requirements." |
| Architectural Drawings | "Describe the type of drawings needed, stage of your project, and whether you have existing plans." |
| Drafting Services | "Describe the scope of drafting work required and the type of project (residential, commercial, mixed-use)." |
| Development Project Planning | "Describe the development type, total site size, number of units, and current planning stage." |

This is a JavaScript `onChange` on the service dropdown. Zero backend changes. Makes every lead significantly more actionable.

---

## 3. THREAT MODEL & SECURITY ARCHITECTURE

### 3.1 Threat Model

Security is not a checklist. It is a threat model — who attacks, how, and what we do about it.

| Actor | Attack Vector | Mitigation |
|---|---|---|
| Script kiddie | SQL injection via form fields | Prisma ORM parameterizes all queries |
| Bot | Mass booking form spam | Rate limiting + CAPTCHA-ready honeypot field |
| Bot | Brute force admin login | Account lockout after 10 attempts + rate limit |
| Attacker | Session hijacking | HTTP-only cookies, session rotation on login |
| Attacker | XSS via form inputs | CSP headers + React's built-in escaping |
| Attacker | Clickjacking | X-Frame-Options: DENY |
| Attacker | MIME sniffing | X-Content-Type-Options: nosniff |
| Attacker | Mass assignment | Explicit field whitelisting in every API route |
| Attacker | Credential stuffing | bcrypt cost 12 + account lockout by email |
| Insider / Future dev | Secret in client bundle | Pre-commit hook scanning for NEXT_PUBLIC_ misuse |
| Anyone | CORS abuse | Explicit CORS policy per endpoint type |
| Anyone | Sensitive data exposure | IP hashed, no PII in logs or URLs |

### 3.2 HTTP Security Headers

Defined in `next.config.js` — applies to every response:

```javascript
// next.config.js
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control',        value: 'on' },
  { key: 'Strict-Transport-Security',     value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options',               value: 'DENY' },
  { key: 'X-Content-Type-Options',        value: 'nosniff' },
  { key: 'Referrer-Policy',               value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',            value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https://www.google-analytics.com",
      "frame-ancestors 'none'",
    ].join('; ')
  },
]
```

### 3.3 Authentication Architecture

| Property | Value |
|---|---|
| Method | NextAuth.js v5 with PostgreSQL database sessions |
| Session storage | HTTP-only cookie — not accessible by JavaScript |
| Session lifetime | 30 days sliding window |
| Session rotation | New session token issued on every login |
| Session invalidation | All sessions killed on password change |
| Password hashing | bcrypt, cost factor 12 |
| Rate limiting | 10 attempts per IP per 15 minutes |
| Account lockout | After 10 failed attempts by email — locked for 30 minutes |
| Login anomaly logging | Every attempt (success + failure) written to AuditLog |

### 3.4 Dual-Layer Admin Route Protection

In Next.js App Router, middleware can be bypassed in edge cases. Protection must exist in two places:

```
Layer 1 — Edge Middleware:     Fast redirect for unauthenticated requests to /admin/*
Layer 2 — Server Component:    Re-verify session inside every admin Server Component
```

Both layers are required. Neither alone is sufficient.

```typescript
// Layer 1: src/middleware.ts
// Intercepts /admin/* and /api/v1/* (except public endpoints)
// Returns 401/redirect if no valid session

// Layer 2: src/app/(admin)/admin/dashboard/page.tsx
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await getServerSession()
  if (!session) redirect('/admin/login') // Re-check even after middleware
  // ...
}
```

### 3.5 Mass Assignment Protection

Every public API endpoint explicitly whitelists the fields it accepts. Admin-only fields are never accepted from public endpoints, even if they pass Zod validation of their type.

```typescript
// Public booking creation — strips all admin fields
const publicBookingSchema = z.object({
  name:         z.string().min(2).max(100),
  email:        z.string().email(),
  phone:        z.string().regex(SA_PHONE_REGEX),
  service:      z.enum(['house_planning', 'arch_drawings', 'drafting_services', 'dev_project_planning']),
  location:     z.string().min(2).max(200),
  description:  z.string().min(20).max(2000),
  meeting_date: z.string().datetime().optional(),
  budget:       z.string().max(50).optional(),
  consent_given: z.literal(true), // Must be exactly true
  // status, deleted_at, lead_score — NEVER accepted from public
})
```

### 3.6 CORS Policy

| Endpoint Type | CORS Policy |
|---|---|
| Public API (`POST /api/v1/bookings`, `POST /api/v1/contact`) | Same-origin only in production |
| Admin API (`/api/v1/bookings GET/PATCH/DELETE`, etc.) | Same-origin only, always |
| Health check (`/api/health`) | Open — no sensitive data |

### 3.7 Server-Only Enforcement

Every server module begins with this import to crash the build if accidentally imported by client code:

```typescript
// src/server/db/prisma.ts — first line
import 'server-only'

// src/server/repositories/*.ts — first line
import 'server-only'

// src/server/use-cases/**/*.ts — first line
import 'server-only'
```

This prevents database connections, secrets, and business logic from ever reaching the browser bundle.

### 3.8 IP Address Privacy

IP addresses are stored as SHA-256 hashes with a server-side salt. Raw IPs are never written to the database.

```typescript
// src/server/utils/privacy.ts
import { createHash } from 'crypto'

export function hashIpAddress(ip: string): string {
  const salt = process.env.IP_HASH_SALT // Required env variable
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex')
}
```

### 3.9 Pre-commit Secret Scanning

Husky + a custom script prevents `NEXT_PUBLIC_` prefix on sensitive variables:

```bash
# .husky/pre-commit
#!/bin/sh
node scripts/check-secrets.js
```

```javascript
// scripts/check-secrets.js
const forbidden = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'ADMIN_PASSWORD', 'IP_HASH_SALT']
// Scans all .env* files and all source files for NEXT_PUBLIC_ + forbidden pattern
// Exits with code 1 if found — blocks the commit
```

---

## 4. COMPLETE SYSTEM ARCHITECTURE

### 4.1 The Five Layers

```
┌──────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL SERVICES                             │
│                                                                      │
│  GitHub · Vercel · Neon (PostgreSQL) · Google Analytics 4           │
│  Google Tag Manager · Sentry · UptimeRobot · Resend (v2)            │
└──────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────┐
│              LAYER 1 — PRESENTATION (React + Next.js)                │
│                                                                      │
│  Responsibility: Render UI · Manage user interaction · SEO          │
│  Rule: NEVER contains business logic                                 │
│  Rule: ALL API calls go through src/client/services/ only           │
│  Rule: NEVER imports from src/server/                               │
│                                                                      │
│  Tech: React 18 · Next.js 14 App Router · Tailwind CSS · shadcn/ui  │
└──────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────┐
│              LAYER 2 — APPLICATION (Next.js API Routes)              │
│                                                                      │
│  Responsibility: Parse requests · Validate input · Authorize         │
│  Orchestrate use cases · Format responses                            │
│  Rule: API routes are THIN — they coordinate, not implement          │
│  Rule: All business logic lives in use cases                         │
│                                                                      │
│  Tech: Next.js Route Handlers · Zod · NextAuth.js                   │
└──────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────┐
│              LAYER 3 — DOMAIN (Use Cases + Repositories)             │
│                                                                      │
│  USE CASES: Enforce business rules · Orchestrate workflows           │
│  One file per action (create-booking.ts, update-booking-status.ts)  │
│                                                                      │
│  REPOSITORIES: All database queries for one domain in one file      │
│  Never called directly by API routes — only by use cases            │
│                                                                      │
│  Tech: TypeScript · Custom error classes · Audit logger             │
└──────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────┐
│              LAYER 4 — DATA ACCESS (Prisma ORM)                      │
│                                                                      │
│  Responsibility: Translate intent into SQL                           │
│  Handle all persistence operations                                   │
│  Rule: ORM for 99% of queries · Raw SQL only for admin reports (v2) │
│                                                                      │
│  Tech: Prisma 5 · PostgreSQL driver · Connection pooling            │
└──────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────┐
│              LAYER 5 — DATABASE (PostgreSQL on Neon)                 │
│                                                                      │
│  Responsibility: Store all data · Enforce structural integrity       │
│  Guarantee ACID on every write · The final enforcer                 │
│  Rule: Constraints cannot be bypassed by any layer above            │
│                                                                      │
│  Tech: PostgreSQL 15 · UNIQUE · FK · CHECK · Composite indexes      │
└──────────────────────────────────────────────────────────────────────┘
```

### 4.2 Request Lifecycle (Public Booking)

```
Visitor submits booking form
        │
        ▼
client/services/booking-service.ts
  → POST /api/v1/bookings
        │
        ▼
src/middleware.ts (Edge)
  → Attach X-Request-ID
  → Apply rate limiting
  → (No auth required — public endpoint)
        │
        ▼
src/app/api/v1/bookings/route.ts
  → Parse JSON body
  → Zod validation (publicBookingSchema)
  → If invalid → return 400 with field errors
        │
        ▼
server/use-cases/bookings/create-booking.ts
  → Extract UTM from request headers
  → Hash IP address
  → Calculate lead score
  → Check honeypot field
        │
        ▼
server/repositories/booking.repository.ts
  → prisma.booking.create(data)
        │
        ▼
server/audit/audit-logger.ts
  → prisma.auditLog.create({ action: 'BOOKING_CREATE', ... })
        │
        ▼
server/notifications/notification-queue.ts
  → prisma.notification.create({ channel: 'whatsapp', sent_at: null })
        │
        ▼
API route returns ApiResponse<Booking>
        │
        ▼
client/services/booking-service.ts resolves
        │
        ▼
React component shows success state
```

### 4.3 The Adapter Principle

Each layer communicates only with the layer directly below it. This is not optional.

| Layer | Calls | Never Calls |
|---|---|---|
| React components | `client/services/*.ts` | API directly, Prisma, repositories |
| Service functions | `/api/v1/*` endpoints | Prisma, repositories, use cases |
| API routes | Use cases only | Prisma directly, repositories directly |
| Use cases | Repositories + audit logger | API routes, React, HTTP |
| Repositories | Prisma client | API routes, use cases (except own) |

---

## 5. TECHNOLOGY STACK

### 5.1 Complete Stack — Locked

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Frontend Framework | Next.js App Router | 14.x | SSR/ISR/SSG, routing, API routes, SEO |
| Language | TypeScript | 5.x | Strict mode — type safety across all layers |
| Styling | Tailwind CSS | 3.x | Utility-first, responsive, no CSS files |
| UI Components | shadcn/ui | Latest | Accessible primitives — owned code |
| Forms | React Hook Form | 7.x | Form state, performance, ref-based |
| Validation | Zod | 3.x | Schema validation — shared FE + BE |
| Server State | TanStack Query | 5.x | Caching, background updates, deduplication |
| Client State | Zustand | 4.x | UI state only (theme, sidebar toggle) |
| Icons | Lucide React | Latest | Consistent icons — no emojis in UI |
| HTTP Client | Native Fetch | — | Isomorphic, no extra dependency |
| Auth | NextAuth.js | 5.x | Session management, HTTP-only cookies |
| ORM | Prisma | 5.x | Type-safe queries, migrations |
| Database | PostgreSQL (Neon) | 15+ | ACID, relational integrity |
| Error Tracking | Sentry | 8.x | Production errors — **v1, not v2** |
| Deployment | Vercel | — | Hosting, CI/CD, preview deploys |
| Analytics | Google Analytics 4 | — | Traffic, behavior, conversions |
| Tag Manager | Google Tag Manager | — | Conversion tracking pixels |
| Uptime Monitoring | UptimeRobot | — | Free tier, 5-min checks |
| Testing (Unit) | Jest + RTL | 29.x | Component tests, hook tests |
| Testing (E2E) | Playwright | 1.40+ | Critical path automation |
| Testing (Visual) | Playwright | 1.40+ | 320/375/390px regression |
| Server-only Guard | server-only | Latest | Prevent server code in client bundle |
| Bundle Analysis | @next/bundle-analyzer | Latest | Pre-launch bundle audit |
| Pre-commit Hooks | Husky + lint-staged | Latest | Quality gate before every commit |

### 5.2 Why Each Choice (Solo Developer Rationale)

| Decision | Why |
|---|---|
| Next.js | One codebase for frontend + API. One deployment. SEO built-in. |
| TypeScript strict | Catches layer-crossing mistakes at build time, not in production. |
| Prisma | Type-safe queries. Migrations are automatic. Schema is documentation. |
| Vercel | Deploy from GitHub push. Preview every PR. Free tier. Zero DevOps. |
| TanStack Query | Manages caching and re-fetching. Eliminates `useEffect` fetch patterns. |
| shadcn/ui | You own the code. No version conflicts. Tailwind-native. |
| Sentry in v1 | Free for small projects. Catches real errors before the client calls you. |
| server-only | Crashes the build on import mistakes. Cheaper than a security incident. |

---

## 6. COMPLETE FILE STRUCTURE

```
sunduza/
│
├── .github/
│   └── workflows/
│       ├── ci.yml                        # Tests on every PR
│       └── deploy.yml                    # Deploy to Vercel on main merge
│
├── .husky/
│   ├── pre-commit                        # Run lint-staged + secret scanner
│   └── commit-msg                        # Enforce conventional commits
│
├── config/                               # App-level config (outside src — different lifecycle)
│   ├── theme.json                        # Colors, fonts, hero images, brand assets
│   ├── navigation.json                   # Nav links, footer links
│   ├── services.json                     # Service definitions + booking prompts
│   └── features.json                     # Feature flags (build-time)
│
├── prisma/
│   ├── schema.prisma                     # Single source of truth for DB schema
│   ├── seed.ts                           # Seed admin user + initial projects + testimonials
│   └── migrations/                       # Auto-generated migration files
│
├── public/
│   ├── images/
│   │   ├── hero-desktop.webp             # Optimized hero — desktop
│   │   ├── hero-mobile.webp              # Optimized hero — mobile
│   │   ├── og-image.jpg                  # Open Graph image for social sharing
│   │   └── projects/                     # v1: static project images
│   └── favicon.ico
│
├── scripts/
│   ├── check-secrets.js                  # Pre-commit: scan for leaked secrets
│   └── generate-request-id.ts            # Utility for X-Request-ID
│
├── src/
│   │
│   ├── app/                              # Next.js App Router — ROUTING ONLY
│   │   │                                 # No business logic. No direct DB calls.
│   │   ├── (public)/                     # Public route group
│   │   │   ├── layout.tsx                # PublicLayout: navbar + footer + WhatsApp button
│   │   │   ├── page.tsx                  # Homepage
│   │   │   ├── services/
│   │   │   │   └── page.tsx              # Services page
│   │   │   ├── projects/
│   │   │   │   └── page.tsx              # Projects grid (ISR)
│   │   │   ├── booking/
│   │   │   │   └── page.tsx              # Booking form page
│   │   │   ├── contact/
│   │   │   │   └── page.tsx              # Contact page
│   │   │   └── privacy/
│   │   │       └── page.tsx              # Privacy policy — POPIA required
│   │   │
│   │   ├── (admin)/                      # Admin route group — protected
│   │   │   ├── layout.tsx                # AdminLayout: sidebar + header + session guard
│   │   │   └── admin/
│   │   │       ├── login/
│   │   │       │   └── page.tsx          # Admin login
│   │   │       ├── dashboard/
│   │   │       │   └── page.tsx          # Dashboard: counts + recent activity
│   │   │       ├── bookings/
│   │   │       │   └── page.tsx          # Bookings table + status management
│   │   │       ├── projects/
│   │   │       │   └── page.tsx          # Projects CRUD
│   │   │       ├── messages/
│   │   │       │   └── page.tsx          # Contact messages + read/unread
│   │   │       └── settings/
│   │   │           └── page.tsx          # Site settings (WhatsApp number, email, etc.)
│   │   │
│   │   └── api/
│   │       └── v1/                       # API routes — thin coordinators only
│   │           ├── auth/
│   │           │   └── [...nextauth]/
│   │           │       └── route.ts      # NextAuth handler
│   │           ├── bookings/
│   │           │   ├── route.ts          # GET (admin), POST (public)
│   │           │   └── [id]/
│   │           │       └── route.ts      # PATCH (admin), DELETE (admin)
│   │           ├── projects/
│   │           │   ├── route.ts          # GET (public), POST (admin)
│   │           │   └── [id]/
│   │           │       └── route.ts      # PATCH (admin), DELETE (admin)
│   │           ├── contact/
│   │           │   ├── route.ts          # GET (admin), POST (public)
│   │           │   └── [id]/
│   │           │       └── route.ts      # PATCH read status (admin)
│   │           ├── settings/
│   │           │   └── route.ts          # GET (public safe keys), PATCH (admin)
│   │           └── health/
│   │               └── route.ts          # GET — health check, no auth required
│   │
│   ├── client/                           # FRONTEND ONLY — never imported by server
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                       # shadcn/ui primitives (copy-pasted, owned)
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── textarea.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── table.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── skeleton.tsx
│   │   │   │   ├── toast.tsx
│   │   │   │   └── tooltip.tsx
│   │   │   │
│   │   │   ├── layout/
│   │   │   │   ├── navbar.tsx            # Responsive navbar with mobile menu
│   │   │   │   ├── footer.tsx            # Footer with links + social
│   │   │   │   ├── whatsapp-button.tsx   # Floating WhatsApp CTA
│   │   │   │   └── admin-sidebar.tsx     # Admin navigation sidebar
│   │   │   │
│   │   │   ├── home/
│   │   │   │   ├── hero.tsx              # Hero section with primary CTA
│   │   │   │   ├── services-preview.tsx  # 4 service cards
│   │   │   │   ├── portfolio-preview.tsx # 3-project preview grid
│   │   │   │   ├── testimonials.tsx      # Client testimonials carousel
│   │   │   │   ├── stats-bar.tsx         # "5+ years, X projects" social proof
│   │   │   │   └── cta-section.tsx       # Bottom conversion section
│   │   │   │
│   │   │   ├── booking/
│   │   │   │   ├── booking-form.tsx      # Full booking form with service-contextual prompts
│   │   │   │   └── booking-success.tsx   # Post-submission success state
│   │   │   │
│   │   │   ├── contact/
│   │   │   │   ├── contact-form.tsx      # Contact inquiry form
│   │   │   │   └── contact-info.tsx      # Phone, email, location display
│   │   │   │
│   │   │   ├── projects/
│   │   │   │   ├── project-card.tsx      # Individual project card
│   │   │   │   ├── project-grid.tsx      # Responsive grid layout
│   │   │   │   └── project-filter.tsx    # Category filter tabs
│   │   │   │
│   │   │   ├── admin/
│   │   │   │   ├── bookings-table.tsx    # Bookings with filters + pagination
│   │   │   │   ├── booking-detail.tsx    # Full booking modal with status update
│   │   │   │   ├── projects-manager.tsx  # Project CRUD table
│   │   │   │   ├── project-form.tsx      # Add/edit project modal form
│   │   │   │   ├── messages-table.tsx    # Contact messages with read tracking
│   │   │   │   ├── dashboard-stats.tsx   # KPI cards (today's bookings, unread, etc.)
│   │   │   │   ├── conversion-funnel.tsx # PENDING→CONTACTED→CONFIRMED→COMPLETED counts
│   │   │   │   └── settings-form.tsx     # Site settings editor
│   │   │   │
│   │   │   └── seo/
│   │   │       ├── metadata.tsx          # Dynamic metadata per page
│   │   │       └── structured-data.tsx   # JSON-LD for local business schema
│   │   │
│   │   ├── hooks/
│   │   │   ├── use-bookings.ts           # TanStack Query hook for bookings
│   │   │   ├── use-projects.ts           # TanStack Query hook for projects
│   │   │   ├── use-messages.ts           # TanStack Query hook for contact messages
│   │   │   ├── use-settings.ts           # TanStack Query hook for site settings
│   │   │   └── use-toast.ts              # Toast notification hook
│   │   │
│   │   ├── services/                     # HTTP callers — all API calls go through here
│   │   │   ├── booking-service.ts        # Booking CRUD API calls
│   │   │   ├── project-service.ts        # Project CRUD API calls
│   │   │   ├── contact-service.ts        # Contact message API calls
│   │   │   └── settings-service.ts       # Settings API calls
│   │   │
│   │   └── providers.tsx                 # TanStack Query + Toast + Theme providers
│   │
│   ├── server/                           # BACKEND ONLY — server-only guard on all files
│   │   │
│   │   ├── db/
│   │   │   └── prisma.ts                 # Prisma client singleton (server-only)
│   │   │
│   │   ├── config/
│   │   │   └── env.ts                    # Zod env validation — fails fast on startup
│   │   │
│   │   ├── errors/
│   │   │   ├── AppError.ts               # Base error class
│   │   │   ├── ValidationError.ts        # 400 — Zod failures
│   │   │   ├── NotFoundError.ts          # 404 — Resource not found
│   │   │   ├── ForbiddenError.ts         # 403 — Not admin
│   │   │   ├── UnauthorizedError.ts      # 401 — No session
│   │   │   ├── ConflictError.ts          # 409 — Invalid state transition
│   │   │   └── RateLimitError.ts         # 429 — Too many requests
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.ts                   # Session guard for admin endpoints
│   │   │   ├── rate-limit.ts             # Rate limiting by IP per endpoint
│   │   │   └── request-id.ts             # X-Request-ID generation + propagation
│   │   │
│   │   ├── repositories/                 # All DB queries for one domain in one file
│   │   │   ├── booking.repository.ts     # All Booking queries
│   │   │   ├── project.repository.ts     # All Project queries
│   │   │   ├── contact.repository.ts     # All ContactMessage queries
│   │   │   ├── settings.repository.ts    # All SiteSettings queries
│   │   │   └── notification.repository.ts # All Notification queries
│   │   │
│   │   ├── use-cases/                    # Business logic — one file per action
│   │   │   ├── bookings/
│   │   │   │   ├── create-booking.ts     # Validate, score, save, audit, queue notification
│   │   │   │   ├── update-booking-status.ts # Validate transition, save, audit
│   │   │   │   ├── get-bookings.ts       # Filter, paginate, return list
│   │   │   │   └── delete-booking.ts     # Soft delete, audit
│   │   │   ├── projects/
│   │   │   │   ├── create-project.ts
│   │   │   │   ├── update-project.ts
│   │   │   │   ├── get-projects.ts
│   │   │   │   └── delete-project.ts
│   │   │   └── contact/
│   │   │       ├── create-message.ts
│   │   │       ├── get-messages.ts
│   │   │       └── mark-message-read.ts
│   │   │
│   │   ├── audit/
│   │   │   └── audit-logger.ts           # Centralized AuditLog writes
│   │   │
│   │   ├── notifications/
│   │   │   └── notification-queue.ts     # Insert Notification rows (processed in v2)
│   │   │
│   │   └── utils/
│   │       ├── privacy.ts                # IP hashing (SHA-256 + salt)
│   │       ├── lead-scoring.ts           # Lead score calculation
│   │       └── utm-extractor.ts          # Extract UTM params from request URL
│   │
│   ├── shared/                           # Safe to import from both client and server
│   │   ├── types/
│   │   │   ├── booking.types.ts          # Booking, BookingStatus, CreateBookingInput
│   │   │   ├── project.types.ts          # Project, CreateProjectInput
│   │   │   ├── contact.types.ts          # ContactMessage, CreateMessageInput
│   │   │   ├── settings.types.ts         # SiteSettings, SettingsKey
│   │   │   └── api.types.ts              # ApiResponse<T>, ErrorCode, PaginationMeta
│   │   │
│   │   ├── validations/                  # Zod schemas — used on both FE and BE
│   │   │   ├── booking.schema.ts         # publicBookingSchema + adminBookingSchema
│   │   │   ├── project.schema.ts         # projectCreateSchema + projectUpdateSchema
│   │   │   ├── contact.schema.ts         # contactMessageSchema
│   │   │   └── settings.schema.ts        # settingsUpdateSchema
│   │   │
│   │   └── constants/
│   │       ├── booking-statuses.ts       # PENDING, CONTACTED, CONFIRMED, COMPLETED, REJECTED
│   │       ├── service-options.ts        # 4 service keys + display names + prompts
│   │       └── error-codes.ts            # All ErrorCode enum values
│   │
│   └── middleware.ts                     # Next.js edge middleware — thin composition
│
├── tests/
│   ├── factories/
│   │   ├── booking.factory.ts            # Valid + invalid booking variants
│   │   ├── project.factory.ts
│   │   └── contact.factory.ts
│   ├── unit/
│   │   ├── validations/                  # Zod schema tests
│   │   ├── use-cases/                    # Business logic tests (mocked repos)
│   │   └── utils/                        # Privacy, lead scoring, UTM extractor
│   ├── integration/
│   │   └── api/                          # Full API route tests with test DB
│   ├── e2e/
│   │   ├── booking-flow.spec.ts          # Visitor → booking → success
│   │   ├── admin-login.spec.ts           # Login → dashboard
│   │   ├── admin-booking-status.spec.ts  # Admin updates booking status
│   │   └── contact-form.spec.ts          # Visitor sends contact message
│   └── visual/
│       └── homepage.spec.ts              # Visual regression at 320/375/390px
│
├── .env.example                          # All variables with descriptions, no values
├── .eslintrc.json
├── .prettierrc
├── tailwind.config.ts
├── tsconfig.json                         # Path aliases defined
├── next.config.js                        # Security headers + bundle analyzer
├── package.json
├── CONTRIBUTING.md                       # The Laws — solo edition
└── SYSTEM_DESIGN.md                      # This document
```

### 6.1 TypeScript Path Aliases

Defined in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*":        ["./src/*"],
      "@client/*":  ["./src/client/*"],
      "@server/*":  ["./src/server/*"],
      "@shared/*":  ["./src/shared/*"],
      "@config/*":  ["./config/*"],
      "@tests/*":   ["./tests/*"]
    }
  }
}
```

Usage:
```typescript
import { bookingCreateSchema }    from '@shared/validations/booking.schema'
import { bookingRepository }      from '@server/repositories/booking.repository'
import { BookingForm }            from '@client/components/booking/booking-form'
import { BOOKING_STATUSES }       from '@shared/constants/booking-statuses'
```

---

## 7. DATABASE DESIGN & ERD

### 7.1 Entity Relationship Diagram

```
┌───────────────────┐
│       User        │ ← Single admin account (seeded)
├───────────────────┤
│ id          PK    │
│ email       UQ    │
│ password          │ bcrypt hash cost 12
│ name              │
│ role              │ UserRole enum (ADMIN)
│ failed_attempts   │ For account lockout
│ locked_until      │ Lockout expiry
│ created_at        │
│ updated_at        │
│ deleted_at        │ Soft delete
└────────┬──────────┘
         │ 1
         │ has many
         ▼ N
┌───────────────────┐
│      Session      │ ← NextAuth database sessions
├───────────────────┤
│ id          PK    │
│ sessionToken UQ   │
│ userId      FK    │ → User
│ expires           │
│ created_at        │
└───────────────────┘

┌───────────────────────────────────────────┐
│                  Booking                  │ ← Core lead entity
├───────────────────────────────────────────┤
│ id              PK                        │
│ name                                      │
│ email                                     │
│ phone                                     │
│ service                                   │ 4 valid values
│ location                                  │
│ description                               │ TEXT
│ meeting_date                              │ Optional future date
│ budget                                    │ Optional text
│ status                                    │ BookingStatus enum
│ consent_given                             │ Boolean (POPIA)
│ consent_given_at                          │ Timestamp of consent
│ lead_score                                │ Calculated 0-100
│ utm_source                                │
│ utm_medium                                │
│ utm_campaign                              │
│ utm_term                                  │
│ utm_content                               │
│ referrer_url                              │
│ landing_page                              │
│ user_agent                                │
│ ip_address                                │ SHA-256 hash
│ created_at                                │
│ updated_at                                │
│ deleted_at                                │ Soft delete
└───────────────────────────────────────────┘

┌───────────────────┐
│      Project      │ ← Portfolio items
├───────────────────┤
│ id          PK    │
│ title             │
│ description       │ TEXT
│ image_path        │ /images/projects/filename.jpg (not arbitrary URL)
│ category          │ Optional
│ sort_order        │ Admin-controlled display order
│ is_featured       │ Show on homepage preview
│ created_at        │
│ updated_at        │
│ deleted_at        │ Soft delete
└────────┬──────────┘
         │ 1
         │ has many
         ▼ N
┌───────────────────┐
│   Testimonial     │ ← Seeded in v1, managed via UI in v2
├───────────────────┤
│ id          PK    │
│ client_name       │
│ review            │ TEXT
│ rating            │ 1-5 integer
│ project_id  FK    │ → Project (optional)
│ is_active         │ Show/hide without delete
│ created_at        │
│ updated_at        │
│ deleted_at        │ Soft delete
└───────────────────┘

┌───────────────────┐
│  ContactMessage   │ ← General inquiries
├───────────────────┤
│ id          PK    │
│ name              │
│ email             │
│ phone             │ Optional
│ message           │ TEXT
│ read              │ Boolean default false
│ read_at           │ Timestamp when marked read
│ created_at        │
│ updated_at        │
│ deleted_at        │ Soft delete
└───────────────────┘

┌───────────────────┐
│   SiteSettings    │ ← Runtime config without redeployment
├───────────────────┤
│ id          PK    │
│ key         UQ    │ whatsapp_number, contact_email, etc.
│ value             │
│ description       │ Human-readable purpose
│ updated_at        │
│ updated_by  FK    │ → User (optional)
└───────────────────┘

┌───────────────────────────────────┐
│           Notification            │ ← v2-ready notification queue
├───────────────────────────────────┤
│ id          PK                    │
│ type                              │ BOOKING_RECEIVED, STATUS_CHANGED
│ channel                           │ email, whatsapp, sms
│ recipient                         │ email or phone number
│ payload           JSON            │ Full notification content
│ sent_at                           │ null = unsent (processed in v2)
│ failed_at                         │
│ error                             │
│ created_at                        │
└───────────────────────────────────┘

┌───────────────────────────────────┐
│             AuditLog              │ ← Every admin + system action
├───────────────────────────────────┤
│ id          PK                    │
│ action                            │ AuditAction enum
│ entity_type                       │ Booking, Project, User, etc.
│ entity_id                         │
│ user_id     FK                    │ → User (null for public actions)
│ ip_address                        │ Hashed
│ user_agent                        │
│ metadata    JSON                  │ { oldStatus, newStatus, etc. }
│ created_at                        │
└───────────────────────────────────┘
```

### 7.2 Index Strategy

| Index | Table | Columns | Purpose |
|---|---|---|---|
| Primary | All | `id` | PK lookups |
| Unique | User | `email` | Prevent duplicate accounts |
| Unique | Session | `sessionToken` | Fast session lookup |
| Unique | SiteSettings | `key` | One value per key |
| Composite | Booking | `(status, created_at)` | Admin list: filter + sort |
| Composite | Booking | `(deleted_at, status)` | Soft-delete aware filter |
| Single | Booking | `email` | Find bookings by visitor |
| Single | Booking | `created_at` | Date ordering |
| Single | ContactMessage | `read` | Unread message filter |
| Single | ContactMessage | `created_at` | Date ordering |
| Single | AuditLog | `(entity_type, entity_id)` | Find audit trail per entity |
| Single | AuditLog | `created_at` | Audit trail ordering |
| Single | Notification | `sent_at` | Find unsent notifications |
| Single | Project | `(deleted_at, is_featured)` | Homepage preview query |

---

## 8. PRISMA SCHEMA

```prisma
// prisma/schema.prisma
// Single source of truth for database structure.
// Every change here creates a migration. Never edit the database directly.

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

enum BookingStatus {
  PENDING      // New booking — awaiting admin action
  CONTACTED    // Admin has reached out to the client
  CONFIRMED    // Consultation date confirmed
  COMPLETED    // Consultation has been delivered
  REJECTED     // Booking declined or not a fit
}

enum UserRole {
  ADMIN
}

enum AuditAction {
  LOGIN_SUCCESS
  LOGIN_FAILURE
  LOGOUT
  BOOKING_CREATE
  BOOKING_STATUS_UPDATE
  BOOKING_DELETE
  PROJECT_CREATE
  PROJECT_UPDATE
  PROJECT_DELETE
  CONTACT_MESSAGE_CREATE
  CONTACT_MESSAGE_READ
  SETTINGS_UPDATE
}

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────

model User {
  id               String    @id @default(cuid())
  email            String    @unique
  password         String                           // bcrypt hash, cost factor 12
  name             String?
  role             UserRole  @default(ADMIN)
  failed_attempts  Int       @default(0)            // For account lockout
  locked_until     DateTime?                        // null = not locked
  created_at       DateTime  @default(now())
  updated_at       DateTime  @updatedAt
  deleted_at       DateTime?

  sessions         Session[]
  audit_logs       AuditLog[]
  settings_updates SiteSettings[]

  @@index([email])
  @@index([deleted_at])
}

model Session {
  id            String   @id @default(cuid())
  sessionToken  String   @unique
  userId        String
  expires       DateTime
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt

  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([sessionToken])
  @@index([expires])
}

// ─────────────────────────────────────────────
// CORE BUSINESS
// ─────────────────────────────────────────────

model Booking {
  id              String        @id @default(cuid())
  name            String
  email           String
  phone           String
  service         String        // house_planning | arch_drawings | drafting_services | dev_project_planning
  location        String
  description     String        @db.Text
  meeting_date    DateTime?
  budget          String?

  // Lead management
  status          BookingStatus @default(PENDING)
  lead_score      Int?          // 0-100, calculated on create

  // Legal — POPIA compliance
  consent_given   Boolean       @default(false)
  consent_given_at DateTime?

  // Marketing attribution
  utm_source      String?
  utm_medium      String?
  utm_campaign    String?
  utm_term        String?
  utm_content     String?
  referrer_url    String?
  landing_page    String?

  // Technical metadata
  user_agent      String?
  ip_address      String?       // SHA-256 hash of real IP

  created_at      DateTime      @default(now())
  updated_at      DateTime      @updatedAt
  deleted_at      DateTime?

  @@index([status, created_at])
  @@index([deleted_at, status])
  @@index([email])
  @@index([created_at])
}

model Project {
  id           String    @id @default(cuid())
  title        String
  description  String    @db.Text
  image_path   String                              // /images/projects/filename.jpg
  category     String?
  sort_order   Int       @default(0)              // Admin-controlled display order
  is_featured  Boolean   @default(false)          // Show on homepage preview

  created_at   DateTime  @default(now())
  updated_at   DateTime  @updatedAt
  deleted_at   DateTime?

  testimonials Testimonial[]

  @@index([deleted_at, is_featured])
  @@index([category])
  @@index([sort_order])
}

model Testimonial {
  id           String   @id @default(cuid())
  client_name  String
  review       String   @db.Text
  rating       Int?                               // 1-5
  project_id   String?
  is_active    Boolean  @default(true)            // Show/hide without deleting

  created_at   DateTime @default(now())
  updated_at   DateTime @updatedAt
  deleted_at   DateTime?

  project      Project? @relation(fields: [project_id], references: [id])

  @@index([is_active])
  @@index([project_id])
}

model ContactMessage {
  id         String    @id @default(cuid())
  name       String
  email      String
  phone      String?
  message    String    @db.Text
  read       Boolean   @default(false)
  read_at    DateTime?

  created_at DateTime  @default(now())
  updated_at DateTime  @updatedAt
  deleted_at DateTime?

  @@index([read])
  @@index([created_at])
}

model SiteSettings {
  id          String   @id @default(cuid())
  key         String   @unique
  value       String
  description String?                              // Human-readable purpose
  updated_at  DateTime @updatedAt
  updated_by  String?

  updater     User?    @relation(fields: [updated_by], references: [id])

  @@index([key])
}

// ─────────────────────────────────────────────
// NOTIFICATIONS (v2-ready queue)
// ─────────────────────────────────────────────

model Notification {
  id         String    @id @default(cuid())
  type       String                               // BOOKING_RECEIVED, STATUS_CHANGED
  channel    String                               // email | whatsapp | sms
  recipient  String                               // email or phone
  payload    Json                                 // Full notification content
  sent_at    DateTime?                            // null = unsent
  failed_at  DateTime?
  error      String?

  created_at DateTime  @default(now())

  @@index([sent_at])
  @@index([created_at])
}

// ─────────────────────────────────────────────
// AUDIT & GOVERNANCE
// ─────────────────────────────────────────────

model AuditLog {
  id          String      @id @default(cuid())
  action      AuditAction
  entity_type String                               // Booking | Project | User | ContactMessage
  entity_id   String
  user_id     String?                              // null for public actions
  ip_address  String?                              // Hashed
  user_agent  String?
  metadata    Json?                                // { oldStatus, newStatus, reason, etc. }

  created_at  DateTime    @default(now())

  user        User?       @relation(fields: [user_id], references: [id])

  @@index([entity_type, entity_id])
  @@index([action])
  @@index([created_at])
}
```

---

## 9. REPOSITORY & USE CASE LAYER

### 9.1 Repository Pattern

Every database query lives in its domain repository. API routes never call Prisma directly.

```typescript
// src/server/repositories/booking.repository.ts
import 'server-only'
import { prisma } from '@server/db/prisma'
import { BookingStatus, Prisma } from '@prisma/client'

export interface BookingFilters {
  status?:   BookingStatus
  page?:     number
  limit?:    number
  sort?:     'created_at' | 'lead_score'
  order?:    'asc' | 'desc'
}

export const bookingRepository = {
  findAll: async (filters: BookingFilters = {}) => {
    const { status, page = 1, limit = 20, sort = 'created_at', order = 'desc' } = filters
    const skip = (page - 1) * limit

    const where: Prisma.BookingWhereInput = {
      deleted_at: null,
      ...(status && { status }),
    }

    const [data, total] = await prisma.$transaction([
      prisma.booking.findMany({ where, skip, take: limit, orderBy: { [sort]: order } }),
      prisma.booking.count({ where }),
    ])

    return { data, total, page, limit, pages: Math.ceil(total / limit) }
  },

  findById: (id: string) =>
    prisma.booking.findFirst({ where: { id, deleted_at: null } }),

  create: (data: Prisma.BookingCreateInput) =>
    prisma.booking.create({ data }),

  updateStatus: (id: string, status: BookingStatus) =>
    prisma.booking.update({ where: { id }, data: { status } }),

  softDelete: (id: string) =>
    prisma.booking.update({ where: { id }, data: { deleted_at: new Date() } }),
}
```

### 9.2 Use Case Pattern

Business logic in dedicated files. One file per action.

```typescript
// src/server/use-cases/bookings/create-booking.ts
import 'server-only'
import { bookingRepository }     from '@server/repositories/booking.repository'
import { auditLogger }           from '@server/audit/audit-logger'
import { notificationQueue }     from '@server/notifications/notification-queue'
import { hashIpAddress }         from '@server/utils/privacy'
import { calculateLeadScore }    from '@server/utils/lead-scoring'
import { extractUtmParams }      from '@server/utils/utm-extractor'
import type { CreateBookingInput } from '@shared/types/booking.types'

export async function createBooking(
  input: CreateBookingInput,
  meta: { ip: string; userAgent: string; url: string }
) {
  const utm = extractUtmParams(meta.url)

  const booking = await bookingRepository.create({
    ...input,
    ip_address:      hashIpAddress(meta.ip),
    user_agent:      meta.userAgent,
    lead_score:      calculateLeadScore(input),
    consent_given_at: input.consent_given ? new Date() : null,
    ...utm,
  })

  await auditLogger.log({
    action:      'BOOKING_CREATE',
    entity_type: 'Booking',
    entity_id:   booking.id,
    ip_address:  hashIpAddress(meta.ip),
    user_agent:  meta.userAgent,
    metadata:    { service: booking.service, lead_score: booking.lead_score },
  })

  await notificationQueue.enqueue({
    type:      'BOOKING_RECEIVED',
    channel:   'whatsapp',            // v2: processed by background job
    recipient: process.env.ADMIN_WHATSAPP_NUMBER!,
    payload:   { booking_id: booking.id, name: booking.name, service: booking.service },
  })

  return booking
}
```

### 9.3 API Route — Thin Coordinator

```typescript
// src/app/api/v1/bookings/route.ts
import { NextRequest, NextResponse }    from 'next/server'
import { publicBookingSchema }          from '@shared/validations/booking.schema'
import { createBooking }                from '@server/use-cases/bookings/create-booking'
import { getBookings }                  from '@server/use-cases/bookings/get-bookings'
import { requireAdmin }                 from '@server/middleware/auth'
import { ZodError }                     from 'zod'
import { ValidationError }              from '@server/errors/ValidationError'

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json()
    const input  = publicBookingSchema.parse(body)  // throws ZodError if invalid
    const booking = await createBooking(input, {
      ip:        req.headers.get('x-forwarded-for') ?? 'unknown',
      userAgent: req.headers.get('user-agent') ?? 'unknown',
      url:       req.url,
    })
    return NextResponse.json({ success: true, data: booking }, { status: 201 })
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({
        success: false,
        data: null,
        error: { code: 'VALIDATION_ERROR', message: 'Please check your input.', fields: err.flatten().fieldErrors }
      }, { status: 400 })
    }
    return NextResponse.json({
      success: false, data: null,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong. Please try again.' }
    }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req)
  if (authError) return authError

  const { searchParams } = new URL(req.url)
  const result = await getBookings({
    status: searchParams.get('status') as any,
    page:   Number(searchParams.get('page') ?? 1),
    limit:  Math.min(Number(searchParams.get('limit') ?? 20), 100), // cap at 100
    sort:   searchParams.get('sort') as any,
    order:  searchParams.get('order') as any,
  })

  return NextResponse.json({ success: true, ...result })
}
```

### 9.4 Lead Scoring Algorithm

```typescript
// src/server/utils/lead-scoring.ts
import 'server-only'
import type { CreateBookingInput } from '@shared/types/booking.types'

const SERVICE_SCORES: Record<string, number> = {
  dev_project_planning: 40,   // Highest value service
  house_planning:       35,
  arch_drawings:        30,
  drafting_services:    20,
}

const BUDGET_SCORES: Record<string, number> = {
  '500000+':       30,
  '200000-500000': 25,
  '100000-200000': 20,
  '50000-100000':  15,
  'under-50000':   5,
  '':              10,        // No budget stated — uncertain, not disqualified
}

export function calculateLeadScore(input: CreateBookingInput): number {
  let score = 0

  // Service type weight (max 40)
  score += SERVICE_SCORES[input.service] ?? 20

  // Budget signal (max 30)
  score += BUDGET_SCORES[input.budget ?? ''] ?? 10

  // Meeting date provided = motivated (max 15)
  if (input.meeting_date) score += 15

  // Description quality — longer = more serious (max 15)
  const descLength = input.description.length
  if (descLength >= 200) score += 15
  else if (descLength >= 100) score += 10
  else if (descLength >= 50) score += 5

  return Math.min(score, 100)
}
```

---

## 10. API CONTRACTS

### 10.1 Endpoint Registry

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | System health check |
| `POST` | `/api/v1/auth/login` | Public | Admin login |
| `POST` | `/api/v1/auth/logout` | Admin | Logout + destroy session |
| `POST` | `/api/v1/bookings` | Public | Submit consultation request |
| `GET` | `/api/v1/bookings` | Admin | List bookings with filters + pagination |
| `GET` | `/api/v1/bookings/:id` | Admin | Get single booking details |
| `PATCH` | `/api/v1/bookings/:id` | Admin | Update booking status |
| `DELETE` | `/api/v1/bookings/:id` | Admin | Soft delete booking |
| `GET` | `/api/v1/projects` | Public | List active projects |
| `POST` | `/api/v1/projects` | Admin | Create new project |
| `PATCH` | `/api/v1/projects/:id` | Admin | Update project |
| `DELETE` | `/api/v1/projects/:id` | Admin | Soft delete project |
| `POST` | `/api/v1/contact` | Public | Submit contact message |
| `GET` | `/api/v1/contact` | Admin | List contact messages |
| `PATCH` | `/api/v1/contact/:id` | Admin | Mark message as read |
| `DELETE` | `/api/v1/contact/:id` | Admin | Soft delete message |
| `GET` | `/api/v1/settings` | Public (safe keys only) | Get public site settings |
| `PATCH` | `/api/v1/settings/:key` | Admin | Update a setting value |

### 10.2 Standard Response Shapes

**Success — single object:**
```json
{
  "success": true,
  "data": { "id": "clx...", "name": "John Doe", "status": "PENDING" },
  "error": null
}
```

**Success — paginated list:**
```json
{
  "success": true,
  "data": [ { "id": "clx..." } ],
  "meta": { "page": 1, "limit": 20, "total": 47, "pages": 3 },
  "error": null
}
```

**Validation error:**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please check your input and try again.",
    "fields": {
      "email": ["Please enter a valid email address"],
      "description": ["Please provide more detail (minimum 20 characters)"]
    }
  }
}
```

**General error:**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "You must be logged in to access this resource."
  }
}
```

### 10.3 Error Code Registry

| Code | HTTP | When Used |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Zod schema validation failed |
| `UNAUTHORIZED` | 401 | No valid session |
| `FORBIDDEN` | 403 | Session valid but not admin |
| `NOT_FOUND` | 404 | Resource doesn't exist or is soft-deleted |
| `CONFLICT` | 409 | Invalid status transition attempted |
| `RATE_LIMITED` | 429 | Too many requests from this IP |
| `INTERNAL_SERVER_ERROR` | 500 | Unhandled — logged to Sentry |

### 10.4 Health Check Response

```json
{
  "status": "ok",
  "db": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

Returns `status: "degraded"` with appropriate `db: "error"` if database is unreachable. Used by UptimeRobot every 5 minutes.

---

## 11. USER FLOWS

### 11.1 Flow 1: Visitor Books Consultation (Primary Conversion)

```
Visitor lands on homepage
  ├── Hero section with value proposition + primary CTA
  ├── Services preview — 4 cards
  ├── Portfolio preview — 3 featured projects
  ├── Testimonials — social proof
  └── Stats bar — "5+ years, X projects completed"
           │
           ▼ clicks any "Book Consultation" CTA
     /booking page loads
           │
           ▼ service dropdown onChange fires
     Description placeholder updates to service-specific prompt
           │
           ▼ visitor fills all fields
     Client-side Zod validation runs inline (no submit needed)
           │
           ▼ clicks "Request Consultation"
     Consent checkbox must be checked (POPIA)
           │
           ▼ POST /api/v1/bookings
     Server validates → saves → scores → audits → queues notification
           │
     ┌─────┴──────┐
   Error         Success
     │              │
  Inline          Success message shown
  field errors    Form resets
                  "We will contact you within 24 hours"
                         │
                         ▼
              Admin logs into /admin/bookings
              Sees new PENDING booking with lead score
              Clicks phone → WhatsApp opens
              Contacts client
              Updates status to CONTACTED
```

### 11.2 Flow 2: Admin Updates Booking Status

```
Admin at /admin/bookings
  ├── Filter by status (PENDING / CONTACTED / CONFIRMED / COMPLETED / REJECTED)
  ├── Sort by date or lead score
  └── Sees table: Name | Service | Location | Lead Score | Date | Status | Actions
           │
           ▼ clicks "View" on a row
     Booking detail modal opens:
       - Full form data
       - Lead score badge (colour-coded)
       - Marketing attribution (UTM source, referrer)
       - Status update dropdown
       - Clickable phone → opens WhatsApp
           │
           ▼ admin updates status
     PATCH /api/v1/bookings/:id
     Use case validates transition is allowed
     Status updated + AuditLog written
           │
           ▼
     Table refreshes with new status badge
     TanStack Query cache invalidated
```

### 11.3 Flow 3: Admin Manages Projects

```
Admin at /admin/projects
  ├── Sees project grid with edit/delete per card
  └── "Add New Project" button
           │
           ▼ add or edit
     Modal form:
       - Title (required)
       - Description (required)
       - Image path (required — /images/projects/filename.jpg)
       - Category (optional)
       - Featured toggle (show on homepage)
       - Sort order (drag-and-drop in v2, manual number in v1)
           │
           ▼ save
     POST or PATCH /api/v1/projects
     Project saved → AuditLog written
     Public /projects page shows updated content on next ISR revalidation
```

### 11.4 Flow 4: Admin Manages Site Settings

```
Admin at /admin/settings
  ├── WhatsApp Number (editable)
  ├── Contact Email (editable)
  ├── Business Phone (editable)
  ├── Business Address (editable)
  └── Hero Tagline (editable)
           │
           ▼ admin updates a field
     PATCH /api/v1/settings/:key
     SiteSettings row updated
     AuditLog written with old value + new value
           │
           ▼
     Public site reads fresh value on next request
     No code deployment required
```

### 11.5 Flow 5: WhatsApp (Any Page)

```
Floating button visible on every page (bottom-right, always on top)
  │
  ▼
Visitor clicks
  │
  ▼
Opens: https://wa.me/{WHATSAPP_NUMBER}?text=Hello%2C%20I%27m%20interested%20in%20architectural%20services.
  │
  ▼
WhatsApp number read from SiteSettings at page load
(Admin can update without redeployment)
```

---

## 12. BUSINESS LOGIC & VALIDATION RULES

### 12.1 Booking Validation

| Field | Rules | Error Message |
|---|---|---|
| name | Required · min 2 · max 100 | "Please enter your full name" |
| email | Required · valid email format | "Please enter a valid email address" |
| phone | Required · SA format: 10 digits starting with 0, or +27 prefix | "Please enter a valid South African phone number" |
| service | Required · one of 4 valid enum values | "Please select a service" |
| location | Required · min 2 · max 200 | "Please enter your project location" |
| description | Required · min 20 · max 2000 | "Please provide more detail (minimum 20 characters)" |
| meeting_date | Optional · if provided: must be a valid ISO date · must be in the future | "Please select a future date" |
| budget | Optional · max 50 | "Budget description is too long" |
| consent_given | Must be exactly `true` | "You must agree to be contacted to submit this request" |

### 12.2 Project Validation

| Field | Rules | Error Message |
|---|---|---|
| title | Required · max 100 | "Please enter a project title" |
| description | Required · max 1000 | "Please enter a project description" |
| image_path | Required · must start with `/images/projects/` · must end with `.jpg`, `.png`, `.webp` | "Please enter a valid project image path" |
| category | Optional · max 50 | "Category name is too long" |
| sort_order | Optional · integer 0-999 | "Sort order must be a number" |

### 12.3 Contact Message Validation

| Field | Rules | Error Message |
|---|---|---|
| name | Required · min 2 · max 100 | "Please enter your name" |
| email | Required · valid email | "Please enter a valid email address" |
| phone | Optional · if present: SA format | "Please enter a valid phone number" |
| message | Required · min 10 · max 2000 | "Please enter a longer message (minimum 10 characters)" |

### 12.4 SA Phone Number Regex

```typescript
const SA_PHONE_REGEX = /^(\+27|0)[6-8][0-9]{8}$/
```

Accepts: `0781234567`, `+27781234567`
Rejects: `123`, `00781234567`, `+1234567890`

### 12.5 Rate Limiting Rules

| Endpoint | Limit | Window | After Limit |
|---|---|---|---|
| `POST /api/v1/auth/login` | 10 requests | 15 minutes | Block 30 minutes |
| `POST /api/v1/bookings` | 5 requests | 1 hour | Block 1 hour |
| `POST /api/v1/contact` | 3 requests | 1 hour | Block 1 hour |

---

## 13. STATUS LIFECYCLES

### 13.1 Booking Status State Machine

```
                ┌──────────────┐
                │   PENDING    │ ← Every new booking starts here
                └──────┬───────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            │
    ┌──────────┐  ┌──────────┐     │
    │CONTACTED │  │ REJECTED │ ◄───┤
    └────┬─────┘  └──────────┘     │
         │                         │
    ┌────┴─────┐                   │
    │          ├───────────────────┘
    ▼          ▼
┌──────────┐ ┌──────────┐
│CONFIRMED │ │ REJECTED │
└────┬─────┘ └──────────┘
     │
     ▼
┌──────────┐
│COMPLETED │ ← Terminal state
└──────────┘
```

### 13.2 Valid Transitions

| From | To | Allowed |
|---|---|---|
| PENDING | CONTACTED | Yes |
| PENDING | REJECTED | Yes |
| CONTACTED | CONFIRMED | Yes |
| CONTACTED | REJECTED | Yes |
| CONFIRMED | COMPLETED | Yes |
| CONFIRMED | REJECTED | Yes |
| COMPLETED | (any) | No — terminal |
| REJECTED | (any) | No — terminal |

### 13.3 Transition Enforcement

```typescript
// src/server/use-cases/bookings/update-booking-status.ts
const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING:   ['CONTACTED', 'REJECTED'],
  CONTACTED: ['CONFIRMED', 'REJECTED'],
  CONFIRMED: ['COMPLETED', 'REJECTED'],
  COMPLETED: [],
  REJECTED:  [],
}

export async function updateBookingStatus(id: string, newStatus: BookingStatus, adminId: string) {
  const booking = await bookingRepository.findById(id)
  if (!booking) throw new NotFoundError('Booking not found')

  const allowed = VALID_TRANSITIONS[booking.status]
  if (!allowed.includes(newStatus)) {
    throw new ConflictError(
      `Cannot transition from ${booking.status} to ${newStatus}`
    )
  }

  const updated = await bookingRepository.updateStatus(id, newStatus)

  await auditLogger.log({
    action:      'BOOKING_STATUS_UPDATE',
    entity_type: 'Booking',
    entity_id:   id,
    user_id:     adminId,
    metadata:    { old_status: booking.status, new_status: newStatus },
  })

  return updated
}
```

---

## 14. ERROR HANDLING ARCHITECTURE

### 14.1 Error Class Hierarchy

```typescript
// src/server/errors/AppError.ts
export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly statusCode: number,
    public readonly fields?: Record<string, string[]>
  ) {
    super(message)
    this.name = this.constructor.name
  }
}

export class ValidationError   extends AppError {
  constructor(message: string, fields?: Record<string, string[]>) {
    super('VALIDATION_ERROR', message, 400, fields)
  }
}
export class UnauthorizedError extends AppError {
  constructor() { super('UNAUTHORIZED', 'Authentication required.', 401) }
}
export class ForbiddenError    extends AppError {
  constructor() { super('FORBIDDEN', 'You do not have permission.', 403) }
}
export class NotFoundError     extends AppError {
  constructor(msg = 'Resource not found.') { super('NOT_FOUND', msg, 404) }
}
export class ConflictError     extends AppError {
  constructor(msg: string) { super('CONFLICT', msg, 409) }
}
export class RateLimitError    extends AppError {
  constructor() { super('RATE_LIMITED', 'Too many requests. Please try again later.', 429) }
}
```

### 14.2 Global API Error Handler

```typescript
// src/server/errors/handle-api-error.ts
import { NextResponse } from 'next/server'
import { ZodError }     from 'zod'
import { AppError }     from './AppError'
import * as Sentry      from '@sentry/nextjs'

export function handleApiError(err: unknown): NextResponse {
  if (err instanceof AppError) {
    return NextResponse.json(
      { success: false, data: null, error: { code: err.code, message: err.message, fields: err.fields } },
      { status: err.statusCode }
    )
  }

  if (err instanceof ZodError) {
    return NextResponse.json(
      { success: false, data: null,
        error: { code: 'VALIDATION_ERROR', message: 'Please check your input.', fields: err.flatten().fieldErrors } },
      { status: 400 }
    )
  }

  // Unknown error — log to Sentry, return generic 500
  Sentry.captureException(err)
  return NextResponse.json(
    { success: false, data: null,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong. Please try again.' } },
    { status: 500 }
  )
}
```

### 14.3 Frontend Error Handling

```typescript
// src/shared/lib/api-client.ts
export async function apiClient<T>(
  url: string,
  options?: RequestInit
): Promise<{ data: T; meta?: PaginationMeta }> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Request-ID': generateRequestId(),
      ...options?.headers,
    }
  })

  const json = await res.json()

  if (!json.success) {
    throw new ApiError(json.error.code, json.error.message, json.error.fields)
  }

  return { data: json.data, meta: json.meta }
}
```

---

## 15. OBSERVABILITY & MONITORING

### 15.1 The Three Pillars

**Logging — Structured JSON**

Every API request logs:
```json
{
  "level": "info",
  "request_id": "req_abc123",
  "method": "POST",
  "path": "/api/v1/bookings",
  "status": 201,
  "duration_ms": 145,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

Never logged: passwords, full email addresses, full phone numbers, raw IP addresses.

**Error Tracking — Sentry (v1)**

- Every unhandled exception captured with context
- Source maps uploaded at deploy for readable stack traces
- Alerts on new error types via email
- Free tier covers this project's volume

**Uptime Monitoring — UptimeRobot**

- Monitors `GET /api/health` every 5 minutes
- Sends email alert if site goes down
- Free tier — no credit card required

### 15.2 Health Check Implementation

```typescript
// src/app/api/health/route.ts
import { prisma } from '@server/db/prisma'

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return Response.json({
      status: 'ok',
      db: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? '1.0.0'
    })
  } catch {
    return Response.json({
      status: 'degraded',
      db: 'error',
      timestamp: new Date().toISOString()
    }, { status: 503 })
  }
}
```

### 15.3 Admin Dashboard Intelligence

The dashboard surfaces actionable data from existing fields — no new queries needed:

| Metric | How Calculated |
|---|---|
| Today's bookings | `WHERE created_at >= today AND deleted_at IS NULL` |
| Unread messages | `WHERE read = false AND deleted_at IS NULL` |
| High-priority leads | `WHERE status = 'PENDING' AND lead_score >= 70` |
| Conversion funnel | COUNT per status, displayed as pipeline |
| Average response time | AVG time from `created_at` to first status change to CONTACTED |
| Top traffic source | GROUP BY `utm_source` on recent bookings |

---

## 16. PERFORMANCE ARCHITECTURE

### 16.1 Rendering Strategy Per Page

| Page | Strategy | Rationale |
|---|---|---|
| Homepage | ISR — revalidate 60s | SEO value + updates when projects change |
| Services page | Static | Content never changes |
| Projects page | ISR — revalidate 300s | Updates when admin adds projects |
| Booking page | Client-side | No SEO needed, interactive form |
| Contact page | Static | Content never changes |
| Privacy policy | Static | Content changes rarely |
| Admin pages | Server-side (SSR) | Must verify session on server |

### 16.2 Caching Strategy

| Data | Cache Location | TTL | Invalidation Trigger |
|---|---|---|---|
| Projects list | TanStack Query + Next.js fetch | 5 minutes | Admin creates/updates/deletes project |
| Site settings | TanStack Query | 10 minutes | Admin updates settings |
| Booking list | TanStack Query | 30 seconds | Admin updates a booking status |
| Contact messages | TanStack Query | 30 seconds | Admin reads a message |
| Health check | No cache | — | Always fresh |

### 16.3 Image Optimization Rules

- Always use `next/image` — never raw `<img>` tags
- Every image specifies `width` and `height` — prevents layout shift (CLS)
- Hero image always has `priority={true}` — improves LCP score
- Project images use `loading="lazy"` — default behavior of `next/image`
- All images in `/public` converted to `.webp` before adding

### 16.4 Bundle Analysis Rule

Before every major release:

```bash
ANALYZE=true npm run build
```

Review the bundle report. No single client-side module should exceed 100KB uncompressed. Server modules should never appear in the client bundle.

---

## 17. MARKETING INTEGRATION LAYER

### 17.1 UTM Attribution — What Gets Captured

Every booking stores the full marketing context at the moment of conversion:

| Field | Source | Example |
|---|---|---|
| `utm_source` | URL parameter | `google`, `facebook`, `instagram` |
| `utm_medium` | URL parameter | `cpc`, `organic`, `social` |
| `utm_campaign` | URL parameter | `cape_town_homes_2024` |
| `utm_term` | URL parameter | `architect+cape+town` |
| `utm_content` | URL parameter | `hero_cta_button` |
| `referrer_url` | `Referer` header | `https://www.google.co.za` |
| `landing_page` | Request URL | `/booking?utm_source=google&...` |

### 17.2 Google Analytics 4 Integration

Events tracked:

| Event Name | When Fired | Parameters |
|---|---|---|
| `page_view` | Every page | `page_path`, `page_title` |
| `booking_form_start` | User focuses first field | `service` (if pre-selected) |
| `booking_form_submit` | Form submitted (before API) | `service` |
| `booking_form_success` | API returns 201 | `service`, `lead_score` |
| `booking_form_error` | API returns error | `error_code` |
| `whatsapp_click` | Floating button clicked | `page_path` |
| `contact_form_submit` | Contact form submitted | — |
| `project_view` | Project card clicked | `project_title`, `category` |

### 17.3 Google Tag Manager Setup

GTM manages tracking pixels so Mponisi (marketing) can add new tracking without code changes.

Configured triggers in GTM:
- `booking_form_success` event → Google Ads conversion pixel
- `booking_form_success` event → Facebook/Meta Pixel (if running social ads)
- All pages → GA4 base tag

### 17.4 features.json (Build-time Feature Flags)

```json
{
  "booking_form":         true,
  "contact_form":         true,
  "portfolio_grid":       true,
  "testimonials_section": true,
  "whatsapp_button":      true,
  "stats_bar":            true,
  "google_analytics":     true,
  "cookie_consent":       true,
  "lead_scoring":         true
}
```

Toggle a feature off by setting to `false` and redeploying. Useful for A/B testing or temporarily disabling a section.

---

## 18. LEGAL & COMPLIANCE (POPIA)

POPIA (Protection of Personal Information Act) is South African law. This system collects personal information from South African residents. Compliance is mandatory.

### 18.1 What Personal Information Is Collected

| Data | Where Stored | Legal Basis | Retention |
|---|---|---|---|
| Full name | Booking, ContactMessage | Consent (booking) / Legitimate interest (contact) | 2 years |
| Email address | Booking, ContactMessage | Consent / Legitimate interest | 2 years |
| Phone number | Booking, ContactMessage | Consent / Legitimate interest | 2 years |
| Project description | Booking | Consent | 2 years |
| IP address (hashed) | Booking, AuditLog | Legitimate interest (fraud prevention) | 1 year |
| User agent | Booking, AuditLog | Legitimate interest | 1 year |

### 18.2 Required Pages and Components

| Requirement | Implementation |
|---|---|
| Privacy policy page | `/privacy` — linked in footer |
| Consent at booking | Checkbox: "I agree to be contacted by Sunduza Architectural regarding my enquiry. See our Privacy Policy." |
| Cookie consent | Banner for GA4/GTM cookies on first visit |
| Data subject rights | Admin can hard-delete a person's data on written request |

### 18.3 Consent Capture

```typescript
// In booking form — this field is required (Zod: z.literal(true))
<Checkbox
  id="consent"
  required
  label={
    <>
      I agree to be contacted by Sunduza Architectural regarding my enquiry.
      View our <Link href="/privacy">Privacy Policy</Link>.
    </>
  }
/>
```

`consent_given: true` and `consent_given_at: new Date()` are stored on every booking.

### 18.4 Data Retention Implementation

Add a scheduled task (v2: cron job, v1: manual quarterly review):

```sql
-- Hard delete bookings older than 2 years with no active engagement
DELETE FROM bookings
WHERE created_at < NOW() - INTERVAL '2 years'
AND status IN ('COMPLETED', 'REJECTED')
AND deleted_at IS NOT NULL;
```

### 18.5 Privacy Policy Must Cover

1. What personal information is collected
2. Why it is collected (purpose)
3. How it is stored and protected
4. Who has access to it
5. How long it is kept
6. The data subject's right to request deletion
7. Contact information for the Information Officer (Kevin)

---

## 19. TRANSACTION MANAGEMENT

### 19.1 ACID Compliance

| Property | Implementation |
|---|---|
| Atomicity | All multi-step writes use `prisma.$transaction([...])` |
| Consistency | DB constraints enforced at all times |
| Isolation | Read Committed default — sufficient for v1 single-admin |
| Durability | PostgreSQL guarantees data after commit |

### 19.2 Transactional Operations

Any operation that writes to two or more tables must use a transaction:

```typescript
// Example: booking creation + audit log in one transaction
const [booking, _audit] = await prisma.$transaction([
  prisma.booking.create({ data: bookingData }),
  prisma.auditLog.create({ data: auditData }),
])
```

### 19.3 Optimistic Locking (v2-Ready)

Single admin in v1 — concurrent update conflicts are not a risk. Schema is ready for v2 multi-admin by adding a `version Int @default(0)` field to Booking:

```typescript
// v2: Include version in update to detect concurrent modifications
const result = await prisma.booking.updateMany({
  where: { id, version: currentVersion },
  data: { status: newStatus, version: { increment: 1 } }
})
if (result.count === 0) throw new ConflictError('Booking was modified by another user.')
```

---

## 20. TESTING STRATEGY

### 20.1 Test Pyramid

```
            ┌───────┐
            │  E2E  │   Playwright — 4 critical paths only
          ┌─┴───────┴─┐
          │ INTEGRATION│  Jest — all API routes + DB
        ┌─┴───────────┴─┐
        │     UNIT       │  Jest + RTL — schemas, use cases, utils, components
        └───────────────┘
```

### 20.2 Test Coverage Targets

| Layer | Target | What to Test |
|---|---|---|
| Zod schemas | 100% | Every valid and invalid input combination |
| Use cases | 90% | All business rules, all error paths |
| Utility functions | 100% | Lead scoring, IP hashing, UTM extraction |
| API routes | 80% | All endpoints, auth guards, error codes |
| React components | 60% | Form validation, error states, loading states |
| E2E | Critical paths | Booking flow, admin login, status update, contact |

### 20.3 Test Data Factories

```typescript
// tests/factories/booking.factory.ts
const defaults = {
  name:          'Thabo Nkosi',
  email:         'thabo@example.co.za',
  phone:         '0781234567',
  service:       'house_planning',
  location:      'Sandton, Johannesburg',
  description:   'I need a 4-bedroom house designed for a 500sqm plot in Sandton.',
  consent_given: true,
}

export const bookingFactory = {
  valid:   (o = {}) => ({ ...defaults, ...o }),
  invalid: {
    missingEmail:       () => bookingFactory.valid({ email: '' }),
    invalidPhone:       () => bookingFactory.valid({ phone: '123' }),
    shortDescription:   () => bookingFactory.valid({ description: 'too short' }),
    pastMeetingDate:    () => bookingFactory.valid({ meeting_date: '2020-01-01T10:00:00Z' }),
    noConsent:          () => bookingFactory.valid({ consent_given: false }),
    xssInName:          () => bookingFactory.valid({ name: '<script>alert(1)</script>' }),
    invalidService:     () => bookingFactory.valid({ service: 'invalid_service' }),
    adminFieldInjection:() => bookingFactory.valid({ status: 'COMPLETED' } as any),
  }
}
```

### 20.4 Security Test Suite

```typescript
// tests/integration/api/security.test.ts

describe('Security', () => {
  it('rejects unauthenticated GET /api/v1/bookings', async () => {
    const res = await GET('/api/v1/bookings')
    expect(res.status).toBe(401)
  })

  it('rejects status injection in public booking POST', async () => {
    const res = await POST('/api/v1/bookings', {
      ...bookingFactory.valid(),
      status: 'COMPLETED',
    })
    const booking = await prisma.booking.findFirst({ orderBy: { created_at: 'desc' } })
    expect(booking?.status).toBe('PENDING') // Injected status ignored
  })

  it('rejects invalid status transition', async () => {
    const booking = await createTestBookingWithStatus('COMPLETED')
    const res = await PATCH(`/api/v1/bookings/${booking.id}`, { status: 'PENDING' }, adminHeaders)
    expect(res.status).toBe(409)
  })

  it('blocks after rate limit threshold', async () => {
    for (let i = 0; i < 5; i++) {
      await POST('/api/v1/bookings', bookingFactory.valid())
    }
    const res = await POST('/api/v1/bookings', bookingFactory.valid())
    expect(res.status).toBe(429)
  })
})
```

### 20.5 Database State in Tests

Integration tests use PostgreSQL transaction rollback:

```typescript
// tests/integration/setup.ts
import { prisma } from '@server/db/prisma'

beforeEach(async () => {
  await prisma.$executeRaw`BEGIN`
})

afterEach(async () => {
  await prisma.$executeRaw`ROLLBACK`
})
```

Each test runs in a transaction that rolls back — fast, isolated, no test data leaks.

### 20.6 Visual Regression Tests

```typescript
// tests/visual/homepage.spec.ts
const viewports = [
  { width: 320, name: 'mobile-small' },
  { width: 375, name: 'iphone-se' },
  { width: 390, name: 'iphone-pro' },
  { width: 768, name: 'tablet' },
  { width: 1280, name: 'desktop' },
]

for (const vp of viewports) {
  test(`homepage renders correctly at ${vp.width}px`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: 800 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot(`homepage-${vp.name}.png`, {
      maxDiffPixelRatio: 0.02 // Allow 2% pixel difference
    })
  })
}
```

### 20.7 CI Test Gate

Every PR must pass before merge:

```yaml
# .github/workflows/ci.yml
- run: npm run lint           # Zero ESLint errors
- run: npm run type-check     # Zero TypeScript errors
- run: npm run test           # All unit + integration tests passing
- run: npm run test:e2e       # All 4 E2E critical paths passing
- run: npm run test:visual    # Visual regression passing
```

---

## 21. DEPLOYMENT ARCHITECTURE

### 21.1 Environment Strategy

| Environment | Database | Deploy Trigger | Purpose |
|---|---|---|---|
| Local | Local PostgreSQL | `npm run dev` | Daily development |
| Preview | Neon branch (per PR) | PR to `dev` branch | Test changes before merge |
| Production | Neon main branch | Merge to `main` | Live client site |

### 21.2 Branch Strategy

```
main          ← Production. Auto-deploys to Vercel. Protected. No direct push. Ever.
  │
dev           ← Integration. PRs merged here first. Deploys to preview.
  │
feat/*        ← Feature branches. One concern per branch. PR into dev.
fix/*         ← Bug fixes. PR into dev.
chore/*       ← Maintenance (deps, config). PR into dev.
```

### 21.3 CI/CD Pipeline

```
1  Push to feat/* branch
2  Open PR targeting dev
3  GitHub Actions triggers:
      npm ci
      npm run lint
      npm run type-check
      npm run test
      npm run test:e2e
      npm run test:visual
4  Vercel creates preview deployment for this PR
5  All CI checks pass
6  Self-review checklist completed
7  Squash merge into dev
8  Preview deployment for dev branch auto-updates
9  Sprint end (or when stable): merge dev → main
10 Vercel production deployment triggers:
      npm run build
      npx prisma migrate deploy
      New deployment becomes live
      Old deployment drained gracefully
```

### 21.4 Database Migration Safety Rules

1. **Never deploy a destructive migration on a Friday**
2. **Always run `prisma migrate dev` locally before committing**
3. **Additive only in one sprint** — add columns, add tables. Drop columns only after 2 sprints (deprecated first)
4. **Every migration reviewed** before merge to main — not just the Prisma schema change
5. **Test migrations** run against a Neon preview branch before hitting production
6. **If migration fails mid-deploy**, Vercel will roll back the code — but the DB won't roll back automatically. Know the manual rollback SQL before deploying.

### 21.5 Vercel Configuration

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm ci",
  "env": {
    "DATABASE_URL": "@database_url",
    "NEXTAUTH_SECRET": "@nextauth_secret",
    "IP_HASH_SALT": "@ip_hash_salt"
  }
}
```

---

## 22. ENVIRONMENT CONFIGURATION

### 22.1 All Environment Variables

```bash
# ────────────────────────────────────────────
# DATABASE
# ────────────────────────────────────────────
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# ────────────────────────────────────────────
# AUTH
# ────────────────────────────────────────────
NEXTAUTH_SECRET="minimum-32-character-random-string-here"
NEXTAUTH_URL="https://sunduza.vercel.app"   # localhost:3000 in dev

# ────────────────────────────────────────────
# ADMIN SEED (used once during prisma db seed)
# ────────────────────────────────────────────
ADMIN_EMAIL="xivutisokevinsunduza@gmail.com"
ADMIN_PASSWORD="ChangeThisAfterFirstLogin123!"

# ────────────────────────────────────────────
# SECURITY
# ────────────────────────────────────────────
IP_HASH_SALT="unique-random-string-for-ip-hashing"

# ────────────────────────────────────────────
# ADMIN NOTIFICATIONS (used by notification queue)
# ────────────────────────────────────────────
ADMIN_WHATSAPP_NUMBER="27867233640"  # Format: country code + number, no +

# ────────────────────────────────────────────
# ERROR TRACKING
# ────────────────────────────────────────────
SENTRY_DSN="https://xxx@yyy.ingest.sentry.io/zzz"
SENTRY_ORG="sunduza"
SENTRY_PROJECT="sunduza-web"

# ────────────────────────────────────────────
# MARKETING (NEXT_PUBLIC_ = visible in browser — intentional)
# ────────────────────────────────────────────
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
NEXT_PUBLIC_GTM_ID="GTM-XXXXXXX"
```

### 22.2 Startup Validation

```typescript
// src/server/config/env.ts
import 'server-only'
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL:             z.string().url('DATABASE_URL must be a valid URL'),
  NEXTAUTH_SECRET:          z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL:             z.string().url('NEXTAUTH_URL must be a valid URL'),
  IP_HASH_SALT:             z.string().min(16, 'IP_HASH_SALT must be at least 16 characters'),
  ADMIN_WHATSAPP_NUMBER:    z.string().regex(/^\d{10,15}$/, 'Invalid WhatsApp number format'),
  SENTRY_DSN:               z.string().url().optional(),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_GTM_ID:       z.string().optional(),
})

// This runs at module import time — if it throws, the server refuses to start
export const env = envSchema.parse(process.env)
```

If `DATABASE_URL` is missing in production, the app refuses to start entirely and logs a clear error message — rather than starting, serving pages, and crashing only when the first database call is made.

---

## 23. THE SOLO DEVELOPER'S LAWS

These are not guidelines. They are laws.

| Law | Rule | Why |
|---|---|---|
| I | Never push directly to `main` | One bad commit breaks the live client site |
| II | Never run `prisma migrate dev` outside your local machine | It creates migrations based on your current schema — environment matters |
| III | Never deploy a destructive migration on a Friday | No support available over the weekend |
| IV | Never write Prisma queries in API routes | They belong in repositories. Future you will thank you. |
| V | Never use raw SQL outside `lib/reports/` (v2) | ORM everywhere else — injection prevention |
| VI | Never store env variables as `NEXT_PUBLIC_*` unless intentionally public | Leaks to browser bundle |
| VII | Every new endpoint must have at least one test | Untested code breaks silently |
| VIII | One concern per branch | Mixed concerns = impossible rollback |
| IX | Run the self-review checklist before every merge | Catch your mistakes before your client does |
| X | Import from `@shared/` for types/schemas, `@client/` for frontend, `@server/` for backend | Cross-layer imports break the architecture |

### 23.1 Self-Review Checklist (Before Every PR Merge)

```
□ npm run lint          → zero errors
□ npm run type-check    → zero errors
□ npm run test          → all passing
□ npm run test:e2e      → critical paths passing
□ prisma migrate dev    → if schema changed
□ .env.example updated  → if new env var added
□ API contract updated  → if endpoints changed
□ Tested at 320px       → if any UI changed
□ server-only present   → if new server module added
□ No NEXT_PUBLIC_ leak  → if new env var added
□ PR description written → what, why, how to test
```

---

## 24. BUILD ORDER & SPRINTS

### 24.1 Dependency Map

```
Sprint 1 — Foundation (5 days)
  GitHub repo + branch structure
  Next.js + TypeScript strict + Tailwind + Prisma
  All 9 database tables created
  Migrations run and verified
  tsconfig path aliases
  Startup env validation
  server-only on all server modules
  Sentry installed
  Pre-commit hooks (Husky)
        │
        ▼
Sprint 2 — Core Layout + Auth (4 days)
  Public layout (navbar, footer, WhatsApp button)
  Admin layout (sidebar, header)
  Admin login page + NextAuth config
  Seeded admin user
  Security headers in next.config.js
  Health check endpoint
        │
        ▼
Sprint 3 — Public Pages (4 days)
  Homepage (hero, services preview, portfolio preview, testimonials, CTA)
  Services page (static)
  Projects page (ISR)
  Privacy policy page (static)
  JSON-LD structured data for local business
  SEO metadata per page
        │
        ▼
Sprint 4 — Lead Capture (5 days)
  Booking form with service-contextual prompts
  Booking API (POST) with full validation
  Contact form
  Contact API (POST)
  Rate limiting on both public endpoints
  POPIA consent checkbox
  UTM capture on booking
  Lead scoring on create
  Notification queue row on create
        │
        ▼
Sprint 5 — Admin Operations (5 days)
  Admin bookings page (table, filters, pagination)
  Booking detail modal (full data, status update, WhatsApp link)
  Admin projects page (CRUD)
  Admin messages page (read/unread)
  Admin settings page
  Admin dashboard (stats, funnel, high-priority leads)
        │
        ▼
Sprint 6 — Marketing + Analytics (2 days)
  Google Analytics 4 integration
  Google Tag Manager
  Conversion event tracking
  Cookie consent banner
        │
        ▼
Sprint 7 — Polish + Launch (4 days)
  Visual regression tests (320/375/390/768/1280px)
  Lighthouse audit → score > 90 mobile
  Accessibility audit (keyboard nav, ARIA labels, colour contrast)
  Bundle analysis
  Full E2E test run
  Staging validation on preview deployment
  UptimeRobot configured
  Client handover checklist
```

### 24.2 Sprint Summary

| Sprint | Duration | Deliverable |
|---|---|---|
| 1 — Foundation | 5 days | Repo, schema, environment, security foundation |
| 2 — Layout + Auth | 4 days | Admin login, public/admin layouts, health check |
| 3 — Public Pages | 4 days | Homepage, services, projects, SEO, privacy |
| 4 — Lead Capture | 5 days | Booking + contact forms, APIs, POPIA, UTM, scoring |
| 5 — Admin Operations | 5 days | Full admin dashboard — bookings, projects, messages, settings |
| 6 — Marketing | 2 days | GA4, GTM, conversion tracking, cookie consent |
| 7 — Polish + Launch | 4 days | Testing, performance, accessibility, deployment |
| **Total** | **~29 days** | **Production-ready system** |

---

## 25. SUCCESS CRITERIA

### 25.1 v1 Launch Criteria — All Must Pass

| # | Criterion | Verified By |
|---|---|---|
| 1 | Visitor can submit booking form and see success message | Manual + E2E test |
| 2 | Booking appears in admin dashboard with correct data | Manual test |
| 3 | POPIA consent is captured and stored on booking | Database verification |
| 4 | Admin can update booking status through all valid transitions | E2E test |
| 5 | Invalid status transition returns 409 with clear message | Integration test |
| 6 | Admin can add, edit, delete projects | Manual test |
| 7 | Projects page reflects changes without code deployment | ISR revalidation test |
| 8 | Visitor can send contact message — admin sees unread badge | Manual test |
| 9 | WhatsApp button opens with pre-filled message on every page | Manual test |
| 10 | Admin can update WhatsApp number in settings — button reflects new number | Manual test |
| 11 | Site works and looks correct at 320px, 375px, 390px, 768px, 1280px | Playwright visual |
| 12 | Lighthouse mobile score ≥ 90 | Lighthouse CI |
| 13 | Zero console errors on any public page | Browser console check |
| 14 | All CI tests passing on main branch | GitHub Actions |
| 15 | Sentry is receiving events in production | Sentry dashboard |
| 16 | UptimeRobot is monitoring health endpoint | UptimeRobot dashboard |
| 17 | Security headers present on all responses | securityheaders.com scan |
| 18 | GA4 receiving events on form submission | GA4 realtime dashboard |
| 19 | Lead scoring populates on every booking | Database verification |
| 20 | No raw IP addresses in database | Database verification |

### 25.2 Post-Launch Business Metrics

| Metric | Target | Measured By |
|---|---|---|
| Booking submissions / week | 5+ | Database count |
| Form completion rate | ≥ 70% | GA4 funnel |
| Mobile conversion rate | ≥ 2% | GA4 |
| Bounce rate | < 50% | GA4 |
| Admin response time (booking → CONTACTED) | < 24 hours | AuditLog average |
| Site uptime | ≥ 99.5% | UptimeRobot |

---

## 26. DESIGN DECISIONS LOG

| Decision | Chosen | Rejected | Reason |
|---|---|---|---|
| Frontend framework | Next.js App Router | Plain React, Remix | SEO required for Google Ads, API routes built-in, one deployment |
| Language | TypeScript strict | JavaScript | Layer-crossing mistakes caught at build time |
| Database | PostgreSQL (Neon) | SQLite, MongoDB | ACID, relational integrity, FK enforcement, production proven |
| ORM | Prisma 5 | Raw SQL, Drizzle, TypeORM | Type-safe, migrations automatic, schema = documentation |
| Auth | NextAuth.js v5 database sessions | JWT only, custom auth | Built for Next.js, HTTP-only cookies, session rotation built-in |
| Forms | React Hook Form + Zod | Native form, Formik | Validation parity FE/BE, performance, ref-based |
| Server state | TanStack Query 5 | Redux, SWR, Context | Caching, background updates, deduplication, less code |
| UI components | shadcn/ui | MUI, Chakra, Mantine | Owned code, no version conflicts, Tailwind-native |
| Deployment | Vercel | AWS, Render, Railway | Next.js native, preview deploys per PR, zero DevOps |
| Error tracking | Sentry (v1) | No error tracking | Free tier covers this volume, catches production issues before client reports them |
| Image strategy | Static `/public/images/` | Arbitrary external URLs, Cloudinary | External URLs break (404s in portfolio), v1 scope, Cloudinary is v2 |
| Booking statuses | 5 states | 3 states | Clear workflow: PENDING → CONTACTED → CONFIRMED → COMPLETED / REJECTED |
| Mobile testing | Playwright visual 320–1280px | Manual only | Automated, repeatable, regression-preventing |
| IP storage | SHA-256 hash + salt | Raw IP | POPIA compliance, privacy by design |
| Config storage | SiteSettings DB table | Hardcoded constants | Admin updates without developer involvement |
| Lead scoring | Calculated on create (0–100) | Manual prioritisation | Admin with 50 bookings needs priority signals without reading each one |
| Service prompts | Dynamic per service selection | Generic description field | Higher quality leads — relevant context for each service type |
| Error classes | Typed hierarchy (AppError → subtypes) | String error codes only | Catch specific errors, different handling per type, Sentry context |
| CORS policy | Same-origin only | Open CORS | No legitimate cross-origin use case in v1 |

---

## 27. FUTURE EXTENSION POINTS (v2+)

Every v2+ feature listed here can be added without modifying any existing code.

| Feature | Current State | What to Add | Effort |
|---|---|---|---|
| Email notifications | Notification rows created, `sent_at: null` | Background worker + Resend API | Medium |
| WhatsApp API automation | Notification rows created | Twilio/WATI API processor | Medium |
| Project image upload | Static file paths | Cloudinary upload endpoint + Admin UI change | Medium |
| Testimonial management UI | DB table seeded, no admin UI | CRUD in admin dashboard | Low |
| Company settings UI | SiteSettings table exists, basic UI | Expand settings page | Low |
| Multi-admin support | `role` field on User, single user seeded | Add user management, invite flow | Medium |
| Analytics dashboard | GA4 + booking data exists | Charts using recharts + existing queries | Medium |
| Blog / News | Not present | New module — MDX or DB-backed | High |
| Client portal | Not present | NextAuth for visitors, booking status tracker | High |
| Online payments | Not present | Stripe integration | High |
| Drag-and-drop project ordering | `sort_order` field exists | DnD library + PATCH endpoint | Low |
| A/B testing forms | Not present | Feature flag + variant tracking | Medium |
| Retargeting pixels | GTM configured | Add pixels in GTM console — no code change | Low |
| Data export | Not present | CSV export endpoint for bookings | Low |
| Hard delete / POPIA erasure tool | Soft delete exists | Admin action for hard delete by email | Low |
| Cron job for data retention | Documented policy | Vercel cron or pg_cron | Low |

---

## APPENDIX A — SiteSettings Seed Values

```typescript
// prisma/seed.ts — initial settings
const settings = [
  { key: 'whatsapp_number',  value: '27867233640',                      description: 'WhatsApp number for floating button and booking notifications' },
  { key: 'contact_email',    value: 'xivutisokevinsunduza@gmail.com',    description: 'Primary contact email shown on contact page' },
  { key: 'business_phone',   value: '0867233640',                        description: 'Business phone number shown on contact page' },
  { key: 'business_address', value: 'South Africa',                      description: 'Business address shown on contact page and footer' },
  { key: 'hero_tagline',     value: 'Designing Spaces That Inspire',     description: 'Main hero section headline' },
  { key: 'years_experience', value: '5',                                 description: 'Years of experience shown in stats bar' },
]
```

---

## APPENDIX B — Audit Action Reference

| Action | Who Triggers | Metadata Captured |
|---|---|---|
| `LOGIN_SUCCESS` | Admin | ip_address, user_agent |
| `LOGIN_FAILURE` | Anyone | ip_address, user_agent, email attempted |
| `LOGOUT` | Admin | — |
| `BOOKING_CREATE` | Visitor | service, lead_score, utm_source |
| `BOOKING_STATUS_UPDATE` | Admin | old_status, new_status |
| `BOOKING_DELETE` | Admin | booking_id, reason (optional) |
| `PROJECT_CREATE` | Admin | title, category |
| `PROJECT_UPDATE` | Admin | changed_fields, old_values, new_values |
| `PROJECT_DELETE` | Admin | project_id |
| `CONTACT_MESSAGE_CREATE` | Visitor | — (no PII in audit log) |
| `CONTACT_MESSAGE_READ` | Admin | — |
| `SETTINGS_UPDATE` | Admin | key, old_value, new_value |

---

## APPENDIX C — Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/your-username/sunduza.git
cd sunduza

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env.local
# Fill in all values in .env.local

# 4. Start local PostgreSQL (or use Neon dev branch)
# If local: createdb sunduza_dev

# 5. Run migrations
npx prisma migrate dev

# 6. Seed database
npx prisma db seed

# 7. Start development server
npm run dev

# 8. Open admin
# Navigate to http://localhost:3000/admin/login
# Use credentials from ADMIN_EMAIL + ADMIN_PASSWORD in .env.local
```

---

*Document Version: 2.0*
*Status: LOCKED — Ready for Build*
*Architecture: Production Grade · Industry Scalable · POPIA Compliant · Security First*

---

> The design is complete. The laws are set. The build can begin.
