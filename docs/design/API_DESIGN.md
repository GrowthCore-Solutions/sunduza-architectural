# SUNDUZA ARCHITECTURAL & PROJECTS
## API Design Detail
### All 17 Endpoints · Request · Response · Validation · Error Cases

---

> The API is the contract between the frontend and the backend.
> Once it is defined, both sides can be built independently.
> Every endpoint here is complete — what goes in, what comes out,
> what fails and why, and what the frontend does with each case.

---

## CONTEXT

We have 9 normalized entities, a complete physical schema,
25 indexes, and 10 CHECK constraints enforced at the DB level.

The API sits between the React frontend and the PostgreSQL database.
It is the only way data moves. Nothing in the frontend touches
the database directly. Nothing in the database knows about HTTP.

All endpoints live under `/api/v1/` — versioned from day one.

---

## GLOBAL RULES (Apply to Every Endpoint)

```
Request ID:     Every request gets X-Request-ID header (injected by middleware)
Content-Type:   All requests: application/json
                All responses: application/json
Authentication: Admin endpoints require valid session cookie
                Public endpoints require no authentication
Rate Limiting:  Applied per IP at middleware level before route handler runs
Soft Delete:    All list queries implicitly filter deleted_at IS NULL
Timestamps:     All timestamps in ISO 8601 UTC format
Pagination:     Default page=1, limit=20, max limit=100
```

---

## STANDARD RESPONSE ENVELOPE

Every response — success or error — uses this envelope.
The frontend can always check `success` before reading `data`.

```typescript
// Success — single object
{
  "success": true,
  "data": { ...object },
  "error": null
}

// Success — list
{
  "success": true,
  "data": [ ...objects ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 47,
    "pages": 3
  },
  "error": null
}

// Error
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message shown to user",
    "fields": {              // Only present for VALIDATION_ERROR
      "fieldName": ["error message"]
    }
  }
}
```

---

## ENDPOINT REGISTRY

| # | Method | Path | Access | Handler |
|---|---|---|---|---|
| 1 | GET | `/api/health` | Public | Health check |
| 2 | POST | `/api/v1/auth/login` | Public | Admin login |
| 3 | POST | `/api/v1/auth/logout` | Admin | Admin logout |
| 4 | POST | `/api/v1/bookings` | Public | Create booking |
| 5 | GET | `/api/v1/bookings` | Admin | List bookings |
| 6 | GET | `/api/v1/bookings/:id` | Admin | Get single booking |
| 7 | PATCH | `/api/v1/bookings/:id` | Admin | Update booking status |
| 8 | DELETE | `/api/v1/bookings/:id` | Admin | Soft delete booking |
| 9 | GET | `/api/v1/projects` | Public | List projects |
| 10 | POST | `/api/v1/projects` | Admin | Create project |
| 11 | PATCH | `/api/v1/projects/:id` | Admin | Update project |
| 12 | DELETE | `/api/v1/projects/:id` | Admin | Soft delete project |
| 13 | POST | `/api/v1/contact` | Public | Create contact message |
| 14 | GET | `/api/v1/contact` | Admin | List contact messages |
| 15 | PATCH | `/api/v1/contact/:id` | Admin | Mark message read |
| 16 | DELETE | `/api/v1/contact/:id` | Admin | Soft delete message |
| 17 | GET | `/api/v1/settings` | Public (safe keys) | Get site settings |
| 18 | PATCH | `/api/v1/settings/:key` | Admin | Update a setting |

---
---

## ENDPOINT 1 — Health Check

```
GET /api/health
Access: Public
Rate limit: None
Auth: None
```

### Purpose
Confirms the system is alive and the database is reachable.
Called by UptimeRobot every 5 minutes. Also called manually
after every deployment to confirm the release is healthy.

### Request
```
No body. No query params. No headers required.
```

### Response — Healthy
```json
HTTP 200
{
  "status": "ok",
  "db": "ok",
  "timestamp": "2024-09-15T08:30:00.000Z",
  "version": "1.0.0"
}
```

### Response — Degraded (DB unreachable)
```json
HTTP 503
{
  "status": "degraded",
  "db": "error",
  "timestamp": "2024-09-15T08:30:00.000Z",
  "version": "1.0.0"
}
```

### Implementation
```typescript
// src/app/api/health/route.ts
import { prisma } from '@server/db/prisma'

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return Response.json({
      status: 'ok',
      db: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? '1.0.0'
    }, { status: 200 })
  } catch {
    return Response.json({
      status: 'degraded',
      db: 'error',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? '1.0.0'
    }, { status: 503 })
  }
}
```

### Frontend Usage
```typescript
// Called by UptimeRobot — not called by the React app directly
// Deployment verification: curl https://sunduza.vercel.app/api/health
```

---
---

## ENDPOINT 2 — Admin Login

