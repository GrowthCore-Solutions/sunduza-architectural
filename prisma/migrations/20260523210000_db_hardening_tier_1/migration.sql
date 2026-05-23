-- Tier 1 hardening: correctness, performance, idempotency, integrity.
-- Idempotent where possible (IF NOT EXISTS / IF EXISTS) so partial reruns recover.
-- Applies on top of 20260515085117_init.

BEGIN;

-- ─── 1. EXTENSIONS ────────────────────────────────────────────────────────────
-- citext  : case-insensitive email comparisons (login + duplicate-lead guards).
-- pgcrypto: stable UUIDs available to seeds and future entities without server
--           round-trips. No new defaults introduced; opt-in via DEFAULT gen_random_uuid().
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── 2. EMAIL COLUMNS → CITEXT ────────────────────────────────────────────────
-- Existing data preserved; uniqueness now case-insensitive.
ALTER TABLE "users"             ALTER COLUMN "email" TYPE CITEXT USING "email"::citext;
ALTER TABLE "bookings"          ALTER COLUMN "email" TYPE CITEXT USING "email"::citext;
ALTER TABLE "contact_messages"  ALTER COLUMN "email" TYPE CITEXT USING "email"::citext;

-- ─── 3. IDEMPOTENCY KEYS ──────────────────────────────────────────────────────
-- Public form submissions (booking + contact) carry an opaque client-supplied
-- key. Duplicate submits with the same key collapse to the original record.
ALTER TABLE "bookings"         ADD COLUMN "idempotency_key" TEXT;
ALTER TABLE "contact_messages" ADD COLUMN "idempotency_key" TEXT;

CREATE UNIQUE INDEX "bookings_idempotency_key_key"         ON "bookings"("idempotency_key");
CREATE UNIQUE INDEX "contact_messages_idempotency_key_key" ON "contact_messages"("idempotency_key");

-- ─── 4. CHECK CONSTRAINTS ─────────────────────────────────────────────────────
-- Defence-in-depth. App-layer Zod still validates, but the DB is the final word.

-- Lead score bounded 0..100; NULL allowed (score may be deferred).
ALTER TABLE "bookings"
  ADD CONSTRAINT "bookings_lead_score_range"
  CHECK ("lead_score" IS NULL OR ("lead_score" >= 0 AND "lead_score" <= 100));

-- Consent timestamp must accompany a true consent flag (POPIA — BR-009).
ALTER TABLE "bookings"
  ADD CONSTRAINT "bookings_consent_consistency"
  CHECK (
    ("consent_given" = false AND "consent_given_at" IS NULL)
    OR
    ("consent_given" = true  AND "consent_given_at" IS NOT NULL)
  );

