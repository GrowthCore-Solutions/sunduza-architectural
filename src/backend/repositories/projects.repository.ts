// Project data access. Owns every Prisma call against the `projects` table —
// no business rules, no audit, no auth. Services compose these.
import "server-only";

import { db } from "@/backend/lib/db";
import { projectRowSelect, type ProjectRow } from "@/shared/types/db";
import type { ProjectCreateInput, ProjectUpdateInput } from "@/shared/types/project";
import type { DbClient } from "@/backend/repositories/types";

export const projectsRepository = {
  findMany(featured?: boolean, client: DbClient = db): Promise<ProjectRow[]> {
    return client.project.findMany({
      where: featured ? { isFeatured: true } : undefined,
      orderBy: { sortOrder: "asc" },
      select: projectRowSelect,
    });
  },

  findById(id: string, client: DbClient = db): Promise<ProjectRow | null> {
    return client.project.findUnique({ where: { id }, select: projectRowSelect });
  },

  /** Minimal projection for the sitemap — active projects, id + updatedAt only. */
  findRefs(client: DbClient = db): Promise<{ id: string; updatedAt: Date }[]> {
    return client.project.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, updatedAt: true },
    });
  },

  async exists(id: string, client: DbClient = db): Promise<boolean> {
    const row = await client.project.findUnique({ where: { id }, select: { id: true } });
    return row !== null;
  },

  create(data: ProjectCreateInput, client: DbClient = db): Promise<ProjectRow> {
    return client.project.create({ data, select: projectRowSelect });
  },

  update(id: string, data: ProjectUpdateInput, client: DbClient = db): Promise<ProjectRow> {
    return client.project.update({ where: { id }, data, select: projectRowSelect });
  },

  async softDelete(id: string, client: DbClient = db): Promise<void> {
    await client.project.update({ where: { id }, data: { deletedAt: new Date() } });
  },
};