```
POST /api/v1/auth/login
Access: Public
Rate limit: 10 requests / 15 minutes per IP
Auth: None (this IS the auth endpoint)
```

### Purpose
Authenticates the admin and creates a database session.
Returns a session cookie in the response headers.
NextAuth.js handles the session creation internally.

### Request Body
```json
{
  "email": "xivutisokevinsunduza@gmail.com",
  "password": "AdminPassword123!"
}
```

### Zod Validation Schema
```typescript
const loginSchema = z.object({
  email:    z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Please enter your password'),
})
```

### Response — Success
```json
HTTP 200
Set-Cookie: next-auth.session-token=...; HttpOnly; Secure; SameSite=Lax; Path=/

{
  "success": true,
  "data": {
    "user": {
      "id": "clx1234567890",
      "email": "xivutisokevinsunduza@gmail.com",
      "name": "Xivutiso Kevin Sunduza",
      "role": "ADMIN"
    }
  },
  "error": null
}
```

### Response — Invalid Credentials
```json
HTTP 401
{
  "success": false,
  "data": null,
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "message": "Invalid email or password."
  }
}
```

### Response — Account Locked
```json
HTTP 423
{
  "success": false,
  "data": null,
  "error": {
    "code": "AUTH_ACCOUNT_LOCKED",
    "message": "Account temporarily locked. Please try again in 30 minutes."
  }
}
```

### Response — Rate Limited
```json
HTTP 429
{
  "success": false,
  "data": null,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many login attempts. Please try again in 15 minutes."
  }
}
```

### AuditLog Written
```json
// On success:
{ "action": "LOGIN_SUCCESS", "entity_type": "User", "entity_id": "<user_id>" }

// On failure:
{ "action": "LOGIN_FAILURE", "entity_type": "User", "entity_id": "unknown",
  "metadata": { "email_attempted": "<hashed>", "reason": "invalid_credentials" } }
```

### Security Notes
```
Password never returned in response — ever
Email in audit log is hashed — never raw
failed_attempts incremented on every failure
locked_until set when failed_attempts reaches 10
Session token is HTTP-only — never accessible by JavaScript
New session token issued on every successful login (rotation)
```

---
---

## ENDPOINT 3 — Admin Logout

```
POST /api/v1/auth/logout
Access: Admin (session required)
Rate limit: None
Auth: Valid session cookie
```

### Purpose
Destroys the current session. Clears the session cookie.
After this call, the admin is fully unauthenticated.

### Request
```
No body required.
Session cookie sent automatically by browser.
```

### Response — Success
```json
HTTP 200
Set-Cookie: next-auth.session-token=; HttpOnly; Secure; Max-Age=0; Path=/

{
  "success": true,
  "data": { "message": "Logged out successfully." },
  "error": null
}
```

### Response — No Session
```json
HTTP 401
{
  "success": false,
  "data": null,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "No active session found."
  }
}
```

### AuditLog Written
```json
{ "action": "LOGOUT", "entity_type": "User", "entity_id": "<user_id>" }
```

### Frontend Behaviour After Logout
```typescript
// client/services/auth-service.ts
await authService.logout()
router.push('/admin/login')  // Redirect to login page
queryClient.clear()          // Clear all TanStack Query cache
```

---
---

## ENDPOINT 4 — Create Booking (Primary Conversion)

```
POST /api/v1/bookings
Access: Public
Rate limit: 5 requests / 1 hour per IP
Auth: None
```

### Purpose
The most important endpoint in the system. Captures a visitor's
consultation request. Validates all input, calculates lead score,
captures marketing attribution, records POPIA consent, writes
audit log, queues notification.

### Request Body
```json
{
  "name":          "Thabo Nkosi",
  "email":         "thabo.nkosi@email.co.za",
  "phone":         "0781234567",
  "service":       "house_planning",
  "location":      "Sandton, Johannesburg",
  "description":   "I need a 4-bedroom family home designed for a 650sqm plot in Sandton. Looking for a modern contemporary style with open-plan living areas and a double garage.",
  "meeting_date":  "2024-10-15T10:00:00.000Z",
  "budget":        "R500 000 - R800 000",
  "consent_given": true
}
```

