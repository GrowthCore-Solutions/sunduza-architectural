import "server-only";

import type { Prisma, PrismaClient } from "@prisma/client";

/**
 * A Prisma client capable of running model queries — either the long-lived
 * singleton (`db`) or an interactive transaction client (`tx`).
 *
 * Repositories accept this so the same data-access function composes both on
 * its own and inside `db.$transaction(async (tx) => …)`. The soft-delete
 * middleware on the singleton also applies to transaction clients, so filtering
 * behaviour is identical either way.
 */
export type DbClient = PrismaClient | Prisma.TransactionClient;
