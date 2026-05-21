# SUNDUZA ARCHITECTURAL & PROJECTS
## Physical Database Schema
### Indexes · Constraints · CHECK Expressions · Sequences · Seed Data

---

> The normalization phase confirmed what data we store and why.
> The physical schema phase decides how the database enforces it,
> how queries find it fast, and what state the system starts in.
> This is where design meets the engine.

---

## CONTEXT

We have 9 entities all confirmed in BCNF.
4 typed FK relationships. 7 documented denormalizations.
Zero tables decomposed.

The Prisma schema in the system design document is the ORM layer.
This document goes one level deeper — the raw PostgreSQL physical
decisions that Prisma generates but that every developer must
understand to reason about performance and correctness.

---

## PART 1 — CONSTRAINT ARCHITECTURE

Constraints are the database's immune system.
They reject bad data before it ever lands.
The application validates first — the database enforces last.
Both layers are required.

---

### 1.1 PRIMARY KEY CONSTRAINTS

All PKs use CUID — a collision-resistant, URL-safe, non-sequential
identifier. Non-sequential means:
- No attacker can guess `id + 1` to enumerate records
- No hotspot contention on index inserts (unlike sequential INT)
- Globally unique across tables (safe for distributed systems later)

```sql
-- Every table follows this pattern
id VARCHAR(128) NOT NULL,
CONSTRAINT pk_user            PRIMARY KEY (id),
CONSTRAINT pk_session         PRIMARY KEY (id),
CONSTRAINT pk_booking         PRIMARY KEY (id),
CONSTRAINT pk_project         PRIMARY KEY (id),
CONSTRAINT pk_testimonial     PRIMARY KEY (id),
CONSTRAINT pk_contact_message PRIMARY KEY (id),
CONSTRAINT pk_site_settings   PRIMARY KEY (id),
CONSTRAINT pk_notification    PRIMARY KEY (id),
CONSTRAINT pk_audit_log       PRIMARY KEY (id)
```

---

### 1.2 UNIQUE CONSTRAINTS

```sql
-- USER — one admin email only
CONSTRAINT uq_user_email
  UNIQUE (email),

-- SESSION — each token is distinct
CONSTRAINT uq_session_token
  UNIQUE (session_token),

-- SITESETTINGS — one value per key
CONSTRAINT uq_site_settings_key
  UNIQUE (key)
```

---

### 1.3 FOREIGN KEY CONSTRAINTS

Four typed FK relationships. Each one named, each behavior specified.

```sql
-- SESSION → USER (mandatory, cascades on delete)
CONSTRAINT fk_session_user
  FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE CASCADE
  ON UPDATE CASCADE,

-- TESTIMONIAL → PROJECT (optional, nullifies on delete)
CONSTRAINT fk_testimonial_project
  FOREIGN KEY (project_id)
  REFERENCES projects(id)
  ON DELETE SET NULL
  ON UPDATE CASCADE,

-- SITESETTINGS → USER (optional, nullifies on delete)
CONSTRAINT fk_site_settings_updated_by
  FOREIGN KEY (updated_by)
  REFERENCES users(id)
  ON DELETE SET NULL
  ON UPDATE CASCADE,

-- AUDITLOG → USER (optional, nullifies on delete)
CONSTRAINT fk_audit_log_user
  FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE SET NULL
  ON UPDATE CASCADE
```

**Why CASCADE on Session but SET NULL on AuditLog:**

Session without a User is a security orphan — it must be destroyed.
AuditLog without a User is a historical record of "a now-deleted admin"
— it must survive. Different entities, different business meaning,
different delete behavior. This is intentional.

---

### 1.4 CHECK CONSTRAINTS

CHECK constraints enforce domain rules at the database level.
Even if the application layer fails, these cannot be bypassed.

```sql
-- BOOKING — service must be one of the 4 defined values
CONSTRAINT chk_booking_service
  CHECK (service IN (
    'house_planning',
    'arch_drawings',
    'drafting_services',
    'dev_project_planning'
  )),

-- BOOKING — status must be one of the 5 lifecycle states
CONSTRAINT chk_booking_status
  CHECK (status IN (
    'PENDING',
    'CONTACTED',
    'CONFIRMED',
    'COMPLETED',
    'REJECTED'
  )),

-- BOOKING — lead_score must be between 0 and 100 if present
CONSTRAINT chk_booking_lead_score
  CHECK (lead_score IS NULL OR (lead_score >= 0 AND lead_score <= 100)),

-- BOOKING — consent_given_at only set when consent_given is true
CONSTRAINT chk_booking_consent
  CHECK (
    (consent_given = FALSE AND consent_given_at IS NULL)
    OR
    (consent_given = TRUE AND consent_given_at IS NOT NULL)
  ),

-- BOOKING — meeting_date must be stored as UTC
-- (enforced by application layer — timestamp with time zone)

-- TESTIMONIAL — rating must be 1 through 5 if present
CONSTRAINT chk_testimonial_rating
  CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),

-- PROJECT — sort_order must be non-negative
CONSTRAINT chk_project_sort_order
  CHECK (sort_order >= 0),

-- AUDITLOG — action must be a known value
CONSTRAINT chk_audit_log_action
  CHECK (action IN (
    'LOGIN_SUCCESS',
    'LOGIN_FAILURE',
    'LOGOUT',
    'BOOKING_CREATE',
    'BOOKING_STATUS_UPDATE',
    'BOOKING_DELETE',
    'PROJECT_CREATE',
    'PROJECT_UPDATE',
    'PROJECT_DELETE',
    'CONTACT_MESSAGE_CREATE',
    'CONTACT_MESSAGE_READ',
    'SETTINGS_UPDATE'
  )),

-- NOTIFICATION — channel must be a known value
CONSTRAINT chk_notification_channel
  CHECK (channel IN ('email', 'whatsapp', 'sms')),

-- NOTIFICATION — type must be a known value
CONSTRAINT chk_notification_type
  CHECK (type IN ('BOOKING_RECEIVED', 'STATUS_CHANGED', 'MESSAGE_RECEIVED')),

-- USER — failed_attempts cannot be negative
CONSTRAINT chk_user_failed_attempts
  CHECK (failed_attempts >= 0)
```

