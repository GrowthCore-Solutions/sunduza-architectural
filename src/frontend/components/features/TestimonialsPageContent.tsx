"use client";

import { useTestimonials } from "@/frontend/hooks/useTestimonials";
import { PageHeader } from "@/frontend/components/features/PageHeader";
import { StarRating } from "@/frontend/components/features/StarRating";
import { Skeleton } from "@/frontend/components/ui/skeleton";

export function TestimonialsPageContent() {
  const { data: testimonials, isLoading, isError } = useTestimonials();

  return (
    <div className="paper-grain">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 md:py-24">
        <PageHeader
          eyebrow="Client reviews"
          title="What our clients say"
          description="Real feedback from homeowners and developers who have worked with Sunduza Architectural."
        />

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-52 w-full rounded" />
            ))}
          </div>
        )}

        {isError && (
          <div className="state-panel">Unable to load testimonials. Please try again later.</div>
        )}

        {testimonials && testimonials.length === 0 && !isLoading && (
          <div className="state-panel">No testimonials yet. Check back soon.</div>
        )}

        {testimonials && testimonials.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {testimonials.map((t) => (
              <div key={t.id} className="quote-card">
                {t.rating && <StarRating rating={t.rating} className="mb-4" />}
                <p className="text-[1.0625rem] font-serif leading-relaxed text-ink">
                  &ldquo;{t.review}&rdquo;
                </p>
                <div className="mt-5 flex items-center gap-3 border-t border-rule/50 pt-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-[0.7rem] font-bold uppercase tracking-wide text-primary">
                    {t.clientName.slice(0, 2)}
                  </div>
                  <p className="text-sm font-semibold text-ink">{t.clientName}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
