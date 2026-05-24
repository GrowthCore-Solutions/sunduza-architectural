"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { useProject } from "@/frontend/hooks/useProject";
import { useProjects } from "@/frontend/hooks/useProjects";
import { Button } from "@/frontend/components/ui/button";
import { cn } from "@/frontend/lib/utils";
import type { ProjectRow } from "@/shared/types/db";

const FALLBACK_IMG = "/images/hero/hero-fallback.png";

function yearOf(p: ProjectRow): string {
  try { return String(new Date(p.createdAt).getFullYear()); }
  catch { return "—"; }
}

const DELIVERABLES: Record<string, string[]> = {
  Residential: [
    "Site analysis & client brief",
    "Concept & schematic design",
    "Working drawings",
    "Council submission package",
    "Construction documentation",
  ],
  Commercial: [
    "Feasibility & site assessment",
    "Concept design",
    "Town planning drawings",
    "Council submission package",
    "Construction documentation",
  ],
  Development: [
    "Development feasibility study",
    "Bulk services coordination",
    "Town planning application",
    "Civil & structural interface",
    "Council submission package",
  ],
};

const DEFAULT_DELIVERABLES = [
  "Project brief & consultation",
  "Architectural drawings",
  "Council-ready documentation",
  "Construction drawings",
];

function getDeliverables(category?: string | null): string[] {
  if (!category) return DEFAULT_DELIVERABLES;
  return DELIVERABLES[category] ?? DEFAULT_DELIVERABLES;
}

// Project titles follow "Type — Location" convention. Em-dash is the
// canonical separator; fall back to plain hyphen for older entries.
function parseLocationFromTitle(title: string): string | null {
  const idx = title.indexOf(" — ");
  if (idx !== -1) return title.slice(idx + 3).trim() || null;
  const dash = title.lastIndexOf(" - ");
  if (dash !== -1) return title.slice(dash + 3).trim() || null;
  return null;
}

function serviceSlugFor(category?: string | null): string {
  if (category === "Residential") return "house_planning";
  if (category === "Commercial") return "arch_drawings";
  if (category === "Development") return "dev_project_planning";
  return "house_planning";
}

function DetailSkeleton() {
  return (
    <div>
      <div className="w-full bg-paper2" style={{ height: "72vh" }} />
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10 space-y-5">
        {[32, 64, "100%", "80%", "70%"].map((w, i) => (
          <div
            key={i}
            className="portfolio-skeleton rounded"
            style={{ height: i < 2 ? "1.5rem" : "1.25rem", width: w }}
          />
        ))}
      </div>
    </div>
  );
}

