"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useProject } from "@/src/client/hooks/useProject";
import { Button } from "@/src/client/components/ui/button";
import { Skeleton } from "@/src/client/components/ui/skeleton";

export function ProjectDetailContent({ id }: { id: string }) {
  const { data: project, isLoading, isError } = useProject(id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="aspect-video w-full rounded" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-24 text-center">
        <p className="type-eyebrow mb-4">Not found</p>
        <h1 className="font-serif text-3xl font-semibold text-ink">Project not found</h1>
        <p className="mt-3 text-muted">This project may have been removed or the link is incorrect.</p>
        <Button className="mt-8" asChild>
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4" />
            All projects
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <article className="paper-grain min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-14 md:py-20">
        <Button variant="ghost" size="sm" className="-ml-2 mb-10 text-muted hover:text-ink" asChild>
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4" />
            All projects
          </Link>
        </Button>

        {project.category && (
          <p className="type-eyebrow mb-4">{project.category}</p>
        )}

        <h1 className="max-w-3xl font-serif text-4xl font-semibold tracking-tight text-ink md:text-6xl leading-tight">
          {project.title}
        </h1>

        <div className="relative mt-10 aspect-video overflow-hidden rounded bg-paper2 shadow-soft">
          <Image
            src={project.imagePath || "/images/hero/hero-fallback.png"}
            alt={project.title}
            fill
            sizes="(min-width: 1024px) 960px, 100vw"
            className="object-cover"
            priority
          />
        </div>

        <div className="mt-12 max-w-2xl">
          <p className="font-serif text-xl leading-relaxed text-ink whitespace-pre-line">
            {project.description}
          </p>
        </div>

        <div className="mt-12 flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/booking">
              Start a similar project
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4" />
              Back to portfolio
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
