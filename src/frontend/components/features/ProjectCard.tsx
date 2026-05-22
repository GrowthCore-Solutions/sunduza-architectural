import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ProjectRow } from "@/shared/types/db";

export function ProjectCard({ project }: { project: ProjectRow }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="media-card group"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-paper2">
        <Image
          src={project.imagePath || "/images/hero/hero-fallback.png"}
          alt={project.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04] img-project"
        />
        <div className="project-img-overlay" />
        {project.category && (
          <div className="absolute top-3.5 left-3.5">
            <span className="inline-flex items-center rounded-sm bg-white/90 px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink/80 shadow-sm backdrop-blur-sm">
              {project.category}
            </span>
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-serif text-[1.2rem] font-semibold leading-tight text-ink transition-colors group-hover:text-primary">
          {project.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
          {project.description}
        </p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-primary">
          View project
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
