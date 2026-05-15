import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/src/client/components/ui/button";
import { PageHero } from "@/src/client/components/sections/PageHero";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Testimonials",
  description:
    "Real client reviews for Sunduza Architectural & Projects — trusted by homeowners, developers, and businesses across South Africa.",
};

export const revalidate = 300;

export default async function TestimonialsPage() {
  const testimonials = await db.testimonial.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      clientName: true,
      review: true,
      rating: true,
      project: {
        select: { id: true, title: true },
      },
    },
  });

  return (
    <div className="bg-[--color-paper]">
      <PageHero
        label="Client Reviews"
        title="What Our Clients Say"
        description="Trusted by homeowners, property developers, and commercial clients across South Africa."
      />

      <section className="mx-auto max-w-6xl px-4 py-20">
        {testimonials.length === 0 ? (
          <p className="text-center text-[--color-muted] py-20">
            No reviews yet — be the first.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-sm p-6 border border-[--color-rule] shadow-sm flex flex-col"
              >
                {t.rating && (
                  <div
                    className="flex gap-1 mb-4"
                    aria-label={`Rating: ${t.rating} out of 5`}
                  >
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < t.rating!
                            ? "text-[--color-primary] fill-[--color-primary]"
                            : "text-[--color-rule]"
                        }`}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                )}

                <blockquote className="flex-1">
                  <p className="text-sm text-[--color-muted] leading-relaxed italic mb-4">
                    &ldquo;{t.review}&rdquo;
                  </p>
                </blockquote>

                <div className="pt-4 border-t border-[--color-rule]">
                  <p className="text-sm font-semibold text-[--color-ink]">
                    {t.clientName}
                  </p>
                  {t.project && (
                    <Link
                      href={`/projects/${t.project.id}`}
                      className="text-xs text-[--color-primary] hover:underline mt-0.5 block"
                    >
                      Re: {t.project.title}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-20 text-center bg-[--color-paper2] rounded-sm p-12">
          <h2 className="font-serif text-2xl font-bold text-[--color-ink] mb-3">
            Ready to be our next success story?
          </h2>
          <p className="text-[--color-muted] mb-8 max-w-md mx-auto">
            Book a consultation and experience the professional difference.
          </p>
          <Button asChild>
            <Link href="/booking">
              Book a Consultation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
