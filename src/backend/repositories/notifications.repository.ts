// Notification outbox data access. Rows are written inside the same
// transaction as the entity that triggers them; a separate worker delivers
// them later. The payload carries only what the worker needs to compose a
// message — never a full entity row.
import "server-only";

import type { Prisma } from "@prisma/client";
import { db } from "@/backend/lib/db";
import type { DbClient } from "@/backend/repositories/types";

interface NotificationCreateData {
  type: string;
  channel: string;
  recipient: string;
  payload: Prisma.InputJsonValue;
}

export const notificationsRepository = {
  async create(data: NotificationCreateData, client: DbClient = db): Promise<void> {
    await client.notification.create({ data });
  },
};
