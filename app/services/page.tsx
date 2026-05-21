import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { PageHeader } from "@/src/client/components/features/PageHeader";
import { SERVICES } from "@/src/client/data/services";
import { Button } from "@/src/client/components/ui/button";

export const metadata = {
  title: "Services",
  description:
    "Professional architectural services: house planning, drawings, drafting, and development projects.",
};

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <PageHeader
        eyebrow="What we offer"
        title="Architectural services"
        description="End-to-end documentation and planning for residential and development projects across South Africa."
      />
      <div className="space-y-16">
        {SERVICES.map((service) => (
          <section
            key={service.id}
            id={service.id}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start border-b border-[--color-rule] pb-16 last:border-0"
          >
            <div>
              <h2 className="font-serif text-2xl font-black text-[--color-ink]">{service.title}</h2>
              <p className="mt-4 text-[--color-muted] leading-relaxed">{service.description}</p>
              <Button className="mt-6" asChild>
                <Link href={`/booking?service=${service.id}`}>
                  Book consultation <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <ul className="space-y-3">
              {service.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-[--color-ink]">
                  <Check className="h-4 w-4 text-[--color-primary] shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
