import "server-only";
import { AuditAction } from "@prisma/client";
import { db } from "@/lib/db";
import { buildAuditLogCreate } from "@/src/server/repositories/audit.repository";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";

export const ProjectSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1),
  imagePath: z.string().min(1).max(255),
  category: z.string().max(50).optional(),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
});

export type ProjectInput = z.infer<typeof ProjectSchema>;

export async function createProject(data: ProjectInput, adminUserId: string) {
  const [project] = await db.$transaction([
    db.project.create({
      data: { id: createId(), ...data },
      select: { id: true, title: true, imagePath: true, category: true, isFeatured: true, sortOrder: true },
    }),
    buildAuditLogCreate({
      action: AuditAction.PROJECT_CREATE,
      entityType: "Project",
      entityId: "pending",
      userId: adminUserId,
      metadata: { title: data.title },
    }),
  ]);
  return project;
}

export async function updateProject(id: string, data: Partial<ProjectInput>, adminUserId: string) {
  const [project] = await db.$transaction([
    db.project.update({
      where: { id },
      data,
      select: { id: true, title: true, imagePath: true, category: true, isFeatured: true, sortOrder: true, updatedAt: true },
    }),
    buildAuditLogCreate({
      action: AuditAction.PROJECT_UPDATE,
      entityType: "Project",
      entityId: id,
      userId: adminUserId,
      metadata: { changedFields: Object.keys(data) },
    }),
  ]);
  return project;
}

export async function softDeleteProject(id: string, adminUserId: string) {
  await db.$transaction([
    db.project.update({ where: { id }, data: { deletedAt: new Date() } }),
    buildAuditLogCreate({
      action: AuditAction.PROJECT_DELETE,
      entityType: "Project",
      entityId: id,
      userId: adminUserId,
    }),
  ]);
}

export async function listProjects() {
  return db.project.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      id: true, title: true, description: true,
      imagePath: true, category: true, isFeatured: true,
      sortOrder: true, createdAt: true,
    },
  });
}
