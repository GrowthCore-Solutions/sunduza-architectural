import "server-only";

import { AuditAction } from "@prisma/client";
import type {
  TestimonialCreateInput,
  TestimonialUpdateInput,
} from "@/shared/types/testimonial";
import type { TestimonialRow } from "@/shared/types/db";
import { testimonialsRepository } from "@/backend/repositories/testimonials.repository";
import { writeAuditLog } from "@/backend/services/audit";

export function getTestimonials(): Promise<TestimonialRow[]> {
  return testimonialsRepository.findActive();
}

export function getAllTestimonials(): Promise<TestimonialRow[]> {
  return testimonialsRepository.findAll();
}

export async function createTestimonial(
  data: TestimonialCreateInput,
  context: { userId: string }
): Promise<TestimonialRow> {
  const testimonial = await testimonialsRepository.create(data);

  await writeAuditLog({
    action: AuditAction.TESTIMONIAL_CREATE,
    entityType: "Testimonial",
    entityId: testimonial.id,
    userId: context.userId,
  });

  return testimonial;
}

export async function updateTestimonial(
  id: string,
  data: TestimonialUpdateInput,
  context: { userId: string }
): Promise<TestimonialRow | null> {
  if (!(await testimonialsRepository.exists(id))) return null;

  const testimonial = await testimonialsRepository.update(id, data);

  await writeAuditLog({
    action: AuditAction.TESTIMONIAL_UPDATE,
    entityType: "Testimonial",
    entityId: id,
    userId: context.userId,
  });

  return testimonial;
}

export async function softDeleteTestimonial(
  id: string,
  context: { userId: string }
): Promise<boolean> {
  if (!(await testimonialsRepository.exists(id))) return false;

  await testimonialsRepository.softDelete(id);

  await writeAuditLog({
    action: AuditAction.TESTIMONIAL_DELETE,
    entityType: "Testimonial",
    entityId: id,
    userId: context.userId,
  });

  return true;
}
