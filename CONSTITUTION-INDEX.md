# CONSTITUTION-INDEX — Sunduza Architectural & Projects

> **This file is required in this workspace before any Claude Code (Cursor) build session begins.**
> **Per S10.21 — load this file into Cursor context at the start of every session.**
> **Per S10.23 — update this file at the start of every sprint.**

---

| Attribute        | Value |
|------------------|-------|
| **System**       | Sunduza Architectural & Projects |
| **Client**       | Xivutiso Kevin Sunduza |
| **Stack**        | Next.js 16 (App Router), React 19, TypeScript |
| **Build Phase**  | Phase 3 — Release readiness (Sprints 0–4 complete on `Dev`) |
| **Active Group** | G3 — Integration, staging, production |
| **Operating Mode** | SOLO |
| **Overlay**      | `system-design-template/overlays/solo-dev-overlay.md` |
| **Last Updated** | 2026-05-21 |
| **Sprint**       | Sprints 0–4 merged to `Dev` — see `docs/INTEGRATION_STATUS.md` |

---

## Governance Files (Read Before Every Session)

| File | When |
|------|------|
| `system-design-template/AI-INSTRUCTIONS.md` | Every session — first |
| `system-design-template/system-contexts/sunduza-context.md` | Every build session |
| `system-design-template/overlays/solo-dev-overlay.md` | Every session — operating mode is SOLO |
| **`design-docs/SUNDUZA_LOCKED_DESIGN.md`** | **Every build session — authoritative product spec** |
| `design-docs/SUNDUZA_API_DESIGN.md` | API contract details |
| `design-docs/SUNDUZA_PHYSICAL_SCHEMA.md` | Database schema details |
| `redesign/SUNDUZA_BUILD_PLAN_v2.md` | Sprint history, §14 production checklist |
| `redesign/SUNDUZA_SYSTEM_REDESIGN.md` | Layer contracts, debugging |
| `docs/deployment.md` | Staging / production deploy |
| `docs/INTEGRATION_STATUS.md` | Current verification status on `Dev` |

---

## Active Feature — Release Readiness

**Feature:** Staging verification → controlled `Dev` → `main` releases
**Goal:** Pass build plan §14 checklist on staging; prove booking/contact email path; keep `main` stable until founder sign-off.
**Branch:** `Dev` (integration); release PRs target `main` when ready.
**Merged PRs:** #13 (S0), #14 (S1), #15 (S2), #16 (S3), #17 (S4)

---

## Sprint Delivery Log (Dev)

| Sprint | Scope | PR | Status |
|--------|--------|-----|--------|
| 0 | `server/`, API fixes, audit, notifications, soft-delete | #13 | ✅ Merged |
| 1 | Public site (7 pages + privacy), hooks, FormField | #14 | ✅ Merged |
| 2 | Admin dashboard (6 sections), mobile sidebar | #15 | ✅ Merged |
| 3 | Upstash, Resend, notify cron, deploy docs | #16 | ✅ Merged |
| 4 | Vitest, Playwright, OG metadata, Sentry (optional) | #17 | ✅ Merged |

---

## Resolved (formerly open)

| Issue | Resolution |
|-------|------------|
| JWT session strategy | ✅ `lib/auth.ts` — `strategy: "database"` |
| SQLite in production | ✅ `prisma/schema.prisma` — PostgreSQL |
| Schema gap (9 tables) | ✅ Full schema + migrations |
| No `server/` layer | ✅ `server/*.ts` with `server-only` |
| No `POST /api/contact` | ✅ Implemented |
| Audit / notification writes | ✅ Wired in Sprint 0 |
| Public/admin pages stubbed | ✅ Sprints 1–2 |

---

## Open Issues — Requires Founder Attention

| Issue | Type | Status | Notes |
|-------|------|--------|-------|
| API routes use `/api/*` not `/api/v1/*` (except health) | `S2.76` | 🟡 Decision | Health at `/api/v1/health`; versioning TBD |
| Image strategy — local vs Cloudinary | Content | 🟡 Open | Client input |
| Real testimonials in production | Content | 🟡 Open | Replace seed placeholders |
| Kevin's GA4 property ID | Config | 🟡 Open | Not in v1 build |
| API integration + admin E2E tests | Testing | 🟡 Partial | Unit tests only; see build plan #57–#64 |
| Per-page SEO + Lighthouse ≥85 | Polish | 🟡 Partial | Root OG done; page-level metadata TBD |
| CI pipeline | DevOps | 🟡 Open | Not configured |
| `Dev` → `main` release | Release | 🟡 Pending | After §14 + staging proof |

---

## Target Architecture (current)

```
src/client/  → hooks + UI (browser only)
app/api/     → thin handlers → server/
server/      → business logic (server-only)
types/       → Zod + inferred types
lib/         → db, auth, rate-limit, email, env, api-response
prisma/      → PostgreSQL schema, migrations, seed.ts, seed.prod.ts
tests/       → unit (Vitest) + e2e (Playwright)
```

---

## Relay Status

| Step | Engineer | Status | Notes |
|------|----------|--------|-------|
| Design (Phase 0) | Claude | ✅ Complete | `design-docs/` |
| Build Sprints 0–4 | Cursor | ✅ Complete | Merged to `Dev` |
| Integration / staging | Founder + Cursor | 🟡 In progress | `docs/INTEGRATION_STATUS.md` |
| `Dev` → `main` release | Founder | ⬜ Pending | Not started |
| Debug/Style | ChatGPT | ⬜ Optional | Post-staging |

---

> *Update this file at the start of every sprint and every session.*
> *Per S10.21 — Claude Code does not begin a build session without this file loaded in Cursor.*
> *Per S10.23 — A stale index is equivalent to no index.*
