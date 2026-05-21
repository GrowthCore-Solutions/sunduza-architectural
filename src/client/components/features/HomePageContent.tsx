"use client";

import Link from "next/link";
import { ArrowRight, Building2, PenTool, Ruler, Layers } from "lucide-react";
import { Button } from "@/src/client/components/ui/button";
import { Skeleton } from "@/src/client/components/ui/skeleton";
import { useProjects } from "@/src/client/hooks/useProjects";
import { ProjectCard } from "@/src/client/components/features/ProjectCard";
import { SERVICES } from "@/src/client/data/services";

const SERVICE_ICONS = [Building2, PenTool, Ruler, Layers] as const;

const STATS = [
  { label: "Projects completed", value: "50+" },
  { label: "Years experience", value: "5+" },
  { label: "Core services", value: "4" },
];

export function HomePageContent() {
  const { data: featured, isLoading, isError } = useProjects({ featured: true });

  return (
    <>
      <section className="relative bg-[--color-ink] text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[--color-ink] via-[--color-ink] to-[#1a2744] opacity-90" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 md:py-32">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-[--color-primary] mb-6">
            Sunduza Architectural & Projects
          </p>
          <h1 className="font-serif text-4xl md:text-6xl font-black max-w-3xl leading-tight">
            Architecture that builds confidence before you build
          </h1>
          <p className="mt-6 text-lg text-white/70 max-w-xl leading-relaxed">
            Professional house planning, architectural drawings, drafting, and development
            projects across South Africa — council-ready documentation from day one.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button size="lg" asChild>
              <Link href="/booking">
                Book a consultation
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
              <Link href="/projects">View our work</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-b border-[--color-rule] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center sm:text-left">
              <p className="font-serif text-3xl font-black text-[--color-primary]">{stat.value}</p>
              <p className="mt-1 text-sm text-[--color-muted]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-[--color-primary] mb-2">
              What we do
            </p>
            <h2 className="font-serif text-3xl font-black text-[--color-ink]">Our services</h2>
          </div>
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link href="/services">All services <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service, i) => {
            const Icon = SERVICE_ICONS[i];
            return (
              <div
                key={service.id}
                className="rounded-sm border border-[--color-rule] bg-white p-6 hover:border-[--color-primary]/40 transition-colors"
              >
                <Icon className="h-8 w-8 text-[--color-primary] mb-4" />
                <h3 className="font-serif text-lg font-bold text-[--color-ink]">{service.title}</h3>
                <p className="mt-2 text-sm text-[--color-muted] line-clamp-3">{service.description}</p>
                <Link
                  href={`/booking?service=${service.id}`}
                  className="mt-4 inline-flex text-sm font-medium text-[--color-primary] hover:underline"
                >
                  Learn more
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-[--color-paper2] py-20">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-[--color-primary] mb-2">
            Portfolio
          </p>
          <h2 className="font-serif text-3xl font-black text-[--color-ink] mb-10">Featured projects</h2>
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-72 w-full rounded-sm" />
              ))}
            </div>
          )}
          {isError && (
            <p className="text-[--color-muted]">Unable to load projects. Please try again later.</p>
          )}
          {featured && featured.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.slice(0, 3).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
          <div className="mt-10">
            <Button variant="outline" asChild>
              <Link href="/projects">View all projects</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-[--color-primary] py-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="font-serif text-3xl font-black text-white">Ready to start your project?</h2>
          <p className="mt-4 text-white/80 max-w-lg mx-auto">
            Book a consultation and we will respond within one business day.
          </p>
          <Button size="lg" variant="secondary" className="mt-8" asChild>
            <Link href="/booking">Book a consultation</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
