# System Context — Sunduza Architectural & Projects

> Migrated and corrected to v1 reality from the former multi-client design
> template. This is the authoritative "why" behind the build.

| Attribute | Value |
|-----------|-------|
| System | Sunduza Architectural & Projects platform |
| Client | Xivutiso Kevin Sunduza — South African architectural professional |
| Stack | Next.js 16 (App Router) · PostgreSQL/Prisma · Vercel |
| Jurisdiction | South Africa — **POPIA** compliant |
| Operating mode | Solo developer, single-admin system |

## Problem statement

Kevin generates leads through social media and Google Ads but lacked a
professional platform to anchor his authority. No portfolio showcase, no lead
capture, no way to manage consultation requests beyond manual WhatsApp. The
platform turns ad/organic traffic into **booked, scored, tracked consultations**
he can run from his phone.

## Primary workflow

> Visitor lands from a Google Ad → views services & portfolio → submits the
> booking form → booking is scored and queued → Kevin reviews it in the admin
> dashboard → advances its status → follows up (WhatsApp-first).

## What "v1 done" means

A visitor can submit a consultation booking from any device (320px–1280px);
Kevin sees it in the admin dashboard with its lead score, advances it through the
pipeline, and a full audit trail is captured — live on Vercel with PostgreSQL on
Neon.

## System type

A **lead-generation + portfolio-management + admin-operations** platform — an
operational system, not a brochure site. Every decision is judged on whether it
converts visitors into booked consultations and lets Kevin run the business
without a developer.

## POPIA — non-negotiable constraints

- Explicit, timestamped consent on **every** booking (`consent_given`,
  `consent_given_at`); a booking without consent is invalid.
- Published privacy policy at `/privacy`, linked in the footer.
- Data minimisation; soft delete with an erasure path for written requests.
- No PII in audit logs.

## Special design constraints

- **Lead scoring** on every booking — a materialised computed value on
  `bookings.lead_score` (justified denormalization; see
  [../design/NORMALIZATION.md](../design/NORMALIZATION.md)).
- **UTM capture** on every booking (5 dimensions + referrer + landing page).
- **WhatsApp as a first-class channel** — a floating action across the public
  site, driven by a runtime setting.
- **Runtime config** via `site_settings` — Kevin edits WhatsApp number, hero
  tagline, stats and contact email through the admin UI, no redeploy.
- **Mobile-first at 320px** — the primary device class, not an afterthought.

## v1 reality notes (where the build refined the original design)

- **Auth: JWT sessions, not database sessions.** The original design mandated
  NextAuth database sessions. Auth.js v5's Credentials provider cannot create DB
  sessions, so v1 uses JWT sessions (PR #60). The `sessions`/`accounts` tables
  remain as adapter scaffolding for future OAuth. See
  [../ARCHITECTURE.md](../ARCHITECTURE.md).
- **Data model is larger than the original "9 tables".** v1 ships 15 models —
  the original 9 plus `Lead`, `Service`, `Tag`/`ProjectTag`, `Attachment`,
  `Account`, `VerificationToken`. See [../design/ERD.md](../design/ERD.md).
- **Layering uses a dedicated repository layer** (`src/backend/repositories`) as
  the single Prisma boundary. See [../design/DATA_ACCESS.md](../design/DATA_ACCESS.md).

## Launch criteria (abridged)

Booking submit → success; appears in admin with correct data + lead score; POPIA
consent stored; valid status transitions enforced (invalid rejected); project
CRUD reflected on the public site; contact messages show unread; WhatsApp action
on every public page; correct at 320–1280px; no console errors; CI green; Sentry
live; security headers present in production. Full list tracked in
[../PRODUCTION_CHECKLIST.md](../PRODUCTION_CHECKLIST.md).
