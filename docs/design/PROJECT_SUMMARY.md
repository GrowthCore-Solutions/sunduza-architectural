# SUNDUZA ARCHITECTURAL & PROJECTS
## Complete Project Summary
### What It Is · What We Built · Where It Stands · What's Next

---

## WHO THIS IS FOR

**Xivutiso Kevin Sunduza** is a South African architectural
professional with 5+ years of experience. He designs houses,
produces architectural drawings, provides drafting services,
and plans development projects.

His problem was credibility. He was marketing on social media
but potential clients were not taking him seriously — not because
his work was poor, but because he had no professional web presence
to anchor his authority. No platform to show his past work. No
clean system to capture and manage the leads he was generating.

This system solves that.

---

## WHAT SUNDUZA IS

Sunduza Architectural & Projects is a **professional web platform**
built for one purpose: turn strangers into qualified consultation
bookings while making Kevin look like the serious, premium
architectural professional he already is.

It is not a website. A website is a brochure. This is an
operational system — it captures leads, scores them by value,
helps Kevin manage them through a pipeline, tracks where they
came from, and gives him the tools to run his business from
his phone without needing a developer for anything.

**In one sentence:**
A lead generation and portfolio management platform that converts
anonymous visitors into booked consultations, built to South African
legal standards, designed to scale from 50 to 5,000 leads without
rewriting a line.

---

## THE FOUR THINGS IT DOES

### 1. Makes Kevin Look Premium

The public-facing website showcases his 4 services with clear,
professional copy. His past projects are displayed in a polished
portfolio grid — categorised, filterable, and beautiful on every
screen size. Real client testimonials are shown. His years of
experience and project count are displayed as credibility signals.
The design language targets: Trust, Luxury, Premium, Authority.

A visitor who lands on this site from a Google Ad immediately
understands they are dealing with a professional.

### 2. Captures Leads Intelligently

The booking form is the heart of the system. It has 8 fields —
name, email, phone, service, location, description, preferred
meeting date, and budget. What makes it different from a generic
contact form:

- When a visitor selects a service, the description field
  placeholder changes dynamically to ask the right questions
  for that service. A house planning enquiry gets different
  prompts than a development project planning enquiry.
  Better prompts produce better leads.

- Every booking is automatically scored 0–100 based on service
  type, budget, whether a meeting date was provided, and
  description quality. Kevin never has to guess which of his
  10 pending bookings to call first — the score tells him.