### Zod Validation Schema
```typescript
// src/shared/validations/booking.schema.ts
const SA_PHONE_REGEX = /^(\+27|0)[6-8][0-9]{8}$/

export const publicBookingSchema = z.object({
  name: z
    .string()
    .min(2,   'Please enter your full name')
    .max(100, 'Name is too long'),

  email: z
    .string()
    .email('Please enter a valid email address'),

  phone: z
    .string()
    .regex(SA_PHONE_REGEX, 'Please enter a valid South African phone number'),

  service: z.enum(
    ['house_planning', 'arch_drawings', 'drafting_services', 'dev_project_planning'],
    { errorMap: () => ({ message: 'Please select a service' }) }
  ),

  location: z
    .string()
    .min(2,   'Please enter your project location')
    .max(200, 'Location is too long'),

  description: z
    .string()
    .min(20,   'Please provide more detail (minimum 20 characters)')
    .max(2000, 'Description is too long (maximum 2000 characters)'),

  meeting_date: z
    .string()
    .datetime({ message: 'Please enter a valid date' })
    .refine(
      (val) => new Date(val) > new Date(),
      'Meeting date must be in the future'
    )
    .optional(),

  budget: z
    .string()
    .max(50, 'Budget description is too long')
    .optional(),

  consent_given: z
    .literal(true, {
      errorMap: () => ({
        message: 'You must agree to be contacted to submit this request'
      })
    }),
})

export type CreateBookingInput = z.infer<typeof publicBookingSchema>
```

### Response — Success (201 Created)
```json
HTTP 201
{
  "success": true,
  "data": {
    "id":         "clx1234567890abcdef",
    "name":       "Thabo Nkosi",
    "service":    "house_planning",
    "status":     "PENDING",
    "lead_score": 85,
    "created_at": "2024-09-15T08:30:00.000Z"
  },
  "error": null
}
```

Note: Response intentionally minimal. We do not echo back
email, phone, or location to the visitor — no need, and
reduces accidental PII exposure in browser dev tools.

### Response — Validation Error (400)
```json
HTTP 400
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please check your input and try again.",
    "fields": {
      "email":       ["Please enter a valid email address"],
      "description": ["Please provide more detail (minimum 20 characters)"],
      "consent_given": ["You must agree to be contacted to submit this request"]
    }
  }
}
```

### Response — Rate Limited (429)
```json
HTTP 429
{
  "success": false,
  "data": null,
  "error": {
    "code": "RATE_LIMITED",
    "message": "You have submitted too many requests. Please try again in 1 hour."
  }
}
```

### What Happens Server-Side
```
1. Rate limit check (middleware) — block if exceeded
2. Parse JSON body
3. Zod validation — return 400 if fails
4. Extract UTM params from request URL
5. Hash IP address (SHA-256 + salt)
6. Calculate lead score (0-100)
7. BEGIN transaction:
   a. Insert booking row (status = PENDING)
   b. Insert audit_log row (action = BOOKING_CREATE)
   c. Insert notification row (type = BOOKING_RECEIVED, sent_at = NULL)
8. COMMIT transaction
9. Return 201 with minimal booking data
```

### AuditLog Written
```json
{
  "action":      "BOOKING_CREATE",
  "entity_type": "Booking",
  "entity_id":   "clx1234567890abcdef",
  "user_id":     null,
  "metadata": {
    "service":    "house_planning",
    "lead_score": 85,
    "utm_source": "google"
  }
}
```

### Frontend Behaviour
```typescript
// On 201: show success message, reset form
// On 400: show field errors inline under each input
// On 429: show "too many requests" banner, hide form
// On 500: show generic error, offer WhatsApp as alternative
```

---
---

## ENDPOINT 5 — List Bookings

```
GET /api/v1/bookings
Access: Admin
Rate limit: None
Auth: Valid session cookie required
```

### Purpose
Returns paginated list of bookings for the admin dashboard.
Supports filtering by status and sorting by date or lead score.

### Query Parameters
```
page      integer   Page number (default: 1)
limit     integer   Items per page (default: 20, max: 100)
status    string    Filter: PENDING | CONTACTED | CONFIRMED | COMPLETED | REJECTED
sort      string    Sort field: created_at | lead_score (default: created_at)
order     string    Sort direction: asc | desc (default: desc)
```

### Example Request
```
GET /api/v1/bookings?status=PENDING&sort=lead_score&order=desc&page=1&limit=20
```

### Response — Success (200)
```json
HTTP 200
{
  "success": true,
  "data": [
    {
      "id":           "clx1234567890",
      "name":         "Thabo Nkosi",
      "email":        "thabo.nkosi@email.co.za",
      "phone":        "0781234567",
      "service":      "house_planning",
      "location":     "Sandton, Johannesburg",
      "status":       "PENDING",
      "lead_score":   85,
      "meeting_date": "2024-10-15T10:00:00.000Z",
      "budget":       "R500 000 - R800 000",
      "utm_source":   "google",
      "utm_medium":   "cpc",
      "utm_campaign": "jhb_architects_2024",
      "created_at":   "2024-09-15T08:30:00.000Z",
      "updated_at":   "2024-09-15T08:30:00.000Z"
    }
  ],
  "meta": {
    "page":  1,
    "limit": 20,
    "total": 47,
    "pages": 3
  },
  "error": null
}
```

Note: `description` is NOT returned in the list view —
it is large text fetched only on the detail view (Endpoint 6).
This keeps the list response lean.