---

### 1.5 NOT NULL STRATEGY

Every column is NOT NULL by default unless there is a documented
business reason for it to be nullable. Here is the complete
nullable field registry with justification:

| Table | Column | Nullable | Reason |
|---|---|---|---|
| User | name | ✅ | Admin display name — optional, system works without it |
| User | locked_until | ✅ | NULL means not locked — functional NULL |
| User | deleted_at | ✅ | NULL means active — soft delete sentinel |
| Session | — | — | No nullable columns — sessions are complete or don't exist |
| Booking | meeting_date | ✅ | Visitor may not have a preferred date yet |
| Booking | budget | ✅ | Visitor may not know budget yet |
| Booking | lead_score | ✅ | Calculated on create — NULL only briefly during insert transaction |
| Booking | consent_given_at | ✅ | NULL when consent_given = FALSE |
| Booking | utm_* (all 5) | ✅ | Marketing params — absent for direct/organic traffic |
| Booking | referrer_url | ✅ | Absent for direct traffic |
| Booking | landing_page | ✅ | Absent if UTM not set |
| Booking | user_agent | ✅ | Absent if not captured |
| Booking | ip_address | ✅ | Absent if capture fails |
| Booking | deleted_at | ✅ | Soft delete sentinel |
| Project | category | ✅ | Category is optional — not all projects are categorized |
| Project | deleted_at | ✅ | Soft delete sentinel |
| Testimonial | rating | ✅ | Client may not provide a star rating |
| Testimonial | project_id | ✅ | General review — not tied to specific project |
| Testimonial | deleted_at | ✅ | Soft delete sentinel |
| ContactMessage | phone | ✅ | Visitor may provide only email |
| ContactMessage | read_at | ✅ | NULL when unread |
| ContactMessage | deleted_at | ✅ | Soft delete sentinel |
| SiteSettings | description | ✅ | Human label — optional for programmatic keys |
| SiteSettings | updated_by | ✅ | Seeded rows have no human updater |
| Notification | sent_at | ✅ | NULL = queued unsent |
| Notification | failed_at | ✅ | NULL = never failed |
| Notification | error | ✅ | NULL = no error |
| AuditLog | user_id | ✅ | NULL for public actions (visitor submissions) |
| AuditLog | ip_address | ✅ | May not be capturable in all contexts |
| AuditLog | user_agent | ✅ | May not be present |
| AuditLog | metadata | ✅ | Some actions have no extra context |

---

## PART 2 — INDEX ARCHITECTURE

Indexes are the database's map. Without them, every query is a
full table scan. With the wrong ones, you waste write performance
for no read gain. We index exactly what the application queries.

---

### 2.1 Index Design Principles

```
Index every FK column         — JOIN lookups would otherwise scan
Index every filter column     — WHERE clauses on unindexed columns scan
Index every ORDER BY column   — unindexed sorts require filesort
Composite index order matters — most selective column first
Never index boolean columns alone — low cardinality, index is ignored
Never over-index             — every index costs on INSERT/UPDATE
```

---

### 2.2 USER Indexes

```sql
-- Already covered by constraints
CREATE UNIQUE INDEX uq_user_email
  ON users(email);

-- Soft delete filter — all active user queries
CREATE INDEX idx_user_deleted_at
  ON users(deleted_at)
  WHERE deleted_at IS NULL;   -- Partial index — only active rows
```

**Query this supports:**
```sql
SELECT * FROM users WHERE deleted_at IS NULL;
-- Admin listing (v2 multi-admin)
```

---

### 2.3 SESSION Indexes

```sql
-- Already covered by constraint
CREATE UNIQUE INDEX uq_session_token
  ON sessions(session_token);

-- FK lookup — find sessions for a user
CREATE INDEX idx_session_user_id
  ON sessions(user_id);

-- Expiry cleanup — find and remove expired sessions
CREATE INDEX idx_session_expires
  ON sessions(expires);
```

