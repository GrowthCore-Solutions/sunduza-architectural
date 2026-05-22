"use client";

import * as React from "react";
import { useProjects } from "@/frontend/hooks/useProjects";
import { PageHeader } from "@/frontend/components/features/PageHeader";
import { ProjectCard } from "@/frontend/components/features/ProjectCard";
import { Skeleton } from "@/frontend/components/ui/skeleton";
import { cn } from "@/frontend/lib/utils";

const CATEGORIES = ["All", "Residential", "Commercial", "Development"] as const;

export function ProjectsPageContent() {
  const { data: projects, isLoading, isError } = useProjects();
  const [category, setCategory] = React.useState<string>("All");

  const filtered =
    projects?.filter((p) => category === "All" || p.category === category) ?? [];

  return (
    <div className="paper-grain">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 md:py-24">
        <PageHeader
          eyebrow="Portfolio"
          title="Our projects"
          description="A selection of completed architectural work across residential, commercial, and development projects."
        />

        <div className="tab-rail mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                "tab-rail-item",
                category === cat && "tab-rail-item--active"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-full rounded" />
            ))}
          </div>
        )}

        {isError && (
          <div className="state-panel">Unable to load projects. Please refresh the page.</div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="state-panel">No projects in this category yet.</div>
        )}

        {filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
