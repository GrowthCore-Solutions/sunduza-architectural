"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  title: string;
  description: string;
  imagePath: string;
  category: string | null;
}

interface ProjectsGridProps {
  projects: Project[];
  categories: string[];
}

export function ProjectsGrid({ projects, categories }: ProjectsGridProps) {
  const [active, setActive] = React.useState<string>("All");

  const filtered =
    active === "All" ? projects : projects.filter((p) => p.category === active);

  return (
    <div>
      {/* Category filter tabs */}
      {categories.length > 1 && (
        <div
          className="flex flex-wrap gap-2 mb-10"
          role="tablist"
          aria-label="Filter projects by category"
        >
          {["All", ...categories].map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={active === cat}
              onClick={() => setActive(cat)}
              className={cn(
                "px-4 py-1.5 rounded-sm text-sm font-medium border transition-colors duration-200",
                active === cat
                  ? "bg-[--color-primary] text-white border-[--color-primary]"
                  : "bg-white text-[--color-muted] border-[--color-rule] hover:border-[--color-primary] hover:text-[--color-ink]"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center text-[--color-muted]">
          No projects in this category yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group block rounded-sm overflow-hidden border border-[--color-rule] hover:shadow-lg transition-all duration-300"
              aria-label={`View ${project.title}`}
            >
              <div className="aspect-[4/3] overflow-hidden bg-[--color-paper2] relative">
                <Image
                  src={project.imagePath}
                  alt={project.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="p-5">
                {project.category && (
                  <span className="text-xs font-semibold uppercase tracking-widest text-[--color-primary] mb-2 block">
                    {project.category}
                  </span>
                )}
                <h3 className="font-serif text-lg font-bold text-[--color-ink] mb-2 leading-snug">
                  {project.title}
                </h3>
                <p className="text-sm text-[--color-muted] line-clamp-2">
                  {project.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
