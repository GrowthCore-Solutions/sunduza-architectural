// Testimonial data access.
import "server-only";

import { db } from "@/backend/lib/db";
import { testimonialRowSelect, type TestimonialRow } from "@/shared/types/db";
import type {
  TestimonialCreateInput,
  TestimonialUpdateInput,
} from "@/shared/types/testimonial";
import type { DbClient } from "@/backend/repositories/types";

export const testimonialsRepository = {
  findActive(client: DbClient = db): Promise<TestimonialRow[]> {
    return client.testimonial.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      select: testimonialRowSelect,
    });
  },

  findAll(client: DbClient = db): Promise<TestimonialRow[]> {
    return client.testimonial.findMany({
      orderBy: { createdAt: "desc" },
      select: testimonialRowSelect,
    });
  },

  async exists(id: string, client: DbClient = db): Promise<boolean> {
    const row = await client.testimonial.findUnique({ where: { id }, select: { id: true } });
    return row !== null;
  },

  create(data: TestimonialCreateInput, client: DbClient = db): Promise<TestimonialRow> {
    return client.testimonial.create({ data, select: testimonialRowSelect });
  },

  update(
    id: string,
    data: TestimonialUpdateInput,
    client: DbClient = db
  ): Promise<TestimonialRow> {
    return client.testimonial.update({ where: { id }, data, select: testimonialRowSelect });
  },

  async softDelete(id: string, client: DbClient = db): Promise<void> {
    await client.testimonial.update({ where: { id }, data: { deletedAt: new Date() } });
  },
};
