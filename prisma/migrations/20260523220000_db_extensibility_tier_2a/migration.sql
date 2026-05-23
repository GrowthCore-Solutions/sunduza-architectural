-- Tier 2a — Extensibility scaffolding.
-- Services lookup table, project tags M2M, polymorphic attachments,
-- typed site settings, role enum extension. Built to extend without
-- further migrations as the product grows.
--
-- Applies on top of 20260523210000_db_hardening_tier_1.

BEGIN;

-- ─── 1. ENUM EXTENSIONS ───────────────────────────────────────────────────────
-- Reserve EDITOR / VIEWER now so future staff onboarding is a row insert,
-- not a schema migration. No application path uses them yet.
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'EDITOR';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'VIEWER';

-- Typed values for site_settings so the admin UI knows how to render and
-- parse each setting without per-key special cases.
CREATE TYPE "SettingValueType" AS ENUM (
  'STRING','INTEGER','BOOLEAN','JSON','URL','EMAIL','PHONE'
);

-- ─── 2. SERVICES CATALOGUE ────────────────────────────────────────────────────
-- Replaces the hardcoded list of service slugs with an admin-managed lookup.
-- Adding, renaming or hiding a service becomes a row update.
CREATE TABLE "services" (
    "id"          TEXT NOT NULL,
    "slug"        TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "description" TEXT,
    "icon"        TEXT,
    "is_active"   BOOLEAN NOT NULL DEFAULT true,
    "sort_order"  INTEGER NOT NULL DEFAULT 0,
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"  TIMESTAMP(3) NOT NULL,
    "deleted_at"  TIMESTAMP(3),
    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "services_slug_key" ON "services"("slug");

CREATE INDEX "services_active_sort_idx"
  ON "services"("is_active", "sort_order")
  WHERE "deleted_at" IS NULL;

-- Slug guard: lowercase, alphanumerics and dashes. Mirrors the convention used
-- by the existing seed (house_planning, arch_drawings, ...) but locked at DB.
ALTER TABLE "services"
  ADD CONSTRAINT "services_slug_shape"
  CHECK ("slug" ~ '^[a-z0-9][a-z0-9_-]*[a-z0-9]$');

-- Seed the four current offerings. The slugs are the exact strings already
-- stored in bookings.service — the backfill below depends on them matching.
INSERT INTO "services" ("id","slug","name","description","sort_order","updated_at") VALUES
  (gen_random_uuid()::text, 'house_planning',        'House Planning',
   'Full residential design from concept to council-ready drawings.',                 10, NOW()),
  (gen_random_uuid()::text, 'arch_drawings',         'Architectural Drawings',
   'Detailed architectural drawings for submission, construction or both.',           20, NOW()),
  (gen_random_uuid()::text, 'drafting_services',     'Drafting Services',
   'Technical drafting for architects, engineers and contractors.',                   30, NOW()),
  (gen_random_uuid()::text, 'dev_project_planning',  'Development Project Planning',
   'Site planning and development documentation for multi-unit and commercial work.', 40, NOW());

-- ─── 3. BOOKING → SERVICE FK ──────────────────────────────────────────────────
-- Add the live pointer; the existing TEXT `service` column remains as an
-- immutable snapshot of what the visitor selected. Two columns, two roles:
--   service     = historical attribution (never changes after submission)
--   service_id  = live link (NULL once the service is removed from catalogue)
ALTER TABLE "bookings" ADD COLUMN "service_id" TEXT;

UPDATE "bookings" b
  SET "service_id" = s."id"
  FROM "services" s
  WHERE s."slug" = b."service";

ALTER TABLE "bookings"
  ADD CONSTRAINT "bookings_service_id_fkey"
  FOREIGN KEY ("service_id") REFERENCES "services"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "bookings_service_id_active_idx"
  ON "bookings"("service_id")
  WHERE "deleted_at" IS NULL AND "service_id" IS NOT NULL;

-- ─── 4. TAGS + PROJECT_TAGS M2M ───────────────────────────────────────────────
-- Layered on top of Project.category — category stays as the primary axis,
-- tags add multi-dimensional classification (location, style, status...).
CREATE TABLE "tags" (
    "id"         TEXT NOT NULL,
    "slug"       TEXT NOT NULL,
    "name"       TEXT NOT NULL,
    "color"      TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

CREATE INDEX "tags_sort_active_idx"
  ON "tags"("sort_order")
  WHERE "deleted_at" IS NULL;

ALTER TABLE "tags"
  ADD CONSTRAINT "tags_slug_shape"
  CHECK ("slug" ~ '^[a-z0-9][a-z0-9_-]*[a-z0-9]$');

-- Optional color guard: accept a hex (#RRGGBB) or NULL.
ALTER TABLE "tags"
  ADD CONSTRAINT "tags_color_shape"
  CHECK ("color" IS NULL OR "color" ~ '^#[0-9A-Fa-f]{6}$');

-- Prisma's implicit M2M join table convention: _<RelationName> with A, B cols.
CREATE TABLE "_ProjectTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ProjectTags_AB_pkey" PRIMARY KEY ("A","B")
);

CREATE INDEX "_ProjectTags_B_index" ON "_ProjectTags"("B");

ALTER TABLE "_ProjectTags"
  ADD CONSTRAINT "_ProjectTags_A_fkey"
  FOREIGN KEY ("A") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_ProjectTags"
  ADD CONSTRAINT "_ProjectTags_B_fkey"
  FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── 5. POLYMORPHIC ATTACHMENTS ───────────────────────────────────────────────
-- Single file table for every entity that needs media. Today: zero writers.
-- Tomorrow: multi-image projects, testimonial photos, settings logos,
-- booking blueprints — all without adding tables per entity.
CREATE TABLE "attachments" (
    "id"          TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id"   TEXT NOT NULL,
    "file_path"   TEXT NOT NULL,
    "mime_type"   TEXT,
    "size_bytes"  INTEGER,
    "alt_text"    TEXT,
    "sort_order"  INTEGER NOT NULL DEFAULT 0,
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"  TIMESTAMP(3) NOT NULL,
    "deleted_at"  TIMESTAMP(3),
    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- Hot path: list a single entity's attachments in order.
CREATE INDEX "attachments_entity_sort_active_idx"
  ON "attachments"("entity_type", "entity_id", "sort_order")
  WHERE "deleted_at" IS NULL;

-- Sanity checks: positive file size, recognisable mime shape.
ALTER TABLE "attachments"
  ADD CONSTRAINT "attachments_size_positive"
  CHECK ("size_bytes" IS NULL OR "size_bytes" > 0);

ALTER TABLE "attachments"
  ADD CONSTRAINT "attachments_mime_shape"
  CHECK ("mime_type" IS NULL OR "mime_type" ~ '^[a-z0-9!#$&^_.+-]+/[a-z0-9!#$&^_.+-]+$');

-- ─── 6. SITE_SETTINGS — TYPED VALUES, CATEGORIES, PUBLIC FLAG ─────────────────
-- Backwards-compatible additions. Existing rows default to STRING and the
-- "general" category; the seed below labels the known keys properly.
ALTER TABLE "site_settings"
  ADD COLUMN "value_type" "SettingValueType" NOT NULL DEFAULT 'STRING',
  ADD COLUMN "category"   TEXT,
  ADD COLUMN "is_public"  BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "site_settings_category_idx" ON "site_settings"("category");
CREATE INDEX "site_settings_is_public_idx" ON "site_settings"("is_public");

-- Slug-style key guard. Keeps the EAV table from becoming a free-text dump.
ALTER TABLE "site_settings"
  ADD CONSTRAINT "site_settings_key_shape"
  CHECK ("key" ~ '^[a-z][a-z0-9_]*$');

-- Re-label the existing settings rather than orphaning them. Anything not
-- matched stays STRING / NULL category — safe defaults.
UPDATE "site_settings" SET "value_type" = 'PHONE',   "category" = 'contact',  "is_public" = true  WHERE "key" = 'whatsapp_number';
UPDATE "site_settings" SET "value_type" = 'EMAIL',   "category" = 'contact',  "is_public" = true  WHERE "key" = 'contact_email';
UPDATE "site_settings" SET "value_type" = 'PHONE',   "category" = 'contact',  "is_public" = true  WHERE "key" = 'business_phone';
UPDATE "site_settings" SET "value_type" = 'STRING',  "category" = 'contact',  "is_public" = true  WHERE "key" = 'business_address';
UPDATE "site_settings" SET "value_type" = 'STRING',  "category" = 'branding', "is_public" = true  WHERE "key" = 'hero_tagline';
UPDATE "site_settings" SET "value_type" = 'INTEGER', "category" = 'business', "is_public" = true  WHERE "key" = 'years_experience';
UPDATE "site_settings" SET "value_type" = 'INTEGER', "category" = 'business', "is_public" = true  WHERE "key" = 'projects_completed';

COMMIT;
