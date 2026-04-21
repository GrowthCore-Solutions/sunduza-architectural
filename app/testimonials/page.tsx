import type { Metadata } from "next";
import { db } from "@/lib/db";
import { TestimonialsClientView } from "@/components/features/testimonials-grid";

export const metadata: Metadata = {
  title: "Testimonials",
  description: "What our clients say about Sunduza Architectural.",
};

export default async function TestimonialsPage() {
  const testimonials = await db.testimonial.findMany({
    where: {},
    orderBy: { createdAt: "desc" },
    select: { id: true, clientName: true, review: true, rating: true, createdAt: true },
  });

  return (
    <TestimonialsClientView
      testimonials={testimonials.map((t) => ({ ...t, createdAt: t.createdAt.toISOString() }))}
    />
  );
}
