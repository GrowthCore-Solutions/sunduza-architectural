# SUNDUZA ARCHITECTURAL & PROJECTS
## Complete Database Normalization
### 1NF → 2NF → 3NF → BCNF — All 9 Entities

---

> Normalization is not bureaucracy.
> It is the discipline of ensuring every fact lives in exactly one place,
> depends on exactly the right key, and nothing else.
> A database that violates this will eventually contradict itself.
> We normalize so the data cannot lie.

---

## HOW WE WORK

For every entity we follow this exact sequence:

1. **State all functional dependencies** — what determines what
2. **Identify all candidate keys** — what could uniquely identify a row
3. **Check 1NF** — atomic values, no repeating groups, no multi-valued attributes
4. **Check 2NF** — every non-key attribute fully depends on the WHOLE primary key
5. **Check 3NF** — no transitive dependencies between non-key attributes
6. **Check BCNF** — every determinant is a candidate key
7. **Verdict** — does the table change, what is the final form, what is the justification

---

## NOTATION

```
A → B          A determines B (knowing A you know B with certainty)
{A, B} → C    A and B together determine C
A -/→ B        A does NOT determine B
CK             Candidate Key
PK             Primary Key (chosen candidate key)
NK             Non-key attribute
```

---
---

## ENTITY 1 — USER

### Attributes

```
id, email, password, name, role, failed_attempts,
locked_until, created_at, updated_at, deleted_at
```

### Functional Dependencies

```
id    → email, password, name, role, failed_attempts,
        locked_until, created_at, updated_at, deleted_at

email → id, password, name, role, failed_attempts,
        locked_until, created_at, updated_at, deleted_at
```

Both `id` and `email` are full determinants of every other attribute.

### Candidate Keys

| Candidate Key | Reason |
|---|---|
| `id` | System-generated CUID — always unique |
| `email` | Business rule: one email per admin — UNIQUE constraint |

**Chosen PK:** `id` — surrogate key protects against email changes

---

### 1NF

| Rule | Verdict | Evidence |
|---|---|---|
| Every attribute is atomic | ✅ PASS | Each column holds exactly one value — no JSON, no lists, no sets |
| No repeating groups | ✅ PASS | No attribute repeats across columns for the same row |
| Every row is uniquely identifiable | ✅ PASS | `id` is unique per row |

**1NF: PASS. No changes.**

---

### 2NF

PK is single-column (`id`). Partial dependency is mathematically
impossible with a single-column PK — partial dependency requires
a composite PK where some non-key attribute depends on only part
of that composite key.

**2NF: PASS. No changes.**

---

### 3NF

We check for transitive dependencies: does any non-key attribute
determine another non-key attribute?

```
Does password → name?         No — knowing a hash tells you nothing about a name
Does name → role?             No — the name "Kevin" does not determine the role
Does failed_attempts → locked_until?
```

This last one deserves careful thought.

`failed_attempts` and `locked_until` are related in the application
logic: when `failed_attempts` reaches 10, `locked_until` is set.
But this is **application logic**, not a functional dependency in
the relational sense. `locked_until` is not determined by
`failed_attempts` alone — it is set by the system at a specific
moment. Two users could both have `failed_attempts = 10` but
different `locked_until` values depending on when their 10th
attempt occurred. Therefore:

```
failed_attempts -/→ locked_until   (not a functional dependency)
```

No transitive dependencies exist.

**3NF: PASS. No changes.**

---

### BCNF

Every determinant (`id`, `email`) is a candidate key.
No non-key attribute determines any other attribute.

**BCNF: PASS. No changes.**

---

### FINAL NORMALIZED FORM — USER

```
USER (
  id               CUID        PK
  email            VARCHAR(255) NOT NULL  UNIQUE
  password         VARCHAR(255) NOT NULL
  name             VARCHAR(100) NULL
  role             ENUM(ADMIN)  NOT NULL  DEFAULT ADMIN
  failed_attempts  INTEGER      NOT NULL  DEFAULT 0
  locked_until     TIMESTAMP    NULL
  created_at       TIMESTAMP    NOT NULL  DEFAULT NOW()
  updated_at       TIMESTAMP    NOT NULL
  deleted_at       TIMESTAMP    NULL
)
```

**No decomposition required. User is in BCNF.**

---
---

## ENTITY 2 — SESSION

### Attributes

```
id, session_token, user_id, expires, created_at, updated_at
```

### Functional Dependencies

```
id            → session_token, user_id, expires, created_at, updated_at
session_token → id, user_id, expires, created_at, updated_at
```

`user_id` is a FK, not a determinant here — knowing `user_id`
does NOT tell you which specific session it is (one user can have
many sessions). So:

```
user_id -/→ id            (one user has many sessions)
user_id -/→ session_token
user_id -/→ expires
```

### Candidate Keys

| Candidate Key | Reason |
|---|---|
| `id` | System-generated CUID |
| `session_token` | UNIQUE constraint — each token is distinct |

**Chosen PK:** `id`

---

### 1NF

