import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/src/client/components/ui/button";
import { PageHero } from "@/src/client/components/sections/PageHero";
import { ProjectsGrid } from "@/src/client/components/features/ProjectsGrid";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "View the Sunduza Architectural portfolio of completed residential, commercial, and development projects across South Africa.",
};

export const revalidate = 300;

export default async function ProjectsPage() {
  const projects = await db.project.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      title: true,
      description: true,
      imagePath: true,
      category: true,
    },
  });

  const categories = [
    ...new Set(
      projects
        .map((p) => p.category)
        .filter((c): c is string => c !== null && c !== "")
    ),
  ];

  return (
    <div className="bg-[--color-paper]">
      <PageHero
        label="Our Portfolio"
        title="Completed Projects"
        description="Residential, commercial, and development work delivered across South Africa."
      />

      <section className="mx-auto max-w-7xl px-4 py-20">
        <ProjectsGrid projects={projects} categories={categories} />

        <div className="mt-16 text-center">
          <p className="text-[--color-muted] mb-6">
            Ready to add your project to this portfolio?
          </p>
          <Button asChild>
            <Link href="/booking">
              Book a Consultation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
