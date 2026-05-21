"use client";

import { useTestimonials } from "@/src/client/hooks/useTestimonials";
import { PageHeader } from "@/src/client/components/features/PageHeader";
import { StarRating } from "@/src/client/components/features/StarRating";
import { Skeleton } from "@/src/client/components/ui/skeleton";
import { Card, CardContent } from "@/src/client/components/ui/card";

export function TestimonialsPageContent() {
  const { data: testimonials, isLoading, isError } = useTestimonials();

  return (
    <div className="paper-grain">
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
        <PageHeader
          eyebrow="Client reviews"
          title="What our clients say"
          description="Real feedback from homeowners and developers who have worked with Sunduza Architectural."
        />

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-muted">Unable to load testimonials. Please try again later.</p>
      )}

      {testimonials && testimonials.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t) => (
            <Card key={t.id} className="border-rule/75">
              <CardContent className="p-6">
                {t.rating && <StarRating rating={t.rating} className="mb-4" />}
                <p className="text-ink leading-relaxed">&ldquo;{t.review}&rdquo;</p>
                <p className="mt-4 text-sm font-medium text-primary">— {t.clientName}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
