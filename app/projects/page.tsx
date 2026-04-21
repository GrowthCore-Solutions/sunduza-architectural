import type { Metadata } from "next";
import { db } from "@/lib/db";
import { ProjectsClientView } from "@/components/features/projects-grid";

export const metadata: Metadata = {
  title: "Projects",
  description: "View Sunduza Architectural portfolio of completed projects.",
};

export default async function ProjectsPage() {
  const projects = await db.project.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, shortDescription: true, imageUrl: true, category: true, createdAt: true },
  });

  return (
    <ProjectsClientView
      projects={projects.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() }))}
    />
  );
}
