import { PageHeader } from "@/frontend/components/features/PageHeader";
import { ContactForm } from "@/frontend/components/features/ContactForm";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

export const metadata = {
  title: "Contact",
  description: "Get in touch with Sunduza Architectural & Projects.",
};

const CONTACT_ITEMS = [
  {
    icon: Phone,
    label: "Phone",
    value: "+27 78 672 3364",
    href: "tel:+27786723364",
  },
  {
    icon: Mail,
    label: "Email",
    value: "xivutisokevinsunduza@gmail.com",
    href: "mailto:xivutisokevinsunduza@gmail.com",
    breakAll: true,
  },
  {
    icon: MapPin,
    label: "Location",
    value: "South Africa",
  },
  {
    icon: Clock,
    label: "Hours",
    value: "Mon–Fri, 8 am – 5 pm",
  },
];

export default function ContactPage() {
  return (
    <div className="paper-grain min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 md:py-24">
        <PageHeader
          eyebrow="Get in touch"
          title="Contact us"
          description="Have a question about your project? Send us a message and we will respond within 24 hours."
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.6fr_1fr]">

          {/* Form */}
          <div className="surface-panel p-6 md:p-8">
            <h2 className="font-serif text-xl font-semibold text-ink mb-6">Send a message</h2>
            <ContactForm />
          </div>

          {/* Contact details */}
          <aside className="space-y-3">
            <h2 className="font-serif text-xl font-semibold text-ink mb-5">Contact details</h2>
            {CONTACT_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="contact-aside-card flex items-start gap-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-primary/8 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted mb-0.5">
                      {item.label}
                    </p>
                    {item.href ? (
                      <a
                        href={item.href}
                        className={`text-sm font-medium text-ink hover:text-primary transition-colors${item.breakAll ? " break-all" : ""}`}
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm font-medium text-ink">{item.value}</p>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="mt-6 rounded border border-rule/60 bg-paper2/60 p-5 text-sm leading-relaxed text-muted">
              For project enquiries, the{" "}
              <a href="/booking" className="font-semibold text-primary hover:underline">
                booking form
              </a>{" "}
              gives us the context we need to respond meaningfully.
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
