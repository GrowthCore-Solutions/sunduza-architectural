import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/src/client/components/ui/button";
import { PageHero } from "@/src/client/components/sections/PageHero";
import { SERVICES } from "@/src/shared/constants/services";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Professional architectural services across South Africa: house planning, architectural drawings, drafting services, and development project planning. SANS-compliant documentation.",
};

export default function ServicesPage() {
  return (
    <div className="bg-[--color-paper]">
      <PageHero
        label="What We Offer"
        title="Our Services"
        description="Professional architectural services built for South African standards — from a single house plan to a complete development documentation package."
      />

      {/* Services list */}
      <div className="mx-auto max-w-5xl px-4 py-24 space-y-24">
        {SERVICES.map((svc, i) => {
          const Icon = svc.icon;
          return (
            <div
              key={svc.key}
              id={svc.id}
              className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start scroll-mt-20"
            >
              {/* Content */}
              <div className={i % 2 === 1 ? "md:order-2" : ""}>
                <p className="text-xs font-semibold uppercase tracking-widest text-[--color-primary] mb-3">
                  Service {String(i + 1).padStart(2, "0")}
                </p>
                <h2 className="font-serif text-3xl font-bold text-[--color-ink] mb-4">
                  {svc.title}
                </h2>
                <p className="text-[--color-muted] leading-relaxed mb-6">
                  {svc.description}
                </p>
                <ul className="space-y-2.5 mb-8">
                  {svc.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-[--color-primary] shrink-0 mt-0.5" />
                      <span className="text-[--color-ink]">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild>
                  <Link href="/booking">
                    Book This Service
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {/* Visual */}
              <div
                className={`bg-[--color-paper2] rounded-sm aspect-square flex flex-col items-center justify-center gap-4 ${
                  i % 2 === 1 ? "md:order-1" : ""
                }`}
              >
                <Icon className="h-16 w-16 text-[--color-primary]" strokeWidth={1} />
                <span className="font-serif text-7xl font-black text-[--color-rule]">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <section className="bg-[--color-primary] py-16 text-center">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="font-serif text-3xl font-bold text-white mb-4">
            Not Sure Which Service You Need?
          </h2>
          <p className="text-white/80 mb-8">
            Book a consultation and we will recommend the right approach for your
            project and budget.
          </p>
          <Button
            size="lg"
            className="bg-white text-[--color-primary] hover:bg-[--color-paper2]"
            asChild
          >
            <Link href="/booking">
              Book a Free Consultation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
