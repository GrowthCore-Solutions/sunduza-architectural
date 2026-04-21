import Link from "next/link";

const FOOTER_SERVICES = [
  "House Planning",
  "Architectural Drawings",
  "Drafting Services",
  "Development Projects",
];

const FOOTER_LINKS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Contact", href: "/contact" },
  { label: "Book Consultation", href: "/booking" },
];

export function Footer() {
  return (
    <footer className="border-t border-[#e8ddd0] bg-[#0f172a] text-white">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="font-serif text-2xl font-bold mb-4">Sunduza</div>
            <p className="text-sm text-white/60 leading-relaxed mb-6">
              Sunduza Architectural & Projects (Pty) Ltd — Professional architectural services across South Africa.
            </p>
            <div className="space-y-2 text-sm text-white/60">
              <div>Xivutiso Kevin Sunduza</div>
              <div>+27 78 672 3364</div>
              <div>xivutisokevinsunduza@gmail.com</div>
              <div>South Africa</div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">Services</h3>
            <ul className="space-y-3">
              {FOOTER_SERVICES.map((s) => (
                <li key={s}>
                  <Link href="/services" className="text-sm text-white/70 hover:text-[#b88b4a] transition-colors duration-200">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-white/70 hover:text-[#b88b4a] transition-colors duration-200">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>&copy; {new Date().getFullYear()} Sunduza Architectural & Projects (Pty) Ltd. All rights reserved.</p>
          <p>Design & Build by KSDRILL SA</p>
        </div>
      </div>
    </footer>
  );
}