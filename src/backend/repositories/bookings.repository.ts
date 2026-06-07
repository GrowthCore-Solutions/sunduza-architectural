// Booking data access.
import "server-only";

import type { BookingStatus, Prisma } from "@prisma/client";
import { db } from "@/backend/lib/db";
import {
  bookingConfirmSelect,
  bookingRowSelect,
  type BookingConfirm,
  type BookingRow,
} from "@/shared/types/db";
import type { DbClient } from "@/backend/repositories/types";

export const bookingsRepository = {
  create(
    data: Prisma.BookingUncheckedCreateInput,
    client: DbClient = db
  ): Promise<BookingConfirm> {
    return client.booking.create({ data, select: bookingConfirmSelect });
  },

  async findPage(
    opts: { where?: Prisma.BookingWhereInput; skip: number; take: number },
    client: DbClient = db
  ): Promise<{ rows: BookingRow[]; total: number }> {
    const [rows, total] = await Promise.all([
      client.booking.findMany({
        where: opts.where,
        orderBy: { createdAt: "desc" },
        select: bookingRowSelect,
        skip: opts.skip,
        take: opts.take,
      }),
      client.booking.count({ where: opts.where }),
    ]);
    return { rows, total };
  },

  findById(id: string, client: DbClient = db): Promise<BookingRow | null> {
    return client.booking.findUnique({ where: { id }, select: bookingRowSelect });
  },

  findStatusById(
    id: string,
    client: DbClient = db
  ): Promise<{ id: string; status: BookingStatus } | null> {
    return client.booking.findUnique({ where: { id }, select: { id: true, status: true } });
  },

  findByLeadId(leadId: string, client: DbClient = db): Promise<BookingRow[]> {
    return client.booking.findMany({
      where: { leadId },
      orderBy: { createdAt: "desc" },
      select: bookingRowSelect,
    });
  },

  update(
    id: string,
    data: Prisma.BookingUpdateInput,
    client: DbClient = db
  ): Promise<BookingRow> {
    return client.booking.update({ where: { id }, data, select: bookingRowSelect });
  },

  async softDelete(id: string, client: DbClient = db): Promise<void> {
    await client.booking.update({ where: { id }, data: { deletedAt: new Date() } });
  },
};
