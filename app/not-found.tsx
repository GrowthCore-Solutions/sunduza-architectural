import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Home,
  Layers,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/frontend/components/ui/button";

const QUICK_LINKS = [
  {
    href: "/",
    icon: Home,
    title: "Home",
    cta: "Start here",
  },
  {
    href: "/projects",
    icon: Building2,
    title: "Recent projects",
    cta: "View portfolio",
  },
  {
    href: "/services",
    icon: Layers,
    title: "Our services",
    cta: "See offerings",
  },
  {
    href: "/contact",
    icon: MessageCircle,
    title: "Get in touch",
    cta: "Talk to us",
  },
];

export default function NotFound() {
  return (
    <main className="system-page" aria-labelledby="nf-title">
      <div className="system-page-inner">
        <div>
          <div className="system-page-numeral" aria-hidden="true">
            4<em>0</em>4
          </div>
          <p className="system-page-eyebrow">Page not found</p>
          <h1 id="nf-title" className="system-page-title">
            This page<br />
            <em>doesn&rsquo;t exist.</em>
          </h1>
          <p className="system-page-sub">
            The link you followed may be out of date, or the page might have
            moved. No harm done &mdash; here are a few good places to land.
          </p>
          <div className="system-page-actions">
            <Button asChild variant="default" size="lg">
              <Link href="/">
                <ArrowLeft size={15} /> Back to home
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">
                Contact us <ArrowRight size={15} />
              </Link>
            </Button>
          </div>
        </div>

        <nav aria-label="Popular destinations">
          <div className="system-page-links">
            {QUICK_LINKS.map(({ href, icon: Icon, title, cta }) => (
              <Link key={href} href={href} className="system-page-link">
                <span className="system-page-link-icon" aria-hidden="true">
                  <Icon size={16} strokeWidth={1.75} />
                </span>
                <div className="system-page-link-foot">
                  <div>
                    <p className="system-page-link-title">{title}</p>
                    <span className="system-page-link-cta">
                      {cta} <ArrowRight size={11} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </main>
  );
}