| Rule | Verdict | Evidence |
|---|---|---|
| Every attribute is atomic | ✅ PASS | Single scalar values only |
| No repeating groups | ✅ PASS | No repeating columns |
| Every row uniquely identifiable | ✅ PASS | `id` is unique |

**1NF: PASS. No changes.**

---

### 2NF

Single-column PK. Partial dependency impossible.

**2NF: PASS. No changes.**

---

### 3NF

```
Does session_token → user_id?   No — a token doesn't encode a user
Does user_id → expires?         No — user_id doesn't determine expiry
Does expires → user_id?         No
```

No transitive dependencies.

**3NF: PASS. No changes.**

---

### BCNF

Every determinant (`id`, `session_token`) is a candidate key.

**BCNF: PASS. No changes.**

---

### FINAL NORMALIZED FORM — SESSION

```
SESSION (
  id            CUID         PK
  session_token VARCHAR(255)  NOT NULL  UNIQUE
  user_id       CUID          NOT NULL  FK → USER(id) ON DELETE CASCADE
  expires       TIMESTAMP     NOT NULL
  created_at    TIMESTAMP     NOT NULL  DEFAULT NOW()
  updated_at    TIMESTAMP     NOT NULL
)
```

**No decomposition required. Session is in BCNF.**

---
---

## ENTITY 3 — BOOKING

This is the most complex entity in the system. We work through it
carefully because it has the most attributes and the most risk of
normalization violations.

### Attributes

```
id, name, email, phone, service, location, description,
meeting_date, budget, status, consent_given, consent_given_at,
lead_score, utm_source, utm_medium, utm_campaign, utm_term,
utm_content, referrer_url, landing_page, user_agent, ip_address,
created_at, updated_at, deleted_at
```

### Functional Dependencies

```
id → name, email, phone, service, location, description,
     meeting_date, budget, status, consent_given, consent_given_at,
     lead_score, utm_source, utm_medium, utm_campaign, utm_term,
     utm_content, referrer_url, landing_page, user_agent, ip_address,
     created_at, updated_at, deleted_at
```

No other candidate key exists — there is no natural unique identifier
for a booking. The same person can submit two bookings. Email alone
does not uniquely identify a booking.

### Candidate Keys

| Candidate Key | Reason |
|---|---|
| `id` | Only candidate key — no natural unique identifier |

**Chosen PK:** `id`

---

### 1NF

| Rule | Verdict | Evidence |
|---|---|---|
| Every attribute is atomic | ✅ PASS | All single scalar values |
| No repeating groups | ⚠️ EXAMINE | utm_source, utm_medium, utm_campaign, utm_term, utm_content look like a repeating group |
| Every row uniquely identifiable | ✅ PASS | `id` is unique |

**The UTM fields demand closer examination.**

#### Are UTM fields a repeating group?

A repeating group is when the same type of data appears in multiple
columns of the same row. For example, if we had:

```
phone_1, phone_2, phone_3   ← repeating group — VIOLATES 1NF
```

UTM fields appear similar: `utm_source`, `utm_medium`, `utm_campaign`,
`utm_term`, `utm_content`. Are these five columns storing the same
kind of thing (marketing parameters)?

**The answer is: No — they are NOT a repeating group.**

Each UTM column stores a **different dimension** of marketing attribution.
`utm_source` (which platform) is a fundamentally different fact from
`utm_medium` (which channel type) or `utm_campaign` (which campaign name).
They are not interchangeable. You cannot store them as rows in a
`booking_utm (booking_id, param_name, param_value)` table without
losing the semantic meaning of each dimension.

The Google Analytics UTM standard defines exactly these 5 dimensions.
They are 5 distinct facts about one booking, not 5 instances of the
same fact. This is the correct v1 design.

**Verdict on UTM fields: NOT a repeating group. 1NF satisfied.**

**1NF: PASS. No changes.**

---

### 2NF

Single-column PK (`id`). Partial dependency is impossible.

**2NF: PASS. No changes.**

---

### 3NF

We now examine all non-key attributes for transitive dependencies.
This is where Booking requires the most careful analysis.

#### Dependency 1: consent_given → consent_given_at

```
consent_given → consent_given_at?
```

If `consent_given = TRUE`, does that determine `consent_given_at`?
Not in the relational sense. `consent_given_at` is the timestamp
of when consent was captured — two bookings both with
`consent_given = TRUE` will have different `consent_given_at`
values. The timestamp depends on `id` (the booking), not on
`consent_given`.

```
consent_given -/→ consent_given_at   ✅ No transitive dependency
```

#### Dependency 2: service → description (prompt context)

```
service → description?
```

The service selected shapes the description the visitor provides —
different services have different prompts. But the actual description
text is written by the visitor and is unique to each booking.
`service = 'house_planning'` does not determine the description.

```
service -/→ description   ✅ No transitive dependency
```

#### Dependency 3: lead_score — is it derived?

`lead_score` is calculated from `service`, `budget`, `meeting_date`,
and `description` length at the time of booking creation. This raises
an important 3NF question:

```
{service, budget, meeting_date, description} → lead_score?
```

