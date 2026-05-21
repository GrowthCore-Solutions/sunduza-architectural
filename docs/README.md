# Sunduza documentation

Maintained project documentation lives here. Governance and agent rules stay at the repo root (`CONSTITUTION-INDEX.md`, `AGENTS.md`).

## Operations (start here)

| Document | Purpose |
|----------|---------|
| [LOCAL_SETUP.md](./LOCAL_SETUP.md) | `.env.local`, PostgreSQL, migrate, seed, dev server |
| [deployment.md](./deployment.md) | Vercel, Neon/Railway, cron, production env |
| [INTEGRATION_STATUS.md](./INTEGRATION_STATUS.md) | What is verified on `Dev` and manual staging checks |
| [INTEGRATION_CHECK.md](./INTEGRATION_CHECK.md) | Layer-by-layer integration checklist (frontend / API / DB) |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Current stack layout, auth, `proxy.ts`, env loading |
| [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) | Pre–go-live checklist before `Dev` → `main` |

## Product & design specs

Authoritative pre-build specs (historical names preserved in headings):

| Document | Purpose |
|----------|---------|
| [design/LOCKED_DESIGN.md](./design/LOCKED_DESIGN.md) | Locked product decisions and constitutional alignment |
| [design/API_DESIGN.md](./design/API_DESIGN.md) | API contracts and endpoint behaviour |
| [design/PHYSICAL_SCHEMA.md](./design/PHYSICAL_SCHEMA.md) | DDL, indexes, constraints |
| [design/NORMALIZATION.md](./design/NORMALIZATION.md) | BCNF analysis and denormalizations |
| [design/SYSTEM_DESIGN.md](./design/SYSTEM_DESIGN.md) | Full system design reference |
| [design/ERD_ANALYSIS.md](./design/ERD_ANALYSIS.md) | Entity relationships |
| [design/COMPONENT_ARCHITECTURE.md](./design/COMPONENT_ARCHITECTURE.md) | Frontend component tree and rules |
| [design/UI_STYLING.md](./design/UI_STYLING.md) | Tailwind tokens + semantic CSS layer (surfaces, typography, admin) |
| [design/PROJECT_SUMMARY.md](./design/PROJECT_SUMMARY.md) | Founder-facing project overview |

## Outside `docs/`

| Path | Purpose |
|------|---------|
| `../README.md` | Repo entry: stack, routes, quick start |
| `../CONSTITUTION-INDEX.md` | Sprint governance (required for AI build sessions) |
| `../system-design-template/` | KSDRILL constitutional framework (shared template) |
