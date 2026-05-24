// Sunduza Prisma Singleton + Middleware
// Singleton: prevents connection pool exhaustion in Next.js hot-reload (S5.9)
// Middleware: automatic deleted_at: null filter on every operation that
//             accepts a `where` clause for soft-deletable models (S5.12).
//             System-level default — services never re-implement the filter.
//
// Escape hatches:
//   • Pass `deletedAt: <anything-non-undefined>` in `where` to opt out
//     (set `deletedAt: { not: null }` for tombstones, `undefined` for both).
//   • Raw queries ($queryRaw / $executeRaw) bypass middleware entirely — they
//     MUST hand-filter `deleted_at IS NULL` when targeting soft-delete tables.

import "@/backend/lib/load-env";
import { Prisma, PrismaClient } from "@prisma/client";

// Soft-delete models — every read / aggregate / bulk-mutation defaults to
// active rows (deletedAt IS NULL). Singular update/delete are NOT filtered
// because Prisma requires a strictly-unique `where` for those operations and
// composite predicates would break them; soft-delete callers must therefore
// pass a unique id they already trust.
const SOFT_DELETE_MODELS = new Set<string>([
  "User",
  "Booking",
  "Lead",
  "Project",
  "Testimonial",
  "ContactMessage",
  "Service",
  "Tag",
  "Attachment",
]);

// Every Prisma action that exposes a `where` clause on the target model.
// Keep this list exhaustive — additions to Prisma's API should land here too.
const FILTERED_ACTIONS = new Set<Prisma.PrismaAction>([
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "findUnique",
  "findUniqueOrThrow",
  "count",
  "aggregate",
  "groupBy",
  "updateMany",
  "deleteMany",
]);

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

  client.$use(async (params, next) => {
    if (
      params.model &&
      SOFT_DELETE_MODELS.has(params.model) &&
      FILTERED_ACTIONS.has(params.action)
    ) {
      params.args ??= {};

      // groupBy passes filters under `where`; aggregate / count / findMany do
      // the same. updateMany / deleteMany also accept `where`. One shape covers
      // them all.
      params.args.where ??= {};

      // Only inject when the caller has not addressed deletedAt at all.
      // `deletedAt: undefined` is treated as "I want both" — leave it alone.
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
