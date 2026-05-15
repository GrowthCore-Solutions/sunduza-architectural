import "server-only";
import { AuditAction } from "@prisma/client";
import { db } from "@/lib/db";
import { hashIpAddress } from "@/src/server/utils/hash-ip";
import { buildContactCreate } from "@/src/server/repositories/contact.repository";
import { buildAuditLogCreate } from "@/src/server/repositories/audit.repository";
import type { CreateContactInput } from "@/src/shared/schemas/contact.schema";

export interface CreateContactContext {
  ipAddress: string | null;
  userAgent: string | null;
}

export interface CreateContactResult {
  id: string;
}

// S2.1  — business logic in use-case, not the API route
// S5.15 — contact message + audit written in a single transaction
export async function createContact(
  input: CreateContactInput,
  context: CreateContactContext
): Promise<CreateContactResult> {
  const hashedIp = hashIpAddress(context.ipAddress);

  const [message] = await db.$transaction([
    buildContactCreate({
      name: input.name,
      email: input.email,
      phone: input.phone,
      message: input.message,
    }),
    buildAuditLogCreate({
      action: AuditAction.CONTACT_MESSAGE_CREATE,
      entityType: "ContactMessage",
      entityId: "pending",
      ipAddress: hashedIp,
      userAgent: context.userAgent,
    }),
  ]);

  return { id: message.id };
}
