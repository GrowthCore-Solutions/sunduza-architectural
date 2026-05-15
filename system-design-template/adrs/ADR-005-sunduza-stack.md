# ADR-005 — Sunduza Architectural & Projects: Next.js Stack Assignment

---

| Attribute      | Value |
|----------------|-------|
| **ID**         | ADR-005 |
| **Date**       | 2026-05-15 |
| **Status**     | accepted |
| **Supersedes** | — |
| **Relates To** | `S6.1` (SEO-critical / content-driven), `S3.5` (Next.js database sessions), `S5.1` (PostgreSQL for relational data) |

---

## Context

Sunduza Architectural & Projects is a South African lead-generation and portfolio management platform for an architectural professional. The system must:

1. **SEO and Google Ads discoverability** — The client runs Google Ad campaigns targeting keywords like "architect Sandton", "house planning South Africa". Visitors land from paid ads on specific pages. ISR/SSR ensures every page is Google-indexable and ad-landing-page ready. This is a primary revenue driver — not an optimisation.

2. **Content-driven public pages** — Services, portfolio (projects), and testimonials are publicly readable without authentication. They are also the primary trust-building content. Next.js App Router ISR handles cached, fast, SEO-ready content natively.

3. **South African mobile-first market** — Kevin manages bookings from his phone. Visitors browse and book from mobile. The `320px` viewport baseline (`S4.2`) is non-aspirational — it is the primary device class. Next.js image optimisation, static generation, and minimal JS bundle fit this constraint.

4. **Simple relational data model** — 9 tables, 4 FK relationships, 0 M:N. All data is relational. No document store, no vector embeddings, no AI pipeline. PostgreSQL via Prisma (`S5.9`) is sufficient. A dedicated Python backend is unjustified.

5. **POPIA compliance required** — South African data privacy law requires consent capture, audit logging, soft delete with erasure capability, and IP address hashing. These are all handled within the Next.js + PostgreSQL architecture without additional infrastructure.

6. **Unified full-stack codebase** — NextAuth, API routes, React frontend, and Prisma ORM in one Vercel deployment minimises operational surface for a solo developer. No second Railway service to manage.

7. **Marketing attribution** — Every booking must capture UTM parameters, referrer, and landing page. Next.js middleware and server components handle this natively alongside the booking API route.

---

## Decision

**Sunduza Architectural & Projects is assigned to the Next.js stack.**

Next.js App Router with ISR/SSR handles the SEO, Google Ads landing page, and content-driven requirements natively. NextAuth v5 with database sessions (`S3.5`) satisfies the security requirement. PostgreSQL via Prisma is the only database — no MongoDB, no ChromaDB, no SQLite in production. The unified Vercel deployment is the correct operational choice for a solo developer serving a single-admin system.

This decision is immutable for the v1 lifetime of Sunduza Architectural & Projects.

---

## Consequences

### What becomes easier

- Google Ads + SEO handled natively — ISR at 60s (homepage) and 300s (projects) caches pages without blocking new bookings
- Vercel deployment: one project, zero backend infrastructure, preview per PR
- NextAuth database sessions: instant revocation, device logout, account lockout enforcement (`S3.5`)
- POPIA compliance: all data handling within one PostgreSQL instance — no cross-database integrity issues
- WhatsApp integration: single env var (`site_settings.whatsapp_number`) drives floating button across entire site
- Solo developer operational footprint: one codebase, one deployment, one platform

### What becomes harder

- Complex form state (8-field booking form with dynamic prompts) requires careful React Hook Form + Zod architecture vs Angular Reactive Forms
- Raw SQL required for UTM attribution analytics and lead score aggregation — Prisma query API is insufficient for complex GROUP BY + window functions (`S5.19`)
- If AI features are added in v3, a FastAPI service would need an ADR amendment — Python ecosystem not available in this stack

### Constitutional alignment

- `S6.1` — SEO-critical criteria met: portfolio content, Google Ads landing pages, local search discoverability
- `S3.5` — Next.js NextAuth database sessions: sessions stored in PostgreSQL, instantly revocable
- `S5.1` — All data is relational. PostgreSQL is the only database. No MongoDB, no ChromaDB.
- `S5.4` — Auth data (sessions) in PostgreSQL — same instance as business data
- `S4.2` — 320px mobile-first for South African market
- `S9.5` — South African context: WhatsApp-first, mobile-primary, Google Ads attribution required
- `C0 §10` — Stack assignment registered

---

## Alternatives Considered

| Option | Why Rejected |
|--------|-------------|
| Angular + FastAPI | No SEO without Angular Universal (additional complexity + deployment overhead). No AI, financial precision, or document store requirements that justify two-deployment architecture. Google Ads and organic SEO are primary traffic sources — SSR/ISR is mandatory, not optional. |
| Next.js + separate FastAPI | No Python requirements at v1. A Railway service for a solo-admin system with simple relational data adds infrastructure cost and complexity with no benefit. |
| Next.js + SQLite (keep existing) | SQLite is not viable for production (`S5.5`). No concurrent write safety. No PostgreSQL ENUM types, partial indexes, JSONB, or triggers. Neon serverless PostgreSQL has the same zero-ops footprint as SQLite with full PostgreSQL capabilities. |
| Raw PostgreSQL without ORM | Prisma provides type-safe queries, automatic migrations, and `@updatedAt` — reducing manual boilerplate significantly. Raw SQL is used selectively for complex aggregates (`S5.19`), not as the primary data access pattern. |

---

## Approved Deviations

| Standard | Deviation | Approved Alternative |
|----------|-----------|---------------------|
| `S3.5a` violation (current) | Current `lib/auth.ts` uses `strategy: 'jwt'` | **Sprint 1 remediation required** — must migrate to `strategy: 'database'` + Session model in Prisma schema before any protected routes are built |

**Special requirement documented here (not a deviation — a design constraint):**
- Lighthouse mobile score target is **≥ 90** for Sunduza (above the constitutional minimum of 80 per `S4.69`) — this is a launch criterion, not aspirational.
- Lead score must be stored as a materialised computed value on `bookings.lead_score` — justified denormalization for performance and historical stability (see `design-docs/SUNDUZA_NORMALIZATION.md` §Entity 3).
- POPIA compliance is treated as a Crown Jewel constraint (`S9.5`). Any feature that touches PII must pass POPIA review before merge.

---

> **Status: accepted — 2026-05-15**
> *Owner approval: Maluleke Kurhula Success*
