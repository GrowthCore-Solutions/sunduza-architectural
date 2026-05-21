import Link from "next/link";
import { ArrowRight, Building2, Check, Layers, PenTool, Ruler } from "lucide-react";
import { PageHeader } from "@/src/client/components/features/PageHeader";
import { SERVICES } from "@/src/client/data/services";
import { Button } from "@/src/client/components/ui/button";

const SERVICE_ICONS = [Building2, PenTool, Ruler, Layers] as const;

export const metadata = {
  title: "Services",
  description:
    "Professional architectural services: house planning, drawings, drafting, and development projects.",
};

export default function ServicesPage() {
  return (
    <div className="paper-grain">
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
        <PageHeader
          eyebrow="What we offer"
          title="Architectural services"
          description="End-to-end documentation and planning for residential and development projects across South Africa."
        />

        <div className="space-y-6">
          {SERVICES.map((service, index) => {
            const Icon = SERVICE_ICONS[index];
            return (
              <section
                key={service.id}
                id={service.id}
                className="grid grid-cols-1 gap-8 rounded-md border border-rule/75 bg-white/92 p-6 shadow-soft md:p-8 lg:grid-cols-[0.9fr_1.1fr]"
              >
                <div>
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-paper2 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                    Service {String(index + 1).padStart(2, "0")}
                  </p>
                  <h2 className="font-serif text-3xl font-black leading-tight text-ink">
                    {service.title}
                  </h2>
                  <p className="mt-4 max-w-xl leading-relaxed text-muted">
                    {service.description}
                  </p>
                  <Button className="mt-7" asChild>
                    <Link href={`/booking?service=${service.id}`}>
                      Book consultation
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <ul className="grid content-start gap-3 sm:grid-cols-2">
                  {service.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex min-h-16 items-start gap-3 rounded-md border border-rule/65 bg-paper/70 p-4 text-sm leading-relaxed text-ink"
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
