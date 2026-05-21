"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Layers,
  MapPin,
  PenTool,
  Ruler,
  ShieldCheck,
} from "lucide-react";
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

const TRUST_POINTS = [
  { label: "Council-ready documentation", icon: ShieldCheck },
  { label: "Residential and development work", icon: Building2 },
  { label: "Serving South Africa", icon: MapPin },
];

export function HomePageContent() {
  const { data: featured, isLoading, isError } = useProjects({ featured: true });

  return (
    <>
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <Image
          src="/images/hero/hero-desktop.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-60"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/82 to-ink/35" />
        <div className="architectural-grid absolute inset-0 opacity-45" />

        <div className="relative mx-auto flex min-h-[calc(100svh-12rem)] max-w-7xl items-center px-4 py-14 md:min-h-[calc(100svh-8rem)] md:py-24">
          <div className="max-w-3xl">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
              Plans, drawings, and project support
            </p>
            <h1 className="font-serif text-4xl font-black leading-[0.98] tracking-tight text-white sm:text-5xl md:text-7xl">
              Sunduza Architectural & Projects
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/80 md:mt-6 md:text-xl">
              House plans, architectural drawings, drafting, and development
              planning prepared with the clarity your builder, municipality, and
              project team need from day one.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row md:mt-9">
              <Button size="lg" asChild>
                <Link href="/booking">
                  Book a consultation
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/35 bg-white/10 text-white hover:bg-white/15"
                asChild
              >
                <Link href="/projects">View our work</Link>
              </Button>
            </div>

            <div className="mt-7 grid max-w-3xl grid-cols-1 gap-2 sm:grid-cols-3 md:mt-10 md:gap-3">
              {TRUST_POINTS.map(({ label, icon: Icon }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-white/80">
                  <Icon className="h-4 w-4 shrink-0 text-primary" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-rule bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-0 px-4 sm:grid-cols-3">
          {STATS.map((stat) => (
            <div key={stat.label} className="border-rule py-8 sm:border-r sm:last:border-r-0">
              <p className="font-serif text-4xl font-black text-ink">{stat.value}</p>
              <p className="mt-1 text-sm font-medium text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="paper-grain">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                What we do
              </p>
              <h2 className="font-serif text-4xl font-black tracking-tight text-ink">
                Practical architectural services for real projects
              </h2>
            </div>
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/services">
                All services
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((service, index) => {
              const Icon = SERVICE_ICONS[index];
              return (
                <article
                  key={service.id}
                  className="group flex min-h-[270px] flex-col rounded-md border border-rule/75 bg-white/95 p-6 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:border-primary/55 hover:shadow-lift"
                >
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-paper2 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-serif text-xl font-bold leading-tight text-ink">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {service.description}
                  </p>
                  <Link
                    href={`/booking?service=${service.id}`}
                    className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-semibold text-primary hover:underline"
                  >
                    Book this service
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-mist py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                Portfolio
              </p>
              <h2 className="font-serif text-4xl font-black tracking-tight text-ink">
                Featured projects
              </h2>
            </div>
            <Button variant="outline" asChild>
              <Link href="/projects">
                View all projects
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-80 w-full" />
              ))}
            </div>
          )}

          {isError && (
            <div className="rounded-md border border-rule bg-white/85 p-6 text-sm text-muted shadow-soft">
              Unable to load projects right now. The portfolio section is ready,
              but the database connection needs attention.
            </div>
          )}

          {!isLoading && !isError && featured?.length === 0 && (
            <div className="rounded-md border border-rule bg-white/85 p-6 text-sm text-muted shadow-soft">
              Featured projects will appear here once they are marked in the admin
              dashboard.
            </div>
          )}

          {featured && featured.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.slice(0, 3).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-primary py-16 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 md:flex-row md:items-center">
          <div>
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/80">
              <CheckCircle2 className="h-4 w-4" />
              Project-ready drawings start with a clear consultation.
            </p>
            <h2 className="max-w-2xl font-serif text-4xl font-black leading-tight text-white">
              Tell us what you want to build. We will help shape the next step.
            </h2>
          </div>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/booking">
              Book a consultation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
