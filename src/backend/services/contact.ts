import "server-only";

import { AuditAction } from "@prisma/client";
import { db } from "@/backend/lib/db";
import { getAdminEmail } from "@/backend/lib/env";
import type { ContactMessageInput } from "@/shared/types/contact";
import type { ContactConfirm, ContactMessageRow } from "@/shared/types/db";
import { contactMessagesRepository } from "@/backend/repositories/contact-messages.repository";
import { notificationsRepository } from "@/backend/repositories/notifications.repository";
import { writeAuditLog } from "@/backend/services/audit";

export async function createContactMessage(
  data: ContactMessageInput,
  meta: { ipAddress: string }
): Promise<ContactConfirm> {
  const adminEmail = getAdminEmail();

  // The message row and its notification-outbox row commit together so the
  // admin is never notified about a message that failed to persist (or vice
  // versa).
  const message = await db.$transaction(async (tx) => {
    const created = await contactMessagesRepository.create(
      {
        name: data.name,
        email: data.email,
        // `||` not `??`: an unfilled optional text input submits "", and an
        // empty string must not reach the database unchanged - it violates
        // the phone_min_length CHECK constraint (phone IS NULL OR length >=
        // 10), a 500 that silently dropped the visitor's message. See
        // 2026-08-24 incident (tests/e2e/contact-flow.spec.ts).
        phone: data.phone || null,
        message: data.message,
      },
      tx
    );

    await notificationsRepository.create(
      {
        type: "CONTACT_NEW",
        channel: "email",
        recipient: adminEmail,
        payload: {
          name: data.name,
          email: data.email,
          message: data.message.slice(0, 200),
        },
      },
      tx
    );

    return created;
  });

  await writeAuditLog({
    action: AuditAction.CONTACT_MESSAGE_CREATE,
    entityType: "ContactMessage",
    entityId: message.id,
    ipAddress: meta.ipAddress,
  });

  return message;
}

export function getContactMessages(unreadOnly?: boolean): Promise<ContactMessageRow[]> {
  return contactMessagesRepository.findMany(unreadOnly);
}

export async function markMessageRead(
  id: string,
  context: { userId: string }
): Promise<ContactMessageRow | null> {
  if (!(await contactMessagesRepository.exists(id))) return null;

  const updated = await contactMessagesRepository.markRead(id);

  await writeAuditLog({
    action: AuditAction.CONTACT_MESSAGE_READ,
    entityType: "ContactMessage",
    entityId: id,
    userId: context.userId,
  });

  return updated;
}
