import "server-only";
import { db } from "@/lib/db";
import { createId } from "@paralleldrive/cuid2";

export interface CreateContactData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export function buildContactCreate(data: CreateContactData) {
  return db.contactMessage.create({
    data: {
      id: createId(),
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      message: data.message,
    },
    select: {
      id: true,
      createdAt: true,
    },
  });
}