-- Basic email shape — block obviously malformed strings at the wire.
ALTER TABLE "users"
  ADD CONSTRAINT "users_email_shape"
  CHECK ("email" ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$');

ALTER TABLE "bookings"
  ADD CONSTRAINT "bookings_email_shape"
  CHECK ("email" ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$');

ALTER TABLE "contact_messages"
  ADD CONSTRAINT "contact_messages_email_shape"
  CHECK ("email" ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$');

-- Rating bounded 1..5; NULL allowed (general reviews can skip rating).
ALTER TABLE "testimonials"
  ADD CONSTRAINT "testimonials_rating_range"
  CHECK ("rating" IS NULL OR ("rating" BETWEEN 1 AND 5));

-- Phone minimum length (matches Zod minLength(10) for bookings; contact phone optional).
ALTER TABLE "bookings"
  ADD CONSTRAINT "bookings_phone_min_length"
  CHECK (char_length("phone") >= 10);

ALTER TABLE "contact_messages"
  ADD CONSTRAINT "contact_messages_phone_min_length"
  CHECK ("phone" IS NULL OR char_length("phone") >= 10);

-- Read-state consistency: a message marked read MUST have a read_at timestamp.
ALTER TABLE "contact_messages"
  ADD CONSTRAINT "contact_messages_read_consistency"
  CHECK (
    ("read" = false AND "read_at" IS NULL)
    OR
    ("read" = true  AND "read_at" IS NOT NULL)
  );

-- ─── 5. PARTIAL INDEXES ON SOFT-DELETE MODELS ─────────────────────────────────
-- Replace full indexes with partial WHERE deleted_at IS NULL. Hot reads always
-- filter tombstones, so the partial index is smaller, faster, and stays in cache.

-- users
DROP INDEX IF EXISTS "users_deleted_at_idx";
CREATE INDEX "users_active_idx" ON "users"("deleted_at")
  WHERE "deleted_at" IS NULL;

-- bookings
DROP INDEX IF EXISTS "bookings_status_created_at_idx";
DROP INDEX IF EXISTS "bookings_status_lead_score_idx";
DROP INDEX IF EXISTS "bookings_email_idx";
DROP INDEX IF EXISTS "bookings_created_at_idx";
DROP INDEX IF EXISTS "bookings_utm_source_idx";

CREATE INDEX "bookings_status_created_at_active_idx"
  ON "bookings"("status", "created_at" DESC)
  WHERE "deleted_at" IS NULL;

CREATE INDEX "bookings_status_lead_score_active_idx"
  ON "bookings"("status", "lead_score" DESC)
  WHERE "deleted_at" IS NULL;

CREATE INDEX "bookings_email_active_idx"
  ON "bookings"("email")
  WHERE "deleted_at" IS NULL;

CREATE INDEX "bookings_created_at_active_idx"
  ON "bookings"("created_at" DESC)
  WHERE "deleted_at" IS NULL;

CREATE INDEX "bookings_utm_source_active_idx"
  ON "bookings"("utm_source")
  WHERE "deleted_at" IS NULL AND "utm_source" IS NOT NULL;

-- projects
DROP INDEX IF EXISTS "projects_is_featured_sort_order_idx";
DROP INDEX IF EXISTS "projects_sort_order_idx";
DROP INDEX IF EXISTS "projects_category_idx";

CREATE INDEX "projects_featured_sort_active_idx"
  ON "projects"("is_featured", "sort_order")
  WHERE "deleted_at" IS NULL;

CREATE INDEX "projects_sort_order_active_idx"
  ON "projects"("sort_order")
  WHERE "deleted_at" IS NULL;

CREATE INDEX "projects_category_active_idx"
  ON "projects"("category")
  WHERE "deleted_at" IS NULL AND "category" IS NOT NULL;

-- testimonials
DROP INDEX IF EXISTS "testimonials_is_active_idx";
DROP INDEX IF EXISTS "testimonials_project_id_idx";

CREATE INDEX "testimonials_is_active_active_idx"
  ON "testimonials"("is_active")
  WHERE "deleted_at" IS NULL;

CREATE INDEX "testimonials_project_id_active_idx"
  ON "testimonials"("project_id")
  WHERE "deleted_at" IS NULL AND "project_id" IS NOT NULL;

-- contact_messages
DROP INDEX IF EXISTS "contact_messages_read_created_at_idx";

CREATE INDEX "contact_messages_read_created_at_active_idx"
  ON "contact_messages"("read", "created_at" DESC)
  WHERE "deleted_at" IS NULL;

-- ─── 6. NOTIFICATION QUEUE — GIN INDEX ON PAYLOAD ─────────────────────────────
-- Worker can locate notifications by entity reference inside the JSONB payload
-- without scanning the whole table. jsonb_path_ops is smaller and faster than
-- jsonb_ops for the @> containment operator we expect to use.
CREATE INDEX "notifications_payload_gin_idx"
  ON "notifications" USING GIN ("payload" jsonb_path_ops);

-- Pending-only partial index for the worker's hot loop: only unsent rows.
CREATE INDEX "notifications_pending_idx"
  ON "notifications"("created_at" ASC)
  WHERE "sent_at" IS NULL AND "failed_at" IS NULL;

-- ─── 7. AUDIT LOG IMMUTABILITY ────────────────────────────────────────────────
-- Audit logs are write-once by design. Block UPDATE and DELETE at the engine
-- level — no app bug, future contributor, or compromised credential can rewrite
-- history. TRUNCATE is intentionally still permitted for partition rotation /
-- retention jobs run by ops, not by the application.
CREATE OR REPLACE FUNCTION "prevent_audit_log_mutation"()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs is append-only — % is not permitted', TG_OP
    USING ERRCODE = 'restrict_violation';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "audit_logs_no_update" ON "audit_logs";
CREATE TRIGGER "audit_logs_no_update"
  BEFORE UPDATE ON "audit_logs"
  FOR EACH ROW EXECUTE FUNCTION "prevent_audit_log_mutation"();

DROP TRIGGER IF EXISTS "audit_logs_no_delete" ON "audit_logs";
CREATE TRIGGER "audit_logs_no_delete"
  BEFORE DELETE ON "audit_logs"
  FOR EACH ROW EXECUTE FUNCTION "prevent_audit_log_mutation"();

COMMIT;
