import "server-only";

import { AuditAction } from "@prisma/client";
import { db } from "@/backend/lib/db";
import type { TestimonialCreateInput, TestimonialUpdateInput } from "@/shared/types/testimonial";
import { testimonialRowSelect, type TestimonialRow } from "@/shared/types/db";
import { writeAuditLog } from "@/backend/services/audit";

export async function getTestimonials(): Promise<TestimonialRow[]> {
  return db.testimonial.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    select: testimonialRowSelect,
  });
}

export async function getAllTestimonials(): Promise<TestimonialRow[]> {
  return db.testimonial.findMany({
    orderBy: { createdAt: "desc" },
    select: testimonialRowSelect,
  });
}

export async function createTestimonial(
  data: TestimonialCreateInput,
  context: { userId: string }
): Promise<TestimonialRow> {
  const testimonial = await db.testimonial.create({
    data,
    select: testimonialRowSelect,
  });

  await writeAuditLog({
    action: AuditAction.PROJECT_CREATE,
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
  const existing = await db.testimonial.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return null;

  const testimonial = await db.testimonial.update({
    where: { id },
    data,
    select: testimonialRowSelect,
  });

  await writeAuditLog({
    action: AuditAction.PROJECT_UPDATE,
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
  const existing = await db.testimonial.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return false;

  await db.testimonial.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await writeAuditLog({
    action: AuditAction.PROJECT_DELETE,
    entityType: "Testimonial",
    entityId: id,
    userId: context.userId,
  });

  return true;
}
