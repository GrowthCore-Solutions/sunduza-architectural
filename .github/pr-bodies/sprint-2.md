## Summary

Implements **Sprint 2 — Admin dashboard frontend**.

- Admin React Query hooks (bookings, projects, testimonials, messages, settings)
- `AdminShell` with mobile sidebar (Zustand)
- Dashboard home, bookings pipeline with **status state machine**, content CRUD, messages inbox, site settings editor
- Admin `error.tsx` and section `loading.tsx`
- Testimonials API returns all rows when admin session is present

## Depends on

- #13 — Sprint 0 (backend + APIs)
- #14 — Sprint 1 public site (merge first for full-stack smoke test on `Dev`)

## Test plan

- [ ] `npm run build` passes
- [ ] Login at `/admin/login` → dashboard loads
- [ ] Bookings: filter, pagination, status transitions (no invalid jumps)
- [ ] Projects / testimonials CRUD + featured / `isActive` toggles
- [ ] Messages: mark read
- [ ] Settings: WhatsApp number persists and reflects on public layout after refresh

## Merge note

Merge **after** Sprint 1. Target: **`Dev`**.
