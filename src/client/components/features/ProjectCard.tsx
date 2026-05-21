import Link from "next/link";
import type { ProjectRow } from "@/types/db";
import { Badge } from "@/src/client/components/ui/badge";

export function ProjectCard({ project }: { project: ProjectRow }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group block overflow-hidden rounded-sm border border-[--color-rule] bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-[--color-paper2] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.imagePath}
          alt={project.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[--color-ink]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="p-5">
        {project.category && (
          <Badge variant="secondary" className="mb-2">
            {project.category}
          </Badge>
        )}
        <h3 className="font-serif text-lg font-bold text-[--color-ink] group-hover:text-[--color-primary] transition-colors">
          {project.title}
        </h3>
        <p className="mt-2 text-sm text-[--color-muted] line-clamp-2">
          {project.description}
        </p>
      </div>
    </Link>
  );
}