### Response — Unauthorized (401)
```json
HTTP 401
{
  "success": false,
  "data": null,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "You must be logged in to access this resource."
  }
}
```

### Frontend Usage
```typescript
// hooks/use-bookings.ts
export function useBookings(filters: BookingFilters) {
  return useQuery({
    queryKey: ['bookings', filters],
    queryFn:  () => bookingService.getAll(filters),
    staleTime: 30_000,   // 30 seconds — admin data should be fresh
  })
}
```

---
---

## ENDPOINT 6 — Get Single Booking

```
GET /api/v1/bookings/:id
Access: Admin
Rate limit: None
Auth: Valid session cookie required
```

### Purpose
Returns full booking details including description and all
marketing attribution fields. Called when admin opens the
booking detail modal.

### Response — Success (200)
```json
HTTP 200
{
  "success": true,
  "data": {
    "id":               "clx1234567890",
    "name":             "Thabo Nkosi",
    "email":            "thabo.nkosi@email.co.za",
    "phone":            "0781234567",
    "service":          "house_planning",
    "location":         "Sandton, Johannesburg",
    "description":      "I need a 4-bedroom family home designed for a 650sqm plot...",
    "meeting_date":     "2024-10-15T10:00:00.000Z",
    "budget":           "R500 000 - R800 000",
    "status":           "PENDING",
    "lead_score":       85,
    "consent_given":    true,
    "consent_given_at": "2024-09-15T08:30:00.000Z",
    "utm_source":       "google",
    "utm_medium":       "cpc",
    "utm_campaign":     "jhb_architects_2024",
    "utm_term":         "architect+sandton",
    "utm_content":      "hero_cta",
    "referrer_url":     "https://www.google.co.za",
    "landing_page":     "/booking?utm_source=google&utm_medium=cpc",
    "created_at":       "2024-09-15T08:30:00.000Z",
    "updated_at":       "2024-09-15T08:30:00.000Z"
  },
  "error": null
}
```

### Response — Not Found (404)
```json
HTTP 404
{
  "success": false,
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "Booking not found."
  }
}
```

---
---

## ENDPOINT 7 — Update Booking Status

```
PATCH /api/v1/bookings/:id
Access: Admin
Rate limit: None
Auth: Valid session cookie required
```

### Purpose
Updates the booking status through the defined state machine.
Rejects invalid transitions with a 409 Conflict.
Writes AuditLog with old and new status.

### Request Body
```json
{
  "status": "CONTACTED"
}
```

### Zod Validation Schema
```typescript
export const updateBookingStatusSchema = z.object({
  status: z.enum(
    ['PENDING', 'CONTACTED', 'CONFIRMED', 'COMPLETED', 'REJECTED'],
    { errorMap: () => ({ message: 'Invalid status value' }) }
  ),
})
```

### Valid Transitions (enforced in use case)
```
PENDING    → CONTACTED | REJECTED
CONTACTED  → CONFIRMED | REJECTED
CONFIRMED  → COMPLETED | REJECTED
COMPLETED  → (none — terminal)
REJECTED   → (none — terminal)
```

### Response — Success (200)
```json
HTTP 200
{
  "success": true,
  "data": {
    "id":         "clx1234567890",
    "status":     "CONTACTED",
    "updated_at": "2024-09-15T09:15:00.000Z"
  },
  "error": null
}
```

### Response — Invalid Transition (409)
```json
HTTP 409
{
  "success": false,
  "data": null,
  "error": {
    "code": "CONFLICT",
    "message": "Cannot change status from COMPLETED to PENDING."
  }
}
```

### Response — Not Found (404)
```json
HTTP 404
{
  "success": false,
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "Booking not found."
  }
}
```

### AuditLog Written
```json
{
  "action":      "BOOKING_STATUS_UPDATE",
  "entity_type": "Booking",
  "entity_id":   "clx1234567890",
  "user_id":     "<admin_user_id>",
  "metadata": {
    "old_status": "PENDING",
    "new_status": "CONTACTED"
  }
}
```

### Frontend Behaviour
```typescript
// On 200: update booking in TanStack Query cache, show toast "Status updated"
// On 409: show toast "This status change is not allowed"
// On 404: show toast "Booking no longer exists" — refresh list
```

---
---

## ENDPOINT 8 — Soft Delete Booking

```
DELETE /api/v1/bookings/:id
Access: Admin
Rate limit: None
Auth: Valid session cookie required
```

### Purpose
Soft deletes a booking by setting `deleted_at = NOW()`.
The record remains in the database for audit purposes.
It disappears from all admin list views.

### Request
```
No body required.
```

### Response — Success (200)
```json
HTTP 200
{
  "success": true,
  "data": {
    "id":         "clx1234567890",
    "deleted_at": "2024-09-15T09:30:00.000Z"
  },
  "error": null
}
```

