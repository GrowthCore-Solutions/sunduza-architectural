"use client";

import * as React from "react";
import { Star } from "lucide-react";
import type { Testimonial } from "@/types/testimonial";

export function TestimonialsClientView({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <section className="py-16 md:py-24 bg-[#f5f0e8]">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#0f172a] mb-4">
            What Our Clients Say
          </h2>
          <p className="text-[#5a5040] max-w-2xl mx-auto">
           Trusted by homeowners, developers, and businesses across South Africa.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-sm p-6 border border-[#e8ddd0] shadow-sm"
            >
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < t.rating ? "text-[#b88b4a] fill-[#b88b4a]" : "text-[#e8ddd0]"}`}
                  />
                ))}
              </div>
              <p className="text-sm text-[#5a5040] leading-relaxed mb-4 italic">&ldquo;{t.review}&rdquo;</p>
              <p className="text-sm font-semibold text-[#0f172a]">— {t.clientName}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