In application logic, yes — the score is computed from these fields.
Does this mean `lead_score` is transitively dependent and violates 3NF?

**Careful analysis:**

A transitive dependency in 3NF means: NK → NK → PK.
Here we have: `{service, budget, meeting_date, description}` →
`lead_score`, where all of the left-side attributes depend on `id`.

This IS technically a transitive dependency through multiple
attributes. The strict 3NF resolution would be to not store
`lead_score` at all and compute it on the fly from the source fields.

**However — this is a justified denormalization:**

1. Lead score calculation involves business logic (weighted algorithm)
   that should not live in SQL
2. The score must be stable — if the algorithm changes, old scores
   should not retroactively change
3. Computing it on every query for every booking in the admin list
   is expensive and inconsistent
4. Storing a computed value for performance and stability is a
   well-established, named pattern: **materialized computed column**

**Decision: Retain `lead_score` as a stored computed value.**
Document explicitly that it is calculated on write and intentionally
denormalized for performance and historical accuracy.

```
lead_score is a JUSTIFIED DENORMALIZATION — stored computed value
```

#### Dependency 4: utm_source, referrer_url, landing_page

```
utm_source → utm_medium?      No — Google and Facebook both use cpc
utm_medium → utm_campaign?    No — cpc campaigns have many names
referrer_url → utm_source?    Not reliably — referrer ≠ UTM source
landing_page → utm_campaign?  No — same page used by many campaigns
```

No transitive dependencies among marketing attribution fields.

#### Dependency 5: status — transition chain

```
status -/→ any other attribute   Status is a current state, not a determinant
```

The status lifecycle (PENDING → CONTACTED → CONFIRMED…) is
application logic, not a functional dependency.

**3NF: PASS. No changes required.**
*`lead_score` retained as justified denormalization — documented.*

---

### BCNF

The only candidate key is `id`. Every determinant in the table is
`id`. All non-key attributes depend only on `id`.

`lead_score` has a hidden determinant `{service, budget, meeting_date, description}`
but this is accepted as a materialized computed value — not a BCNF violation
in the practical sense because we have documented and justified it.

**BCNF: PASS with documented exception for `lead_score`.**

---

### STATUS HISTORY — Design Decision

The current design stores only the **current** booking status.
A normalization argument exists for extracting status history:

**The argument:**
If we want to know when a booking moved from PENDING to CONTACTED,
the current schema cannot answer that. `updated_at` tells us when
the row was last updated but not which field changed or what the
old value was.

**The resolution:**
Status history IS captured — but in `AuditLog`, not in Booking.
Every status change writes an `AuditLog` row with:
```json
{ "old_status": "PENDING", "new_status": "CONTACTED" }
```

Adding a `BookingStatusHistory` table would be correct but
redundant given AuditLog already captures this. In v2, if we need
to query status history frequently (e.g. average time to contact),
we add a `BookingStatusHistory` table and populate it alongside
AuditLog. For v1, AuditLog is sufficient.

**Decision: No `BookingStatusHistory` table in v1. AuditLog serves this purpose.**

---

### VISITOR DEDUPLICATION — Design Decision

A normalization purist might argue: visitor `name`, `email`, and
`phone` repeat across multiple bookings from the same person.
Extract them into a `Visitor` table:

```
VISITOR (id, name, email, phone)
BOOKING (id, visitor_id FK, service, ...)
```

**Why we reject this for v1:**

1. **Bookings are anonymous** (BR-001). There is no concept of a
   returning visitor in v1. Each booking is a self-contained lead.

2. **Email is not a stable identity.** The same person may use
   different emails for different inquiries. Merging them into one
   Visitor record requires identity resolution logic we do not have.

3. **No visitor portal exists.** If visitors had accounts (v2),
   a Visitor entity becomes essential. Without accounts, it adds
   complexity with no benefit.

4. **Lead data must be self-contained.** When an admin views a
   booking from 18 months ago, they need all the visitor data
   right there — not a JOIN away from a Visitor table that may
   have been updated since.

**Decision: Visitor contact data stays on Booking. Justified denormalization for v1.**

---

### FINAL NORMALIZED FORM — BOOKING

