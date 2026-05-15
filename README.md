# Sunduza Architectural & Projects

**Sunduza Architectural & Projects (Pty) Ltd** — Professional house planning, architectural drawings, drafting services, and development projects across South Africa.

---

## What This Is

A full-stack web application for Sunduza Architectural & Projects. It serves two audiences:

- **Public visitors** — browse services, view the project portfolio, read client testimonials, make contact, and book a consultation.
- **Admin (Xivutiso Kevin Sunduza)** — a private dashboard to manage incoming booking requests, update booking statuses, manage portfolio projects, and manage client testimonials.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 — `@theme` design tokens |
| Components | Radix UI primitives + class-variance-authority |
| Forms | react-hook-form + Zod v4 |
| Auth | NextAuth v5 (Credentials provider, bcrypt) |
| Database | Prisma 5 — SQLite (dev) → PostgreSQL (prod) |
| Icons | lucide-react |
| Fonts | Playfair Display (serif) + IBM Plex Sans (sans) |

---

## Design Tokens

Defined in `app/globals.css` via Tailwind v4 `@theme`:

| Token | Value | Use |
|---|---|---|
| `--color-primary` | `#b88b4a` | Brand gold — CTAs, accents, highlights |
| `--color-primary-dark` | `#a07740` | Hover state for primary |
| `--color-ink` | `#0f172a` | Main text colour |
| `--color-paper` | `#faf8f2` | Page background (warm white) |
| `--color-paper2` | `#f5f0e8` | Section backgrounds, card fills |
| `--color-rule` | `#e8ddd0` | Borders and dividers |
| `--color-muted` | `#8a7a60` | Secondary text, captions |
| `--font-serif` | Playfair Display | Headings, logo, display text |
| `--font-sans` | IBM Plex Sans | Body, UI, labels |

---

## Services Offered

1. **House Planning** — Full plan sets for council submission (site analysis, floor plans, elevations, sections, SANS-compliant docs)
2. **Architectural Drawings** — Detailed drawings with dimensioning, material schedules, construction details
3. **Drafting Services** — CAD drafting, as-built drawings, town planning support, compliance documentation
4. **Development Projects** — Multi-unit residential, townhouse complexes, commercial developments

---

## Site Structure

### Public Pages

| Route | Purpose |
|---|---|
| `/` | Homepage — hero, stats, services preview, CTA |
| `/services` | Full services listing with feature breakdowns |
| `/projects` | Portfolio grid — all completed projects |
| `/projects/[id]` | Individual project detail view |
| `/testimonials` | Client reviews grid |
| `/contact` | Contact form (saves to DB as `ContactMessage`) |
| `/booking` | Consultation booking form (saves to DB as `Booking`) |

### Admin Pages (authenticated)

| Route | Purpose |
|---|---|
| `/admin/login` | Sign-in page (Credentials — email + bcrypt password) |
| `/admin` | Dashboard — stats overview, quick nav to sections |
| `/admin/bookings` | Manage all booking requests — filter, search, update status, add notes |
| `/admin/projects` | Add / edit / delete portfolio projects, toggle featured |
| `/admin/testimonials` | Add / edit / delete testimonials, toggle featured |

### API Routes

| Route | Method(s) | Auth | Purpose |
|---|---|---|---|
| `/api/auth/[...nextauth]` | GET, POST | — | NextAuth handler |
| `/api/health` | GET | — | Health check |
| `/api/bookings` | POST | — | Submit consultation booking |
| `/api/bookings/[id]` | GET, PATCH, DELETE | — | Single booking ops |
| `/api/contact` | POST | — | Submit contact message |
| `/api/projects` | GET, POST | — | List / create projects |
| `/api/projects/[id]` | GET, PATCH, DELETE | — | Single project ops |
| `/api/testimonials` | GET, POST | — | List / create testimonials |
| `/api/testimonials/[id]` | GET, PATCH, DELETE | — | Single testimonial ops |
| `/api/admin/bookings` | GET, PATCH | Admin | Protected booking management |

---

## Database Models

Defined in `prisma/schema.prisma`:

### `Admin`
Stores admin accounts. Passwords are bcrypt-hashed. Default role: `"admin"`.

### `Booking`
A consultation lead submitted from `/booking`.

| Field | Type | Notes |
|---|---|---|
| `name` | String | Client full name |
| `email` | String | |
| `phone` | String | |
| `service` | String | One of the 4 services |
| `location` | String | City / suburb / area |
| `description` | String | Project description |
| `meetingDate` | String | `YYYY-MM-DD` |
| `budget` | String? | Optional budget range |
| `status` | String | `new` → `contacted` → `in_review` → `confirmed` → `completed` / `cancelled` |
| `notes` | String? | Admin internal notes |

### `ContactMessage`
A general enquiry submitted from `/contact`.

### `Project`
A portfolio item managed from `/admin/projects`.

| Field | Type | Notes |
|---|---|---|
| `title` | String | |
| `shortDescription` | String | |
| `imageUrl` | String | Path under `/images/projects/` |
| `category` | String | `House Plan` / `Architectural Drawing` / `Drafting Services` / `Development Projects` |
| `featured` | Boolean | Whether to highlight on homepage |

### `Testimonial`
A client review managed from `/admin/testimonials`.

| Field | Type | Notes |
|---|---|---|
| `clientName` | String | |
| `review` | String | |
| `rating` | Int | 1–5 |
| `featured` | Boolean | Whether to highlight on homepage |

---

## Booking Status Flow

```
new → contacted → in_review → confirmed → completed
                                         ↘ cancelled (from any stage)
```

---

## API Response Shape

All API routes return a consistent envelope:

```ts
// Success
{ success: true, data: T }

// Error
{ success: false, message: string, code: ErrorCode, status: number }
```

Error codes: `VALIDATION_ERROR`, `NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`, `INTERNAL_ERROR`, `RATE_LIMITED`, `CONFLICT`, `BAD_REQUEST`, `SERVICE_UNAVAILABLE`

---

## Project Layout

```
/
├── app/
│   ├── globals.css           ← Design tokens (Tailwind @theme)
│   ├── layout.tsx            ← Root layout (fonts, metadata)
│   ├── page.tsx              ← Homepage
│   ├── services/page.tsx
│   ├── projects/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── testimonials/page.tsx
│   ├── contact/page.tsx
│   ├── booking/page.tsx
│   ├── admin/
│   │   ├── page.tsx          ← Dashboard
│   │   ├── login/page.tsx
│   │   ├── bookings/page.tsx
│   │   ├── projects/page.tsx
│   │   └── testimonials/page.tsx
│   └── api/                  ← All REST handlers
├── components/
│   ├── ui/                   ← Design system primitives
│   ├── layout/               ← Header, Footer, FloatingWhatsApp
│   ├── features/             ← ProjectsGrid, TestimonialsGrid
│   └── admin/                ← BookingActions
├── lib/
│   ├── auth.ts               ← NextAuth config
│   ├── db.ts                 ← Prisma singleton
│   ├── utils.ts              ← cn(), formatDate()
│   ├── api-response.ts       ← ApiSuccess / ApiError helpers
│   └── api-client.ts         ← Typed fetch wrapper
├── types/
│   ├── booking.ts            ← Zod schema + inferred types
│   ├── project.ts
│   ├── testimonial.ts
│   └── next-auth.d.ts        ← Session type augmentation
└── prisma/
    ├── schema.prisma
    └── seed.ts               ← Dev seed (admin + sample data)
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Required
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Set up the database
npx prisma generate
npx prisma db push

# Seed with admin account + sample data
npm run db:seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public site.
Open [http://localhost:3000/admin/login](http://localhost:3000/admin/login) for the admin panel.

**Default admin credentials (dev only):**
- Email: `admin@sunduza.co.za`
- Password: set via seed — see `prisma/seed.ts`

---

## Contact

**Xivutiso Kevin Sunduza**
- Phone: +27 78 672 3364
- Email: xivutisokevinsunduza@gmail.com
- Location: South Africa

---

*Design & Build by KSDRILL SA*