- Every booking captures where the visitor came from — which
  Google Ad, which campaign, which keyword. This data feeds
  directly to Mponisi (Kevin's marketing person) to optimise
  ad spend.

- POPIA consent is captured on every submission — legally
  required in South Africa.

### 3. Gives Kevin a Professional Admin System

Kevin logs into a private admin dashboard. He sees:

- Today's bookings, pending leads, unread messages, high-priority
  leads — all as at-a-glance KPI cards
- A visual conversion pipeline: PENDING → CONTACTED →
  CONFIRMED → COMPLETED
- A bookings table sortable by lead score or date, filterable
  by status
- Full booking detail with one-tap WhatsApp link to the client
  (pre-filled with a greeting and their name)
- Project management — add, edit, delete portfolio items
- Contact message inbox with read/unread tracking
- Site settings — he can change his WhatsApp number, contact
  email, hero tagline, years of experience — all without
  calling a developer

### 4. Runs Marketing Attribution

Every booking knows its origin. A visitor clicks a Google Ad
for "architect Sandton", lands on the booking page, fills the
form — the system captures utm_source, utm_medium, utm_campaign,
utm_term, and the referring URL. When Mponisi reviews the month's
bookings, she can see exactly which campaigns produced the highest
value leads (by lead score) and which produced the most conversions.
She optimises. The advertising budget stops being a guess.

---

## THE TECHNICAL PICTURE

### Architecture

The system is built in five layers that never cross-contaminate:

```
Presentation    React components — render UI only
Application     Next.js API routes — coordinate requests
Domain          Use cases + repositories — all business logic
Data Access     Prisma ORM — all database queries
Database        PostgreSQL on Neon — enforces every constraint
```

Every layer talks only to the layer directly below it.
The frontend never touches the database. The database never
knows about HTTP. A change in any one layer does not ripple
into the others.

### Technology

| What | How |
|---|---|
| Framework | Next.js 14 App Router — one codebase, one deployment |
| Language | TypeScript strict mode — bugs caught at build, not runtime |
| Database | PostgreSQL 15 on Neon — ACID, serverless, branch per PR |
| ORM | Prisma 5 — type-safe queries, automatic migrations |
| Auth | NextAuth.js v5 — HTTP-only session cookies |
| Styling | Tailwind CSS + shadcn/ui — owned components, no conflicts |
| State | TanStack Query — caching, background updates |
| Deployment | Vercel — preview per PR, auto-deploy on merge to main |
| Errors | Sentry — production error capture, free tier |
| Monitoring | UptimeRobot — health check every 5 minutes |
| Analytics | Google Analytics 4 + Google Tag Manager |

### File Structure — Three Clear Domains

```
src/
├── app/         Next.js routing only — no logic
├── client/      Frontend exclusively — never imports server code
│   ├── components/
│   ├── hooks/
│   └── services/
├── server/      Backend exclusively — server-only guard on every file
│   ├── db/
│   ├── repositories/
│   ├── use-cases/
│   ├── middleware/
│   └── errors/
└── shared/      Safe for both — types, Zod schemas, constants
```

The `server-only` package on every server module means if a
frontend component accidentally imports a database file, the
build crashes immediately with a clear error. The database
connection never reaches the browser bundle.

---

## THE DATABASE

### 9 Tables — All in BCNF

| Table | Purpose |
|---|---|
| User | Single admin account — authentication identity |
| Session | NextAuth database sessions — one per device |
| Booking | Core lead entity — every consultation request |
| Project | Portfolio items — managed by admin |
| Testimonial | Client reviews — linked or standalone |
| ContactMessage | General inquiries — separate from bookings |
| SiteSettings | Runtime config — WhatsApp number, email, tagline |
| Notification | v2-ready outbox queue — notifications to send |
| AuditLog | Immutable event log — every admin and system action |

### Relationships

```
User        → Session         1:N   CASCADE on delete
User        → AuditLog        1:N   SET NULL on delete
User        → SiteSettings    1:N   SET NULL on delete
Project     → Testimonial     1:N   SET NULL on delete

Booking         — no foreign keys — island entity
ContactMessage  — no foreign keys — island entity
Notification    — no foreign keys — outbox pattern
AuditLog        — polymorphic entity reference, not typed FK
```

Zero many-to-many relationships. Zero junction tables needed.

### Key Design Decisions

**Booking is an island.** No FK to User, no FK to Project.
Bookings are anonymous — visitors don't have accounts.
A booking captures a moment in time and is self-contained.

**lead_score is stored.** It is calculated once on creation
from service type, budget, meeting date, and description length.
Stored so old scores don't change if the algorithm changes.

**AuditLog never has updated_at or deleted_at.** It is
write-once by design. The audit trail is permanent.

**SiteSettings uses key-value pairs.** Bounded, documented,
type-safe at the application layer. Admin changes them through
the UI — no deployment needed.

---

## THE API

### 18 Endpoints

| Access | Count | Endpoints |
|---|---|---|
| Public | 6 | Health check, login, create booking, list projects, create contact message, get settings |
| Admin | 12 | Logout, all booking management, all project management, all message management, update settings |

### Standard Envelope

Every response — success or error — looks the same:
```json
{ "success": true/false, "data": {}, "error": null/{} }
```

The frontend always checks `success` before reading `data`.

### Rate Limiting

```
Login endpoint:      10 requests / 15 minutes
Create booking:       5 requests / 1 hour
Create message:       3 requests / 1 hour
```

### Security

- All admin endpoints protected by dual-layer auth:
  edge middleware + server component session check
- Mass assignment protection: public endpoints cannot
  inject `status`, `lead_score`, or `deleted_at`
- Every IP address hashed (SHA-256 + salt) before storage
- Security headers on every response (CSP, X-Frame-Options,
  HSTS, etc.)
- Account lockout after 10 failed login attempts
- Honeypot field on booking form to catch bots silently

---

## THE FRONTEND — 32 COMPONENTS

### Public Pages

| Page | Rendering | Key Components |
|---|---|---|
| Homepage | ISR 60s | Hero, ServicesPreview, PortfolioPreview, Testimonials, StatsBar, CTA |
| Services | Static | ServicesPreview, CTA |
| Projects | ISR 300s | ProjectFilter, ProjectGrid, ProjectCard |
| Booking | Client-side | BookingForm, BookingSuccess |
| Contact | Static | ContactForm, ContactInfo |
| Privacy | Static | Legal text — POPIA required |

### Admin Pages

| Page | Key Components |
|---|---|
| Dashboard | DashboardStats, ConversionFunnel |
| Bookings | BookingsTable, BookingDetailModal, BookingStatusBadge, LeadScoreBadge |
| Projects | ProjectsManager, ProjectFormModal |
| Messages | MessagesTable |
| Settings | SettingsForm |

### Every Component Has

- Loading state (skeletons — no blank screens)
- Error state (message + recovery action)
- Empty state (helpful message — no missing UI)
- Typed props (TypeScript — no runtime surprises)

---

## LEGAL & COMPLIANCE

The system is built for South Africa. POPIA (Protection of
Personal Information Act) compliance is built in, not bolted on.

- Consent checkbox on booking form — required field, `z.literal(true)`
- `consent_given` and `consent_given_at` stored on every booking
- Privacy policy page at `/privacy` — linked in footer
- Cookie consent banner — blocks GA4/GTM until visitor accepts
- IP addresses hashed — never stored raw
- No PII in audit logs
- Data retention policy: 2 years for completed/rejected bookings
- Admin can hard-delete a person's data on written request (POPIA right to erasure)

---

## MARKETING INTEGRATION

Every booking captures the full marketing context:

```
utm_source      Which platform  (google, facebook, instagram)
utm_medium      Which channel   (cpc, organic, social)
utm_campaign    Which campaign  (jhb_architects_2024)
utm_term        Which keyword   (architect+sandton)
utm_content     Which ad        (hero_cta_button)
referrer_url    Where from      (google.co.za)
landing_page    Which page      (/booking?utm_source=google)
```

GA4 tracks:
- Every page view
- Booking form start, submit, success, error
- WhatsApp button clicks
- Project views
- Contact form submissions

GTM manages all conversion pixels — Mponisi can add Facebook
or TikTok pixels without any developer involvement.

---

## WHAT WE DECIDED NOT TO BUILD (v1)

These were considered and explicitly deferred:

| Feature | Why Deferred | When |
|---|---|---|
| Visitor accounts | Anonymous booking is simpler and sufficient | v2 |
| Email notifications | Resend API setup deferred | v2 |
| WhatsApp API automation | Twilio/WATI setup deferred | v2 |
| File uploads | Cloudinary setup deferred | v2 |
| Built-in analytics dashboard | GA4 external tool sufficient | v2 |
| Blog / News | Not requested | v2 |
| Multi-admin | Single owner | v2 |
| Client portal | Not requested | v3 |
| Online payments | Not requested | v3 |

Every v2 feature is structurally prepared for in the v1 schema.
The Notification table exists — v2 just processes it.
The `role` field on User exists — v2 just adds more roles.
No rewrites. Extensions only.

---

## PENDING BEFORE BUILD

Ten things were flagged in the pre-build review.
All accepted. Awaiting one more input from Kevin's side
before documents are updated. After that input is received
and reviewed, these will be incorporated:

1. Image strategy decision — directory picker vs Cloudinary now
2. Cookie consent design — conditional GA4 loading
3. Real testimonials — collected from Kevin's past clients
4. Honeypot field — added to booking schema and form spec
5. Mobile admin experience — 5 key actions specced for 390px
6. 404 and loading pages — added to Sprint 2 scope
7. Error boundaries — `error.tsx` files added to Sprint 2
8. CSV export — added to Sprint 5 scope
9. Admin settings input masks — helper text for non-technical user
10. Kevin's Google Analytics account — confirmed and set up

---

## THE BUILD PLAN

7 sprints. Approximately 29 days solo.

| Sprint | Days | What Gets Built |
|---|---|---|
| 1 — Foundation | 5 | Repo, Next.js, TypeScript, Prisma, all 9 tables, env validation, security, pre-commit hooks, Sentry |
| 2 — Layout + Auth | 4 | Navbar, footer, WhatsApp button, admin sidebar, admin login, health check, 404, loading, error pages |
| 3 — Public Pages | 4 | Homepage, Services, Projects, Privacy — SEO metadata, JSON-LD, ISR |
| 4 — Lead Capture | 5 | Booking form + API, contact form + API, rate limiting, POPIA consent, UTM capture, lead scoring |
| 5 — Admin Operations | 5 | Full admin dashboard — bookings, projects, messages, settings, CSV export |
| 6 — Marketing | 2 | GA4, GTM, conversion events, cookie consent |
| 7 — Polish + Launch | 4 | Visual regression 320–1280px, Lighthouse ≥90, accessibility audit, bundle analysis, staging validation |

---

## 20 LAUNCH CRITERIA

The site does not go live until every one of these passes:

1. Visitor submits booking — success message shown
2. Booking appears in admin with correct data
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

## WHAT MAKES THIS DIFFERENT

Most architectural firm websites in South Africa are static
brochures. This is an operational system. The differences:

**Lead scoring** — 50 pending bookings is overwhelming without
priority signals. The score tells Kevin who to call first.

**Service-specific prompts** — "Tell us about your project" is
generic. "Describe your plot size, number of rooms, and preferred
style" produces a lead Kevin can actually act on.

**Marketing attribution** — most firms know they spent R5,000
on Google Ads. This system tells Kevin which campaign produced
the R2M development project planning enquiry.

**WhatsApp as first-class channel** — South African businesses
live on WhatsApp. The booking detail shows the client's number
as a direct WhatsApp link, pre-filled with their name and service.
One tap. No copy-pasting.

**Admin without a developer** — Kevin changes his phone number,
his tagline, his WhatsApp number through the admin settings page.
No calls to a developer. No deployments. He owns his own system.

**Built to grow** — v2 features (email notifications, WhatsApp
automation, analytics dashboard, multi-admin) are structurally
prepared for in the v1 schema. No rewrites. The system extends.

---

## DOCUMENT INVENTORY

Six design documents produced before a single line of code:

| Document | Purpose |
|---|---|
| System Design (2,743 lines) | Architecture, tech stack, file structure, security, deployment, laws |
| ERD Analysis (~1,009 lines) | 9 entities examined, 4 relationships, zero M:N confirmed |
| Normalization (~800 lines) | All 9 entities through BCNF, 7 denormalizations documented |
| Physical Schema (~700 lines) | DDL, 25 indexes, 10 CHECK constraints, seed data |
| API Design (~900 lines) | All 18 endpoints with request/response/error examples |
| Component Architecture (~900 lines) | All 32 components with props, state, rules, GA4 events |

**Total: ~7,000 lines of design before the first line of production code.**

This is what separates a system that survives 2 years from one
that gets rewritten after 6 months.

---

*Summary Version: 1.0*
*Status: Design complete · Pending one client input · Ready for build after update pass*
*System: Sunduza Architectural & Projects · South Africa · POPIA Compliant*
