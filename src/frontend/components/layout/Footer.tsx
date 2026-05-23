import Link from "next/link";
import { ArrowRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import { CONTACT } from "@/shared/constants/contact";

const SERVICES = [
  { label: "House Planning", href: "/services#house_planning" },
  { label: "Architectural Drawings", href: "/services#arch_drawings" },
  { label: "Drafting Services", href: "/services#drafting_services" },
  { label: "Development Project Planning", href: "/services#dev_project_planning" },
];

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy" },
];

export function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="h-[2px] w-full bg-primary" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Editorial top band */}
        <div className="grid grid-cols-1 gap-6 border-b border-white/10 py-14 md:grid-cols-2 md:items-end">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-primary">
              Sunduza Architectural & Projects
            </p>
            <h2 className="mt-4 max-w-xl font-serif text-3xl font-light italic leading-tight text-white md:text-4xl">
              Start with drawings that<br className="hidden sm:block" /> make the build clearer.
            </h2>
          </div>
          <div className="md:text-right">
            <p className="mb-4 text-sm text-white/50">
              Ready to begin your project?
            </p>
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 rounded bg-primary px-5 h-11 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-primary-dark"
            >
              Book Consultation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-10 py-12 md:grid-cols-[1.6fr_1fr_1fr_1.2fr]">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded bg-white text-[0.65rem] font-black tracking-[0.18em] text-ink">
                SA
              </span>
              <div>
                <p className="font-serif text-xl font-semibold text-white">Sunduza</p>
                <p className="text-[0.6rem] font-medium uppercase tracking-[0.2em] text-white/40">
                  Architectural & Projects
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/55">
              Professional house planning, architectural drawings, drafting, and
              development project support across South Africa.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-white/35">
              Services
            </h3>
            <ul className="space-y-2.5">
              {SERVICES.map((s) => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    className="text-sm text-white/60 transition-colors hover:text-primary"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-white/35">
              Company
            </h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-white/60 transition-colors hover:text-primary"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-white/35">
              Contact
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <a href={`tel:${CONTACT.PHONE_E164}`} className="text-white/60 transition-colors hover:text-primary">
                  {CONTACT.PHONE_DISPLAY}
                </a>
              </li>
              <li className="flex gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <a
                  href={`mailto:${CONTACT.EMAIL}`}
                  className="break-all text-white/60 transition-colors hover:text-primary"
                >
                  {CONTACT.EMAIL}
                </a>
              </li>
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-white/60">{CONTACT.LOCATION}</span>
              </li>
              <li className="flex gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-white/60">{CONTACT.HOURS}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-start justify-between gap-3 border-t border-white/8 py-6 text-xs text-white/35 md:flex-row md:items-center">
          <p>
            &copy; {new Date().getFullYear()} Sunduza Architectural & Projects (Pty) Ltd.
            All rights reserved.
          </p>
          <p>Design & Build by KSDRILL SA</p>
        </div>
      </div>
    </footer>
  );
}