**Queries these support:**
```sql
-- NextAuth session lookup (every authenticated request)
SELECT * FROM sessions WHERE session_token = $1;

-- Session cleanup job (v2)
DELETE FROM sessions WHERE expires < NOW();
```

---

### 2.4 BOOKING Indexes

Booking has the most queries — the admin dashboard, filters,
and sorting all hit this table. Index strategy is critical.

```sql
-- Primary admin list query — filter by status, order by date
-- Most common admin query: "Show me all PENDING bookings, newest first"
CREATE INDEX idx_booking_status_created_at
  ON bookings(status, created_at DESC);

-- Soft delete aware filter combined with status
-- "Show me active PENDING bookings"
CREATE INDEX idx_booking_deleted_at_status
  ON bookings(deleted_at, status)
  WHERE deleted_at IS NULL;   -- Partial index — active bookings only

-- Lead score sort — high priority leads first
-- "Show me all PENDING bookings, highest score first"
CREATE INDEX idx_booking_status_lead_score
  ON bookings(status, lead_score DESC NULLS LAST);

-- Email lookup — "Did this person book before?"
CREATE INDEX idx_booking_email
  ON bookings(email);

-- Date range queries — "Bookings this month"
CREATE INDEX idx_booking_created_at
  ON bookings(created_at DESC);

-- UTM source reporting — "Which channel converts best?"
CREATE INDEX idx_booking_utm_source
  ON bookings(utm_source)
  WHERE utm_source IS NOT NULL;  -- Partial — only attributed bookings
```

**Queries these support:**
```sql
-- Admin dashboard — today's bookings
SELECT COUNT(*) FROM bookings
WHERE created_at >= CURRENT_DATE
AND deleted_at IS NULL;

-- Admin booking list — paginated, filtered, sorted
SELECT * FROM bookings
WHERE status = 'PENDING'
AND deleted_at IS NULL
ORDER BY lead_score DESC NULLS LAST, created_at DESC
LIMIT 20 OFFSET 0;

-- Marketing report — conversions by source
SELECT utm_source, COUNT(*) as conversions
FROM bookings
WHERE utm_source IS NOT NULL
AND deleted_at IS NULL
GROUP BY utm_source
ORDER BY conversions DESC;
```

---

### 2.5 PROJECT Indexes

```sql
-- Homepage featured projects query
-- "Get the 3 featured active projects"
CREATE INDEX idx_project_featured_deleted
  ON projects(is_featured, deleted_at)
  WHERE deleted_at IS NULL AND is_featured = TRUE;

-- Portfolio page — all active projects, ordered
CREATE INDEX idx_project_deleted_sort
  ON projects(deleted_at, sort_order ASC)
  WHERE deleted_at IS NULL;

-- Category filter — "Show Residential projects"
CREATE INDEX idx_project_category
  ON projects(category)
  WHERE category IS NOT NULL;
```

**Queries these support:**
```sql
-- Homepage portfolio preview
SELECT * FROM projects
WHERE is_featured = TRUE AND deleted_at IS NULL
ORDER BY sort_order ASC
LIMIT 3;

-- Projects page with category filter
SELECT * FROM projects
WHERE deleted_at IS NULL
AND (category = $1 OR $1 IS NULL)
ORDER BY sort_order ASC;
```

---

### 2.6 TESTIMONIAL Indexes

```sql
-- Active testimonials for display
CREATE INDEX idx_testimonial_active
  ON testimonials(is_active, deleted_at)
  WHERE is_active = TRUE AND deleted_at IS NULL;

-- FK lookup — find testimonials for a project
CREATE INDEX idx_testimonial_project_id
  ON testimonials(project_id)
  WHERE project_id IS NOT NULL;
```

---

### 2.7 CONTACTMESSAGE Indexes

```sql
-- Admin inbox — unread messages first
CREATE INDEX idx_contact_message_read
  ON contact_messages(read, created_at DESC)
  WHERE deleted_at IS NULL;

-- Unread count badge — admin sidebar
CREATE INDEX idx_contact_message_unread
  ON contact_messages(read)
  WHERE read = FALSE AND deleted_at IS NULL;
```

**Queries these support:**
```sql
-- Unread badge count (fires on every admin page load)
SELECT COUNT(*) FROM contact_messages
WHERE read = FALSE AND deleted_at IS NULL;

-- Admin messages list
SELECT * FROM contact_messages
WHERE deleted_at IS NULL
ORDER BY read ASC, created_at DESC
LIMIT 20 OFFSET 0;
```

---

### 2.8 SITESETTINGS Indexes

```sql
-- Already covered by unique constraint
CREATE UNIQUE INDEX uq_site_settings_key
  ON site_settings(key);
```

The key lookup is the only query pattern. The unique index
covers it entirely. No additional indexes needed.

**Query this supports:**
```sql
-- Get WhatsApp number for floating button
SELECT value FROM site_settings WHERE key = 'whatsapp_number';

-- Get all public settings in one query
SELECT key, value FROM site_settings
WHERE key IN ('whatsapp_number', 'contact_email', 'business_phone');
```

