import Link from "next/link";
import { ArrowRight, Clock, Mail, MapPin, Phone } from "lucide-react";

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
    <footer className="border-t border-rule/30 bg-ink text-white">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="flex flex-col gap-6 border-b border-white/10 pb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Sunduza Architectural
            </p>
            <h2 className="mt-3 max-w-2xl font-serif text-3xl font-black leading-tight text-white md:text-4xl">
              Start with drawings that make the build clearer.
            </h2>
          </div>
          <Link
            href="/booking"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-primary-dark"
          >
            Book Consultation
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-10 py-12 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-sm font-black text-ink">
                SA
              </span>
              <div>
                <p className="font-serif text-2xl font-black text-white">Sunduza</p>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                  Architectural & Projects
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/65">
              Professional house planning, architectural drawings, drafting, and
              development project support across South Africa.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">
              Services
            </h3>
            <ul className="space-y-3">
              {SERVICES.map((service) => (
                <li key={service.href}>
                  <Link
                    href={service.href}
                    className="text-sm text-white/72 transition-colors duration-200 hover:text-primary"
                  >
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">
              Company
            </h3>
            <ul className="space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/72 transition-colors duration-200 hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">
              Contact
            </h3>
            <ul className="space-y-3 text-sm text-white/72">
              <li className="flex gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <a href="tel:+27786723364" className="transition-colors hover:text-primary">
                  +27 78 672 3364
                </a>
              </li>
              <li className="flex gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <a
                  href="mailto:xivutisokevinsunduza@gmail.com"
                  className="break-all transition-colors hover:text-primary"
                >
                  xivutisokevinsunduza@gmail.com
                </a>
              </li>
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>South Africa</span>
              </li>
              <li className="flex gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>Mon-Fri, 8am-5pm</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/45 md:flex-row md:items-center">
          <p>
            &copy; {new Date().getFullYear()} Sunduza Architectural & Projects
            (Pty) Ltd. All rights reserved.
          </p>
          <p>Design & Build by KSDRILL SA</p>
        </div>
      </div>
    </footer>
  );
}