### Response — Not Found (404)
```json
HTTP 404
{
  "success": false,
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "Booking not found."
  }
}
```

### AuditLog Written
```json
{
  "action":      "BOOKING_DELETE",
  "entity_type": "Booking",
  "entity_id":   "clx1234567890",
  "user_id":     "<admin_user_id>",
  "metadata":    {}
}
```

### Frontend Behaviour
```typescript
// On 200: remove booking from TanStack Query cache, show toast "Booking removed"
// Optimistic update: remove from UI immediately, rollback on error
```

---
---

## ENDPOINT 9 — List Projects

```
GET /api/v1/projects
Access: Public
Rate limit: None
Auth: None
```

### Purpose
Returns all active projects for the public portfolio page.
Supports optional category filter. Ordered by sort_order.
Also returns featured projects for homepage preview.

### Query Parameters
```
category   string    Filter by category (optional)
featured   boolean   Return only featured projects (optional)
```

### Example Requests
```
GET /api/v1/projects                          — All active projects
GET /api/v1/projects?category=Residential     — Residential only
GET /api/v1/projects?featured=true            — Homepage preview (3 projects)
```

### Response — Success (200)
```json
HTTP 200
{
  "success": true,
  "data": [
    {
      "id":          "clx9876543210",
      "title":       "Modern Family Residence — Sandton",
      "description": "A contemporary 4-bedroom family home...",
      "image_path":  "/images/projects/sandton-residence.webp",
      "category":    "Residential",
      "sort_order":  1,
      "is_featured": true,
      "created_at":  "2024-01-10T00:00:00.000Z"
    }
  ],
  "meta": {
    "page":  1,
    "limit": 20,
    "total": 5,
    "pages": 1
  },
  "error": null
}
```

### Frontend Caching Strategy
```typescript
// Public projects — cached longer, changes rarely
export function useProjects(filters?: ProjectFilters) {
  return useQuery({
    queryKey:  ['projects', filters],
    queryFn:   () => projectService.getAll(filters),
    staleTime: 5 * 60 * 1000,   // 5 minutes — projects don't change often
  })
}

// ISR on the projects page — Next.js revalidates every 300 seconds
export const revalidate = 300
```

---
---

## ENDPOINT 10 — Create Project

```
POST /api/v1/projects
Access: Admin
Rate limit: None
Auth: Valid session cookie required
```

### Request Body
```json
{
  "title":       "Townhouse Complex — Midrand",
  "description": "Site planning and architectural drawings for a 6-unit townhouse complex. Includes unit layouts, site coverage calculations, and full drafting documentation.",
  "image_path":  "/images/projects/midrand-townhouses.webp",
  "category":    "Development",
  "sort_order":  6,
  "is_featured": false
}
```

### Zod Validation Schema
```typescript
export const createProjectSchema = z.object({
  title: z
    .string()
    .min(2,   'Please enter a project title')
    .max(100, 'Title is too long'),

  description: z
    .string()
    .min(10,   'Please enter a project description')
    .max(1000, 'Description is too long'),

  image_path: z
    .string()
    .regex(
      /^\/images\/projects\/.+\.(webp|jpg|jpeg|png)$/,
      'Image path must be /images/projects/filename.webp (or .jpg, .png)'
    ),

  category: z
    .string()
    .max(50, 'Category is too long')
    .optional(),

  sort_order: z
    .number()
    .int()
    .min(0, 'Sort order must be 0 or higher')
    .default(0),

  is_featured: z
    .boolean()
    .default(false),
})
```

### Response — Success (201)
```json
HTTP 201
{
  "success": true,
  "data": {
    "id":          "clxABCDEF1234",
    "title":       "Townhouse Complex — Midrand",
    "description": "Site planning and architectural drawings...",
    "image_path":  "/images/projects/midrand-townhouses.webp",
    "category":    "Development",
    "sort_order":  6,
    "is_featured": false,
    "created_at":  "2024-09-15T10:00:00.000Z"
  },
  "error": null
}
```

### AuditLog Written
```json
{
  "action":      "PROJECT_CREATE",
  "entity_type": "Project",
  "entity_id":   "clxABCDEF1234",
  "user_id":     "<admin_user_id>",
  "metadata": {
    "title":    "Townhouse Complex — Midrand",
    "category": "Development"
  }
}
```

### Frontend Behaviour
```typescript
// On 201: invalidate projects cache, close modal, show toast "Project added"
queryClient.invalidateQueries({ queryKey: ['projects'] })
```

---
---

## ENDPOINT 11 — Update Project

```
PATCH /api/v1/projects/:id
Access: Admin
Rate limit: None
Auth: Valid session cookie required
```

### Purpose
Partial update — only send the fields you want to change.
Uses Zod `.partial()` so all fields are optional.