function RelatedCard({ project }: { project: ProjectRow }) {
  return (
    <Link href={`/projects/${project.id}`} className="portfolio-card">
      <div className="portfolio-card-media">
        <Image
          src={project.imagePath || FALLBACK_IMG}
          alt={project.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
        <div className="portfolio-card-overlay" />
        {project.category && (
          <div className="portfolio-card-chips">
            <span className="portfolio-card-chip">{project.category}</span>
          </div>
        )}
      </div>
      <div className="portfolio-card-body">
        <div className="portfolio-card-meta">
          <span>{yearOf(project)}</span>
          <span className="portfolio-card-meta-dot" aria-hidden="true" />
          <span>{project.category ?? "Project"}</span>
        </div>
        <h3 className="portfolio-card-title">{project.title}</h3>
        <span className="portfolio-card-cta">
          View project <ArrowRight size={14} aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

export function ProjectDetailContent({ id }: { id: string }) {
  const { data: project, isLoading, isError } = useProject(id);
  const { data: allProjects } = useProjects();

  // Hide the specs bar on scroll-down (saves viewport on mobile)
  const [specsHidden, setSpecsHidden] = React.useState(false);
  const lastYRef = React.useRef(0);
  React.useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 240) setSpecsHidden(false);
      else if (y > lastYRef.current + 8) setSpecsHidden(true);
      else if (y < lastYRef.current - 4) setSpecsHidden(false);
      lastYRef.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const related = (allProjects ?? [])
    .filter((p) => p.id !== id && p.category === project?.category)
    .slice(0, 3);

  if (isLoading) return <DetailSkeleton />;

  if (isError || !project) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="type-eyebrow mb-4">Not found</p>
          <h1 className="font-serif text-4xl font-semibold text-ink mb-4">Project not found</h1>
          <p className="text-muted mb-8 leading-relaxed">
            This project may have been removed or the link is incorrect.
          </p>
          <Button asChild>
            <Link href="/projects">
              <ArrowLeft size={15} /> View all projects
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const deliverables = getDeliverables(project.category);
  const year = yearOf(project);

  return (
    <article>
      {/* ── Cinematic hero ────────────────────────────────────────────── */}
      <div className="project-detail-hero-band">
        <Image
          src={project.imagePath || FALLBACK_IMG}
          alt={project.title}
          fill
          sizes="100vw"
          className="object-cover img-project"
          priority
        />
        <div className="project-detail-img-overlay" />

        <div className="project-detail-caption">
          <div className="project-detail-caption-inner">
            <Link href="/projects" className="project-detail-caption-back">
              <ArrowLeft size={13} aria-hidden="true" />
              All projects
            </Link>

            <div className="project-detail-caption-eyebrow">
              <span>Portfolio</span>
              {project.category && (
                <>
                  <span className="project-detail-caption-eyebrow-divider" aria-hidden="true" />
                  <span>{project.category}</span>
                </>
              )}
              <span className="project-detail-caption-eyebrow-divider" aria-hidden="true" />
              <span>{year}</span>
            </div>

            <h1 className="project-detail-caption-title">{project.title}</h1>

            {project.isFeatured && (
              <span
                className="inline-flex items-center gap-1.5 text-xs font-semibold"
                style={{ color: "var(--color-primary-light)" }}
                aria-label="Featured project"
              >
                <CheckCircle2 size={13} />
                Featured project
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Specs bar ─────────────────────────────────────────────────── */}
      <nav
        className={cn(
          "project-detail-specs",
          specsHidden && "project-detail-specs--hidden"
        )}
        aria-label="Project specifications"
      >
        <div className="project-detail-specs-inner">
          {([
            { label: "Category", value: project.category ?? "Architecture" },
            { label: "Location", value: parseLocationFromTitle(project.title) ?? "Limpopo" },
            { label: "Year completed", value: year },
            { label: "Status", value: "Delivered" },
          ] as const).map((s) => (
            <div key={s.label} className="project-detail-spec">
              <p className="project-detail-spec-label">{s.label}</p>
              <p className="project-detail-spec-value">{s.value}</p>
            </div>
          ))}
        </div>
      </nav>

      {/* ── Body ──────────────────────────────────────────────────────── */}
      <section className="project-detail-body" aria-label="Project description">
        <div className="project-detail-body-inner">
          <div className="project-detail-article">
            <p className="project-detail-article-label">Project overview</p>
            <p className="project-detail-lead">{project.description}</p>
            <div className="project-detail-divider" aria-hidden="true">
              {project.category ?? "Architecture"}
            </div>
            <div className="project-detail-ctas">
              <Button asChild variant="default" size="lg">
                <Link href={`/booking?service=${serviceSlugFor(project.category)}`}>
                  Start a similar project <ArrowRight size={15} />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/projects">
                  <ArrowLeft size={15} /> Back to portfolio
                </Link>
              </Button>
            </div>
          </div>

          <aside className="project-detail-sidebar" aria-label="Project scope">
            <div className="project-detail-sidebar-card">
              <p className="project-detail-sidebar-card-title">What was delivered</p>
              <ul className="project-detail-deliverables">
                {deliverables.map((d) => (
                  <li key={d} className="project-detail-deliverable">
                    <span className="project-detail-deliverable-dot" aria-hidden="true" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>

            <div className="project-detail-cta-card">
              <p className="project-detail-cta-card-title">
                Have a similar<br />project in mind?
              </p>
              <p className="project-detail-cta-card-body">
                We&rsquo;ll guide you from brief to council-ready drawings. No project is too
                small or too ambitious.
              </p>
              <Button asChild variant="default" size="default" className="w-full">
                <Link href="/booking">
                  Book a consultation <ArrowRight size={14} />
                </Link>
              </Button>
            </div>
          </aside>
        </div>
      </section>

      {/* ── Related projects ──────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="project-detail-related" aria-label="More projects like this">
          <div className="project-detail-related-inner">
            <div className="project-detail-related-header">
              <h2 className="project-detail-related-title">
                More <em>{project.category?.toLowerCase() ?? "work"}</em>
              </h2>
              <Button asChild variant="outline" size="sm">
                <Link href="/projects">
                  View all <ArrowRight size={13} />
                </Link>
              </Button>
            </div>
            <div className="project-detail-related-grid">
              {related.map((p) => (
                <RelatedCard key={p.id} project={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Closing CTA ───────────────────────────────────────────────── */}
      <section className="portfolio-cta-band" aria-label="Start your project">
        <div className="portfolio-cta-inner">
          <div className="portfolio-cta-text">
            <h2>
              Inspired by<br />
              <em>what you see?</em>
            </h2>
            <p>
              Every great space starts with a conversation. Tell us about your project and
              we&rsquo;ll bring the same craft and precision to yours.
            </p>
          </div>
          <div className="portfolio-cta-actions">
            <Button asChild variant="default" size="lg">
              <Link href="/booking">
                Start your project <ArrowRight size={15} />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">Get in touch</Link>
            </Button>
          </div>
        </div>
      </section>
    </article>
  );
}
