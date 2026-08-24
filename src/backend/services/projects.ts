import "server-only";

import { AuditAction } from "@prisma/client";
import type { ProjectCreateInput, ProjectUpdateInput } from "@/shared/types/project";
import type { ProjectRow } from "@/shared/types/db";
import { projectsRepository } from "@/backend/repositories/projects.repository";
import { writeAuditLog } from "@/backend/services/audit";

export function getProjects(featured?: boolean): Promise<ProjectRow[]> {
  return projectsRepository.findMany(featured);
}

export function getProjectById(id: string): Promise<ProjectRow | null> {
  return projectsRepository.findById(id);
}

/** Active project references (id + updatedAt) for the sitemap. */
export function getProjectRefs(): Promise<{ id: string; updatedAt: Date }[]> {
  return projectsRepository.findRefs();
}

export async function createProject(
  data: ProjectCreateInput,
  context: { userId: string }
): Promise<ProjectRow> {
  const project = await projectsRepository.create(data);

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
  if (!(await projectsRepository.exists(id))) return null;

  const project = await projectsRepository.update(id, data);

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
  if (!(await projectsRepository.exists(id))) return false;

  await projectsRepository.softDelete(id);

  await writeAuditLog({
    action: AuditAction.PROJECT_DELETE,
    entityType: "Project",
    entityId: id,
    userId: context.userId,
  });

  return true;
}
