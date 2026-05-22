import "server-only";

import { AuditAction } from "@prisma/client";
import { db } from "@/backend/lib/db";
import type { ProjectCreateInput, ProjectUpdateInput } from "@/shared/types/project";
import { projectRowSelect, type ProjectRow } from "@/shared/types/db";
import { writeAuditLog } from "@/backend/services/audit";

export async function getProjects(featured?: boolean): Promise<ProjectRow[]> {
  return db.project.findMany({
    where: featured ? { isFeatured: true } : undefined,
    orderBy: { sortOrder: "asc" },
    select: projectRowSelect,
  });
}

export async function getProjectById(id: string): Promise<ProjectRow | null> {
  return db.project.findUnique({
    where: { id },
    select: projectRowSelect,
  });
}

export async function createProject(
  data: ProjectCreateInput,
  context: { userId: string }
): Promise<ProjectRow> {
  const project = await db.project.create({
    data,
    select: projectRowSelect,
  });

  await writeAuditLog({
    action: AuditAction.PROJECT_CREATE,
    entityType: "Project",
    entityId: project.id,
    userId: context.userId,
  });

  return project;
}

export async function updateProject(
  id: string,
  data: ProjectUpdateInput,
  context: { userId: string }
): Promise<ProjectRow | null> {
  const existing = await db.project.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return null;

  const project = await db.project.update({
    where: { id },
    data,
    select: projectRowSelect,
  });

  await writeAuditLog({
    action: AuditAction.PROJECT_UPDATE,
    entityType: "Project",
    entityId: id,
    userId: context.userId,
  });

  return project;
}

export async function softDeleteProject(
  id: string,
  context: { userId: string }
): Promise<boolean> {
  const existing = await db.project.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return false;

  await db.project.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await writeAuditLog({
    action: AuditAction.PROJECT_DELETE,
    entityType: "Project",
    entityId: id,
    userId: context.userId,
  });

  return true;
}
