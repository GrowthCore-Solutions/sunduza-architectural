// Sunduza Prisma Singleton + Middleware
// Singleton: prevents connection pool exhaustion in Next.js hot-reload (S5.9)
// Middleware: automatic deleted_at: null filter on all soft-deletable models (S5.12)
//             — system-level default, never rely on per-query filtering alone

import { PrismaClient } from "@prisma/client";

// ── Soft-delete models — these always filter deletedAt: null by default ──────
const SOFT_DELETE_MODELS = new Set([
  "User",
  "Booking",
  "Project",
  "Testimonial",
  "ContactMessage",
]);

// ── Prisma singleton ──────────────────────────────────────────────────────────
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const client = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["warn", "error"],
  });

  // S5.12 — Automatic deleted_at: null filter on all active-data queries
  // To intentionally include soft-deleted records, use prisma.$queryRaw or
  // pass { where: { deletedAt: { not: null } } } explicitly with a comment.
  client.$use(async (params, next) => {
    if (
      params.model &&
      SOFT_DELETE_MODELS.has(params.model) &&
      params.action === "findMany"
    ) {
      params.args ??= {};
      params.args.where ??= {};

      if (!("deletedAt" in params.args.where)) {
        params.args.where.deletedAt = null;
      }
    }

    if (
      params.model &&
      SOFT_DELETE_MODELS.has(params.model) &&
      params.action === "findFirst"
    ) {
      params.args ??= {};
      params.args.where ??= {};

      if (!("deletedAt" in params.args.where)) {
        params.args.where.deletedAt = null;
      }
    }

    return next(params);
  });

  return client;
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
