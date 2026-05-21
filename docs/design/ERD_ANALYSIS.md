# SUNDUZA ARCHITECTURAL & PROJECTS
## Entity Relationship Analysis
### Entity-by-Entity · Relationship-by-Relationship · M:N Resolution · Complete ERD

---

> We go slow here. Every entity justified. Every relationship explained.
> Every assumption challenged. Then and only then — the complete ERD.

---

## PART 1 — ENTITY ANALYSIS

We extract every entity from the system, examine what it represents,
what it owns, what it does NOT own, and what makes it distinct.

---

### ENTITY 1 — User

**What it represents:**
The single administrator of the system. The business owner,
Xivutiso Kevin Sunduza. This is not a visitor. Visitors never
get a User record. User is exclusively the admin identity.

**Why it is its own entity:**
It has its own lifecycle (created once, never deleted in v1),
its own attributes that belong to no other entity, and it is
the subject of authentication and session management.

**Attributes:**

| Attribute | Type | Constraint | Reason |
|---|---|---|---|
| id | CUID | PK, NOT NULL | Unique identifier — non-sequential for security |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Login credential — one admin email only |
| password | VARCHAR(255) | NOT NULL | bcrypt hash, cost factor 12 — never plaintext |
| name | VARCHAR(100) | NULL | Display name — optional but useful in admin UI |
| role | ENUM(ADMIN) | NOT NULL, DEFAULT ADMIN | v2-ready for multi-role — currently always ADMIN |
| failed_attempts | INTEGER | NOT NULL, DEFAULT 0 | Account lockout counter — resets on success |
| locked_until | TIMESTAMP | NULL | NULL = not locked · timestamp = locked until then |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Audit trail |
| updated_at | TIMESTAMP | NOT NULL | Auto-updated on every change |
| deleted_at | TIMESTAMP | NULL | Soft delete — NULL = active |

**What User does NOT own:**
- Visitor information (bookings are anonymous)
- Project content (projects are the business's portfolio, not the admin's personal items)
- Contact messages (they come from visitors, not from the admin)

**Candidate keys:** `email` (natural unique key)
**Primary key:** `id` (surrogate — protects against email changes)

---

### ENTITY 2 — Session

**What it represents:**
An active authenticated session for the admin user.
Created by NextAuth.js when admin logs in. Destroyed on logout
or expiry. Not a concept that visitors interact with.

**Why it is its own entity:**
Sessions have a lifecycle completely separate from User.
One user can have multiple concurrent sessions (logged in on
phone + laptop). Session expiry does not affect the User record.
Rotating sessions (security requirement) means creating new rows
without touching User.

**Attributes:**

| Attribute | Type | Constraint | Reason |
|---|---|---|---|
| id | CUID | PK, NOT NULL | Session identifier |
| session_token | VARCHAR(255) | UNIQUE, NOT NULL | The actual token stored in the HTTP-only cookie |
| user_id | CUID | FK → User, NOT NULL | Which admin this session belongs to |
| expires | TIMESTAMP | NOT NULL | When this session becomes invalid |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Audit — when was this session created |
| updated_at | TIMESTAMP | NOT NULL | Sliding window update timestamp |

**What Session does NOT own:**
- User attributes — Session is just a pointer to User
- Any booking or project data

**Candidate keys:** `session_token` (must be unique per session)
**Primary key:** `id` (surrogate)

---

### ENTITY 3 — Booking

**What it represents:**
A consultation request submitted by a visitor through the booking
form. This is the primary business asset of the system. Every
booking is a potential client. It is intentionally anonymous —
visitors do not need an account to book.

**Why it is its own entity:**
It has the richest attribute set in the system. It has its own
status lifecycle (5 states). It captures marketing intelligence
(UTM, referrer). It has legal obligations attached (POPIA consent).
It is the primary thing the admin manages day-to-day.

**Attributes:**