---

### 2.9 NOTIFICATION Indexes

```sql
-- Find unsent notifications (v2 background worker)
CREATE INDEX idx_notification_unsent
  ON notifications(created_at ASC)
  WHERE sent_at IS NULL AND failed_at IS NULL;

-- Find failed notifications for retry
CREATE INDEX idx_notification_failed
  ON notifications(failed_at ASC)
  WHERE failed_at IS NOT NULL AND sent_at IS NULL;
```

**Queries these support:**
```sql
-- v2 worker: process next batch of unsent notifications
SELECT * FROM notifications
WHERE sent_at IS NULL AND failed_at IS NULL
ORDER BY created_at ASC
LIMIT 10;
```

---

### 2.10 AUDITLOG Indexes

```sql
-- Entity audit trail — "Show me all events for booking X"
CREATE INDEX idx_audit_entity
  ON audit_logs(entity_type, entity_id, created_at DESC);

-- Action filter — "Show me all LOGIN_FAILURE events"
CREATE INDEX idx_audit_action
  ON audit_logs(action, created_at DESC);

-- Admin activity — "Show me everything this admin did"
CREATE INDEX idx_audit_user_id
  ON audit_logs(user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

-- Time-based audit trail — "Show me all events from yesterday"
CREATE INDEX idx_audit_created_at
  ON audit_logs(created_at DESC);
```

---

### 2.11 Complete Index Registry

| Index Name | Table | Columns | Type | Purpose |
|---|---|---|---|---|
| `uq_user_email` | users | `email` | Unique | Login lookup |
| `idx_user_deleted_at` | users | `deleted_at` | Partial | Active users |
| `uq_session_token` | sessions | `session_token` | Unique | Auth lookup |
| `idx_session_user_id` | sessions | `user_id` | B-tree | FK lookup |
| `idx_session_expires` | sessions | `expires` | B-tree | Cleanup |
| `idx_booking_status_created_at` | bookings | `status, created_at` | Composite | Admin list |
| `idx_booking_deleted_at_status` | bookings | `deleted_at, status` | Partial | Active filter |
| `idx_booking_status_lead_score` | bookings | `status, lead_score` | Composite | Priority sort |
| `idx_booking_email` | bookings | `email` | B-tree | Visitor lookup |
| `idx_booking_created_at` | bookings | `created_at` | B-tree | Date range |
| `idx_booking_utm_source` | bookings | `utm_source` | Partial | Attribution |
| `idx_project_featured_deleted` | projects | `is_featured, deleted_at` | Partial | Homepage |
| `idx_project_deleted_sort` | projects | `deleted_at, sort_order` | Partial | Portfolio |
| `idx_project_category` | projects | `category` | Partial | Filter |
| `idx_testimonial_active` | testimonials | `is_active, deleted_at` | Partial | Display |
| `idx_testimonial_project_id` | testimonials | `project_id` | Partial | FK lookup |
| `idx_contact_message_read` | contact_messages | `read, created_at` | Composite | Admin inbox |
| `idx_contact_message_unread` | contact_messages | `read` | Partial | Badge count |
| `uq_site_settings_key` | site_settings | `key` | Unique | Key lookup |
| `idx_notification_unsent` | notifications | `created_at` | Partial | Worker queue |
| `idx_notification_failed` | notifications | `failed_at` | Partial | Retry queue |
| `idx_audit_entity` | audit_logs | `entity_type, entity_id, created_at` | Composite | Trail lookup |
| `idx_audit_action` | audit_logs | `action, created_at` | Composite | Action filter |
| `idx_audit_user_id` | audit_logs | `user_id, created_at` | Partial | Admin activity |
| `idx_audit_created_at` | audit_logs | `created_at` | B-tree | Time range |

**Total indexes: 25**
**Unique constraints: 3**
**Partial indexes: 12** (index only where useful — smaller, faster)

---

## PART 3 — COMPLETE DDL (PostgreSQL)

The authoritative CREATE TABLE statements. Prisma generates these
from the schema but every developer must be able to read them raw.

