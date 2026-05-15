import "server-only";
import { AuditAction } from "@prisma/client";
import { db } from "@/lib/db";
import { buildAuditLogCreate } from "@/src/server/repositories/audit.repository";

export async function listMessages(includeRead = false) {
  return db.contactMessage.findMany({
    where: includeRead ? {} : { read: false },
    orderBy: [{ read: "asc" }, { createdAt: "desc" }],
    select: {
      id: true, name: true, email: true, phone: true,
      message: true, read: true, readAt: true, createdAt: true,
    },
  });
}

export async function markMessageRead(id: string, adminUserId: string) {
  const [message] = await db.$transaction([
    db.contactMessage.update({
      where: { id },
      data: { read: true, readAt: new Date() },
      select: { id: true, read: true, readAt: true },
    }),
    buildAuditLogCreate({
      action: AuditAction.CONTACT_MESSAGE_READ,
      entityType: "ContactMessage",
      entityId: id,
      userId: adminUserId,
    }),
  ]);
  return message;
}
