import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/src/client/components/ui/button";
import { db } from "@/lib/db";

export const revalidate = 300;

// Pre-generate all project detail pages at build time
export async function generateStaticParams() {
  try {
    const projects = await db.project.findMany({
      select: { id: true },
    });
    return projects.map((p) => ({ id: p.id }));
  } catch {
    return [];
  }
}

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = await db.project.findUnique({
    where: { id },
    select: { title: true, description: true },
  });

  if (!project) return { title: "Project Not Found" };

  return {
    title: project.title,
    description: project.description.slice(0, 160),
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;

  const project = await db.project.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      imagePath: true,
      category: true,
      createdAt: true,
    },
  });

  if (!project) notFound();

  return (
    <div className="bg-[--color-paper]">
      <div className="mx-auto max-w-4xl px-4 py-16 md:py-24">

        {/* Back */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-[--color-muted] hover:text-[--color-primary] mb-10 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All Projects
        </Link>

        {/* Category + title */}
        {project.category && (
          <span className="text-xs font-semibold uppercase tracking-widest text-[--color-primary] mb-3 block">
            {project.category}
          </span>
        )}
        <h1 className="font-serif text-4xl md:text-5xl font-black text-[--color-ink] mb-8 leading-tight">
          {project.title}
        </h1>

        {/* Image */}
        <div className="aspect-video relative rounded-sm overflow-hidden bg-[--color-paper2] mb-10 shadow-sm">
          <Image
            src={project.imagePath}
            alt={project.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 896px"
            priority
          />
        </div>

        {/* Description */}
        <p className="text-[--color-muted] text-lg leading-relaxed mb-12">
          {project.description}
        </p>

        {/* CTA */}
        <div className="border-t border-[--color-rule] pt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="font-serif text-xl font-bold text-[--color-ink]">
              Interested in a similar project?
            </p>
            <p className="text-sm text-[--color-muted] mt-1">
              Book a consultation and we will scope the drawings you need.
            </p>
          </div>
          <Button asChild className="shrink-0">
            <Link href="/booking">
              Book Consultation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
