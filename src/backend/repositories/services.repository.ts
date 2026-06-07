// Services-catalogue data access (the `services` lookup table that backs
// Booking.service). Caching and slug resolution are business concerns and live
// in the service layer; this module is pure persistence.
import "server-only";

import { db } from "@/backend/lib/db";
import { serviceRowSelect, type ServiceRow } from "@/shared/types/db";
import type { DbClient } from "@/backend/repositories/types";

interface ServiceCreateData {
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
}

interface ServiceUpdateData {
  name?: string;
  description?: string | null;
  icon?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

export const servicesRepository = {
  findActive(client: DbClient = db): Promise<ServiceRow[]> {
    return client.service.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: serviceRowSelect,
    });
  },

  async exists(id: string, client: DbClient = db): Promise<boolean> {
    const row = await client.service.findUnique({ where: { id }, select: { id: true } });
    return row !== null;
  },

  create(data: ServiceCreateData, client: DbClient = db): Promise<ServiceRow> {
    return client.service.create({ data, select: serviceRowSelect });
  },

  update(id: string, data: ServiceUpdateData, client: DbClient = db): Promise<ServiceRow> {
    return client.service.update({ where: { id }, data, select: serviceRowSelect });
  },

  async softDelete(id: string, client: DbClient = db): Promise<void> {
    await client.service.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  },
};
