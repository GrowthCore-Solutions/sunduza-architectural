-- Lead entity: deduplicate visitor contact data into a first-class CRM row.
-- Every unique email across bookings becomes one Lead. Bookings gain a
-- nullable lead_id FK so existing queries are unaffected.
-- Applies on top of 20260523230000_db_normalization.

BEGIN;

-- ─── 1. LEADS TABLE ───────────────────────────────────────────────────────────
CREATE TABLE "leads" (
    "id"            TEXT NOT NULL,
    "email"         CITEXT NOT NULL,
    "name"          TEXT NOT NULL,
    "phone"         TEXT,
    "first_seen_at" TIMESTAMP(3) NOT NULL,
    "last_seen_at"  TIMESTAMP(3) NOT NULL,
    "booking_count" INTEGER NOT NULL DEFAULT 1,
    "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"    TIMESTAMP(3) NOT NULL,
    "deleted_at"    TIMESTAMP(3),
    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "leads_email_key" ON "leads"("email");

-- Partial performance indexes for the admin "leads" view.
CREATE INDEX "leads_email_active_idx"
  ON "leads"("email")
  WHERE "deleted_at" IS NULL;

CREATE INDEX "leads_last_seen_active_idx"
  ON "leads"("last_seen_at" DESC)
  WHERE "deleted_at" IS NULL;

CREATE INDEX "leads_booking_count_active_idx"
  ON "leads"("booking_count" DESC)
  WHERE "deleted_at" IS NULL;

-- booking_count starts at 0 on creation; the trigger increments it to 1 when
-- the first booking row is inserted in the same transaction. Allowing 0 avoids
-- a constraint violation on the transient state between lead INSERT and the
-- trigger UPDATE within the same atomic transaction.
ALTER TABLE "leads"
  ADD CONSTRAINT "leads_booking_count_positive"
  CHECK ("booking_count" >= 0);

-- Phone format reuses the pattern from bookings (10+ chars when provided).
ALTER TABLE "leads"
  ADD CONSTRAINT "leads_phone_min_length"
  CHECK ("phone" IS NULL OR char_length("phone") >= 10);

-- Email shape.
ALTER TABLE "leads"
  ADD CONSTRAINT "leads_email_shape"
  CHECK ("email" ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$');

-- Temporal invariant: first contact cannot be after last contact.
ALTER TABLE "leads"
  ADD CONSTRAINT "leads_seen_order"
  CHECK ("first_seen_at" <= "last_seen_at");

-- ─── 2. LEAD_ID ON BOOKINGS ───────────────────────────────────────────────────
ALTER TABLE "bookings" ADD COLUMN "lead_id" TEXT;

ALTER TABLE "bookings"
  ADD CONSTRAINT "bookings_lead_id_fkey"
  FOREIGN KEY ("lead_id") REFERENCES "leads"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "bookings_lead_id_active_idx"
  ON "bookings"("lead_id")
  WHERE "deleted_at" IS NULL AND "lead_id" IS NOT NULL;

-- ─── 3. BACKFILL — ONE LEAD PER UNIQUE EMAIL ──────────────────────────────────
-- Aggregate existing bookings by email. For each unique email:
--   name / phone  — from the chronologically first booking (first-contact snapshot).
--   first_seen_at — earliest booking created_at.
--   last_seen_at  — most recent booking created_at.
--   booking_count — total non-deleted bookings for this email.
--
-- ON CONFLICT DO NOTHING is defensive; uniqueness means no duplicates can
-- be inserted in a single pass.
INSERT INTO "leads" (
    "id", "email", "name", "phone",
    "first_seen_at", "last_seen_at", "booking_count", "updated_at"
)
SELECT
    gen_random_uuid()::text          AS "id",
    b."email"                        AS "email",
    (
        SELECT b2."name"
        FROM   "bookings" b2
        WHERE  b2."email" = b."email"
          AND  b2."deleted_at" IS NULL
        ORDER  BY b2."created_at" ASC
        LIMIT  1
    )                                AS "name",
    (
        SELECT b2."phone"
        FROM   "bookings" b2
        WHERE  b2."email" = b."email"
          AND  b2."deleted_at" IS NULL
        ORDER  BY b2."created_at" ASC
        LIMIT  1
    )                                AS "phone",
    MIN(b."created_at")              AS "first_seen_at",
    MAX(b."created_at")              AS "last_seen_at",
    COUNT(*)::integer                AS "booking_count",
    NOW()                            AS "updated_at"
FROM  "bookings" b
WHERE b."deleted_at" IS NULL
GROUP BY b."email"
ON CONFLICT DO NOTHING;

-- Wire existing bookings to their lead rows.
UPDATE "bookings" b
   SET "lead_id" = l."id"
  FROM "leads" l
 WHERE b."email" = l."email"
   AND b."deleted_at" IS NULL;

-- ─── 4. CONTACT_MESSAGES EMAIL INDEX ─────────────────────────────────────────
-- Allows looking up contact messages by email without a full table scan.
-- Partial (WHERE deleted_at IS NULL) to match the soft-delete read path.
CREATE INDEX "contact_messages_email_active_idx"
  ON "contact_messages"("email")
  WHERE "deleted_at" IS NULL;

-- ─── 5. KEEP booking_count IN SYNC ───────────────────────────────────────────
-- Trigger: increment booking_count and refresh last_seen_at on every new booking
-- that references an existing lead. The application layer upserts the lead row
-- inside the same transaction, so this trigger is a belt-and-braces guard for
-- out-of-band inserts (seed scripts, data imports, future worker paths).
CREATE OR REPLACE FUNCTION "sync_lead_on_booking_insert"()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW."lead_id" IS NOT NULL THEN
        UPDATE "leads"
           SET "last_seen_at"  = NEW."created_at",
               "booking_count" = "booking_count" + 1,
               "updated_at"    = NOW()
         WHERE "id" = NEW."lead_id";
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "trg_sync_lead_on_booking_insert" ON "bookings";
CREATE TRIGGER "trg_sync_lead_on_booking_insert"
    AFTER INSERT ON "bookings"
    FOR EACH ROW
    EXECUTE FUNCTION "sync_lead_on_booking_insert"();

COMMIT;
