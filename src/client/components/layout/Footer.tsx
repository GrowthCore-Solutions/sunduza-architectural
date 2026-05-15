import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

const SERVICES = [
  { label: "House Planning", href: "/services#house-planning" },
  { label: "Architectural Drawings", href: "/services#arch-drawings" },
  { label: "Drafting Services", href: "/services#drafting" },
  { label: "Development Project Planning", href: "/services#development" },
];

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Contact", href: "/contact" },
  { label: "Book Consultation", href: "/booking" },
  { label: "Privacy Policy", href: "/privacy" },
];

export function Footer() {
  return (
    <footer className="border-t border-[--color-rule] bg-[--color-ink] text-white">
      <div className="mx-auto max-w-7xl px-4 py-16">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Brand */}
          <div>
            <div className="font-serif text-2xl font-bold mb-4 text-white">
              Sunduza
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-6 max-w-xs">
              Sunduza Architectural & Projects (Pty) Ltd — Professional house planning, 
              architectural drawings, and development projects across South Africa.
            </p>
            <ul className="space-y-2 text-sm text-white/60">
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-[--color-primary]" />
                <a
                  href="tel:+27786723364"
                  className="hover:text-[--color-primary] transition-colors"
                >
                  +27 78 672 3364
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0 text-[--color-primary]" />
                <a
                  href="mailto:xivutisokevinsunduza@gmail.com"
                  className="hover:text-[--color-primary] transition-colors break-all"
                >
                  xivutisokevinsunduza@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[--color-primary]" />
                <span>South Africa</span>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">
              Services
            </h3>
            <ul className="space-y-3">
              {SERVICES.map((s) => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    className="text-sm text-white/70 hover:text-[--color-primary] transition-colors duration-200"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {QUICK_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-white/70 hover:text-[--color-primary] transition-colors duration-200"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40">
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
