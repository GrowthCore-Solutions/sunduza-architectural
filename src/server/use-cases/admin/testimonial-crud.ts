import "server-only";
import { db } from "@/lib/db";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";

export const TestimonialSchema = z.object({
  clientName: z.string().min(1).max(100),
  review: z.string().min(1),
  rating: z.number().int().min(1).max(5).optional(),
  projectId: z.string().optional(),
  isActive: z.boolean().default(true),
});
export type TestimonialInput = z.infer<typeof TestimonialSchema>;

export async function createTestimonial(data: TestimonialInput) {
  return db.testimonial.create({
    data: { id: createId(), ...data },
    select: { id: true, clientName: true, review: true, rating: true, isActive: true, createdAt: true },
  });
}

export async function updateTestimonial(id: string, data: Partial<TestimonialInput>) {
  return db.testimonial.update({
    where: { id },
    data,
    select: { id: true, clientName: true, review: true, rating: true, isActive: true, updatedAt: true },
  });
}

export async function softDeleteTestimonial(id: string) {
  await db.testimonial.update({ where: { id }, data: { deletedAt: new Date() } });
}

export async function listTestimonials() {
  return db.testimonial.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, clientName: true, review: true, rating: true,
      isActive: true, projectId: true, createdAt: true,
      project: { select: { id: true, title: true } },
    },
  });
}