```sql
-- ─────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('ADMIN');

CREATE TYPE booking_status AS ENUM (
  'PENDING',
  'CONTACTED',
  'CONFIRMED',
  'COMPLETED',
  'REJECTED'
);

CREATE TYPE audit_action AS ENUM (
  'LOGIN_SUCCESS',
  'LOGIN_FAILURE',
  'LOGOUT',
  'BOOKING_CREATE',
  'BOOKING_STATUS_UPDATE',
  'BOOKING_DELETE',
  'PROJECT_CREATE',
  'PROJECT_UPDATE',
  'PROJECT_DELETE',
  'CONTACT_MESSAGE_CREATE',
  'CONTACT_MESSAGE_READ',
  'SETTINGS_UPDATE'
);

-- ─────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────

CREATE TABLE users (
  id               VARCHAR(128)  NOT NULL,
  email            VARCHAR(255)  NOT NULL,
  password         VARCHAR(255)  NOT NULL,
  name             VARCHAR(100)  NULL,
  role             user_role     NOT NULL  DEFAULT 'ADMIN',
  failed_attempts  INTEGER       NOT NULL  DEFAULT 0,
  locked_until     TIMESTAMPTZ   NULL,
  created_at       TIMESTAMPTZ   NOT NULL  DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   NOT NULL  DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ   NULL,

  CONSTRAINT pk_users
    PRIMARY KEY (id),
  CONSTRAINT uq_user_email
    UNIQUE (email),
  CONSTRAINT chk_user_failed_attempts
    CHECK (failed_attempts >= 0)
);

CREATE UNIQUE INDEX idx_user_email
  ON users(email);

CREATE INDEX idx_user_active
  ON users(deleted_at)
  WHERE deleted_at IS NULL;

-- ─────────────────────────────────────────────
-- SESSIONS
-- ─────────────────────────────────────────────

CREATE TABLE sessions (
  id             VARCHAR(128)  NOT NULL,
  session_token  VARCHAR(255)  NOT NULL,
  user_id        VARCHAR(128)  NOT NULL,
  expires        TIMESTAMPTZ   NOT NULL,
  created_at     TIMESTAMPTZ   NOT NULL  DEFAULT NOW(),
  updated_at     TIMESTAMPTZ   NOT NULL  DEFAULT NOW(),

  CONSTRAINT pk_sessions
    PRIMARY KEY (id),
  CONSTRAINT uq_session_token
    UNIQUE (session_token),
  CONSTRAINT fk_session_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE INDEX idx_session_user_id
  ON sessions(user_id);

CREATE INDEX idx_session_expires
  ON sessions(expires);

-- ─────────────────────────────────────────────
-- BOOKINGS
-- ─────────────────────────────────────────────

CREATE TABLE bookings (
  id                VARCHAR(128)   NOT NULL,

  -- Visitor Contact
  name              VARCHAR(100)   NOT NULL,
  email             VARCHAR(255)   NOT NULL,
  phone             VARCHAR(20)    NOT NULL,

  -- Project Details
  service           VARCHAR(50)    NOT NULL,
  location          VARCHAR(200)   NOT NULL,
  description       TEXT           NOT NULL,
  meeting_date      TIMESTAMPTZ    NULL,
  budget            VARCHAR(50)    NULL,

  -- Lead Management
  status            booking_status NOT NULL  DEFAULT 'PENDING',
  lead_score        INTEGER        NULL,

  -- Legal (POPIA)
  consent_given     BOOLEAN        NOT NULL  DEFAULT FALSE,
  consent_given_at  TIMESTAMPTZ    NULL,

  -- Marketing Attribution
  utm_source        VARCHAR(100)   NULL,
  utm_medium        VARCHAR(100)   NULL,
  utm_campaign      VARCHAR(100)   NULL,
  utm_term          VARCHAR(100)   NULL,
  utm_content       VARCHAR(100)   NULL,
  referrer_url      VARCHAR(500)   NULL,
  landing_page      VARCHAR(500)   NULL,

  -- Technical Metadata
  user_agent        VARCHAR(500)   NULL,
  ip_address        VARCHAR(64)    NULL,

  -- Audit Timestamps
  created_at        TIMESTAMPTZ    NOT NULL  DEFAULT NOW(),
  updated_at        TIMESTAMPTZ    NOT NULL  DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ    NULL,

  CONSTRAINT pk_bookings
    PRIMARY KEY (id),
  CONSTRAINT chk_booking_service
    CHECK (service IN (
      'house_planning',
      'arch_drawings',
      'drafting_services',
      'dev_project_planning'
    )),
  CONSTRAINT chk_booking_lead_score
    CHECK (lead_score IS NULL OR (lead_score >= 0 AND lead_score <= 100)),
  CONSTRAINT chk_booking_consent
    CHECK (
      (consent_given = FALSE AND consent_given_at IS NULL)
      OR
      (consent_given = TRUE  AND consent_given_at IS NOT NULL)
    )
);

CREATE INDEX idx_booking_status_created_at
  ON bookings(status, created_at DESC);

CREATE INDEX idx_booking_active_status
  ON bookings(status)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_booking_status_lead_score
  ON bookings(status, lead_score DESC NULLS LAST)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_booking_email
  ON bookings(email);

CREATE INDEX idx_booking_created_at
  ON bookings(created_at DESC);

CREATE INDEX idx_booking_utm_source
  ON bookings(utm_source)
  WHERE utm_source IS NOT NULL;

-- ─────────────────────────────────────────────
-- PROJECTS
-- ─────────────────────────────────────────────

CREATE TABLE projects (
  id           VARCHAR(128)  NOT NULL,
  title        VARCHAR(100)  NOT NULL,
  description  TEXT          NOT NULL,
  image_path   VARCHAR(255)  NOT NULL,
  category     VARCHAR(50)   NULL,
  sort_order   INTEGER       NOT NULL  DEFAULT 0,
  is_featured  BOOLEAN       NOT NULL  DEFAULT FALSE,
  created_at   TIMESTAMPTZ   NOT NULL  DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL  DEFAULT NOW(),
  deleted_at   TIMESTAMPTZ   NULL,

  CONSTRAINT pk_projects
    PRIMARY KEY (id),
  CONSTRAINT chk_project_sort_order
    CHECK (sort_order >= 0)
);

CREATE INDEX idx_project_featured
  ON projects(is_featured, sort_order ASC)
  WHERE is_featured = TRUE AND deleted_at IS NULL;

CREATE INDEX idx_project_active_sort
  ON projects(sort_order ASC)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_project_category
  ON projects(category)
  WHERE category IS NOT NULL AND deleted_at IS NULL;

-- ─────────────────────────────────────────────
-- TESTIMONIALS
-- ─────────────────────────────────────────────

CREATE TABLE testimonials (
  id           VARCHAR(128)  NOT NULL,
  client_name  VARCHAR(100)  NOT NULL,
  review       TEXT          NOT NULL,
  rating       INTEGER       NULL,
  project_id   VARCHAR(128)  NULL,
  is_active    BOOLEAN       NOT NULL  DEFAULT TRUE,
  created_at   TIMESTAMPTZ   NOT NULL  DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL  DEFAULT NOW(),
  deleted_at   TIMESTAMPTZ   NULL,

  CONSTRAINT pk_testimonials
    PRIMARY KEY (id),
  CONSTRAINT chk_testimonial_rating
    CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  CONSTRAINT fk_testimonial_project
    FOREIGN KEY (project_id)
    REFERENCES projects(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

CREATE INDEX idx_testimonial_active
  ON testimonials(is_active)
  WHERE is_active = TRUE AND deleted_at IS NULL;

CREATE INDEX idx_testimonial_project_id
  ON testimonials(project_id)
  WHERE project_id IS NOT NULL;

-- ─────────────────────────────────────────────
-- CONTACT MESSAGES
-- ─────────────────────────────────────────────

CREATE TABLE contact_messages (
  id          VARCHAR(128)  NOT NULL,
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(255)  NOT NULL,
  phone       VARCHAR(20)   NULL,
  message     TEXT          NOT NULL,
  read        BOOLEAN       NOT NULL  DEFAULT FALSE,
  read_at     TIMESTAMPTZ   NULL,
  created_at  TIMESTAMPTZ   NOT NULL  DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL  DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ   NULL,

  CONSTRAINT pk_contact_messages
    PRIMARY KEY (id)
);

CREATE INDEX idx_contact_unread
  ON contact_messages(created_at DESC)
  WHERE read = FALSE AND deleted_at IS NULL;

CREATE INDEX idx_contact_active
  ON contact_messages(read, created_at DESC)
  WHERE deleted_at IS NULL;

-- ─────────────────────────────────────────────
-- SITE SETTINGS
-- ─────────────────────────────────────────────

CREATE TABLE site_settings (
  id           VARCHAR(128)  NOT NULL,
  key          VARCHAR(100)  NOT NULL,
  value        TEXT          NOT NULL,
  description  VARCHAR(255)  NULL,
  updated_at   TIMESTAMPTZ   NOT NULL  DEFAULT NOW(),
  updated_by   VARCHAR(128)  NULL,

  CONSTRAINT pk_site_settings
    PRIMARY KEY (id),
  CONSTRAINT uq_site_settings_key
    UNIQUE (key),
  CONSTRAINT fk_site_settings_user
    FOREIGN KEY (updated_by)
    REFERENCES users(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

-- ─────────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────────

CREATE TABLE notifications (
  id          VARCHAR(128)  NOT NULL,
  type        VARCHAR(50)   NOT NULL,
  channel     VARCHAR(20)   NOT NULL,
  recipient   VARCHAR(255)  NOT NULL,
  payload     JSONB         NOT NULL,
  sent_at     TIMESTAMPTZ   NULL,
  failed_at   TIMESTAMPTZ   NULL,
  error       TEXT          NULL,
  created_at  TIMESTAMPTZ   NOT NULL  DEFAULT NOW(),

  CONSTRAINT pk_notifications
    PRIMARY KEY (id),
  CONSTRAINT chk_notification_type
    CHECK (type IN (
      'BOOKING_RECEIVED',
      'STATUS_CHANGED',
      'MESSAGE_RECEIVED'
    )),
  CONSTRAINT chk_notification_channel
    CHECK (channel IN ('email', 'whatsapp', 'sms'))
);

CREATE INDEX idx_notification_unsent
  ON notifications(created_at ASC)
  WHERE sent_at IS NULL AND failed_at IS NULL;

CREATE INDEX idx_notification_failed
  ON notifications(failed_at ASC)
  WHERE failed_at IS NOT NULL AND sent_at IS NULL;

-- ─────────────────────────────────────────────
-- AUDIT LOG
-- ─────────────────────────────────────────────

CREATE TABLE audit_logs (
  id           VARCHAR(128)  NOT NULL,
  action       audit_action  NOT NULL,
  entity_type  VARCHAR(50)   NOT NULL,
  entity_id    VARCHAR(128)  NOT NULL,
  user_id      VARCHAR(128)  NULL,
  ip_address   VARCHAR(64)   NULL,
  user_agent   VARCHAR(500)  NULL,
  metadata     JSONB         NULL,
  created_at   TIMESTAMPTZ   NOT NULL  DEFAULT NOW(),

  -- No updated_at  — rows are never modified
  -- No deleted_at  — rows are never deleted

  CONSTRAINT pk_audit_logs
    PRIMARY KEY (id),
  CONSTRAINT fk_audit_log_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

CREATE INDEX idx_audit_entity
  ON audit_logs(entity_type, entity_id, created_at DESC);

CREATE INDEX idx_audit_action_date
  ON audit_logs(action, created_at DESC);

CREATE INDEX idx_audit_user_id
  ON audit_logs(user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

CREATE INDEX idx_audit_created_at
  ON audit_logs(created_at DESC);
```

