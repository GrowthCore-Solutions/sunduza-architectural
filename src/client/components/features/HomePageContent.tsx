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
import { useTestimonials } from "@/src/client/hooks/useTestimonials";
import { ProjectCard } from "@/src/client/components/features/ProjectCard";
import { StarRating } from "@/src/client/components/features/StarRating";
import { SERVICES } from "@/src/client/data/services";

const SERVICE_ICONS = [Building2, PenTool, Ruler, Layers] as const;

const STATS = [
  { label: "Projects completed", value: "50+", detail: "Residential & commercial" },
  { label: "Years of practice", value: "5+", detail: "Industry expertise" },
  { label: "Core services", value: "4", detail: "End-to-end delivery" },
];

const TRUST_POINTS = [
  { label: "Council-ready documentation", icon: ShieldCheck },
  { label: "Residential & development work", icon: Building2 },
  { label: "Serving South Africa", icon: MapPin },
];

export function HomePageContent() {
  const { data: featured, isLoading: projectsLoading, isError: projectsError } = useProjects({ featured: true });
  const { data: testimonials, isLoading: testimonialsLoading } = useTestimonials();

  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────────────────── */}
      <section className="hero-band">
        <Image
          src="/images/hero/hero-desktop.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="hero-band-media"
          aria-hidden="true"
        />
        <div className="hero-overlay" />
        <div className="hero-grid architectural-grid" />

        <div className="hero-inner">
          <div className="max-w-[52rem]">
            <p className="type-eyebrow-hero mb-6">
              Plans, drawings &amp; project support
            </p>
            <h1 className="font-serif text-5xl font-semibold leading-[1.0] tracking-[-0.025em] text-white sm:text-6xl md:text-[5.5rem]">
              Sunduza<br />
              <span className="font-light italic text-white/90">Architectural</span><br />
              <span className="font-semibold">&amp; Projects</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 md:mt-8 md:text-lg">
              House plans, architectural drawings, drafting, and development
              planning prepared with the clarity your builder, municipality,
              and project team need from day one.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row md:mt-10">
              <Button size="lg" asChild>
                <Link href="/booking">
                  Book a consultation
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/25 bg-white/8 text-white hover:bg-white/15 hover:border-white/40 hover:text-white"
                asChild
              >
                <Link href="/projects">View our work</Link>
              </Button>
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-6 md:mt-12">
              {TRUST_POINTS.map(({ label, icon: Icon }) => (
                <div key={label} className="flex items-center gap-2 text-[0.8125rem] text-white/65">
                  <Icon className="h-4 w-4 shrink-0 text-primary" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1.5 text-white/30">
          <div className="h-8 w-px bg-gradient-to-b from-transparent to-white/30" />
          <span className="text-[0.6rem] uppercase tracking-[0.22em]">Scroll</span>
        </div>
      </section>

      {/* ─── Stats strip ──────────────────────────────────────────────── */}
      <section className="stats-strip">
        <div className="stats-strip-inner">
          {STATS.map((stat) => (
            <div key={stat.label} className="stats-cell">
              <p className="font-serif text-[3.25rem] font-semibold leading-none tracking-[-0.03em] text-ink">
                {stat.value}
              </p>
              <p className="mt-2 text-sm font-medium text-ink">{stat.label}</p>
              <p className="mt-0.5 text-xs text-muted">{stat.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Services ─────────────────────────────────────────────────── */}
      <section className="paper-grain py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="section-intro">
            <div className="section-intro-stack">
              <p className="type-eyebrow mb-3">What we do</p>
              <h2 className="font-serif text-4xl font-semibold leading-tight tracking-tight text-ink md:text-5xl">
                Practical architectural<br className="hidden sm:block" />
                <span className="font-light italic"> services for real projects</span>
              </h2>
            </div>
            <Button variant="ghost" asChild className="hidden sm:inline-flex text-sm">
              <Link href="/services">
                All services
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((service, index) => {
              const Icon = SERVICE_ICONS[index];
              const num = String(index + 1).padStart(2, "0");
              return (
                <article
                  key={service.id}
                  className="surface-interactive service-card group"
                >
                  <div className="mb-6 flex items-start justify-between">
                    <div className="service-card-icon">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-serif text-4xl font-light text-rule/70 leading-none select-none">
                      {num}
                    </span>
                  </div>
                  <h3 className="font-serif text-[1.3rem] font-semibold leading-tight text-ink">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {service.description}
                  </p>
                  <Link
                    href={`/booking?service=${service.id}`}
                    className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[0.8125rem] font-semibold text-primary hover:underline"
                  >
                    Book this service
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </article>
              );
            })}
          </div>

          <div className="mt-6 sm:hidden">
            <Button variant="outline" asChild className="w-full">
              <Link href="/services">
                All services
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Featured projects ─────────────────────────────────────────── */}
      <section className="mist-section py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="section-intro">
            <div className="section-intro-stack">
              <p className="type-eyebrow mb-3">Portfolio</p>
              <h2 className="font-serif text-4xl font-semibold tracking-tight text-ink md:text-5xl">
                Featured projects
              </h2>
            </div>
            <Button variant="outline" asChild className="hidden sm:inline-flex">
              <Link href="/projects">
                View all projects
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-80 w-full rounded" />
              ))}
            </div>
          )}

          {isError && (
            <div className="state-panel">
              Unable to load projects right now. The portfolio section is ready,
              but the database connection needs attention.
            </div>
          )}

          {!isLoading && !isError && featured?.length === 0 && (
            <div className="state-panel">
              Featured projects will appear here once they are marked in the admin
              dashboard.
            </div>
          )}

          {featured && featured.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.slice(0, 3).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}

          <div className="mt-6 sm:hidden">
            <Button variant="outline" asChild className="w-full">
              <Link href="/projects">
                View all projects
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────────────────────────── */}
      <section className="cta-band">
        <div className="cta-band-inner">
          <div className="max-w-2xl">
            <p className="mb-4 flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-[0.22em] text-primary">
              <CheckCircle2 className="h-4 w-4" />
              Project-ready drawings start here
            </p>
            <h2 className="font-serif text-4xl font-light italic leading-tight text-white md:text-5xl">
              Tell us what you want to build.{" "}
              <span className="font-semibold not-italic text-white">
                We will shape the next step.
              </span>
            </h2>
          </div>
          <Button size="lg" variant="secondary" asChild className="shrink-0 bg-primary hover:bg-primary-dark text-white">
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
