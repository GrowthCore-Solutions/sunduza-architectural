"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[--color-rule] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 h-16">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 shrink-0"
          aria-label="Sunduza Architectural — home"
        >
          <span className="font-serif text-xl font-bold text-[--color-ink] tracking-tight">
            Sunduza
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-sm transition-colors duration-200",
                pathname === item.href
                  ? "text-[--color-primary] bg-[--color-paper2]"
                  : "text-[--color-ink] hover:text-[--color-primary] hover:bg-[--color-paper2]"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center">
          <Button size="sm" asChild>
            <Link href="/booking">Book Consultation</Link>
          </Button>
        </div>

        {/* Mobile hamburger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Open navigation menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-[280px] p-0">
            <div className="flex flex-col h-full">
              <SheetHeader className="px-5 py-4 border-b border-[--color-rule]">
                <SheetTitle>Sunduza</SheetTitle>
              </SheetHeader>

              <nav className="flex flex-col p-4 gap-1 flex-1" aria-label="Mobile navigation">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "px-4 py-3 text-sm font-medium rounded-sm transition-colors duration-200",
                      pathname === item.href
                        ? "text-[--color-primary] bg-[--color-paper2]"
                        : "text-[--color-ink] hover:text-[--color-primary] hover:bg-[--color-paper2]"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="p-4 border-t border-[--color-rule]">
                <Button className="w-full" asChild>
                  <Link href="/booking" onClick={() => setOpen(false)}>
                    Book Consultation
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
