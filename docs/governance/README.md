# Governance

Sunduza-specific governance: why the system exists, the stack decision, and the
standards the codebase holds itself to. (The generic multi-client engineering
framework that used to live in `system-design-template/` has been removed from
this product repo — it belonged in its own repo and referenced unrelated
clients.)

| Document | Purpose |
|----------|---------|
| [SYSTEM_CONTEXT.md](./SYSTEM_CONTEXT.md) | Problem, workflow, POPIA constraints, special design rules, launch criteria |
| [ADR-001-nextjs-postgres-stack.md](./ADR-001-nextjs-postgres-stack.md) | The stack decision and alternatives considered |

## Engineering standards (where they live now)

The standards the original framework enumerated are embodied directly in the
codebase and these docs:

| Standard area | Documented in |
|---------------|---------------|
| Layering — UI → API → service → repository → DB | [../design/DATA_ACCESS.md](../design/DATA_ACCESS.md) |
| Data model, soft delete, money-as-cents | [../design/ERD.md](../design/ERD.md), [../design/NORMALIZATION.md](../design/NORMALIZATION.md) |
| Security, auth, CSRF, rate limiting | [../ARCHITECTURE.md](../ARCHITECTURE.md), [../requirements/NON_FUNCTIONAL_REQUIREMENTS.md](../requirements/NON_FUNCTIONAL_REQUIREMENTS.md) |
| What the system must do | [../requirements/FUNCTIONAL_REQUIREMENTS.md](../requirements/FUNCTIONAL_REQUIREMENTS.md) |
| Product lock-in decisions | [../design/LOCKED_DESIGN.md](../design/LOCKED_DESIGN.md) |