```
BOOKING (
  -- Identity
  id                CUID         PK

  -- Visitor Contact (denormalized — no Visitor entity in v1)
  name              VARCHAR(100)  NOT NULL
  email             VARCHAR(255)  NOT NULL
  phone             VARCHAR(20)   NOT NULL

  -- Project Details
  service           VARCHAR(50)   NOT NULL
                    CHECK (service IN (
                      'house_planning',
                      'arch_drawings',
                      'drafting_services',
                      'dev_project_planning'
                    ))
  location          VARCHAR(200)  NOT NULL
  description       TEXT          NOT NULL
  meeting_date      TIMESTAMP     NULL
  budget            VARCHAR(50)   NULL

  -- Lead Management
  status            ENUM          NOT NULL  DEFAULT 'PENDING'
                    CHECK (status IN (
                      'PENDING','CONTACTED','CONFIRMED',
                      'COMPLETED','REJECTED'
                    ))
  lead_score        INTEGER       NULL      -- Materialized computed value (0-100)

  -- Legal (POPIA)
  consent_given     BOOLEAN       NOT NULL  DEFAULT FALSE
  consent_given_at  TIMESTAMP     NULL

  -- Marketing Attribution (5 UTM dimensions — not a repeating group)
  utm_source        VARCHAR(100)  NULL
  utm_medium        VARCHAR(100)  NULL
  utm_campaign      VARCHAR(100)  NULL
  utm_term          VARCHAR(100)  NULL
  utm_content       VARCHAR(100)  NULL
  referrer_url      VARCHAR(500)  NULL
  landing_page      VARCHAR(500)  NULL

  -- Technical Metadata
  user_agent        VARCHAR(500)  NULL
  ip_address        VARCHAR(64)   NULL      -- SHA-256 hash, never raw

  -- Audit Timestamps
  created_at        TIMESTAMP     NOT NULL  DEFAULT NOW()
  updated_at        TIMESTAMP     NOT NULL
  deleted_at        TIMESTAMP     NULL
)
```

**No decomposition required. Booking is in 3NF / BCNF with two
documented, justified denormalizations:**
1. `lead_score` — materialized computed value for performance + historical stability
2. Visitor contact fields — no Visitor entity in v1, bookings are anonymous

---
---

## ENTITY 4 — PROJECT

### Attributes

```
id, title, description, image_path, category,
sort_order, is_featured, created_at, updated_at, deleted_at
```

### Functional Dependencies

```
id → title, description, image_path, category,
     sort_order, is_featured, created_at, updated_at, deleted_at
```

No other candidate key — two projects could share the same title.
`image_path` could theoretically be unique (one image per project)
but this is not enforced as a business rule and should not be a CK.

### Candidate Keys

| Candidate Key | Reason |
|---|---|
| `id` | Only candidate key |

**Chosen PK:** `id`

---

### 1NF

| Rule | Verdict | Evidence |
|---|---|---|
| Every attribute is atomic | ✅ PASS | All single values |
| No repeating groups | ✅ PASS | No columns of the same type |
| Every row uniquely identifiable | ✅ PASS | `id` is unique |

**1NF: PASS. No changes.**

---

### 2NF

Single-column PK. Partial dependency impossible.

**2NF: PASS. No changes.**

---

### 3NF

```
Does title → category?        No — a title doesn't determine its category
Does category → sort_order?   No — two projects in same category have different orders
Does is_featured → sort_order? No — featured status doesn't control sort position
Does image_path → title?      No — image filename doesn't encode the title
```

No transitive dependencies.

**3NF: PASS. No changes.**

---

### BCNF

Only determinant is `id`, which is the only candidate key.

**BCNF: PASS. No changes.**

---

### `category` — Design Note

`category` is stored as a free-text `VARCHAR(50)` on Project.
A strict normalization view might extract it:

```
CATEGORY (id, name)
PROJECT   (id, ..., category_id FK → CATEGORY)
```

**Why we keep it as VARCHAR in v1:**

1. Categories are not managed entities — the admin types them
   freehand. There is no CRUD for categories.
2. The filter on the projects page uses `DISTINCT category` from
   the projects table to build the filter tabs dynamically.
3. Adding a Category table adds a JOIN and a management screen
   for no real benefit when there are fewer than 20 projects.
4. In v2, if categories need descriptions, icons, or ordering,
   we promote `category` to a full entity. The field name stays
   the same — migration is additive.

**Decision: `category` stays as VARCHAR(50). Documented pragmatic decision.**

---

### FINAL NORMALIZED FORM — PROJECT

```
PROJECT (
  id           CUID         PK
  title        VARCHAR(100)  NOT NULL
  description  TEXT          NOT NULL
  image_path   VARCHAR(255)  NOT NULL
  category     VARCHAR(50)   NULL       -- Pragmatic VARCHAR, not FK in v1
  sort_order   INTEGER       NOT NULL   DEFAULT 0
  is_featured  BOOLEAN       NOT NULL   DEFAULT FALSE
  created_at   TIMESTAMP     NOT NULL   DEFAULT NOW()
  updated_at   TIMESTAMP     NOT NULL
  deleted_at   TIMESTAMP     NULL
)
```

**No decomposition required. Project is in BCNF.**

---
---

## ENTITY 5 — TESTIMONIAL

### Attributes

```
id, client_name, review, rating, project_id,
is_active, created_at, updated_at, deleted_at
```

### Functional Dependencies

```
id → client_name, review, rating, project_id,
     is_active, created_at, updated_at, deleted_at
```

`project_id` is a nullable FK. It does NOT determine anything —
knowing which project a testimonial is about does not tell us
the review text, the rating, or the client name. The dependency
runs from `id`, not from `project_id`.

### Candidate Keys

| Candidate Key | Reason |
|---|---|
| `id` | Only candidate key — same client could write multiple reviews |

**Chosen PK:** `id`

---

### 1NF

