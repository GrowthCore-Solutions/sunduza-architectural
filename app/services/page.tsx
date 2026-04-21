import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const SERVICES = [
  {
    title: "House Planning",
    description: "Comprehensive house plans designed to pass council submissions first time. We handle site analysis, floor plans, elevations, and section drawings — all compliant with South African National Standards.",
    features: ["Site analysis", "Floor plans", "Elevations & sections", "Council submission docs"],
  },
  {
    title: "Architectural Drawings",
    description: "Detailed architectural drawings with precise dimensioning, material specifications, and annotated details that contractors can build from directly.",
    features: ["Precise dimensioning", "Material schedules", "Construction details", "Revision management"],
  },
  {
    title: "Drafting Services",
    description: "Accurate documentation for residential and commercial projects — from initial concept sketches to full working drawings.",
    features: ["CAD drafting", "As-built drawings", "Town planning support", "Compliance documentation"],
  },
  {
    title: "Development Projects",
    description: "Full architectural documentation for multi-unit residential, townhouse complexes, and commercial developments.",
    features: ["Multi-unit layouts", "Bulk & coverage analysis", "SANS compliance", "Landscape integration"],
  },
];

export const metadata = {
  title: "Services",
  description: "Professional architectural services: house planning, drawings, drafting, and development projects.",
};

export default function ServicesPage() {
  return (
    <div className="bg-[#faf8f2]">
      {/* Header */}
      <section className="bg-[#0f172a] py-24 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#b88b4a] mb-3">What We Offer</p>
        <h1 className="font-serif text-5xl font-black text-white">Our Services</h1>
      </section>

      {/* Services list */}
      <section className="mx-auto max-w-5xl px-4 py-24 space-y-16">
        {SERVICES.map((svc, i) => (
          <div key={svc.title} className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div className={i % 2 === 1 ? "md:order-2" : ""}>
              <p className="text-xs font-medium uppercase tracking-widest text-[#b88b4a] mb-3">
                Service {String(i + 1).padStart(2, "0")}
              </p>
              <h2 className="font-serif text-3xl font-bold text-[#0f172a] mb-4">{svc.title}</h2>
              <p className="text-[#5a5040] leading-relaxed mb-6">{svc.description}</p>
              <ul className="space-y-2">
                {svc.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-[#0f172a]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#b88b4a] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href="/booking">
                  <Button>
                    Book This Service
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className={`bg-[#f5f0e8] rounded-sm aspect-square flex items-center justify-center ${i % 2 === 1 ? "md:order-1" : ""}`}>
              <span className="font-serif text-6xl font-black text-[#e8ddd0]">0{i + 1}</span>
            </div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="bg-[#b88b4a] py-16 text-center">
        <h2 className="font-serif text-3xl font-bold text-white mb-4">Not Sure Which Service You Need?</h2>
        <p className="text-white/80 mb-8">Book a consultation and we will recommend the right approach.</p>
        <Link href="/booking">
          <Button size="lg" className="bg-white text-[#b88b4a] hover:bg-[#f5f0e8]">
            Book a Consultation
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>
    </div>
  );
}