---

## PART 4 — UPDATED_AT TRIGGER

Prisma handles `updated_at` automatically via `@updatedAt`.
But if anyone runs raw SQL directly (migrations, manual fixes),
the trigger ensures it never falls out of sync.

```sql
-- Reusable trigger function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to every table that has updated_at
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_testimonials_updated_at
  BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_contact_messages_updated_at
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Note: audit_logs and notifications have no updated_at
-- audit_logs: write-once, never modified
-- notifications: updated_at not needed — sent_at/failed_at track state
```

---

## PART 5 — SEED DATA

The system cannot operate without initial data.
Prisma seed runs once after the first migration on every
fresh environment (local, preview, production).

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { createId } from '@paralleldrive/cuid2'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // ── 1. ADMIN USER ────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD!,
    12  // bcrypt cost factor 12 — industry standard
  )

  const admin = await prisma.user.upsert({
    where:  { email: process.env.ADMIN_EMAIL! },
    update: {},  // Never overwrite if exists — idempotent seed
    create: {
      id:       createId(),
      email:    process.env.ADMIN_EMAIL!,
      password: hashedPassword,
      name:     'Xivutiso Kevin Sunduza',
      role:     'ADMIN',
    }
  })
  console.log(`Admin seeded: ${admin.email}`)

  // ── 2. SITE SETTINGS ─────────────────────────────────────────
  const settings = [
    {
      key:         'whatsapp_number',
      value:       '27867233640',
      description: 'WhatsApp number for floating button — format: country code + number, no +'
    },
    {
      key:         'contact_email',
      value:       'xivutisokevinsunduza@gmail.com',
      description: 'Primary contact email displayed on the contact page'
    },
    {
      key:         'business_phone',
      value:       '0867233640',
      description: 'Business phone number displayed on contact page and footer'
    },
    {
      key:         'business_address',
      value:       'South Africa',
      description: 'Business address shown on contact page and in structured data'
    },
    {
      key:         'hero_tagline',
      value:       'Designing Spaces That Inspire',
      description: 'Main headline in the hero section — keep it under 6 words'
    },
    {
      key:         'years_experience',
      value:       '5',
      description: 'Years of experience shown in the stats bar — update annually'
    },
    {
      key:         'projects_completed',
      value:       '30',
      description: 'Number of completed projects shown in stats bar'
    },
  ]

  for (const setting of settings) {
    await prisma.siteSettings.upsert({
      where:  { key: setting.key },
      update: {},  // Never overwrite admin-changed values
      create: { id: createId(), ...setting }
    })
  }
  console.log(`Site settings seeded: ${settings.length} entries`)

  // ── 3. SAMPLE PROJECTS ───────────────────────────────────────
  // Replace image_path values with real project images before launch
  const projects = [
    {
      title:       'Modern Family Residence — Sandton',
      description: 'A contemporary 4-bedroom family home designed for a 600sqm plot in Sandton. The design prioritises open-plan living, natural light, and seamless indoor-outdoor flow.',
      image_path:  '/images/projects/sandton-residence.webp',
      category:    'Residential',
      sort_order:  1,
      is_featured: true,
    },
    {
      title:       'Mixed-Use Development — Pretoria East',
      description: 'A 12-unit mixed-use development combining ground-floor retail with residential apartments above. Full architectural drawings, structural coordination, and development planning.',
      image_path:  '/images/projects/pretoria-mixed-use.webp',
      category:    'Development',
      sort_order:  2,
      is_featured: true,
    },
    {
      title:       'Commercial Office Fitout — Midrand',
      description: 'Architectural drawings and drafting services for a 400sqm commercial office space. Includes space planning, mechanical coordination, and full documentation package.',
      image_path:  '/images/projects/midrand-office.webp',
      category:    'Commercial',
      sort_order:  3,
      is_featured: true,
    },
    {
      title:       'Residential Extension — Centurion',
      description: 'A double-storey extension to an existing home, adding two bedrooms, a study, and an entertainment deck. Full council submission drawings and approval management.',
      image_path:  '/images/projects/centurion-extension.webp',
      category:    'Residential',
      sort_order:  4,
      is_featured: false,
    },
    {
      title:       'Townhouse Complex — Johannesburg South',
      description: 'Site planning and architectural drawings for a 6-unit townhouse complex. Includes unit layouts, site coverage calculations, and full drafting documentation.',
      image_path:  '/images/projects/jhb-south-townhouses.webp',
      category:    'Development',
      sort_order:  5,
      is_featured: false,
    },
  ]

  for (const project of projects) {
    await prisma.project.upsert({
      where:  { id: createId() },  // Always create — no natural unique key
      update: {},
      create: { id: createId(), ...project }
    })
  }
  console.log(`Projects seeded: ${projects.length} entries`)

  // ── 4. TESTIMONIALS ──────────────────────────────────────────
  // These are real reviews — collect from past clients before launch
  // Replace with actual client words — do not launch with placeholder text
  const testimonials = [
    {
      client_name: 'Thabo Mokoena',
      review:      'Kevin delivered architectural drawings that were precise, professional, and ready for council submission first time. No back and forth — he understood the brief immediately.',
      rating:      5,
      is_active:   true,
    },
    {
      client_name: 'Zanele Dlamini',
      review:      'From the first consultation to the final drawings, the process was seamless. The house design exceeded what I imagined. I have already recommended Sunduza Architectural to three friends.',
      rating:      5,
      is_active:   true,
    },
    {
      client_name: 'Riaan van der Merwe',
      review:      'Professional, responsive, and technically excellent. The development project planning he provided saved us months of back-and-forth with the municipality.',
      rating:      5,
      is_active:   true,
    },
  ]

  for (const testimonial of testimonials) {
    await prisma.testimonial.create({
      data: { id: createId(), ...testimonial }
    })
  }
  console.log(`Testimonials seeded: ${testimonials.length} entries`)

  console.log('Seed complete.')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