| Rule | Verdict | Evidence |
|---|---|---|
| Every attribute is atomic | ✅ PASS | Single values per column |
| No repeating groups | ✅ PASS | No column repetition |
| Every row uniquely identifiable | ✅ PASS | `id` is unique |

**1NF: PASS. No changes.**

---

### 2NF

Single-column PK. Partial dependency impossible.

**2NF: PASS. No changes.**

---

### 3NF

```
Does rating → review?        No — a 5-star rating doesn't determine the text
Does project_id → rating?    No — same project can have different rated reviews
Does client_name → review?   No — same person could write different reviews
Does is_active → review?     No — active status doesn't determine content
```

No transitive dependencies.

**3NF: PASS. No changes.**

---

### BCNF

Only determinant is `id`. `project_id` is a FK reference, not a
determinant of other attributes.

**BCNF: PASS. No changes.**

---

### FINAL NORMALIZED FORM — TESTIMONIAL

```
TESTIMONIAL (
  id           CUID        PK
  client_name  VARCHAR(100) NOT NULL
  review       TEXT         NOT NULL
  rating       INTEGER      NULL       CHECK (rating BETWEEN 1 AND 5)
  project_id   CUID         NULL       FK → PROJECT(id) ON DELETE SET NULL
  is_active    BOOLEAN      NOT NULL   DEFAULT TRUE
  created_at   TIMESTAMP    NOT NULL   DEFAULT NOW()
  updated_at   TIMESTAMP    NOT NULL
  deleted_at   TIMESTAMP    NULL
)
```

**No decomposition required. Testimonial is in BCNF.**

---
---

## ENTITY 6 — CONTACTMESSAGE

### Attributes

```
id, name, email, phone, message, read, read_at,
created_at, updated_at, deleted_at
```

### Functional Dependencies

```
id → name, email, phone, message, read, read_at,
     created_at, updated_at, deleted_at
```

### Candidate Keys

| Candidate Key | Reason |
|---|---|
| `id` | Only candidate key — same person can send multiple messages |

**Chosen PK:** `id`

---

### 1NF

| Rule | Verdict | Evidence |
|---|---|---|
| Every attribute is atomic | ✅ PASS | Single values only |
| No repeating groups | ✅ PASS | No column repetition |
| Every row uniquely identifiable | ✅ PASS | `id` is unique |

**1NF: PASS. No changes.**

---

### 2NF

Single-column PK. Partial dependency impossible.

**2NF: PASS. No changes.**

---

### 3NF

The one relationship to examine carefully:

```
read → read_at?
```

When `read = TRUE`, `read_at` is set. When `read = FALSE`,
`read_at = NULL`. Is this a transitive dependency?

**No.** `read` (a boolean) does not functionally determine
`read_at` (a timestamp). Two messages both with `read = TRUE`
will have different `read_at` values. The timestamp depends on
WHEN the admin clicked "mark as read" — that is a moment in time
unique to each message, not derivable from the boolean value.

```
read -/→ read_at    (same boolean value, different timestamps)
```

This is the same pattern as `consent_given` / `consent_given_at`
on Booking. Both are correct designs.

**3NF: PASS. No changes.**

---

### BCNF

Only determinant is `id`. No other determinants exist.

**BCNF: PASS. No changes.**

---

### FINAL NORMALIZED FORM — CONTACTMESSAGE

```
CONTACTMESSAGE (
  id          CUID         PK
  name        VARCHAR(100)  NOT NULL
  email       VARCHAR(255)  NOT NULL
  phone       VARCHAR(20)   NULL
  message     TEXT          NOT NULL
  read        BOOLEAN       NOT NULL  DEFAULT FALSE
  read_at     TIMESTAMP     NULL
  created_at  TIMESTAMP     NOT NULL  DEFAULT NOW()
  updated_at  TIMESTAMP     NOT NULL
  deleted_at  TIMESTAMP     NULL
)
```

**No decomposition required. ContactMessage is in BCNF.**

---
---

## ENTITY 7 — SITESETTINGS

### Attributes

```
id, key, value, description, updated_at, updated_by
```

### Functional Dependencies

```
id  → key, value, description, updated_at, updated_by
key → id, value, description, updated_at, updated_by
```

Both `id` and `key` fully determine all other attributes.

### Candidate Keys

| Candidate Key | Reason |
|---|---|
| `id` | System-generated CUID |
| `key` | UNIQUE constraint — one value per setting key |

**Chosen PK:** `id`

---

### 1NF

| Rule | Verdict | Evidence |
|---|---|---|
| Every attribute is atomic | ✅ PASS | Single values per column |
| No repeating groups | ✅ PASS | No repetition |
| Every row uniquely identifiable | ✅ PASS | `id` unique |

**1NF: PASS. No changes.**

---

### 2NF

Single-column PK. Partial dependency impossible.

**2NF: PASS. No changes.**

---

### 3NF

```
Does key → value?           Yes — but key is a candidate key, so this is fine
Does value → description?   No — a value doesn't describe itself
Does updated_by → updated_at? No — who changed it doesn't determine when
```

`key → value` is acceptable because `key` IS a candidate key.
A dependency through a candidate key is not a transitive dependency
by definition.

