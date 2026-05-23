"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { cn } from "@/frontend/lib/utils";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Contact", href: "/contact" },
] as const;

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname.startsWith("/admin")) return null;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-rule/60 bg-paper/96 shadow-[0_1px_16px_-3px_rgb(15_26_34/0.09)] backdrop-blur-md"
          : "border-b border-rule/35 bg-paper/92 backdrop-blur-sm"
      )}
    >
      {/* Gold accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary" />

      {/* ── Primary bar: logo + desktop nav + CTA ── */}
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:h-[4.5rem] md:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 group"
          aria-label="Sunduza Architectural home"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded bg-ink text-[0.65rem] font-black tracking-[0.2em] text-white shadow-sm transition-colors group-hover:bg-graphite md:h-[2.6rem] md:w-[2.6rem]">
            SA
          </span>
          <span className="leading-none">
            <span className="block font-serif text-[1.15rem] font-semibold tracking-tight text-ink leading-none md:text-[1.3rem]">
              Sunduza
            </span>
            <span className="hidden text-[0.6rem] font-medium uppercase tracking-[0.22em] text-muted sm:block mt-[3px]">
              Architectural &amp; Projects
            </span>
          </span>
        </Link>

        {/* Desktop-only nav */}
        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-3.5 py-2 text-[0.8125rem] font-medium tracking-[0.005em] transition-colors duration-200",
                  active ? "text-primary" : "text-graphite hover:text-ink"
                )}
              >
                {item.label}
                {active && (
                  <span className="absolute bottom-[6px] left-3.5 right-3.5 h-px bg-primary/70 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* CTA — "Book" on mobile, full label on desktop */}
        <Button
          size="sm"
          asChild
          className="h-10 gap-1.5 px-3 text-[0.8125rem] md:h-9 md:px-4"
        >
          <Link href="/booking">
            <span className="md:hidden">Book</span>
            <span className="hidden md:inline">Book Consultation</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      {/* ── Mobile nav strip (horizontal scroll, hidden on md+) ── */}
      <div className="relative md:hidden">
        <div className="h-px w-full bg-rule/25" />
        <nav
          className="mob-nav-rail"
          aria-label="Mobile navigation"
        >
          <div className="mob-nav-inner">
            {NAV_ITEMS.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn("mob-nav-link", active && "mob-nav-link--active")}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
        {/* Right-edge scroll hint */}
        <div className="mob-nav-fade" aria-hidden="true" />
      </div>
    </header>
  );
}
