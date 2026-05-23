-- Normalization pass: structured budget range, explicit project_tags junction.
-- Applies on top of 20260523220000_db_extensibility_tier_2a.

BEGIN;

-- ─── 1. STRUCTURED BUDGET ─────────────────────────────────────────────────────
-- Replace free-text budget with a cents-denominated range. The legacy `budget`
-- TEXT column stays for historical attribution and backward compat while the
-- front-end migrates; it is NOT used for any arithmetic.

ALTER TABLE "bookings"
  ADD COLUMN "budget_min_cents" BIGINT,
  ADD COLUMN "budget_max_cents" BIGINT,
  ADD COLUMN "budget_currency"  CHAR(3) NOT NULL DEFAULT 'ZAR';

-- Range sanity: min ≤ max when both are provided; both non-negative.
ALTER TABLE "bookings"
  ADD CONSTRAINT "bookings_budget_min_positive"
  CHECK ("budget_min_cents" IS NULL OR "budget_min_cents" >= 0);

ALTER TABLE "bookings"
  ADD CONSTRAINT "bookings_budget_max_positive"
  CHECK ("budget_max_cents" IS NULL OR "budget_max_cents" >= 0);

ALTER TABLE "bookings"
  ADD CONSTRAINT "bookings_budget_range_order"
  CHECK (
    "budget_min_cents" IS NULL
    OR "budget_max_cents" IS NULL
    OR "budget_min_cents" <= "budget_max_cents"
  );

-- ISO 4217 currency code: 3 uppercase letters (ZAR, USD, EUR, GBP…).
ALTER TABLE "bookings"
  ADD CONSTRAINT "bookings_budget_currency_shape"
  CHECK ("budget_currency" ~ '^[A-Z]{3}$');

-- Index for range-based admin filtering: "show leads with budget > R500k".
CREATE INDEX "bookings_budget_range_active_idx"
  ON "bookings"("budget_min_cents", "budget_max_cents")
  WHERE "deleted_at" IS NULL
    AND "budget_min_cents" IS NOT NULL;

-- Best-effort backfill of the new range columns from the legacy text field.
-- These five patterns cover the typical free-text inputs seen in the seed data
-- and are applied in order from most-specific to least-specific.
-- Unrecognised patterns leave the new columns NULL (explicitly acceptable).
--
-- Pattern 1: plain integer or decimal → treat as single-point range (min = max).
UPDATE "bookings"
  SET "budget_min_cents" = ROUND(REGEXP_REPLACE("budget", '[^0-9.]', '', 'g')::numeric * 100)::bigint,
      "budget_max_cents" = ROUND(REGEXP_REPLACE("budget", '[^0-9.]', '', 'g')::numeric * 100)::bigint
  WHERE "budget" IS NOT NULL
    AND "budget" ~ '^\s*R?\s*[0-9][0-9 ]*(\.[0-9]+)?\s*$'
    AND "budget_min_cents" IS NULL;

-- Pattern 2: "500k" / "R500k" → 500 000 as single-point range.
UPDATE "bookings"
  SET "budget_min_cents" = ROUND(REGEXP_REPLACE("budget", '[^0-9.]', '', 'g')::numeric * 1000 * 100)::bigint,
      "budget_max_cents" = ROUND(REGEXP_REPLACE("budget", '[^0-9.]', '', 'g')::numeric * 1000 * 100)::bigint
  WHERE "budget" IS NOT NULL
    AND lower("budget") ~ '[0-9]+\s*k'
    AND "budget_min_cents" IS NULL;

-- Pattern 3: "1m" / "R1m" / "1 million" → multiply by 1 000 000.
UPDATE "bookings"
  SET "budget_min_cents" = ROUND(REGEXP_REPLACE("budget", '[^0-9.]', '', 'g')::numeric * 1000000 * 100)::bigint,
      "budget_max_cents" = ROUND(REGEXP_REPLACE("budget", '[^0-9.]', '', 'g')::numeric * 1000000 * 100)::bigint
  WHERE "budget" IS NOT NULL
    AND lower("budget") ~ '[0-9]+\s*(m|million)'
    AND "budget_min_cents" IS NULL;

-- ─── 2. EXPLICIT PROJECT_TAGS JUNCTION ────────────────────────────────────────
-- Drop the Prisma-implicit _ProjectTags table (A / B columns) and replace with
-- a self-describing project_tags table (project_id / tag_id). The composite PK
-- and cascades are equivalent; column names now make sense in raw SQL and BI.
--
-- Safe: the implicit table was introduced in the tier-2a migration with no rows
-- (no project_tags have been assigned yet). This is a pure rename-and-clarify.

-- Remove implicit junction introduced by Prisma in the tier-2a migration.
ALTER TABLE "_ProjectTags" DROP CONSTRAINT IF EXISTS "_ProjectTags_A_fkey";
ALTER TABLE "_ProjectTags" DROP CONSTRAINT IF EXISTS "_ProjectTags_B_fkey";
DROP TABLE IF EXISTS "_ProjectTags";

-- Explicit junction with readable column names.
CREATE TABLE "project_tags" (
    "project_id" TEXT NOT NULL,
    "tag_id"     TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "project_tags_pkey" PRIMARY KEY ("project_id", "tag_id")
);

CREATE INDEX "project_tags_tag_id_idx" ON "project_tags"("tag_id");

ALTER TABLE "project_tags"
  ADD CONSTRAINT "project_tags_project_id_fkey"
  FOREIGN KEY ("project_id") REFERENCES "projects"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "project_tags"
  ADD CONSTRAINT "project_tags_tag_id_fkey"
  FOREIGN KEY ("tag_id") REFERENCES "tags"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
