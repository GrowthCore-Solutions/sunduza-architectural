"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useProject } from "@/src/client/hooks/useProject";
import { Button } from "@/src/client/components/ui/button";
import { Badge } from "@/src/client/components/ui/badge";
import { Skeleton } from "@/src/client/components/ui/skeleton";

export function ProjectDetailContent({ id }: { id: string }) {
  const { data: project, isLoading, isError } = useProject(id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full rounded-sm" />
        <Skeleton className="h-6 w-full" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <h1 className="font-serif text-3xl font-black">Project not found</h1>
        <Button className="mt-6" asChild>
          <Link href="/projects"><ArrowLeft className="h-4 w-4" /> All projects</Link>
        </Button>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-5xl px-4 py-16 md:py-20">
      <Button variant="ghost" size="sm" className="mb-8 -ml-2" asChild>
        <Link href="/projects"><ArrowLeft className="h-4 w-4" /> All projects</Link>
      </Button>
      {project.category && <Badge className="mb-4">{project.category}</Badge>}
      <h1 className="max-w-3xl font-serif text-4xl font-black tracking-tight text-ink md:text-6xl">
        {project.title}
      </h1>
      <div className="relative mt-8 aspect-video overflow-hidden rounded-md bg-paper2 shadow-soft">
        <Image
          src={project.imagePath || "/images/hero/hero-fallback.png"}
          alt={project.title}
          fill
          sizes="(min-width: 1024px) 960px, 100vw"
          className="object-cover"
        />
      </div>
      <p className="mt-8 max-w-3xl text-lg leading-relaxed text-ink whitespace-pre-line">
        {project.description}
      </p>
      <Button className="mt-10" asChild>
        <Link href="/booking">Start a similar project</Link>
      </Button>
    </article>
  );
}
