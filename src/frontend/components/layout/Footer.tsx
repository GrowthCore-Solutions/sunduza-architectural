import * as React from "react";
import Link from "next/link";
import { ArrowRight, Clock, Lock, Mail, MapPin, Phone } from "lucide-react";
import { CONTACT } from "@/shared/constants/contact";
import type { PublicSiteSettings } from "@/backend/services/settings";

// Brand icons (lucide doesn't ship brand marks; inline simple paths)
function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12z" />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M4.98 3.5a2.5 2.5 0 1 1-.02 5.01A2.5 2.5 0 0 1 4.98 3.5zM3 9h4v12H3V9zm7 0h3.8v1.7h.06c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.77 2.65 4.77 6.1V21h-4v-5.5c0-1.32-.03-3.01-1.84-3.01-1.84 0-2.12 1.43-2.12 2.91V21h-4V9z" />
    </svg>
  );
}

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

const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com/", Icon: InstagramIcon },
  { label: "Facebook", href: "https://facebook.com/", Icon: FacebookIcon },
  { label: "LinkedIn", href: "https://linkedin.com/", Icon: LinkedinIcon },
];

export function Footer({ settings }: { settings: PublicSiteSettings }) {
  return (
    <footer className="bg-ink text-white">
      <div className="h-[2px] w-full bg-primary" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Editorial top band */}
        <div className="grid grid-cols-1 gap-6 border-b border-white/10 py-10 md:grid-cols-2 md:items-end md:py-14">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-primary">
              Sunduza Architectural &amp; Projects
            </p>
            <h2 className="mt-4 max-w-xl font-serif text-[1.75rem] font-light italic leading-tight text-white sm:text-3xl md:text-4xl">
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

        {/* Link columns — vertical stack on mobile, multi-col on md+ */}
        <div className="grid grid-cols-1 gap-10 py-10 sm:grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1.2fr] md:gap-10 md:py-12">
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded bg-white text-[0.65rem] font-black tracking-[0.18em] text-ink">
                SA
              </span>
              <div>
                <p className="font-serif text-xl font-semibold text-white">Sunduza</p>
                <p className="text-[0.6rem] font-medium uppercase tracking-[0.2em] text-white/40">
                  Architectural &amp; Projects
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/55">
              Professional house planning, architectural drawings, drafting, and
              development project support across South Africa.
            </p>

            {/* Social icons */}
            <div className="mt-6 flex items-center gap-2">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded border border-white/10 bg-white/[0.03] text-white/55 transition-colors hover:border-primary/60 hover:bg-white/[0.06] hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
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
                <a href={`tel:${settings.phoneE164}`} className="text-white/60 transition-colors hover:text-primary">
                  {settings.phone}
                </a>
              </li>
              <li className="flex gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <a
                  href={`mailto:${settings.email}`}
                  className="break-all text-white/60 transition-colors hover:text-primary"
                >
                  {settings.email}
                </a>
              </li>
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-white/60">{settings.address}</span>
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
            &copy; {new Date().getFullYear()} Sunduza Architectural &amp; Projects (Pty) Ltd.
            All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <p>Design &amp; Build by GrowthCore-Solutions</p>
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 text-white/35 transition-colors hover:text-primary"
            >
              <Lock className="h-3 w-3" aria-hidden="true" />
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
