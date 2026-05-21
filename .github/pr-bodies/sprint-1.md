## What this adds

This PR builds the public-facing website on top of the Sprint 0 backend (#13).

Visitors can browse services and projects, read testimonials, send a contact message, book a consultation, and read the privacy policy. Shared form components and React Query hooks load data from the existing APIs.

## Included work

- Public hooks: `useProjects`, `useProject`, `useTestimonials`
- Pages: home, services, projects (list + detail), testimonials, contact, booking, privacy
- Reusable `FormField` component and contact/booking forms
- Loading states and a not-found page for project detail

## Prerequisites

- #13 must already be merged into `Dev`

## How to test

1. Run `npm run build` and confirm it completes without errors.
2. Start the app with `npm run dev` and a valid `.env.local` (PostgreSQL).
3. Visit the public routes and confirm each page shows real content, not an empty shell.
4. Submit the contact and booking forms and confirm you see a success message.
5. Open `/privacy` and confirm the policy text displays.

## Merge order

Merge this into `Dev` before the admin dashboard PR (Sprint 2). Do not target `main` yet.
