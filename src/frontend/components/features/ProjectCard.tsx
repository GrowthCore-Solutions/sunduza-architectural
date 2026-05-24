import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ProjectRow } from "@/shared/types/db";

export function ProjectCard({ project }: { project: ProjectRow }) {
  const year = (() => {
    try {
      return new Date(project.createdAt).getFullYear();
    } catch {
      return null;
    }
  })();

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
          className="object-cover transition-transform duration-700 group-hover:scale-[1.06] img-project"
        />
        <div className="project-img-overlay" />

        {project.category && (
          <div className="absolute top-3.5 left-3.5">
            <span className="inline-flex items-center rounded-sm bg-white/90 px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink/80 shadow-sm backdrop-blur-sm">
              {project.category}
            </span>
          </div>
        )}

        {/* Year — appears bottom-right on hover */}
        {year && (
          <div className="absolute bottom-3.5 right-3.5 translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="inline-flex items-center rounded-sm bg-ink/85 px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
              {year}
            </span>
          </div>
        )}

        {/* Gold corner accent — bottom-left, reveals on hover */}
        <div className="pointer-events-none absolute bottom-0 left-0 h-10 w-10 border-b-2 border-l-2 border-primary opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
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
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
