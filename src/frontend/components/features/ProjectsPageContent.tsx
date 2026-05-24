"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Grid3x3, LayoutList, SearchX } from "lucide-react";
import { useProjects } from "@/frontend/hooks/useProjects";
import { Button } from "@/frontend/components/ui/button";
import { cn } from "@/frontend/lib/utils";
import type { ProjectRow } from "@/shared/types/db";

const CATEGORIES = ["All", "Residential", "Commercial", "Development"] as const;
type Category = (typeof CATEGORIES)[number];
type ViewMode = "grid" | "editorial";

const FALLBACK_IMG = "/images/hero/hero-fallback.png";

function yearOf(p: ProjectRow): string {
  try {
    return String(new Date(p.createdAt).getFullYear());
  } catch {
    return "—";
  }
}

function pickHeroSelection(projects: ProjectRow[]): {
  main: ProjectRow | null;
  side: ProjectRow[];
} {
  if (!projects.length) return { main: null, side: [] };
  const featured = projects.filter((p) => p.isFeatured);
  const pool = featured.length > 0 ? featured : projects;
  return {
    main: pool[0] ?? null,
    side: pool.slice(1, 3),
  };
}

export function ProjectsPageContent() {
  const { data: projects, isLoading, isError } = useProjects();
  const [category, setCategory] = React.useState<Category>("All");
  const [view, setView] = React.useState<ViewMode>("grid");

  // Stable reference for downstream useMemo deps — `projects ?? []` would
  // allocate a fresh array literal every render and invalidate every memo.
  const all = React.useMemo(() => projects ?? [], [projects]);
  const filtered = React.useMemo(
    () => (category === "All" ? all : all.filter((p) => p.category === category)),
    [all, category]
  );

  const counts = React.useMemo(() => {
    const map: Record<Category, number> = {
      All: all.length,
      Residential: 0,
      Commercial: 0,
      Development: 0,
    };
    for (const p of all) {
      if (p.category === "Residential") map.Residential++;
      else if (p.category === "Commercial") map.Commercial++;
      else if (p.category === "Development") map.Development++;
    }
    return map;
  }, [all]);

  const featuredCount = React.useMemo(() => all.filter((p) => p.isFeatured).length, [all]);
  const categoryCount = React.useMemo(
    () => new Set(all.map((p) => p.category).filter(Boolean)).size,
    [all]
  );

  const { main: heroMain, side: heroSide } = React.useMemo(
    () => pickHeroSelection(all),
    [all]
  );

  return (
    <>
      {/* Hero */}
      <section className="portfolio-hero" aria-label="Portfolio overview">
        <div className="portfolio-hero-inner">
          <div className="portfolio-hero-grid">
            <div>
              <p className="type-eyebrow">Portfolio</p>
              <h1 className="portfolio-hero-title">
                Spaces<br />
                <em>built to last</em>
              </h1>
              <p className="portfolio-hero-sub">
                A selection of completed architectural work across residential homes, commercial
                buildings, and development projects throughout South Africa — each drawn, detailed,
                and delivered with care.
              </p>

              <div className="portfolio-hero-meta" aria-label="At a glance">
                <div className="portfolio-hero-meta-row">
                  <span className="portfolio-hero-meta-dot" aria-hidden="true" />
                  <span>Residential · Commercial · Development</span>
                </div>
                <div className="portfolio-hero-meta-row">
                  <span className="portfolio-hero-meta-dot" aria-hidden="true" />
                  <span>Council-ready drawings, delivered nationwide</span>
                </div>
              </div>
            </div>

            {/* Mosaic */}
            {heroMain ? (
              <div className="portfolio-hero-mosaic" aria-hidden="true">
                <Link
                  href={`/projects/${heroMain.id}`}
                  className="portfolio-hero-mosaic-tile portfolio-hero-mosaic-tile--main"
                >
                  <Image
                    src={heroMain.imagePath || FALLBACK_IMG}
                    alt={heroMain.title}
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover"
                    priority
                  />
                  <div className="portfolio-hero-mosaic-overlay" />
                  {heroMain.isFeatured && (
                    <span className="portfolio-hero-mosaic-tag">Featured</span>
                  )}
                  <div className="portfolio-hero-mosaic-cap">
                    <p className="portfolio-hero-mosaic-cap-eyebrow">
                      {heroMain.category ?? "Project"} · {yearOf(heroMain)}
                    </p>
                    <p className="portfolio-hero-mosaic-cap-title">{heroMain.title}</p>
                  </div>
                </Link>

                {heroSide.map((p, i) => (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}`}
                    className="portfolio-hero-mosaic-tile"
                  >
                    <Image
                      src={p.imagePath || FALLBACK_IMG}
                      alt={p.title}
                      fill
                      sizes="(min-width: 1024px) 20vw, 50vw"
                      className="object-cover"
                      priority={i === 0}
                    />
                    {p.category && (
                      <span className="portfolio-hero-mosaic-tag">{p.category}</span>
                    )}
                  </Link>
                ))}

                {Array.from({ length: Math.max(0, 2 - heroSide.length) }).map((_, i) => (
                  <div key={`ph-${i}`} className="portfolio-hero-mosaic-tile" aria-hidden="true">
                    <Image
                      src={FALLBACK_IMG}
                      alt=""
                      fill
                      sizes="20vw"
                      className="object-cover opacity-60"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="portfolio-hero-mosaic" aria-hidden="true">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "portfolio-skeleton portfolio-hero-mosaic-tile",
                      i === 0 && "portfolio-hero-mosaic-tile--main"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats ribbon */}
      <section className="portfolio-stats" aria-label="Portfolio metrics">
        <div className="portfolio-stats-inner">
          <div className="portfolio-stat">
            <p className="portfolio-stat-value">
              {all.length || "—"} <span>completed</span>
            </p>
            <p className="portfolio-stat-label">Total projects</p>
          </div>
          <div className="portfolio-stat">
            <p className="portfolio-stat-value">
              {featuredCount || "—"} <span>highlighted</span>
            </p>
            <p className="portfolio-stat-label">Featured work</p>
          </div>
          <div className="portfolio-stat">
            <p className="portfolio-stat-value">
              {categoryCount || "—"} <span>typologies</span>
            </p>
            <p className="portfolio-stat-label">Categories</p>
          </div>
        </div>
      </section>

      {/* Sticky filter + view toolbar */}
      <div className="portfolio-toolbar">
        <div className="portfolio-toolbar-inner">
          <div
            className="portfolio-filter-pills"
            role="tablist"
            aria-label="Filter projects by category"
          >
            {CATEGORIES.map((cat) => {
              const active = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "portfolio-filter-pill",
                    active && "portfolio-filter-pill--active"
                  )}
                >
                  {cat}
                  <span className="portfolio-filter-count">{counts[cat]}</span>
                </button>
              );
            })}
          </div>

          <div
            className="portfolio-view-toggle"
            role="group"
            aria-label="Switch view mode"
          >
            <button
              type="button"
              onClick={() => setView("grid")}
              aria-pressed={view === "grid"}
              className={cn(
                "portfolio-view-btn",
                view === "grid" && "portfolio-view-btn--active"
              )}
            >
              <Grid3x3 size={14} strokeWidth={2} aria-hidden="true" />
              Grid
            </button>
            <button
              type="button"
              onClick={() => setView("editorial")}
              aria-pressed={view === "editorial"}
              className={cn(
                "portfolio-view-btn",
                view === "editorial" && "portfolio-view-btn--active"
              )}
            >
              <LayoutList size={14} strokeWidth={2} aria-hidden="true" />
              Editorial
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <section className="portfolio-body" aria-label="Project listing">
        <div className="portfolio-body-inner">
          {!isLoading && !isError && (
            <div className="portfolio-result-meta" aria-live="polite">
              <strong>{filtered.length}</strong>
              <span>
                {filtered.length === 1 ? "project" : "projects"}
                {category !== "All" && ` in ${category.toLowerCase()}`}
              </span>
            </div>
          )}

          {isLoading && (
            <div className="portfolio-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="portfolio-skeleton" style={{ height: "22rem" }} />
              ))}
            </div>
          )}

          {isError && !isLoading && (
            <div className="portfolio-empty" role="alert">
              <div className="portfolio-empty-icon">
                <SearchX size={22} strokeWidth={1.75} />
              </div>
              <h3 className="portfolio-empty-title">Unable to load projects</h3>
              <p className="portfolio-empty-body">
                Something went wrong on our side. Please refresh the page to try again.
              </p>
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <div className="portfolio-empty">
              <div className="portfolio-empty-icon">
                <SearchX size={22} strokeWidth={1.75} />
              </div>
              <h3 className="portfolio-empty-title">No projects in this category yet</h3>
              <p className="portfolio-empty-body">
                Try switching to a different category, or get in touch — your project could be the
                first.
              </p>
              <Button asChild variant="default" size="default">
                <Link href="/booking">
                  Start a project <ArrowRight size={14} />
                </Link>
              </Button>
            </div>
          )}

          {!isLoading && !isError && filtered.length > 0 && view === "grid" && (
            <div className="portfolio-grid">
              {filtered.map((p) => (
                <Link key={p.id} href={`/projects/${p.id}`} className="portfolio-card">
                  <div className="portfolio-card-media">
                    <Image
                      src={p.imagePath || FALLBACK_IMG}
                      alt={p.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                    <div className="portfolio-card-overlay" />
                    <div className="portfolio-card-chips">
                      {p.category && (
                        <span className="portfolio-card-chip">{p.category}</span>
                      )}
                      {p.isFeatured && (
                        <span className="portfolio-card-chip portfolio-card-chip--featured">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="portfolio-card-body">
                    <div className="portfolio-card-meta">
                      <span>{yearOf(p)}</span>
                      <span className="portfolio-card-meta-dot" aria-hidden="true" />
                      <span>{p.category ?? "Project"}</span>
                    </div>
                    <h3 className="portfolio-card-title">{p.title}</h3>
                    <p className="portfolio-card-desc">{p.description}</p>
                    <span className="portfolio-card-cta">
                      View project <ArrowRight size={14} aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!isLoading && !isError && filtered.length > 0 && view === "editorial" && (
            <div className="portfolio-editorial">
              {filtered.map((p, idx) => (
                <article key={p.id} className="portfolio-editorial-row">
                  <Link
                    href={`/projects/${p.id}`}
                    className="portfolio-editorial-media"
                    aria-label={`View ${p.title}`}
                  >
                    <Image
                      src={p.imagePath || FALLBACK_IMG}
                      alt={p.title}
                      fill
                      sizes="(min-width: 768px) 55vw, 100vw"
                      className="object-cover"
                    />
                  </Link>

                  <div className="portfolio-editorial-content">
                    <p className="portfolio-editorial-num" aria-hidden="true">
                      {String(idx + 1).padStart(2, "0")}
                    </p>
                    <div className="portfolio-editorial-meta">
                      <span>{p.category ?? "Project"}</span>
                      <span
                        className="portfolio-editorial-meta-divider"
                        aria-hidden="true"
                      />
                      <span>{yearOf(p)}</span>
                      {p.isFeatured && (
                        <>
                          <span
                            className="portfolio-editorial-meta-divider"
                            aria-hidden="true"
                          />
                          <span style={{ color: "var(--color-primary)" }}>Featured</span>
                        </>
                      )}
                    </div>
                    <h2 className="portfolio-editorial-title">{p.title}</h2>
                    <p className="portfolio-editorial-desc">{p.description}</p>
                    <Link
                      href={`/projects/${p.id}`}
                      className="portfolio-editorial-cta"
                    >
                      View project <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA band */}
      <section className="portfolio-cta-band" aria-label="Start your project">
        <div className="portfolio-cta-inner">
          <div className="portfolio-cta-text">
            <h2>
              Don&rsquo;t see what<br />
              you&rsquo;re <em>looking for?</em>
            </h2>
            <p>
              Every project starts with a brief. Tell us about yours and we&rsquo;ll show you how
              we can bring it to life — from concept through council to completion.
            </p>
          </div>
          <div className="portfolio-cta-actions">
            <Button asChild variant="default" size="lg">
              <Link href="/booking">
                Start a project <ArrowRight size={15} />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">Get in touch</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
