// Notification delivery worker. Drains the outbox: reads pending rows, sends
// each via the configured channel, and records the result. Retries up to
// MAX_ATTEMPTS before marking a row permanently failed. Invoked by the
// /api/internal/notify cron route.
import "server-only";

import type { Prisma } from "@prisma/client";
import { notificationsRepository } from "@/backend/repositories/notifications.repository";
import { notifyAdminNewBooking, notifyAdminNewContact } from "@/backend/lib/email";

const MAX_ATTEMPTS = 3;
const BATCH_SIZE = 20;

type DeliveryResult = { ok: true } | { ok: false; error: string };

async function deliver(type: string, payload: Record<string, unknown>): Promise<DeliveryResult> {
  if (type === "BOOKING_NEW") {
    return notifyAdminNewBooking({
      name: String(payload.name ?? ""),
      email: String(payload.email ?? ""),
      service: String(payload.service ?? ""),
      leadScore: typeof payload.leadScore === "number" ? payload.leadScore : null,
    });
  }
  if (type === "CONTACT_NEW") {
    return notifyAdminNewContact({
      name: String(payload.name ?? ""),
      email: String(payload.email ?? ""),
      message: String(payload.message ?? ""),
    });
  }
  return { ok: false, error: `Unknown notification type: ${type}` };
}

export async function processPendingNotifications(): Promise<{
  processed: number;
  sent: number;
  failed: number;
}> {
  const pending = await notificationsRepository.findPending(BATCH_SIZE);

  let sent = 0;
  let failed = 0;

  for (const row of pending) {
    const payload = (row.payload ?? {}) as Record<string, unknown>;
    const result = await deliver(row.type, payload);

    if (result.ok) {
      await notificationsRepository.markSent(row.id);
      sent++;
      continue;
    }

    const attempts = (typeof payload._attempts === "number" ? payload._attempts : 0) + 1;
    if (attempts >= MAX_ATTEMPTS) {
      await notificationsRepository.markFailed(row.id, result.error);
    } else {
      await notificationsRepository.recordAttempt(
        row.id,
        { ...payload, _attempts: attempts } as Prisma.InputJsonValue,
        result.error
      );
    }
    failed++;
  }

  return { processed: pending.length, sent, failed };
}