---

## PART 6 — MIGRATION EXECUTION ORDER

Prisma handles ordering automatically but the developer must
understand the dependency chain to reason about failures.

```
Migration execution order — enforced by FK dependencies:

1. users              — no dependencies
2. sessions           — depends on users (FK: user_id)
3. projects           — no dependencies
4. testimonials       — depends on projects (FK: project_id)
5. bookings           — no dependencies (island entity)
6. contact_messages   — no dependencies (island entity)
7. site_settings      — depends on users (FK: updated_by)
8. notifications      — no dependencies (outbox pattern)
9. audit_logs         — depends on users (FK: user_id)

Triggers (after all tables):
10. set_updated_at() function
11. All updated_at triggers

Seed (after all tables and triggers):
12. Admin user
13. Site settings
14. Sample projects
15. Testimonials
```

**Commands in sequence:**

```bash
# 1. Run all migrations
npx prisma migrate dev --name init

# 2. Verify schema matches expectation
npx prisma db pull   # Should show no diff

# 3. Run seed
npx prisma db seed

# 4. Verify seed data
npx prisma studio    # Visual table browser — dev only
```

---

## PART 7 — PERFORMANCE BENCHMARKS (Expected)

At Sunduza's v1 scale (50–200 bookings/month), all queries should
complete under these thresholds. If any query exceeds the threshold,
check the EXPLAIN ANALYZE output before adding indexes.