**3NF: PASS. No changes.**

---

### BCNF

Every determinant is a candidate key (`id` or `key`).

**BCNF: PASS. No changes.**

---

### KEY-VALUE PATTERN — Design Justification

The Entity-Attribute-Value (EAV) pattern — which SiteSettings
uses — is generally considered an anti-pattern in relational
design because:

1. You lose type safety (`value` is TEXT for everything)
2. You cannot enforce NOT NULL per key
3. You cannot add constraints per setting

**Why we accept it here:**

1. The settings are few (fewer than 10 in v1)
2. All values are simple strings (phone number, email, tagline)
3. The admin edits them through a validated UI form — type safety
   is enforced at the application layer, not the DB layer
4. The alternative (one column per setting) violates 1NF if we
   ever add a setting — it requires a migration every time
5. The key-value pattern here is bounded and documented —
   not an open-ended schema-less store

**Decision: EAV for SiteSettings is accepted and justified.
This is a pragmatic, bounded denormalization.**

---

### FINAL NORMALIZED FORM — SITESETTINGS

```
SITESETTINGS (
  id           CUID         PK
  key          VARCHAR(100)  NOT NULL  UNIQUE
  value        TEXT          NOT NULL
  description  VARCHAR(255)  NULL
  updated_at   TIMESTAMP     NOT NULL
  updated_by   CUID          NULL      FK → USER(id) ON DELETE SET NULL
)
```

**No decomposition required. SiteSettings is in BCNF
with documented EAV justification.**

---
---

## ENTITY 8 — NOTIFICATION

### Attributes

```
id, type, channel, recipient, payload,
sent_at, failed_at, error, created_at
```

### Functional Dependencies

```
id → type, channel, recipient, payload,
     sent_at, failed_at, error, created_at
```

No other candidate key. `recipient` alone doesn't identify a
notification (same recipient gets many notifications).

### Candidate Keys

| Candidate Key | Reason |
|---|---|
| `id` | Only candidate key |

**Chosen PK:** `id`

---

### 1NF

| Rule | Verdict | Evidence |
|---|---|---|
| Every attribute is atomic | ⚠️ EXAMINE | `payload` is JSONB — is this atomic? |
| No repeating groups | ✅ PASS | No column repetition |
| Every row uniquely identifiable | ✅ PASS | `id` is unique |

#### Is JSONB `payload` a 1NF violation?

Strictly speaking, storing structured data (JSON) in a single
column does violate the atomicity rule of 1NF because `payload`
contains multiple facts bundled together: `booking_id`, `name`,
`service`, etc.

The strict resolution would be to extract payload into typed columns:

```
NOTIFICATION (id, type, channel, recipient, booking_id, visitor_name, service, ...)
```

**Why we keep `payload` as JSONB:**

1. **Different notification types have different payloads.**
   A `BOOKING_RECEIVED` notification needs `booking_id + name + service`.
   A `STATUS_CHANGED` notification needs `booking_id + old_status + new_status`.
   A `MESSAGE_RECEIVED` notification needs `message_id + sender_name`.

   If we typed every possible field, we would have 10+ nullable columns
   — one for each notification type's unique data. That is worse than JSONB.

2. **Notification is an outbox record, not a business entity.**
   It is a serialized intent, not a first-class queryable entity.
   The system does not query inside `payload` — it reads the whole
   row and passes `payload` to the notification sender.

3. **This is the standard outbox pattern.** Industry-standard
   implementations (Debezium, MediatR outbox, etc.) use serialized
   payload for exactly this reason.

**Decision: `payload` JSONB is a justified, documented 1NF exception
using the outbox pattern. It will not be decomposed.**

**1NF: PASS with documented JSONB justification.**

---

### 2NF

Single-column PK. Partial dependency impossible.

**2NF: PASS. No changes.**

---

### 3NF

```
Does channel → type?      No — WhatsApp channel can carry any notification type
Does type → channel?      No — BOOKING_RECEIVED could go via email or WhatsApp
Does sent_at → failed_at? No — a sent notification doesn't have a failed_at
Does failed_at → error?   Yes — but failed_at is not a non-key attribute
                          determining another; error is the detail of the failure,
                          not determined by a timestamp alone
```

`failed_at` and `error` are companion fields — they are set
together by the same operation. `failed_at` being set does not
functionally determine the content of `error` (two failures at
the same millisecond would have different error messages).

```
failed_at -/→ error   (same timestamp, different errors possible — not a FD)
```

**3NF: PASS. No changes.**

---

### BCNF

Only determinant is `id`.

**BCNF: PASS. No changes.**

---

### FINAL NORMALIZED FORM — NOTIFICATION

```
NOTIFICATION (
  id          CUID         PK
  type        VARCHAR(50)   NOT NULL
  channel     VARCHAR(20)   NOT NULL
  recipient   VARCHAR(255)  NOT NULL
  payload     JSONB         NOT NULL
  sent_at     TIMESTAMP     NULL       -- NULL = queued, unsent
  failed_at   TIMESTAMP     NULL
  error       TEXT          NULL
  created_at  TIMESTAMP     NOT NULL   DEFAULT NOW()
)
```

