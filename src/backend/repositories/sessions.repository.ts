// Auth.js database-session data access. Rows created here must match the
// exact shape @auth/prisma-adapter itself would write, so auth() (which
// reads via the adapter) sees them transparently - see
// src/backend/services/auth.ts for why this is created out-of-band.
import "server-only";

import { db } from "@/backend/lib/db";
import type { DbClient } from "@/backend/repositories/types";

export const sessionsRepository = {
  create(
    data: { sessionToken: string; userId: string; expires: Date },
    client: DbClient = db
  ): Promise<void> {
    return client.session.create({ data }).then(() => undefined);
  },
};
