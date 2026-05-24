"use client";

import * as React from "react";
import { StarRating } from "@/frontend/components/features/StarRating";
import { cn } from "@/frontend/lib/utils";
import { useDragScroll } from "@/frontend/hooks/useDragScroll";
import type { TestimonialRow } from "@/shared/types/db";

interface Props {
  testimonials: TestimonialRow[];
}

/**
 * Renders testimonials as a scroll-snap carousel on mobile (with dot pagination)
 * and as a static 3-column grid on md+ screens.
 */
export function TestimonialsCarousel({ testimonials }: Props) {
  const { ref: dragRef, isDragging } = useDragScroll<HTMLDivElement>();
  const scrollerRef = dragRef;
  const [active, setActive] = React.useState(0);

  // Track the closest snapped slide
  React.useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const slideWidth = node.clientWidth;
        if (!slideWidth) return;
        const idx = Math.round(node.scrollLeft / slideWidth);
        setActive(Math.min(idx, testimonials.length - 1));
      });
    };
    node.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      node.removeEventListener("scroll", onScroll);
    };
  }, [scrollerRef, testimonials.length]);

  const goTo = (idx: number) => {
    const node = scrollerRef.current;
    if (!node) return;
    node.scrollTo({ left: idx * node.clientWidth, behavior: "smooth" });
  };

  return (
    <>
      {/* Mobile: snap carousel */}
      <div className="md:hidden">
        <div
          ref={scrollerRef}
          className={cn(
            "testimonials-scroller scroll-fade-x",
            isDragging && "testimonials-scroller--dragging"
          )}
        >
          {testimonials.map((t) => (
            <figure key={t.id} className="testimonials-scroller-slide">
              <div className="quote-card-rich">
                {t.rating && <StarRating rating={t.rating} className="mb-4" />}
                <blockquote className="font-serif text-[1.05rem] leading-relaxed text-ink line-clamp-6">
                  &ldquo;{t.review}&rdquo;
                </blockquote>
                <figcaption className="mt-auto flex items-center gap-3 border-t border-rule/50 pt-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[0.65rem] font-bold uppercase tracking-wide text-primary">
                    {t.clientName.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{t.clientName}</p>
                    <p className="text-xs uppercase tracking-[0.14em] text-muted">
                      Verified client
                    </p>
                  </div>
                </figcaption>
              </div>
            </figure>
          ))}
        </div>

        {testimonials.length > 1 && (
          <div className="mt-5 flex items-center justify-center gap-2" role="tablist" aria-label="Testimonial pagination">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                type="button"
                role="tab"
                aria-label={`Go to testimonial ${idx + 1}`}
                aria-selected={idx === active}
                onClick={() => goTo(idx)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  idx === active ? "w-6 bg-primary" : "w-1.5 bg-rule hover:bg-muted"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop: 3-column grid */}
      <div className="hidden md:grid md:grid-cols-3 md:gap-5">
        {testimonials.slice(0, 3).map((t) => (
          <figure key={t.id} className="quote-card-rich">
            {t.rating && <StarRating rating={t.rating} className="mb-4" />}
            <blockquote className="font-serif text-[1.05rem] leading-relaxed text-ink line-clamp-5">
              &ldquo;{t.review}&rdquo;
            </blockquote>
            <figcaption className="mt-auto flex items-center gap-3 border-t border-rule/50 pt-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[0.65rem] font-bold uppercase tracking-wide text-primary">
                {t.clientName.slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">{t.clientName}</p>
                <p className="text-xs uppercase tracking-[0.14em] text-muted">
                  Verified client
                </p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </>
  );
}