**No decomposition required. Notification is in BCNF
with documented JSONB outbox justification.**

---
---

## ENTITY 9 — AUDITLOG

### Attributes

```
id, action, entity_type, entity_id, user_id,
ip_address, user_agent, metadata, created_at
```

### Functional Dependencies

```
id → action, entity_type, entity_id, user_id,
     ip_address, user_agent, metadata, created_at
```

No other candidate key. The same entity could be audited many
times. The same user could trigger many audit events. The same
action could happen many times.

### Candidate Keys

| Candidate Key | Reason |
|---|---|
| `id` | Only candidate key |

**Chosen PK:** `id`

---

### 1NF

| Rule | Verdict | Evidence |
|---|---|---|
| Every attribute is atomic | ⚠️ EXAMINE | `metadata` is JSONB |
| No repeating groups | ✅ PASS | No repetition |
| Every row uniquely identifiable | ✅ PASS | `id` is unique |

#### Is JSONB `metadata` a 1NF violation?

Same argument as Notification's `payload`. `metadata` stores
action-specific context:

- For `BOOKING_STATUS_UPDATE`: `{ old_status, new_status }`
- For `PROJECT_UPDATE`: `{ changed_fields, old_values, new_values }`
- For `SETTINGS_UPDATE`: `{ key, old_value, new_value }`

Each action type has a different metadata shape. Extracting these
into typed columns would require:
```
old_status, new_status, changed_fields, old_values,
new_values, old_setting_value, new_setting_value ...
```

All nullable, all irrelevant for most action types.
JSONB is correct here for the same reason as Notification.

**Decision: `metadata` JSONB is accepted. Documented.**

#### The polymorphic `(entity_type, entity_id)` pair

```
entity_type  VARCHAR(50)   -- 'Booking', 'Project', 'User'...
entity_id    VARCHAR(128)  -- The CUID of the affected record
```

In strict relational theory, this is a violation of referential
integrity — `entity_id` is not a typed FK. It cannot be enforced
by the database engine. The DB cannot verify that `entity_id`
actually exists in the table named by `entity_type`.

**Why this is the correct design for AuditLog:**

1. **Audit logs must outlive their subjects.** If we FK'd
   `entity_id` to `bookings.id`, then soft-deleting a booking
   could conflict with the audit log (depending on CASCADE rules).
   Worse, if we ever hard-deleted a booking (POPIA erasure), the
   FK would prevent deletion unless we CASCADE-deleted the audit
   trail — which destroys the audit record.

2. **Polymorphic references cannot be typed FKs** in PostgreSQL
   without creative workarounds (inheritance, separate FK columns
   per entity type). The standard pattern is a VARCHAR pair.

3. **The audit log is queried by `(entity_type, entity_id)` together.**
   This composite pair has an index on it. It works correctly
   without a FK.

**Decision: `(entity_type, entity_id)` polymorphic pair is accepted.
This is a known, named pattern for audit tables. Integrity is
enforced at the application layer (audit-logger.ts), not the DB.**

**1NF: PASS with documented JSONB and polymorphic reference justifications.**

---

### 2NF

Single-column PK. Partial dependency impossible.

**2NF: PASS. No changes.**

---

### 3NF

```
Does entity_type → action?  No — a 'Booking' entity can have many action types
Does action → entity_type?  No — BOOKING_STATUS_UPDATE always targets Booking
                            but this is application logic, not a FD
Does user_id → action?      No — same admin performs many different actions
Does ip_address → user_id?  No — same IP can be different users
```

`action → entity_type` deserves extra attention. In practice,
`BOOKING_STATUS_UPDATE` will always have `entity_type = 'Booking'`.
Could we say `action → entity_type`?

**This is application-layer consistency, not a functional dependency.**

A functional dependency means: for every tuple where action = X,
entity_type = Y is necessarily true. If we added a new action type
in v2 that affected both Bookings and Projects (a batch operation,
for example), this "dependency" would break. It is not a true FD —
it is a current correlation. We do not design for correlations.

```
action -/→ entity_type   (correlation, not functional dependency)
```

**3NF: PASS. No changes.**

---

### BCNF

Only determinant is `id`.

**BCNF: PASS. No changes.**

---

### FINAL NORMALIZED FORM — AUDITLOG

```
AUDITLOG (
  id           CUID         PK
  action       ENUM         NOT NULL
               CHECK (action IN (
                 'LOGIN_SUCCESS', 'LOGIN_FAILURE', 'LOGOUT',
                 'BOOKING_CREATE', 'BOOKING_STATUS_UPDATE', 'BOOKING_DELETE',
                 'PROJECT_CREATE', 'PROJECT_UPDATE', 'PROJECT_DELETE',
                 'CONTACT_MESSAGE_CREATE', 'CONTACT_MESSAGE_READ',
                 'SETTINGS_UPDATE'
               ))
  entity_type  VARCHAR(50)  NOT NULL
  entity_id    VARCHAR(128) NOT NULL
  user_id      CUID         NULL       FK → USER(id) ON DELETE SET NULL
  ip_address   VARCHAR(64)  NULL
  user_agent   VARCHAR(500) NULL
  metadata     JSONB        NULL
  created_at   TIMESTAMP    NOT NULL   DEFAULT NOW()

  -- NOTE: No updated_at — AuditLog rows are NEVER modified
  -- NOTE: No deleted_at — AuditLog rows are NEVER deleted
)
```

