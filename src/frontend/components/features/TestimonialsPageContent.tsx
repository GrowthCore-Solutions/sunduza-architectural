"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, MessageCircle, Star } from "lucide-react";
import { useTestimonials } from "@/frontend/hooks/useTestimonials";
import { Button } from "@/frontend/components/ui/button";
import type { TestimonialRow } from "@/shared/types/db";

function yearOf(t: TestimonialRow): string {
  try { return String(new Date(t.createdAt).getFullYear()); }
  catch { return "—"; }
}

function initials(name: string): string {
  return name.split(" ").map((w) => w[0] ?? "").slice(0, 2).join("").toUpperCase();
}

function avg(nums: number[]): string {
  if (!nums.length) return "—";
  return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1);
}

function Stars({ rating, size = 15 }: { rating: number; size?: number }) {
  return (
    <div className="testimonial-card-stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          strokeWidth={1.75}
          className={i < rating ? "testimonial-card-star" : "testimonial-card-star--empty"}
          fill={i < rating ? "currentColor" : "none"}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function RatingBars({ testimonials }: { testimonials: TestimonialRow[] }) {
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: testimonials.filter((t) => t.rating === star).length,
  }));
  const max = Math.max(...counts.map((c) => c.count), 1);
  return (
    <div className="testimonials-rating-bars" aria-label="Rating distribution">
      {counts.map(({ star, count }) => (
        <div key={star} className="testimonials-rating-bar-row">
          <span className="testimonials-rating-bar-label">{star}</span>
          <Star
            size={11}
            fill="currentColor"
            style={{ color: "var(--color-primary)", flexShrink: 0, opacity: 0.7 }}
            aria-hidden="true"
          />
          <div className="testimonials-rating-bar-track">
            <div
              className="testimonials-rating-bar-fill"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
          <span className="testimonials-rating-bar-count">{count}</span>
        </div>
      ))}
    </div>
  );
}

