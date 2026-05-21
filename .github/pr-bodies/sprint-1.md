## Summary

Implements **Sprint 1 — Public site frontend** on top of Sprint 0 (`#13`).

- Public React Query hooks: `useProjects`, `useProject`, `useTestimonials`
- All public routes render real content (home, services, projects, testimonials, contact, booking, privacy)
- Shared `<FormField>` and booking/contact forms wired to existing APIs
- Route conventions: `loading.tsx` and `not-found.tsx` where appropriate

## Depends on

- #13 — Sprint 0 backend foundations (merged to `Dev`)

## Test plan

- [ ] `npm run build` passes
- [ ] `/`, `/services`, `/projects`, `/projects/[id]`, `/testimonials` render content
- [ ] `/contact` and `/booking` forms submit successfully (requires `.env.local` + DB)
- [ ] `/privacy` renders POPIA copy

## Merge note

Merge **before** Sprint 2–4 PRs. Target branch: **`Dev`** (not `main`).
