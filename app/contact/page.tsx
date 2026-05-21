import { PageHeader } from "@/src/client/components/features/PageHeader";
import { ContactForm } from "@/src/client/components/features/ContactForm";
import { Mail, Phone, MapPin } from "lucide-react";

export const metadata = {
  title: "Contact",
  description: "Get in touch with Sunduza Architectural & Projects.",
};

export default function ContactPage() {
  return (
    <div className="paper-grain">
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
        <PageHeader
          eyebrow="Get in touch"
          title="Contact us"
          description="Have a question about your project? Send us a message and we will respond within 24 hours."
        />
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="rounded-md border border-rule/75 bg-white/95 p-5 shadow-soft md:p-8 lg:col-span-2">
            <ContactForm />
          </div>
          <aside className="space-y-4 text-sm">
            <div className="rounded-md border border-rule/75 bg-white/86 p-5 shadow-soft">
              <Phone className="mb-3 h-5 w-5 text-primary" />
              <p className="font-semibold text-ink">Phone</p>
              <a href="tel:+27786723364" className="mt-1 block text-muted hover:text-primary">
                +27 78 672 3364
              </a>
            </div>
            <div className="rounded-md border border-rule/75 bg-white/86 p-5 shadow-soft">
              <Mail className="mb-3 h-5 w-5 text-primary" />
              <p className="font-semibold text-ink">Email</p>
              <a
                href="mailto:xivutisokevinsunduza@gmail.com"
                className="mt-1 block break-all text-muted hover:text-primary"
              >
                xivutisokevinsunduza@gmail.com
              </a>
            </div>
            <div className="rounded-md border border-rule/75 bg-white/86 p-5 shadow-soft">
              <MapPin className="mb-3 h-5 w-5 text-primary" />
              <p className="font-semibold text-ink">Location</p>
              <p className="mt-1 text-muted">South Africa</p>
              <p className="mt-1 text-muted">Mon-Fri, 8am-5pm</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
