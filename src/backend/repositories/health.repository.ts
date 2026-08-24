// Health/liveness data access — a trivial round-trip to confirm the database
// is reachable.
import "server-only";

import { db } from "@/backend/lib/db";
import type { DbClient } from "@/backend/repositories/types";

export const healthRepository = {
  async ping(client: DbClient = db): Promise<void> {
    await client.$queryRaw`SELECT 1`;
  },
};