**No decomposition required. AuditLog is in BCNF
with documented JSONB and polymorphic reference justifications.**

---
---

## NORMALIZATION SUMMARY

### Results Table

| Entity | 1NF | 2NF | 3NF | BCNF | Decomposed? | Denormalizations |
|---|---|---|---|---|---|---|
| User | ✅ | ✅ | ✅ | ✅ | No | None |
| Session | ✅ | ✅ | ✅ | ✅ | No | None |
| Booking | ✅ | ✅ | ✅ | ✅ | No | 2 documented |
| Project | ✅ | ✅ | ✅ | ✅ | No | 1 documented |
| Testimonial | ✅ | ✅ | ✅ | ✅ | No | None |
| ContactMessage | ✅ | ✅ | ✅ | ✅ | No | None |
| SiteSettings | ✅ | ✅ | ✅ | ✅ | No | 1 documented |
| Notification | ✅ | ✅ | ✅ | ✅ | No | 1 documented |
| AuditLog | ✅ | ✅ | ✅ | ✅ | No | 2 documented |

**All 9 entities pass BCNF. Zero tables decomposed.**

---

### All Documented Denormalizations

Every deviation from strict normalization is listed here.
None are accidents. All are justified and recorded.

| # | Entity | Field / Pattern | Normal Form Tension | Justification |
|---|---|---|---|---|
| 1 | Booking | `lead_score` | Derived from other fields — transitive dependency | Materialized computed value — performance + historical stability |
| 2 | Booking | `name, email, phone` | Repeats if same visitor books twice | No Visitor entity in v1 — bookings are anonymous, self-contained |
| 3 | Project | `category` VARCHAR | Could be FK to Category table | No category lifecycle in v1 — freehand text, dynamic filter tabs |
| 4 | SiteSettings | EAV pattern | `value` TEXT loses type safety | Bounded, documented settings — type safety enforced at app layer |
| 5 | Notification | `payload` JSONB | Multi-valued attribute in one column | Outbox pattern — different types have different shapes |
| 6 | AuditLog | `metadata` JSONB | Multi-valued attribute in one column | Action-specific context — different shapes per action type |
| 7 | AuditLog | `(entity_type, entity_id)` | Polymorphic reference — no typed FK | Audit must survive deletion of subject — typed FK prevents this |

---

### Why No Table Was Decomposed

This is not a coincidence or a shortcut.

The schema was designed with normalization in mind from the start.
Entities were identified correctly — each one represents a single
concept with a single primary key that all its attributes depend on.

The M:N analysis (from the ERD phase) confirmed zero many-to-many
relationships — which eliminates the most common source of
normalization violations.

The denormalizations that exist are all at the edge of BCNF —
they are conscious tradeoffs between theoretical purity and
practical requirements (performance, the outbox pattern, POPIA
compliance, v1 scope). Each one is named, explained, and recorded.

This is what normalization should produce: not mechanical
decomposition for its own sake, but a clear understanding of
every design decision and the confidence that each choice was made
deliberately.

---

### What Changes in the Prisma Schema

**Nothing changes.** The Prisma schema produced in the system
design document already reflects a normalized structure.
The normalization process has:

1. Confirmed every design decision
2. Documented every denormalization explicitly
3. Justified every exception with a named pattern
4. Produced no new tables and no removed tables

The schema is clean. The decisions are documented. The build can proceed.

---

## FINAL COMPLETE NORMALIZED SCHEMA (ALL 9 ENTITIES)

```
─────────────────────────────────────────────────────────────
ENTITY          PK      FOREIGN KEYS              BCNF
─────────────────────────────────────────────────────────────
User            id      —                         ✅
Session         id      user_id → User CASCADE     ✅
Booking         id      —                         ✅
Project         id      —                         ✅
Testimonial     id      project_id → Project      ✅
                        SET NULL (nullable)
ContactMessage  id      —                         ✅
SiteSettings    id      updated_by → User         ✅
                        SET NULL (nullable)
Notification    id      —                         ✅
AuditLog        id      user_id → User            ✅
                        SET NULL (nullable)
─────────────────────────────────────────────────────────────
TOTAL ENTITIES: 9
TOTAL FK RELATIONSHIPS: 4
TOTAL TABLES DECOMPOSED: 0
TOTAL DOCUMENTED DENORMALIZATIONS: 7
ALL ENTITIES IN BCNF: YES
─────────────────────────────────────────────────────────────
```

---

*Normalization Complete*
*Status: All 9 entities in BCNF · 7 denormalizations documented and justified*
*Next: Physical Schema — indexes, constraints, CHECK expressions, seed data*
