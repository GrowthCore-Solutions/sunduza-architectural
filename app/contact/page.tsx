import { PageHeader } from "@/src/client/components/features/PageHeader";
import { ContactForm } from "@/src/client/components/features/ContactForm";
import { Mail, Phone, MapPin } from "lucide-react";

export const metadata = {
  title: "Contact",
  description: "Get in touch with Sunduza Architectural & Projects.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <PageHeader
        eyebrow="Get in touch"
        title="Contact us"
        description="Have a question about your project? Send us a message and we will respond within 24 hours."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <ContactForm />
        </div>
        <aside className="space-y-6 text-sm">
          <div className="flex gap-3">
            <Phone className="h-5 w-5 text-[--color-primary] shrink-0" />
            <div>
              <p className="font-medium text-[--color-ink]">Phone</p>
              <a href="tel:+27786723364" className="text-[--color-muted] hover:text-[--color-primary]">
                +27 78 672 3364
              </a>
            </div>
          </div>
          <div className="flex gap-3">
            <Mail className="h-5 w-5 text-[--color-primary] shrink-0" />
            <div>
              <p className="font-medium text-[--color-ink]">Email</p>
              <a
                href="mailto:xivutisokevinsunduza@gmail.com"
                className="text-[--color-muted] hover:text-[--color-primary] break-all"
              >
                xivutisokevinsunduza@gmail.com
              </a>
            </div>
          </div>
          <div className="flex gap-3">
            <MapPin className="h-5 w-5 text-[--color-primary] shrink-0" />
            <div>
              <p className="font-medium text-[--color-ink]">Location</p>
              <p className="text-[--color-muted]">South Africa</p>
              <p className="text-[--color-muted] mt-1">Mon–Fri, 8am–5pm</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
