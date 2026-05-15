import "server-only";
import { db } from "@/lib/db";
import { createId } from "@paralleldrive/cuid2";

type NotificationType = "BOOKING_RECEIVED" | "STATUS_CHANGED" | "MESSAGE_RECEIVED";
type NotificationChannel = "email" | "whatsapp" | "sms";

interface QueueNotificationParams {
  type: NotificationType;
  channel: NotificationChannel;
  recipient: string;
  payload: Record<string, unknown>;
}

// Queues a notification row. Processed by a background worker in v2.
// In v1: rows are written but never dispatched (no sender configured).
export function buildNotificationCreate(params: QueueNotificationParams) {
  return db.notification.create({
    data: {
      id: createId(),
      type: params.type,
      channel: params.channel,
      recipient: params.recipient,
      payload: params.payload as object,
    },
    select: { id: true },
  });
}
