// Contact-message data access.
import "server-only";

import { db } from "@/backend/lib/db";
import {
  contactConfirmSelect,
  contactMessageRowSelect,
  type ContactConfirm,
  type ContactMessageRow,
} from "@/shared/types/db";
import type { DbClient } from "@/backend/repositories/types";

interface ContactMessageCreateData {
  name: string;
  email: string;
  phone: string | null;
  message: string;
}

export const contactMessagesRepository = {
  create(data: ContactMessageCreateData, client: DbClient = db): Promise<ContactConfirm> {
    return client.contactMessage.create({ data, select: contactConfirmSelect });
  },

  findMany(unreadOnly?: boolean, client: DbClient = db): Promise<ContactMessageRow[]> {
    return client.contactMessage.findMany({
      where: unreadOnly ? { read: false } : undefined,
      orderBy: { createdAt: "desc" },
      select: contactMessageRowSelect,
    });
  },

  async exists(id: string, client: DbClient = db): Promise<boolean> {
    const row = await client.contactMessage.findUnique({ where: { id }, select: { id: true } });
    return row !== null;
  },

  markRead(id: string, client: DbClient = db): Promise<ContactMessageRow> {
    return client.contactMessage.update({
      where: { id },
      data: { read: true, readAt: new Date() },
      select: contactMessageRowSelect,
    });
  },
};
