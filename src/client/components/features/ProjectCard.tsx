import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ProjectRow } from "@/types/db";
import { Badge } from "@/src/client/components/ui/badge";

export function ProjectCard({ project }: { project: ProjectRow }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group block overflow-hidden rounded-md border border-rule/75 bg-white shadow-soft transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-paper2">
        <Image
          src={project.imagePath || "/images/hero/hero-fallback.png"}
          alt={project.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/48 via-ink/8 to-transparent opacity-75 transition-opacity group-hover:opacity-90" />
      </div>
      <div className="p-5">
        {project.category && (
          <Badge variant="secondary" className="mb-3">
            {project.category}
          </Badge>
        )}
        <h3 className="font-serif text-xl font-bold leading-tight text-ink transition-colors group-hover:text-primary">
          {project.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
          {project.description}
        </p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
          View project
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