### Request Body (partial — send only changed fields)
```json
{
  "title":       "Modern Townhouse Complex — Midrand",
  "is_featured": true
}
```

### Zod Validation Schema
```typescript
export const updateProjectSchema = createProjectSchema.partial()
// All fields become optional — only validate what is sent
```

### Response — Success (200)
```json
HTTP 200
{
  "success": true,
  "data": {
    "id":          "clxABCDEF1234",
    "title":       "Modern Townhouse Complex — Midrand",
    "is_featured": true,
    "updated_at":  "2024-09-15T11:00:00.000Z"
  },
  "error": null
}
```

### AuditLog Written
```json
{
  "action":      "PROJECT_UPDATE",
  "entity_type": "Project",
  "entity_id":   "clxABCDEF1234",
  "user_id":     "<admin_user_id>",
  "metadata": {
    "changed_fields": ["title", "is_featured"],
    "old_values": {
      "title":       "Townhouse Complex — Midrand",
      "is_featured": false
    },
    "new_values": {
      "title":       "Modern Townhouse Complex — Midrand",
      "is_featured": true
    }
  }
}
```

---
---

## ENDPOINT 12 — Soft Delete Project

```
DELETE /api/v1/projects/:id
Access: Admin
Rate limit: None
Auth: Valid session cookie required
```

### Response — Success (200)
```json
HTTP 200
{
  "success": true,
  "data": {
    "id":         "clxABCDEF1234",
    "deleted_at": "2024-09-15T11:30:00.000Z"
  },
  "error": null
}
```

### Side Effects
```
Any Testimonial rows with project_id = this project's id
will have project_id SET TO NULL automatically via FK constraint.
Those testimonials become general business reviews.
This is correct behaviour — documented in normalization phase.
```

### AuditLog Written
```json
{
  "action":      "PROJECT_DELETE",
  "entity_type": "Project",
  "entity_id":   "clxABCDEF1234",
  "user_id":     "<admin_user_id>",
  "metadata":    {}
}
```

---
---

## ENDPOINT 13 — Create Contact Message

```
POST /api/v1/contact
Access: Public
Rate limit: 3 requests / 1 hour per IP
Auth: None
```

### Request Body
```json
{
  "name":    "Sipho Dlamini",
  "email":   "sipho.dlamini@email.co.za",
  "phone":   "0829876543",
  "message": "I would like to know more about your drafting services for a commercial property. Do you work outside of Gauteng?"
}
```

### Zod Validation Schema
```typescript
export const contactMessageSchema = z.object({
  name: z
    .string()
    .min(2,   'Please enter your name')
    .max(100, 'Name is too long'),

  email: z
    .string()
    .email('Please enter a valid email address'),

  phone: z
    .string()
    .regex(SA_PHONE_REGEX, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),

  message: z
    .string()
    .min(10,   'Please enter a longer message (minimum 10 characters)')
    .max(2000, 'Message is too long (maximum 2000 characters)'),
})
```

### Response — Success (201)
```json
HTTP 201
{
  "success": true,
  "data": {
    "id":         "clxMESSAGE123",
    "created_at": "2024-09-15T12:00:00.000Z"
  },
  "error": null
}
```

Note: We return only `id` and `created_at`. Not the message
content — no need to echo it back, and reduces PII in transit.

### AuditLog Written
```json
{
  "action":      "CONTACT_MESSAGE_CREATE",
  "entity_type": "ContactMessage",
  "entity_id":   "clxMESSAGE123",
  "user_id":     null,
  "metadata":    {}
}
```

Note: No PII in the audit log metadata for contact messages.
Name and email are not recorded in AuditLog — they live only
in the ContactMessage row itself.

---
---

## ENDPOINT 14 — List Contact Messages

```
GET /api/v1/contact
Access: Admin
Rate limit: None
Auth: Valid session cookie required
```

### Query Parameters
```
page    integer   Page number (default: 1)
limit   integer   Items per page (default: 20, max: 100)
read    boolean   Filter: true (read) | false (unread) | omit (all)
```

### Example Requests
```
GET /api/v1/contact              — All messages, unread first
GET /api/v1/contact?read=false   — Unread only (admin inbox)
```

### Response — Success (200)
```json
HTTP 200
{
  "success": true,
  "data": [
    {
      "id":         "clxMESSAGE123",
      "name":       "Sipho Dlamini",
      "email":      "sipho.dlamini@email.co.za",
      "phone":      "0829876543",
      "message":    "I would like to know more about your drafting services...",
      "read":       false,
      "read_at":    null,
      "created_at": "2024-09-15T12:00:00.000Z"
    }
  ],
  "meta": {
    "page":  1,
    "limit": 20,
    "total": 8,
    "pages": 1
  },
  "error": null
}
```

