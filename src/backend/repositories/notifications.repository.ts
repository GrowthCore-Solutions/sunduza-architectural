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

/** A pending outbox row, projected to what the delivery worker needs. */
export interface PendingNotification {
  id: string;
  type: string;
  payload: Prisma.JsonValue;
}

export const notificationsRepository = {
  async create(data: NotificationCreateData, client: DbClient = db): Promise<void> {
    await client.notification.create({ data });
  },

  /** Oldest undelivered, unfailed rows first — the worker scan order. */
  findPending(take: number, client: DbClient = db): Promise<PendingNotification[]> {
    return client.notification.findMany({
      where: { sentAt: null, failedAt: null },
      orderBy: { createdAt: "asc" },
      take,
      select: { id: true, type: true, payload: true },
    });
  },

  async markSent(id: string, client: DbClient = db): Promise<void> {
    await client.notification.update({ where: { id }, data: { sentAt: new Date() } });
  },

  async markFailed(id: string, error: string, client: DbClient = db): Promise<void> {
    await client.notification.update({
      where: { id },
      data: { failedAt: new Date(), error },
    });
  },

  /** Record a failed delivery attempt without giving up (retry later). */
  async recordAttempt(
    id: string,
    payload: Prisma.InputJsonValue,
    error: string,
    client: DbClient = db
  ): Promise<void> {
    await client.notification.update({ where: { id }, data: { payload, error } });
  },
};
