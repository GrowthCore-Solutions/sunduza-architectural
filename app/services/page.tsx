import Link from "next/link";
import { ArrowRight, Building2, Check, Layers, PenTool, Ruler } from "lucide-react";
import { PageHeader } from "@/frontend/components/features/PageHeader";
import { SERVICES } from "@/frontend/data/services";
import { Button } from "@/frontend/components/ui/button";

const SERVICE_ICONS = [Building2, PenTool, Ruler, Layers] as const;

export const metadata = {
  title: "Services",
  description:
    "Professional architectural services: house planning, drawings, drafting, and development projects.",
};

export default function ServicesPage() {
  return (
    <div className="paper-grain">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 md:py-24">
        <PageHeader
          eyebrow="What we offer"
          title="Architectural services"
          description="End-to-end documentation and planning for residential and development projects across South Africa."
        />

        <div className="space-y-5">
          {SERVICES.map((service, index) => {
            const Icon = SERVICE_ICONS[index];
            const num = String(index + 1).padStart(2, "0");
            return (
              <section
                key={service.id}
                id={service.id}
                className="service-section"
              >
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded bg-paper2 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="font-serif text-5xl font-light text-rule/60 leading-none select-none">
                      {num}
                    </span>
                  </div>
                  <p className="type-eyebrow mb-3">Service {num}</p>
                  <h2 className="font-serif text-3xl font-semibold leading-tight tracking-tight text-ink">
                    {service.title}
                  </h2>
                  <p className="mt-4 max-w-lg text-[0.9375rem] leading-relaxed text-muted">
                    {service.description}
                  </p>
                  <Button className="mt-8" asChild>
                    <Link href={`/booking?service=${service.id}`}>
                      Book this service
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <ul className="grid content-start gap-3 sm:grid-cols-2">
                  {service.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 rounded border border-rule/60 bg-paper/80 p-4 text-sm leading-relaxed text-ink"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
