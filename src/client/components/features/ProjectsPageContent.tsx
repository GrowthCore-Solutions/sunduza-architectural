"use client";

import * as React from "react";
import { useProjects } from "@/src/client/hooks/useProjects";
import { PageHeader } from "@/src/client/components/features/PageHeader";
import { ProjectCard } from "@/src/client/components/features/ProjectCard";
import { Skeleton } from "@/src/client/components/ui/skeleton";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Residential", "Commercial", "Development"] as const;

export function ProjectsPageContent() {
  const { data: projects, isLoading, isError } = useProjects();
  const [category, setCategory] = React.useState<string>("All");

  const filtered =
    projects?.filter((p) => category === "All" || p.category === category) ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <PageHeader
        eyebrow="Portfolio"
        title="Our projects"
        description="A selection of completed architectural work across residential, commercial, and development projects."
      />

      <div className="mb-8 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              category === cat
                ? "bg-[--color-primary] text-white"
                : "bg-white border border-[--color-rule] text-[--color-ink] hover:border-[--color-primary]"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-sm" />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-[--color-muted]">Unable to load projects. Please refresh the page.</p>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <p className="text-[--color-muted]">No projects in this category yet.</p>
      )}

      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
