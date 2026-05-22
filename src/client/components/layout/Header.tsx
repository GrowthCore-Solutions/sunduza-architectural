"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/src/client/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/client/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Contact", href: "/contact" },
] as const;

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
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
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary" />
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3 group"
          aria-label="Sunduza Architectural home"
        >
          <span className="flex h-[2.6rem] w-[2.6rem] items-center justify-center rounded bg-ink text-[0.65rem] font-black tracking-[0.2em] text-white shadow-sm transition-colors group-hover:bg-graphite">
            SA
          </span>
          <span className="leading-none">
            <span className="block font-serif text-[1.3rem] font-semibold tracking-tight text-ink leading-none">
              Sunduza
            </span>
            <span className="hidden text-[0.6rem] font-medium uppercase tracking-[0.22em] text-muted sm:block mt-[3px]">
              Architectural & Projects
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
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

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/"
            className={cn(
              "px-3.5 py-2 text-[0.8125rem] font-medium tracking-[0.005em] transition-colors duration-200",
              pathname === "/" ? "text-primary" : "text-graphite hover:text-ink"
            )}
          >
            Home
          </Link>
          <Button size="sm" asChild className="h-9 px-4 text-[0.8125rem]">
            <Link href="/booking">
              Book Consultation
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="h-10 w-10" aria-label="Open navigation menu">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-[300px] p-0">
            <div className="flex h-full flex-col">
              <div className="h-[2px] w-full bg-primary" />
              <SheetHeader className="border-b border-rule px-5 py-4">
                <SheetTitle className="font-serif text-base font-semibold text-ink text-left">
                  Sunduza Architectural
                </SheetTitle>
              </SheetHeader>

              <nav className="flex flex-1 flex-col gap-0.5 p-4" aria-label="Mobile navigation">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded px-4 py-2.5 text-sm font-medium transition-colors duration-200",
                    pathname === "/" ? "bg-paper2 text-primary" : "text-ink hover:bg-paper2 hover:text-primary"
                  )}
                >
                  Home
                </Link>
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded px-4 py-2.5 text-sm font-medium transition-colors duration-200",
                      pathname === item.href
                        ? "bg-paper2 text-primary"
                        : "text-ink hover:bg-paper2 hover:text-primary"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="border-t border-rule p-4">
                <Button className="w-full" asChild>
                  <Link href="/booking" onClick={() => setOpen(false)}>
                    Book Consultation
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
