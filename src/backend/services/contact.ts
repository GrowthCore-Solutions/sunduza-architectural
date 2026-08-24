import "server-only";

import { AuditAction } from "@prisma/client";
import { db } from "@/backend/lib/db";
import { getAdminEmail } from "@/backend/lib/env";
import type { ContactMessageInput } from "@/shared/types/contact";
import {
  contactConfirmSelect,
  contactMessageRowSelect,
  type ContactConfirm,
  type ContactMessageRow,
} from "@/shared/types/db";
import { writeAuditLog } from "@/backend/services/audit";

export async function createContactMessage(
  data: ContactMessageInput,
  meta: { ipAddress: string }
): Promise<ContactConfirm> {
  const adminEmail = getAdminEmail();

  const [message] = await db.$transaction([
    db.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        message: data.message,
      },
      select: contactConfirmSelect,
    }),
    db.notification.create({
      data: {
        type: "CONTACT_NEW",
        channel: "email",
        recipient: adminEmail,
        payload: {
          name: data.name,
          email: data.email,
          message: data.message.slice(0, 200),
        },
      },
    }),
  ]);

  await writeAuditLog({
    action: AuditAction.CONTACT_MESSAGE_CREATE,
    entityType: "ContactMessage",
    entityId: message.id,
    ipAddress: meta.ipAddress,
  });

  return message;
}

export async function getContactMessages(unreadOnly?: boolean): Promise<ContactMessageRow[]> {
  return db.contactMessage.findMany({
    where: unreadOnly ? { read: false } : undefined,
    orderBy: { createdAt: "desc" },
    select: contactMessageRowSelect,
  });
}

export async function markMessageRead(
  id: string,
  context: { userId: string }
): Promise<ContactMessageRow | null> {
  const existing = await db.contactMessage.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) return null;

  const updated = await db.contactMessage.update({
    where: { id },
    data: { read: true, readAt: new Date() },
    select: contactMessageRowSelect,
  });

  await writeAuditLog({
    action: AuditAction.CONTACT_MESSAGE_READ,
    entityType: "ContactMessage",
    entityId: id,
    userId: context.userId,
  });

  return updated;
}
