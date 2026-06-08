# ADR-001 — Next.js + PostgreSQL stack

| Attribute | Value |
|-----------|-------|
| Status | Accepted |
| Date | 2026-05-15 (migrated into the repo 2026-06) |
| Owner | Maluleke Kurhula Success |

> Migrated from the former multi-client template (was ADR-005). Renumbered to
> ADR-001 as the first ADR in this repo's own sequence.

## Context

Sunduza is a South African lead-generation and portfolio platform for an
architectural professional. Decisive forces:

1. **SEO + Google Ads** are a primary revenue driver — every page must be
   indexable and ad-landing ready (SSR/ISR), not an optimisation.
2. **Content-driven public pages** (services, portfolio, testimonials) are the
   trust-building surface and must be fast and cached.
3. **Mobile-first (320px)** — the owner runs the business from his phone; visitors
   browse and book from mobile.
4. **Simple relational model** — all data is relational; no document store,
   vectors, or AI pipeline.
5. **POPIA** — consent capture, audit logging, soft delete with erasure.
6. **Solo-operator footprint** — one codebase, one deployment.
7. **Marketing attribution** — UTM/referrer/landing capture on every booking.

## Decision

**Adopt the Next.js (App Router) + PostgreSQL/Prisma stack on a single Vercel
deployment.** NextAuth (Auth.js) v5 for auth; Tailwind + a semantic CSS layer;
React Hook Form + Zod; TanStack Query + Zustand; Sentry for error capture. This
is immutable for the v1 lifetime.

## Consequences

**Easier:** native SEO/ISR for ad landing pages; one Vercel project with
preview-per-PR; POPIA-relevant data all in one PostgreSQL instance; WhatsApp
driven by a single runtime setting; minimal operational surface for a solo dev.

**Harder:** complex booking-form state needs careful RHF + Zod design; complex
attribution analytics may need selective raw SQL; adding a Python AI service
later would require a new ADR.

## Alternatives considered

| Option | Why rejected |
|--------|--------------|
| Angular + FastAPI | No native SEO without Angular Universal; two-deployment overhead unjustified for a simple relational, solo-admin system. |
| Next.js + separate FastAPI | No Python requirement at v1; extra infra cost with no benefit. |
| SQLite | Not production-viable (no concurrent-write safety, no PostgreSQL enums/partial indexes/JSONB). Neon gives the same zero-ops footprint with full PostgreSQL. |
| Raw SQL without an ORM | Prisma gives type-safe queries + migrations; raw SQL is used only for complex aggregates. |

## Superseded constraint

The original ADR mandated `strategy: "database"` (NextAuth DB sessions) and
flagged the then-current JWT setting as "Sprint-1 remediation required." v1
**reverses** this: Auth.js v5's Credentials provider cannot create DB sessions,
so **JWT sessions are the accepted approach** (PR #60). The decision to use
PostgreSQL/Prisma/Vercel/Next.js is unchanged. See
[../ARCHITECTURE.md](../ARCHITECTURE.md) for the auth model.
