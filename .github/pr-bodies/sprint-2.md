## What this adds

This PR delivers the admin dashboard so the business owner can manage leads and content without touching the database.

After logging in, you can work through bookings, update projects and testimonials, read contact messages, and edit site settings (including the WhatsApp number shown on the public site).

## Included work

- Admin data hooks for bookings, projects, testimonials, messages, and settings
- Mobile-friendly shell with sidebar (Zustand)
- Dashboard home and full UI for each admin section
- Booking status changes that follow the allowed state machine
- Admin error and loading UI
- Testimonials API returns inactive items when an admin is logged in

## Prerequisites

- #13 (backend)
- #14 (public site) should be merged first so you can smoke-test the full stack on `Dev`

## How to test

1. Run `npm run build`.
2. Log in at `/admin/login`.
3. Walk through each section: bookings (filter, pagination, status updates), projects, testimonials, messages, settings.
4. Change the WhatsApp number in settings, refresh a public page, and confirm the number updated.

## Merge order

Merge into `Dev` after Sprint 1. Do not target `main` yet.
