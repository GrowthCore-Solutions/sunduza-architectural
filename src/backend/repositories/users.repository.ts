// Credentials-auth user data access.
import "server-only";

import { db } from "@/backend/lib/db";
import { userAuthSelect, type UserAuthRow } from "@/shared/types/db";
import type { DbClient } from "@/backend/repositories/types";

export const usersRepository = {
  findByEmailForAuth(email: string, client: DbClient = db): Promise<UserAuthRow | null> {
    return client.user.findUnique({ where: { email }, select: userAuthSelect });
  },

  recordFailedAttempt(
    id: string,
    newAttempts: number,
    lockedUntil: Date | null,
    client: DbClient = db
  ): Promise<void> {
    return client.user
      .update({ where: { id }, data: { failedAttempts: newAttempts, lockedUntil } })
      .then(() => undefined);
  },

  clearFailedAttempts(id: string, client: DbClient = db): Promise<void> {
    return client.user
      .update({ where: { id }, data: { failedAttempts: 0, lockedUntil: null } })
      .then(() => undefined);
  },
};
