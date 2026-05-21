"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu } from "lucide-react";
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
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Contact", href: "/contact" },
] as const;

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-rule/80 bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/85">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3"
          aria-label="Sunduza Architectural home"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-ink text-sm font-black text-white shadow-soft">
            SA
          </span>
          <span className="leading-none">
            <span className="block font-serif text-xl font-black tracking-tight text-ink">
              Sunduza
            </span>
            <span className="hidden text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted sm:block">
              Architectural
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3.5 py-2 text-sm font-semibold transition-colors duration-200",
                pathname === item.href
                  ? "bg-white text-primary shadow-sm shadow-ink/5"
                  : "text-graphite hover:bg-white/75 hover:text-primary"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center md:flex">
          <Button size="sm" asChild>
            <Link href="/booking">
              Book Consultation
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Open navigation menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-[280px] p-0">
            <div className="flex h-full flex-col">
              <SheetHeader className="border-b border-rule px-5 py-4">
                <SheetTitle>Sunduza Architectural</SheetTitle>
              </SheetHeader>

              <nav className="flex flex-1 flex-col gap-1 p-4" aria-label="Mobile navigation">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-md px-4 py-3 text-sm font-semibold transition-colors duration-200",
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