| Attribute | Type | Constraint | Reason |
|---|---|---|---|
| id | CUID | PK, NOT NULL | Unique identifier |
| name | VARCHAR(100) | NOT NULL | Visitor's full name |
| email | VARCHAR(255) | NOT NULL | Contact email |
| phone | VARCHAR(20) | NOT NULL | SA phone — primary contact method |
| service | VARCHAR(50) | NOT NULL | One of 4 service enum values |
| location | VARCHAR(200) | NOT NULL | Project location |
| description | TEXT | NOT NULL | Project description (min 20 chars) |
| meeting_date | TIMESTAMP | NULL | Optional preferred meeting date |
| budget | VARCHAR(50) | NULL | Optional budget indicator |
| status | ENUM | NOT NULL, DEFAULT PENDING | Booking lifecycle state |
| consent_given | BOOLEAN | NOT NULL, DEFAULT FALSE | POPIA — must be TRUE to submit |
| consent_given_at | TIMESTAMP | NULL | When consent was captured |
| lead_score | INTEGER | NULL | Calculated 0–100 on creation |
| utm_source | VARCHAR(100) | NULL | Marketing channel |
| utm_medium | VARCHAR(100) | NULL | Marketing medium |
| utm_campaign | VARCHAR(100) | NULL | Campaign name |
| utm_term | VARCHAR(100) | NULL | Search keyword |
| utm_content | VARCHAR(100) | NULL | Ad variant |
| referrer_url | VARCHAR(500) | NULL | Where visitor came from |
| landing_page | VARCHAR(500) | NULL | Which page they converted on |
| user_agent | VARCHAR(500) | NULL | Browser/device info |
| ip_address | VARCHAR(64) | NULL | SHA-256 hashed — never raw |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | When booking was submitted |
| updated_at | TIMESTAMP | NOT NULL | Last status change time |
| deleted_at | TIMESTAMP | NULL | Soft delete — NULL = active |

