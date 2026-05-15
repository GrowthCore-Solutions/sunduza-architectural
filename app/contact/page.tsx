import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Mail, MapPin, MessageCircle, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/src/client/components/ui/button";
import { PageHero } from "@/src/client/components/sections/PageHero";
import { ContactForm } from "@/src/client/components/features/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Sunduza Architectural & Projects. Call, WhatsApp, or email us — we respond within 24 hours.",
  openGraph: {
    title: "Contact — Sunduza Architectural & Projects",
    description:
      "Reach us by phone, WhatsApp, or email. We respond within 24 hours.",
  },
};

const CONTACT_METHODS = [
  {
    icon: Phone,
    label: "Phone",
    value: "+27 78 672 3364",
    href: "tel:+27786723364",
    description: "Mon – Fri, 8:00 – 17:00",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "+27 78 672 3364",
    href: "https://wa.me/27786723364?text=Hello%2C%20I'm%20interested%20in%20architectural%20services.",
    description: "Fastest response — typically within 2 hours",
    external: true,
  },
  {
    icon: Mail,
    label: "Email",
    value: "xivutisokevinsunduza@gmail.com",
    href: "mailto:xivutisokevinsunduza@gmail.com",
    description: "Responses within 24 hours",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "South Africa",
    href: null,
    description: "Serving clients nationwide",
  },
];

export default function ContactPage() {
  return (
    <div className="bg-[--color-paper]">
      <PageHero
        label="Get In Touch"
        title="Contact Us"
        description="We respond to every enquiry within 24 hours. WhatsApp is our fastest channel."
      />

      <section className="mx-auto max-w-5xl px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Contact methods */}
          <div>
            <h2 className="font-serif text-2xl font-bold text-[--color-ink] mb-8">
              How to Reach Us
            </h2>

            <ul className="space-y-6">
              {CONTACT_METHODS.map(({ icon: Icon, label, value, href, description, external }) => (
                <li key={label} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-[--color-paper2] text-[--color-primary]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-[--color-muted] mb-0.5">
                      {label}
                    </p>
                    {href ? (
                      <a
                        href={href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noopener noreferrer" : undefined}
                        className="font-medium text-[--color-ink] hover:text-[--color-primary] transition-colors"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="font-medium text-[--color-ink]">{value}</p>
                    )}
                    <p className="text-sm text-[--color-muted] mt-0.5">{description}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Hours */}
            <div className="mt-10 p-6 rounded-sm border border-[--color-rule] bg-white">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-5 w-5 text-[--color-primary]" />
                <h3 className="font-semibold text-[--color-ink]">Office Hours</h3>
              </div>
              <ul className="space-y-2 text-sm">
                {[
                  { day: "Monday – Friday", hours: "08:00 – 17:00" },
                  { day: "Saturday", hours: "09:00 – 13:00 (by appointment)" },
                  { day: "Sunday", hours: "Closed" },
                ].map(({ day, hours }) => (
                  <li
                    key={day}
                    className="flex items-center justify-between border-b border-[--color-rule] pb-2 last:border-0 last:pb-0"
                  >
                    <span className="text-[--color-muted]">{day}</span>
                    <span className="font-medium text-[--color-ink]">{hours}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Booking prompt */}
          <div>
            <h2 className="font-serif text-2xl font-bold text-[--color-ink] mb-4">
              Ready to Start Your Project?
            </h2>
            <p className="text-[--color-muted] leading-relaxed mb-8">
              The fastest way to get started is to book a consultation. Tell us about
              your project — we will respond within 24 hours with a plan of action.
            </p>

            {/* What to expect */}
            <div className="space-y-4 mb-10">
              {[
                {
                  step: "01",
                  title: "Submit your project brief",
                  detail:
                    "Fill in the booking form — service, location, description, and your preferred meeting date.",
                },
                {
                  step: "02",
                  title: "We review and confirm",
                  detail:
                    "We review your brief and contact you within 24 hours to confirm the consultation.",
                },
                {
                  step: "03",
                  title: "Consultation & scoping",
                  detail:
                    "We discuss your requirements, scope the work, and provide a clear quote.",
                },
                {
                  step: "04",
                  title: "Drawings delivered",
                  detail:
                    "Professional, council-ready drawings delivered on time, every time.",
                },
              ].map(({ step, title, detail }) => (
                <div key={step} className="flex gap-4">
                  <div className="font-serif text-2xl font-black text-[--color-rule] shrink-0 w-10">
                    {step}
                  </div>
                  <div>
                    <p className="font-semibold text-[--color-ink] text-sm">{title}</p>
                    <p className="text-sm text-[--color-muted] mt-0.5 leading-relaxed">
                      {detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/booking">
                Book a Consultation
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Live contact form */}
          <div>
            <h2 className="font-serif text-2xl font-bold text-[--color-ink] mb-6">
              Send Us a Message
            </h2>
            <p className="text-[--color-muted] text-sm mb-6 leading-relaxed">
              Prefer to type? Leave us a message and we will respond within 24 hours.
            </p>
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