export function TestimonialsPageContent() {
  const { data: testimonials, isLoading, isError } = useTestimonials();

  // Stable reference for downstream useMemo deps — `testimonials ?? []` would
  // allocate a fresh array literal every render and invalidate every memo.
  const all = React.useMemo(() => testimonials ?? [], [testimonials]);
  const ratings = all.map((t) => t.rating).filter(Boolean) as number[];
  const fiveStarCount = ratings.filter((r) => r === 5).length;

  const featured = React.useMemo(
    () => all.find((t) => t.rating === 5) ?? all[0] ?? null,
    [all]
  );
  const rest = React.useMemo(
    () => (featured ? all.filter((t) => t.id !== featured.id) : all),
    [all, featured]
  );

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="testimonials-hero" aria-label="Client reviews overview">
        <div className="testimonials-hero-inner">
          <div className="testimonials-hero-grid">
            <div>
              <p className="type-eyebrow">Client reviews</p>
              <h1 className="testimonials-hero-title">
                The words<br />
                <em>of our clients</em>
              </h1>
              <p className="testimonials-hero-sub">
                Every project leaves a trace — in the drawings we deliver, the approvals we secure,
                and the way our clients feel when the work is done. Here&rsquo;s what they say.
              </p>
            </div>

            <aside className="testimonials-trust-panel" aria-label="Rating summary">
              <div className="testimonials-trust-panel-row">
                {[
                  { value: isLoading ? "—" : avg(ratings), sub: "/ 5", label: "Avg rating" },
                  { value: isLoading ? "—" : String(all.length), sub: "", label: "Reviews" },
                  { value: isLoading ? "—" : String(fiveStarCount), sub: "★", label: "5-star" },
                ].map((s) => (
                  <div key={s.label} className="testimonials-trust-stat">
                    <span className="testimonials-trust-stat-value">
                      {s.value}
                      {s.sub && <sub>{s.sub}</sub>}
                    </span>
                    <span className="testimonials-trust-stat-label">{s.label}</span>
                  </div>
                ))}
              </div>

              {!isLoading && ratings.length > 0 && <RatingBars testimonials={all} />}

              {isLoading && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {[80, 55, 35, 15, 8].map((w, i) => (
                    <div
                      key={i}
                      className="portfolio-skeleton rounded"
                      style={{ height: "0.375rem", width: `${w}%` }}
                    />
                  ))}
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>

      {/* ── Featured hero quote ───────────────────────────────────────── */}
      {!isLoading && featured && (
        <section className="testimonials-featured" aria-label="Featured review">
          <div className="testimonials-featured-inner">
            <span className="testimonials-featured-mark" aria-hidden="true">&ldquo;</span>
            <blockquote>
              <p className="testimonials-featured-quote">{featured.review}</p>
              <footer className="testimonials-featured-client">
                <div className="testimonials-featured-avatar" aria-hidden="true">
                  {initials(featured.clientName)}
                </div>
                <div>
                  <p className="testimonials-featured-name">{featured.clientName}</p>
                  <p className="testimonials-featured-meta">
                    {featured.rating ? `${featured.rating}/5 · ` : ""}
                    {yearOf(featured)}
                  </p>
                </div>
                {featured.rating && (
                  <div style={{ marginLeft: "auto" }}>
                    <Stars rating={featured.rating} size={16} />
                  </div>
                )}
              </footer>
            </blockquote>
          </div>
        </section>
      )}

      {/* ── Masonry wall ─────────────────────────────────────────────── */}
      <section className="testimonials-wall" aria-label="All client reviews">
        <div className="testimonials-wall-inner">
          <div className="testimonials-wall-header">
            <h2 className="testimonials-wall-title">
              All{all.length > 0 ? ` ${all.length}` : ""}{" "}
              <em>reviews</em>
            </h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/booking">
                Join them <ArrowRight size={13} />
              </Link>
            </Button>
          </div>

          {isLoading && (
            <div className="testimonials-masonry">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="portfolio-skeleton testimonial-card"
                  style={{
                    height: i % 3 === 0 ? "14rem" : i % 2 === 0 ? "10rem" : "12rem",
                    border: "none",
                  }}
                />
              ))}
            </div>
          )}

          {isError && !isLoading && (
            <div className="testimonials-empty" role="alert">
              <div className="portfolio-empty-icon">
                <MessageCircle size={22} strokeWidth={1.75} />
              </div>
              <p className="testimonials-empty-title">Unable to load reviews</p>
              <p className="testimonials-empty-body">
                Please refresh the page to try again.
              </p>
            </div>
          )}

          {!isLoading && !isError && all.length === 0 && (
            <div className="testimonials-empty">
              <div className="portfolio-empty-icon">
                <MessageCircle size={22} strokeWidth={1.75} />
              </div>
              <p className="testimonials-empty-title">No reviews yet</p>
              <p className="testimonials-empty-body">
                Be the first — book a consultation and see what we can build together.
              </p>
              <Button asChild variant="default" size="default" className="mt-2">
                <Link href="/booking">Book now <ArrowRight size={14} /></Link>
              </Button>
            </div>
          )}

          {!isLoading && !isError && all.length > 0 && (
            <div className="testimonials-masonry">
              {featured && (
                <article className="testimonial-card testimonial-card--top">
                  {featured.rating && <Stars rating={featured.rating} />}
                  <span className="testimonial-card-openmark" aria-hidden="true">&ldquo;</span>
                  <blockquote>
                    <p className="testimonial-card-quote">{featured.review}</p>
                  </blockquote>
                  <div className="testimonial-card-foot">
                    <div className="testimonial-avatar" aria-hidden="true">
                      {initials(featured.clientName)}
                    </div>
                    <div>
                      <p className="testimonial-card-name">{featured.clientName}</p>
                      <p className="testimonial-card-year">{yearOf(featured)}</p>
                    </div>
                  </div>
                </article>
              )}

              {rest.map((t) => (
                <article key={t.id} className="testimonial-card">
                  {t.rating && <Stars rating={t.rating} />}
                  <span className="testimonial-card-openmark" aria-hidden="true">&ldquo;</span>
                  <blockquote>
                    <p className="testimonial-card-quote">{t.review}</p>
                  </blockquote>
                  <div className="testimonial-card-foot">
                    <div className="testimonial-avatar" aria-hidden="true">
                      {initials(t.clientName)}
                    </div>
                    <div>
                      <p className="testimonial-card-name">{t.clientName}</p>
                      <p className="testimonial-card-year">{yearOf(t)}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Closing CTA ───────────────────────────────────────────────── */}
      <section className="portfolio-cta-band" aria-label="Work with us">
        <div className="portfolio-cta-inner">
          <div className="portfolio-cta-text">
            <h2>
              Ready to add your<br />
              <em>own story?</em>
            </h2>
            <p>
              Join the clients who trusted us with their homes, offices, and developments. Your
              project deserves the same dedication — let&rsquo;s start with a conversation.
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
    </>
  );
}