| Query | Expected Time | Index Used |
|---|---|---|
| Session lookup by token | < 1ms | `uq_session_token` |
| Admin booking list (paginated) | < 5ms | `idx_booking_active_status` |
| Unread message count (badge) | < 2ms | `idx_contact_unread` |
| Homepage featured projects | < 3ms | `idx_project_featured` |
| Active testimonials | < 2ms | `idx_testimonial_active` |
| Settings key lookup | < 1ms | `uq_site_settings_key` |
| Booking status update | < 5ms | PK lookup + write |
| Audit log insert | < 3ms | Write only — no read |
| Health check query | < 2ms | `SELECT 1` — no table scan |

---

## PART 8 — PHYSICAL SCHEMA SUMMARY

```
─────────────────────────────────────────────────────────────────
TABLES:              9
ENUMS:               3  (user_role, booking_status, audit_action)
PRIMARY KEYS:        9  (one per table)
UNIQUE CONSTRAINTS:  3  (user.email, session.session_token,
                         site_settings.key)
FOREIGN KEYS:        4  (session→user, testimonial→project,
                         site_settings→user, audit_log→user)
CHECK CONSTRAINTS:  10  (service, status, lead_score, consent,
                         rating, sort_order, audit action,
                         notification type, notification channel,
                         failed_attempts)
INDEXES:            25  (12 partial — only index useful rows)
TRIGGERS:            7  (set_updated_at on 7 tables)
SEED RECORDS:       ~15 (1 admin, 7 settings, 5 projects, 3 testimonials)
─────────────────────────────────────────────────────────────────
```

---

*Physical Schema Complete*
*Status: DDL ready · Indexes designed · Constraints specified · Seed data ready*
*Next: API Design Detail — request/response examples for all 17 endpoints*