---
---

## ENDPOINT 15 — Mark Message Read

```
PATCH /api/v1/contact/:id
Access: Admin
Rate limit: None
Auth: Valid session cookie required
```

### Purpose
Marks a contact message as read. Sets `read = true` and
`read_at = NOW()`. This clears the unread badge in the admin sidebar.

### Request Body
```json
{
  "read": true
}
```

### Zod Validation Schema
```typescript
export const markMessageReadSchema = z.object({
  read: z.literal(true),   // Can only mark as read — not as unread
})
```

### Response — Success (200)
```json
HTTP 200
{
  "success": true,
  "data": {
    "id":      "clxMESSAGE123",
    "read":    true,
    "read_at": "2024-09-15T13:00:00.000Z"
  },
  "error": null
}
```

### AuditLog Written
```json
{
  "action":      "CONTACT_MESSAGE_READ",
  "entity_type": "ContactMessage",
  "entity_id":   "clxMESSAGE123",
  "user_id":     "<admin_user_id>",
  "metadata":    {}
}
```

---
---

## ENDPOINT 16 — Soft Delete Contact Message

```
DELETE /api/v1/contact/:id
Access: Admin
Rate limit: None
Auth: Valid session cookie required
```

### Response — Success (200)
```json
HTTP 200
{
  "success": true,
  "data": {
    "id":         "clxMESSAGE123",
    "deleted_at": "2024-09-15T13:30:00.000Z"
  },
  "error": null
}
```

---
---

## ENDPOINT 17 — Get Site Settings

```
GET /api/v1/settings
Access: Public (safe keys only)
Rate limit: None
Auth: None
```

### Purpose
Returns the public-safe site settings needed by the frontend
at runtime — WhatsApp number, contact email, business phone,
hero tagline. Admin-only settings are never returned.

The safe keys whitelist is defined in the use case — not the route.
The frontend cannot request arbitrary keys.

### Safe Keys Whitelist
```typescript
const PUBLIC_SAFE_KEYS = [
  'whatsapp_number',
  'contact_email',
  'business_phone',
  'business_address',
  'hero_tagline',
  'years_experience',
  'projects_completed',
] as const
```

### Response — Success (200)
```json
HTTP 200
{
  "success": true,
  "data": {
    "whatsapp_number":    "27867233640",
    "contact_email":      "xivutisokevinsunduza@gmail.com",
    "business_phone":     "0867233640",
    "business_address":   "South Africa",
    "hero_tagline":       "Designing Spaces That Inspire",
    "years_experience":   "5",
    "projects_completed": "30"
  },
  "error": null
}
```

Note: Response is a flat key-value object, not an array.
The frontend destructures directly.

### Frontend Caching Strategy
```typescript
export function useSettings() {
  return useQuery({
    queryKey:  ['settings'],
    queryFn:   () => settingsService.getPublic(),
    staleTime: 10 * 60 * 1000,   // 10 minutes — settings rarely change
    gcTime:    30 * 60 * 1000,   // Keep in cache 30 minutes
  })
}
```

---
---

## ENDPOINT 18 — Update Site Setting

```
PATCH /api/v1/settings/:key
Access: Admin
Rate limit: None
Auth: Valid session cookie required
```

### Purpose
Updates a single site setting by key. The admin changes the
WhatsApp number, hero tagline, or any other setting without
a code deployment. The key must exist (no creating new keys
via API — only the seed defines valid keys).

### Request Body
```json
{
  "value": "27829876543"
}
```

### Zod Validation Schema
```typescript
export const updateSettingSchema = z.object({
  value: z.string().min(1, 'Value cannot be empty').max(500, 'Value is too long'),
})
```

### Key-Specific Validation (in use case)
```typescript
// Different keys have different value rules
const KEY_VALIDATORS: Record<string, (val: string) => boolean> = {
  whatsapp_number: (v) => /^\d{10,15}$/.test(v),
  contact_email:   (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  business_phone:  (v) => SA_PHONE_REGEX.test(v),
  years_experience:(v) => !isNaN(Number(v)) && Number(v) > 0,
  projects_completed: (v) => !isNaN(Number(v)) && Number(v) >= 0,
}
```

### Response — Success (200)
```json
HTTP 200
{
  "success": true,
  "data": {
    "key":        "whatsapp_number",
    "value":      "27829876543",
    "updated_at": "2024-09-15T14:00:00.000Z"
  },
  "error": null
}
```

### Response — Key Not Found (404)
```json
HTTP 404
{
  "success": false,
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "Setting 'invalid_key' does not exist."
  }
}
```

### AuditLog Written
```json
{
  "action":      "SETTINGS_UPDATE",
  "entity_type": "SiteSettings",
  "entity_id":   "clxSETTING123",
  "user_id":     "<admin_user_id>",
  "metadata": {
    "key":       "whatsapp_number",
    "old_value": "27867233640",
    "new_value": "27829876543"
  }
}
```