**What Booking does NOT own:**
- Any reference to a User (admin) — bookings are anonymous submissions
- Any reference to a Project — a visitor books a service, not a project
- Any reference to a Service entity — service is a constrained string value,
  not a relational entity in v1 (services don't have their own lifecycle)

**Candidate keys:** None — no natural unique key (same person can book multiple times)
**Primary key:** `id` (surrogate)

**Important design note on `service` field:**
`service` is stored as a constrained VARCHAR, not a foreign key to a Service
table. This is a deliberate decision: services in v1 are fixed (4 values),
have no independent lifecycle, and the admin cannot add or remove them.
If services become manageable entities (v2), we introduce a Service table
and add a FK then. This is the right call for v1.

---

### ENTITY 4 — Project

**What it represents:**
A past architectural work completed by the business. Displayed
in the portfolio section. Each project is evidence of capability —
it is the primary trust-building content on the site.

**Why it is its own entity:**
Projects are managed independently by the admin (CRUD operations).
They have their own display attributes (image, category, sort order,
featured flag). They have a relationship with Testimonials. They
have their own lifecycle (created, updated, soft-deleted).

**Attributes:**

| Attribute | Type | Constraint | Reason |
|---|---|---|---|
| id | CUID | PK, NOT NULL | Unique identifier |
| title | VARCHAR(100) | NOT NULL | Project display title |
| description | TEXT | NOT NULL | What the project involved |
| image_path | VARCHAR(255) | NOT NULL | /images/projects/filename.ext — constrained format |
| category | VARCHAR(50) | NULL | Residential, Commercial, etc. — for filtering |
| sort_order | INTEGER | NOT NULL, DEFAULT 0 | Admin-controlled display order |
| is_featured | BOOLEAN | NOT NULL, DEFAULT FALSE | Show on homepage preview (max 3) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | When added to portfolio |
| updated_at | TIMESTAMP | NOT NULL | Last edit time |
| deleted_at | TIMESTAMP | NULL | Soft delete |

**What Project does NOT own:**
- Any visitor data
- Any booking data
- The testimonial text (Testimonial is its own entity that references Project)

**Candidate keys:** None — title is not unique (two projects could share a name)
**Primary key:** `id` (surrogate)

---

### ENTITY 5 — Testimonial

**What it represents:**
A written review from a past client about their experience with
the business. In v1, testimonials are seeded manually into the
database. In v2, the admin manages them through the UI. A
testimonial may or may not be linked to a specific project.

**Why it is its own entity:**
A testimonial has attributes that belong to no other entity
(client_name, review text, star rating, is_active flag). It can
optionally reference a Project (to show which work it refers to).
Its display can be toggled independently (is_active). It has its
own soft-delete lifecycle.

**Attributes:**

| Attribute | Type | Constraint | Reason |
|---|---|---|---|
| id | CUID | PK, NOT NULL | Unique identifier |
| client_name | VARCHAR(100) | NOT NULL | Name of the reviewing client |
| review | TEXT | NOT NULL | The testimonial text |
| rating | INTEGER | NULL, CHECK 1–5 | Star rating — optional |
| project_id | CUID | FK → Project, NULL | Which project this refers to — optional |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | Show/hide without deleting |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | When added |
| updated_at | TIMESTAMP | NOT NULL | Last edit |
| deleted_at | TIMESTAMP | NULL | Soft delete |

**What Testimonial does NOT own:**
- The project details — it only references a project via FK
- Any booking or visitor data

**Candidate keys:** None
**Primary key:** `id` (surrogate)

**Design note on optional project_id:**
`project_id` is nullable because a testimonial may be a general
review of the business, not tied to a specific project. When
`project_id` IS NULL, the testimonial stands alone. When it is
set, the UI can optionally show which project the client is
reviewing. This is a valid optional FK — not a design smell.

---

### ENTITY 6 — ContactMessage

**What it represents:**
A general inquiry submitted through the contact form by a visitor
who is not yet ready to book a consultation. Different from a
Booking — no service selection, no meeting date, no lead scoring.
Just a name, email, and message.

**Why it is its own entity:**
It has a distinct set of attributes from Booking. It has its own
read/unread status lifecycle (not a booking status — completely
different concept). It does not carry UTM data or lead scoring
because it is not a conversion event in the same way a booking is.
Merging it with Booking would pollute both entities with NULLs.

**Attributes:**

| Attribute | Type | Constraint | Reason |
|---|---|---|---|
| id | CUID | PK, NOT NULL | Unique identifier |
| name | VARCHAR(100) | NOT NULL | Sender's name |
| email | VARCHAR(255) | NOT NULL | Reply-to address |
| phone | VARCHAR(20) | NULL | Optional — may leave only email |
| message | TEXT | NOT NULL | The inquiry content |
| read | BOOLEAN | NOT NULL, DEFAULT FALSE | Unread badge in admin |
| read_at | TIMESTAMP | NULL | When admin marked it read |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | When sent |
| updated_at | TIMESTAMP | NOT NULL | Last update |
| deleted_at | TIMESTAMP | NULL | Soft delete |

**What ContactMessage does NOT own:**
- Any reference to a booking or project
- Any marketing attribution (not a tracked conversion in v1)
- Any admin user reference (who read it is tracked in AuditLog)

**Candidate keys:** None
**Primary key:** `id` (surrogate)

---

### ENTITY 7 — SiteSettings

**What it represents:**
Key-value configuration pairs that control runtime behaviour of
the site without requiring a code deployment. The admin can change
the WhatsApp number, contact email, hero tagline, and other
business details through the admin UI.

**Why it is its own entity:**
Configuration has its own lifecycle — it is read frequently,
written rarely, and each key is independent. Storing it in a
table means the admin controls it. Storing it in code means a
developer must be involved. That violates BR-010.

**Attributes:**

| Attribute | Type | Constraint | Reason |
|---|---|---|---|
| id | CUID | PK, NOT NULL | Unique identifier |
| key | VARCHAR(100) | UNIQUE, NOT NULL | Setting name — e.g. whatsapp_number |
| value | TEXT | NOT NULL | The setting's current value |
| description | VARCHAR(255) | NULL | Human-readable purpose for admin UI |
| updated_at | TIMESTAMP | NOT NULL | When last changed |
| updated_by | CUID | FK → User, NULL | Which admin changed it — optional |

**What SiteSettings does NOT own:**
- Any visitor or booking data
- Theme or design values (those stay in config files — they require redeployment by design)

**Candidate keys:** `key` (the natural unique key for lookups)
**Primary key:** `id` (surrogate — consistent with all other entities)

**Design note:**
The `key` field is the natural lookup key. All queries use
`WHERE key = 'whatsapp_number'` not `WHERE id = 'clx...'`.
The surrogate `id` exists for consistency and future referencing.

---

### ENTITY 8 — Notification

**What it represents:**
A queued notification that the system intends to send. In v1,
rows are inserted but never processed (no sender exists yet).
In v2, a background worker reads unsent rows and dispatches them
via Resend (email) or Twilio/WATI (WhatsApp). This is the
outbox pattern — write the intent, process it separately.

**Why it is its own entity:**
It decouples the act of creating a booking from the act of
notifying the admin. The notification queue can be retried,
inspected, and extended with new channels without touching
the booking creation logic.

**Attributes:**

| Attribute | Type | Constraint | Reason |
|---|---|---|---|
| id | CUID | PK, NOT NULL | Unique identifier |
| type | VARCHAR(50) | NOT NULL | BOOKING_RECEIVED, STATUS_CHANGED |
| channel | VARCHAR(20) | NOT NULL | email, whatsapp, sms |
| recipient | VARCHAR(255) | NOT NULL | Email address or phone number |
| payload | JSONB | NOT NULL | Full notification content for rendering |
| sent_at | TIMESTAMP | NULL | NULL = unsent · timestamp = when sent successfully |
| failed_at | TIMESTAMP | NULL | When last send attempt failed |
| error | TEXT | NULL | Error message from failed attempt |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | When queued |

**What Notification does NOT own:**
- A direct FK to Booking — the booking ID lives inside `payload`
  as JSON. This is intentional: notifications can be triggered
  by other entities in v2 (projects, settings changes) without
  schema changes.

**Candidate keys:** None
**Primary key:** `id` (surrogate)

---

### ENTITY 9 — AuditLog

**What it represents:**
An immutable record of every significant action performed in the
system. Admin actions (status updates, project creation), system
actions (booking created by visitor), and security events
(login success/failure) all create AuditLog rows. Rows are
NEVER updated or deleted. The audit trail is permanent.

**Why it is its own entity:**
Audit records have a completely different lifecycle from all other
entities — they are write-once, never modified, never soft-deleted.
They record what happened to other entities, not what those entities
currently are. They reference the actor (User), the action performed,
and the target entity — three separate concepts that belong together
only in the context of an audit event.

**Attributes:**

| Attribute | Type | Constraint | Reason |
|---|---|---|---|
| id | CUID | PK, NOT NULL | Unique identifier |
| action | ENUM | NOT NULL | The AuditAction enum value |
| entity_type | VARCHAR(50) | NOT NULL | Which table was affected (Booking, Project…) |
| entity_id | VARCHAR(128) | NOT NULL | The CUID of the affected row |
| user_id | CUID | FK → User, NULL | NULL for public actions (visitor bookings) |
| ip_address | VARCHAR(64) | NULL | Hashed IP address |
| user_agent | VARCHAR(500) | NULL | Browser/device info |
| metadata | JSONB | NULL | { old_status, new_status, changed_fields… } |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | When this event occurred |

**What AuditLog does NOT own:**
- The current state of any entity — it records past events, not present state
- Hard references to Booking, Project, etc. as typed FKs — entity_id
  is a generic VARCHAR because audit logs outlive the records they reference
  (a soft-deleted booking still has audit logs). A FK would prevent this.

**Candidate keys:** None — each audit event is unique by nature
**Primary key:** `id` (surrogate)

**Design note on why entity_id is NOT a FK:**
If we made `entity_id` a proper FK to `bookings.id`, then deleting
a booking (even soft delete) would cascade or restrict the audit log.
Audit logs must survive beyond the lifetime of the thing they recorded.
A polymorphic VARCHAR reference is the correct pattern here.

---

## PART 2 — RELATIONSHIP ANALYSIS

Now we examine every relationship between entities.
For each relationship we state: who, what cardinality, what the
FK is, whether it is mandatory or optional, and what happens
on delete.

---

### RELATIONSHIP 1 — User → Session

```
User ──────────────────────────────── Session
 1                                       N
(one admin)                    (many concurrent sessions)
```

**Narrative:**
One User (the admin) can have many Sessions (logged in on
multiple devices simultaneously). Each Session belongs to exactly
one User. A Session cannot exist without its User.

**Cardinality:** 1:N (one User to many Sessions)

**FK:** `Session.user_id → User.id`

**Mandatory/Optional:**
- Session → User: **Mandatory** — a session must belong to a user
- User → Session: **Optional** — a user can have zero sessions (not logged in anywhere)

**On Delete:** `CASCADE` — when User is deleted, all their Sessions are deleted.
An orphan session with no user is meaningless and dangerous.

**Type:** 1:N — **No M:N issue**

---

### RELATIONSHIP 2 — User → AuditLog

```
User ──────────────────────────────── AuditLog
 1                                       N
(one admin)                     (many audit events they triggered)
```

**Narrative:**
One User (admin) triggers many AuditLog entries over their lifetime
(every login, every status update, every project edit). Each
AuditLog entry that was triggered by an admin references that User.
However, not all AuditLog entries have a user — public actions
(visitor submits booking) generate audit entries with `user_id = NULL`.

**Cardinality:** 1:N (one User to many AuditLog rows)

**FK:** `AuditLog.user_id → User.id` — **nullable FK**

**Mandatory/Optional:**
- AuditLog → User: **Optional** — visitor-triggered events have no user
- User → AuditLog: **Optional** — a user may have triggered no audit events yet

**On Delete:** `SET NULL` — if User is ever deleted, their audit entries remain
(audit trail must survive). The `user_id` becomes NULL, meaning "performed by
a now-deleted admin."

**Type:** 1:N — **No M:N issue**

---

### RELATIONSHIP 3 — User → SiteSettings

```
User ──────────────────────────────── SiteSettings
 1                                         N
(one admin)                        (many settings they last updated)
```

**Narrative:**
One User (admin) can update many SiteSettings entries over time.
Each SiteSettings row records who last changed it via `updated_by`.
This is an accountability trail, not a deep relationship. A setting
can exist with `updated_by = NULL` (seeded by the system, never
manually updated yet).

**Cardinality:** 1:N (one User to many SiteSettings rows they've updated)

**FK:** `SiteSettings.updated_by → User.id` — **nullable FK**

**Mandatory/Optional:**
- SiteSettings → User: **Optional** — seeded settings have no updater
- User → SiteSettings: **Optional** — admin may never change a setting

**On Delete:** `SET NULL` — setting survives if admin is ever removed

**Type:** 1:N — **No M:N issue**

---

### RELATIONSHIP 4 — Project → Testimonial

```
Project ────────────────────────────── Testimonial
   1                                       N
(one project)                  (zero or many testimonials about it)
```

**Narrative:**
One Project can have many Testimonials written about it (multiple
clients who were part of the same development project, or the admin
adds multiple reviews referencing the same work). Each Testimonial
optionally references one Project. A Testimonial with no project
reference is a general business review, not tied to specific work.

**Cardinality:** 1:N (one Project to many Testimonials)

**FK:** `Testimonial.project_id → Project.id` — **nullable FK**

**Mandatory/Optional:**
- Testimonial → Project: **Optional** — testimonial can be standalone
- Project → Testimonial: **Optional** — a project may have no testimonials

**On Delete:** `SET NULL` — if a project is deleted, its testimonials remain
visible (they are still valid reviews of the business). The `project_id`
becomes NULL — the testimonial becomes a general review.

**Type:** 1:N — **No M:N issue**

---

### RELATIONSHIP 5 — Booking (standalone — no entity relationship)

**Narrative:**
Booking has NO foreign key to any other business entity.

This is intentional and correct:
- Booking → User: No. Bookings are anonymous. The admin does not "own" a booking the way a user owns a session.
- Booking → Project: No. A visitor books a **service**, not a specific project.
- Booking → Service entity: No. Service is a constrained string value in v1, not a relational entity.

The Booking is an island entity. Its only "connections" to the rest of the
system are:
1. AuditLog entries that reference `entity_id = booking.id` (polymorphic — not a FK)
2. Notification rows whose `payload` JSON contains the booking ID (not a FK)

**This is correct design.** Booking stands alone.

---

### RELATIONSHIP 6 — ContactMessage (standalone — no entity relationship)

**Narrative:**
ContactMessage also has NO foreign key to any other entity.
A contact message is an isolated event — a visitor sends a message.
The admin reads it. No further relationship is needed.

Like Booking, it is referenced by AuditLog polymorphically.

**This is correct design.** ContactMessage stands alone.

---

### RELATIONSHIP 7 — Notification (standalone — no typed FK)

**Narrative:**
Notification has no typed FK to Booking or any other entity.
The reference to the triggering entity lives inside the `payload`
JSONB field. This is the outbox pattern — intentional loose coupling.

In v2, notifications could be triggered by:
- A new booking (BOOKING_RECEIVED)
- A status change (STATUS_CHANGED)
- A new contact message (MESSAGE_RECEIVED)

If Notification had a FK to Booking, it could not be used for
message notifications without adding another nullable FK.
The JSONB payload approach avoids this without schema changes.

**Notification has no entity-to-entity FK relationships.**

---

## PART 3 — M:N RELATIONSHIP ANALYSIS

Now we examine whether any relationships between entities are
Many-to-Many. If they are, we must introduce a junction/bridge
table to resolve them into two 1:N relationships.

---

### Checking Every Entity Pair

| Entity A | Entity B | Relationship | M:N? |
|---|---|---|---|
| User | Session | One admin has many sessions | No — 1:N |
| User | AuditLog | One admin triggers many audit events | No — 1:N |
| User | SiteSettings | One admin updates many settings | No — 1:N |
| Project | Testimonial | One project has many testimonials | No — 1:N |
| Booking | Project | Visitor books a service, not a project | No relationship |
| Booking | User | Bookings are anonymous | No relationship |
| Booking | Testimonial | No connection | No relationship |
| ContactMessage | User | No ownership relationship | No relationship |
| ContactMessage | Booking | Different form, different intent | No relationship |
| Notification | Booking | Loose coupling via JSON payload | No typed relationship |
| AuditLog | Booking | Polymorphic via entity_id VARCHAR | No typed FK |
| AuditLog | Project | Polymorphic via entity_id VARCHAR | No typed FK |

**Verdict: There are ZERO M:N relationships in the Sunduza v1 schema.**

---

### Why There Are No M:N Relationships

This is not an accident. It is a result of how the system is designed:

**1. Booking is anonymous.**
If bookings were tied to visitor accounts, you would have:
`Visitor M:N Service` (one visitor can book many services, one service can be booked by many visitors).
That would require a junction table. But because there are no visitor accounts in v1,
the Booking itself IS the junction concept — it captures one visit + one service at one moment.

**2. Services are not entities.**
If services were a full entity with their own table, you would have:
`Booking M:N Service` (in theory, a booking could request multiple services).
But the business rule is clear — one booking = one service. And services have no independent
lifecycle. So `service` is a constrained VARCHAR on Booking. No junction needed.

**3. Projects and Testimonials are 1:N, not M:N.**
A testimonial is about one project (or no project). A project could have many testimonials.
This is clean 1:N. If a testimonial could reference multiple projects, it would be M:N.
The business does not have this requirement.

**4. Audit is polymorphic, not relational.**
AuditLog uses `(entity_type, entity_id)` VARCHAR pair instead of typed FKs. This means
there is no AuditLog-to-Booking relationship table needed. The tradeoff is no DB-enforced
FK integrity — which is acceptable for an audit table that must survive its subjects.

---

### v2 Note — Where M:N Could Emerge

When v2 features are added, M:N relationships will likely appear:

| Future Feature | M:N Scenario | Junction Table Needed |
|---|---|---|
| Client portal | One client can have many bookings, one booking could be reassigned | BookingClient |
| Project tags | One project has many tags, one tag appears on many projects | ProjectTag |
| Admin team | One booking can be assigned to many admins, one admin handles many bookings | BookingAssignment |
| Service packages | One booking can include multiple services | BookingService |

These do not exist in v1. The schema is clean.

---

## PART 4 — COMPLETE ERD

Now we draw the complete, final ERD with all entities, all
attributes, all primary keys, all foreign keys, all cardinalities,
and all constraints. This is the single source of truth.

---

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║                    SUNDUZA ARCHITECTURAL & PROJECTS                            ║
║                         COMPLETE ENTITY RELATIONSHIP DIAGRAM                   ║
║                                    v1.0                                        ║
╚══════════════════════════════════════════════════════════════════════════════════╝


┌─────────────────────────────┐
│            USER             │
├─────────────────────────────┤
│ PK  id            CUID      │
│ UQ  email         VARCHAR   │
│     password      VARCHAR   │  bcrypt hash
│     name          VARCHAR   │  nullable
│     role          ENUM      │  ADMIN (default)
│     failed_attempts INTEGER │  default 0
│     locked_until  TIMESTAMP │  nullable
│     created_at    TIMESTAMP │
│     updated_at    TIMESTAMP │
│     deleted_at    TIMESTAMP │  nullable (soft delete)
└──────────────┬──────────────┘
               │
               │ 1
               │ "has many"
               │
     ┌─────────┼─────────┐
     │         │         │
     │ N       │ N       │ N
     ▼         ▼         ▼

┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────────┐
│       SESSION       │   │      AUDITLOG        │   │      SITESETTINGS       │
├─────────────────────┤   ├─────────────────────┤   ├─────────────────────────┤
│ PK id      CUID     │   │ PK id       CUID     │   │ PK  id       CUID       │
│ UQ session_token    │   │    action   ENUM     │   │ UQ  key      VARCHAR    │
│ FK user_id CUID     │   │    entity_type       │   │     value    TEXT        │
│    expires TIMESTAMP│   │           VARCHAR    │   │     description VARCHAR  │
│    created_at       │   │    entity_id         │   │     updated_at TIMESTAMP │
│    updated_at       │   │           VARCHAR    │   │ FK  updated_by CUID      │  nullable
└─────────────────────┘   │ FK user_id  CUID     │   └─────────────────────────┘
                          │           nullable   │
  ON DELETE: CASCADE      │    ip_address VARCHAR│     ON DELETE: SET NULL
  (Session dies with User)│    user_agent VARCHAR│     (Setting survives if User deleted)
                          │    metadata   JSONB  │
                          │    created_at        │
                          └─────────────────────┘

                            ON DELETE: SET NULL
                            (Audit survives if User deleted)
                            NEVER updated. NEVER deleted.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


┌──────────────────────────────────────┐
│               PROJECT                │
├──────────────────────────────────────┤
│ PK  id           CUID                │
│     title        VARCHAR(100)        │
│     description  TEXT                │
│     image_path   VARCHAR(255)        │
│     category     VARCHAR(50)         │  nullable
│     sort_order   INTEGER             │  default 0
│     is_featured  BOOLEAN             │  default FALSE
│     created_at   TIMESTAMP           │
│     updated_at   TIMESTAMP           │
│     deleted_at   TIMESTAMP           │  nullable (soft delete)
└─────────────────┬────────────────────┘
                  │
                  │ 1
                  │ "has zero or many"
                  │
                  │ N
                  ▼

┌──────────────────────────────────────┐
│            TESTIMONIAL               │
├──────────────────────────────────────┤
│ PK  id           CUID                │
│     client_name  VARCHAR(100)        │
│     review       TEXT                │
│     rating       INTEGER             │  nullable · CHECK (1 to 5)
│ FK  project_id   CUID                │  nullable → Project
│     is_active    BOOLEAN             │  default TRUE
│     created_at   TIMESTAMP           │
│     updated_at   TIMESTAMP           │
│     deleted_at   TIMESTAMP           │  nullable (soft delete)
└──────────────────────────────────────┘

  ON DELETE: SET NULL
  (Testimonial becomes general review if Project deleted)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


┌────────────────────────────────────────────────────────────────┐
│                          BOOKING                               │
│                  (Island Entity — No FK to other business data)│
├────────────────────────────────────────────────────────────────┤
│  ── IDENTITY ──                                                │
│  PK  id               CUID                                     │
│                                                                │
│  ── VISITOR CONTACT ──                                         │
│      name             VARCHAR(100)    NOT NULL                 │
│      email            VARCHAR(255)    NOT NULL                 │
│      phone            VARCHAR(20)     NOT NULL                 │
│                                                                │
│  ── PROJECT DETAILS ──                                         │
│      service          VARCHAR(50)     NOT NULL                 │
│                        CHECK IN (house_planning,               │
│                                  arch_drawings,                │
│                                  drafting_services,            │
│                                  dev_project_planning)         │
│      location         VARCHAR(200)    NOT NULL                 │
│      description      TEXT            NOT NULL                 │
│      meeting_date     TIMESTAMP       nullable                 │
│      budget           VARCHAR(50)     nullable                 │
│                                                                │
│  ── LEAD MANAGEMENT ──                                         │
│      status           ENUM            NOT NULL DEFAULT PENDING │
│                        (PENDING, CONTACTED, CONFIRMED,         │
│                         COMPLETED, REJECTED)                   │
│      lead_score       INTEGER         nullable  (0 to 100)     │
│                                                                │
│  ── LEGAL (POPIA) ──                                           │
│      consent_given    BOOLEAN         NOT NULL DEFAULT FALSE   │
│      consent_given_at TIMESTAMP       nullable                 │
│                                                                │
│  ── MARKETING ATTRIBUTION ──                                   │
│      utm_source       VARCHAR(100)    nullable                 │
│      utm_medium       VARCHAR(100)    nullable                 │
│      utm_campaign     VARCHAR(100)    nullable                 │
│      utm_term         VARCHAR(100)    nullable                 │
│      utm_content      VARCHAR(100)    nullable                 │
│      referrer_url     VARCHAR(500)    nullable                 │
│      landing_page     VARCHAR(500)    nullable                 │
│                                                                │
│  ── TECHNICAL METADATA ──                                      │
│      user_agent       VARCHAR(500)    nullable                 │
│      ip_address       VARCHAR(64)     nullable (SHA-256 hash)  │
│                                                                │
│  ── AUDIT TIMESTAMPS ──                                        │
│      created_at       TIMESTAMP       NOT NULL                 │
│      updated_at       TIMESTAMP       NOT NULL                 │
│      deleted_at       TIMESTAMP       nullable (soft delete)   │
└────────────────────────────────────────────────────────────────┘


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


┌──────────────────────────────────────┐
│          CONTACTMESSAGE              │
│     (Island Entity — No FK)          │
├──────────────────────────────────────┤
│ PK  id           CUID                │
│     name         VARCHAR(100)        │
│     email        VARCHAR(255)        │
│     phone        VARCHAR(20)         │  nullable
│     message      TEXT                │
│     read         BOOLEAN             │  NOT NULL DEFAULT FALSE
│     read_at      TIMESTAMP           │  nullable
│     created_at   TIMESTAMP           │
│     updated_at   TIMESTAMP           │
│     deleted_at   TIMESTAMP           │  nullable (soft delete)
└──────────────────────────────────────┘


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


┌──────────────────────────────────────┐
│           NOTIFICATION               │
│   (Outbox Pattern — No typed FK)     │
├──────────────────────────────────────┤
│ PK  id           CUID                │
│     type         VARCHAR(50)         │  BOOKING_RECEIVED, STATUS_CHANGED
│     channel      VARCHAR(20)         │  email, whatsapp, sms
│     recipient    VARCHAR(255)        │  email or phone
│     payload      JSONB               │  { booking_id, name, service… }
│     sent_at      TIMESTAMP           │  nullable — NULL = unsent
│     failed_at    TIMESTAMP           │  nullable
│     error        TEXT                │  nullable
│     created_at   TIMESTAMP           │
└──────────────────────────────────────┘


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


RELATIONSHIP SUMMARY TABLE
─────────────────────────────────────────────────────────────────

 From          To              Type  FK Column        On Delete
 ─────────────────────────────────────────────────────────────────
 User      →  Session          1:N   session.user_id  CASCADE
 User      →  AuditLog         1:N   audit.user_id    SET NULL (nullable)
 User      →  SiteSettings     1:N   settings.updated_by SET NULL (nullable)
 Project   →  Testimonial      1:N   testimonial.project_id SET NULL (nullable)
 ─────────────────────────────────────────────────────────────────
 Booking        — no typed FK relationships —
 ContactMessage — no typed FK relationships —
 Notification   — no typed FK relationships —
 AuditLog       — polymorphic entity_type + entity_id (not a FK) —
 ─────────────────────────────────────────────────────────────────


TOTAL TYPED FOREIGN KEYS: 4
TOTAL M:N RELATIONSHIPS:  0
TOTAL JUNCTION TABLES:    0
TOTAL ENTITIES:           9
─────────────────────────────────────────────────────────────────
```

---

## PART 5 — ENTITY SUMMARY CARD

One card per entity. Quick reference for normalization phase.

```
┌─ USER ───────────────────────────────────────────────────┐
│  PK: id                                                   │
│  UQ: email                                                │
│  FK: none                                                 │
│  Nullable: name, locked_until, deleted_at                 │
│  Purpose: Admin authentication + identity                 │
└───────────────────────────────────────────────────────────┘

┌─ SESSION ─────────────────────────────────────────────────┐
│  PK: id                                                   │
│  UQ: session_token                                        │
│  FK: user_id → User (CASCADE)                             │
│  Nullable: none                                           │
│  Purpose: Admin session management                        │
└───────────────────────────────────────────────────────────┘

┌─ BOOKING ─────────────────────────────────────────────────┐
│  PK: id                                                   │
│  UQ: none                                                 │
│  FK: none                                                 │
│  Nullable: meeting_date, budget, lead_score,              │
│            consent_given_at, all utm_*, referrer_url,     │
│            landing_page, user_agent, ip_address,          │
│            deleted_at                                     │
│  Purpose: Core lead capture entity                        │
└───────────────────────────────────────────────────────────┘

┌─ PROJECT ─────────────────────────────────────────────────┐
│  PK: id                                                   │
│  UQ: none                                                 │
│  FK: none                                                 │
│  Nullable: category, deleted_at                           │
│  Purpose: Portfolio item management                       │
└───────────────────────────────────────────────────────────┘

┌─ TESTIMONIAL ─────────────────────────────────────────────┐
│  PK: id                                                   │
│  UQ: none                                                 │
│  FK: project_id → Project (SET NULL, nullable)            │
│  Nullable: rating, project_id, deleted_at                 │
│  Purpose: Social proof, linked or standalone              │
└───────────────────────────────────────────────────────────┘

┌─ CONTACTMESSAGE ──────────────────────────────────────────┐
│  PK: id                                                   │
│  UQ: none                                                 │
│  FK: none                                                 │
│  Nullable: phone, read_at, deleted_at                     │
│  Purpose: General visitor inquiries                       │
└───────────────────────────────────────────────────────────┘

┌─ SITESETTINGS ────────────────────────────────────────────┐
│  PK: id                                                   │
│  UQ: key                                                  │
│  FK: updated_by → User (SET NULL, nullable)               │
│  Nullable: description, updated_by                        │
│  Purpose: Runtime configuration without redeployment      │
└───────────────────────────────────────────────────────────┘

┌─ NOTIFICATION ────────────────────────────────────────────┐
│  PK: id                                                   │
│  UQ: none                                                 │
│  FK: none (outbox pattern — entity ref in payload JSONB)  │
│  Nullable: sent_at, failed_at, error                      │
│  Purpose: v2-ready outbound notification queue            │
└───────────────────────────────────────────────────────────┘

┌─ AUDITLOG ────────────────────────────────────────────────┐
│  PK: id                                                   │
│  UQ: none                                                 │
│  FK: user_id → User (SET NULL, nullable)                  │
│  Nullable: user_id, ip_address, user_agent, metadata      │
│  Purpose: Immutable event log — write-once, never modified │
└───────────────────────────────────────────────────────────┘
```

---

## PART 6 — WHAT GOES INTO NORMALIZATION

When we move to normalization, these are the specific questions
we must answer for each entity:

### Booking — The Richest Entity

**UTM fields (utm_source, utm_medium, utm_campaign, utm_term, utm_content):**
Are these a repeating group? Could they be extracted into a
`BookingAttribution` table?
→ We examine this in 1NF.

**Visitor contact data (name, email, phone):**
Could the same visitor book twice? If so, is it a
functional dependency violation to store name/email/phone
directly on Booking?
→ We examine this in 2NF.

**Status history:**
The current design stores only the current status on Booking.
Is there a normalization argument for a `BookingStatusHistory` table?
→ We examine this during normalization.

### User — The Simplest Entity

All attributes depend solely on `id`. No multi-valued attributes.
Expected to pass all normal forms cleanly.

### AuditLog — The Edge Case

`entity_type` and `entity_id` together form a polymorphic reference.
In strict normalization terms, this is a design smell — we store
a type discriminator alongside a generic ID. But this is an accepted
pattern for audit tables. We will address this explicitly.

### SiteSettings — The Key-Value Store

The key-value pattern (`key`, `value`) is deliberately denormalized
for flexibility. We will state this explicitly and justify it.

---

*ERD Analysis Complete*
*Entities: 9 · FK Relationships: 4 · M:N Relationships: 0 · Junction Tables: 0*
*Ready for: Normalization (1NF → 2NF → 3NF → BCNF)*