### Frontend Behaviour
```typescript
// On 200: invalidate settings cache, show toast "Setting updated"
// WhatsApp button immediately uses new number on next render
queryClient.invalidateQueries({ queryKey: ['settings'] })
```

---
---

## ERROR CODE COMPLETE REGISTRY

Every error code the API can return, mapped to HTTP status and
the scenario that produces it.

| Code | HTTP | Produced By | User-Facing Message |
|---|---|---|---|
| `VALIDATION_ERROR` | 400 | Any endpoint with invalid input | "Please check your input and try again." |
| `UNAUTHORIZED` | 401 | Any admin endpoint without session | "You must be logged in to access this resource." |
| `AUTH_INVALID_CREDENTIALS` | 401 | Login with wrong email/password | "Invalid email or password." |
| `AUTH_ACCOUNT_LOCKED` | 423 | Login after 10 failed attempts | "Account temporarily locked. Please try again in 30 minutes." |
| `FORBIDDEN` | 403 | Session valid but role insufficient | "You do not have permission to perform this action." |
| `NOT_FOUND` | 404 | GET/PATCH/DELETE on non-existent or deleted resource | "Resource not found." |
| `CONFLICT` | 409 | Invalid booking status transition | "Cannot change status from X to Y." |
| `RATE_LIMITED` | 429 | Public endpoints over their limit | "Too many requests. Please try again later." |
| `INTERNAL_SERVER_ERROR` | 500 | Unhandled exception (logged to Sentry) | "Something went wrong. Please try again." |

---

## MIDDLEWARE EXECUTION ORDER

Every request passes through this stack before reaching a route handler:

```
Incoming Request
      │
      ▼
1. Request ID middleware
   → Attach X-Request-ID to request and response headers
   → Used for log correlation and support debugging
      │
      ▼
2. Rate limit middleware
   → Check IP against rate limit store
   → If exceeded: return 429 immediately — route never executes
      │
      ▼
3. Auth middleware (admin routes only)
   → Verify session cookie
   → If missing or expired: return 401 — route never executes
   → If valid: attach session to request context
      │
      ▼
4. Route handler executes
   → Zod validation
   → Use case
   → Repository
   → Response
```

---

## API CLIENT (FRONTEND)

The typed client used by all `client/services/*.ts` files.
Every API call in the entire frontend goes through this.

```typescript
// src/shared/lib/api-client.ts

class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public fields?: Record<string, string[]>
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export async function apiClient<T>(
  url: string,
  options: RequestInit = {}
): Promise<{ data: T; meta?: PaginationMeta }> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type':  'application/json',
      'X-Request-ID':  generateRequestId(),
      ...options.headers,
    },
    credentials: 'include',   // Send session cookie on all requests
  })

  const json = await response.json()

  if (!json.success) {
    throw new ApiError(
      json.error.code,
      json.error.message,
      json.error.fields
    )
  }

  return { data: json.data, meta: json.meta }
}

// Usage in services:
export const bookingService = {
  create: (data: CreateBookingInput) =>
    apiClient<Booking>('/api/v1/bookings', {
      method: 'POST',
      body:   JSON.stringify(data),
    }),

  getAll: (filters: BookingFilters) =>
    apiClient<Booking[]>(`/api/v1/bookings?${new URLSearchParams(filters as any)}`),

  getById: (id: string) =>
    apiClient<Booking>(`/api/v1/bookings/${id}`),

  updateStatus: (id: string, status: BookingStatus) =>
    apiClient<Booking>(`/api/v1/bookings/${id}`, {
      method: 'PATCH',
      body:   JSON.stringify({ status }),
    }),

  remove: (id: string) =>
    apiClient<{ deleted_at: string }>(`/api/v1/bookings/${id}`, {
      method: 'DELETE',
    }),
}
```

---

## SUMMARY

```
─────────────────────────────────────────────────────────────────
TOTAL ENDPOINTS:          18
PUBLIC ENDPOINTS:          6  (health, login, bookings POST,
                               projects GET, contact POST,
                               settings GET)
ADMIN ENDPOINTS:          12  (logout, all GET/PATCH/DELETE
                               on bookings/projects/contact,
                               settings PATCH)
RATE LIMITED ENDPOINTS:    3  (login, bookings POST, contact POST)
AUDIT LOGGED ENDPOINTS:   12  (all state-changing operations)
ZOD SCHEMAS REQUIRED:      8  (one per unique request body shape)
─────────────────────────────────────────────────────────────────
```

---

*API Design Complete*
*Status: All 18 endpoints specified · Request/response examples complete*
*Error cases documented · Middleware order defined · API client typed*
*Next: Component Architecture — every frontend component specified*
