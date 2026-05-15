"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Calendar,
  FolderOpen,
  Star,
  MessageSquare,
  Settings,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/src/client/components/ui/button";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Bookings", href: "/admin/bookings", icon: Calendar },
  { label: "Projects", href: "/admin/projects", icon: FolderOpen },
  { label: "Testimonials", href: "/admin/testimonials", icon: Star },
  { label: "Messages", href: "/admin/messages", icon: MessageSquare },
  { label: "Settings", href: "/admin/settings", icon: Settings },
] as const;

interface AdminSidebarProps {
  adminEmail?: string;
  adminName?: string;
}

export function AdminSidebar({ adminEmail, adminName }: AdminSidebarProps) {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-[--color-rule] bg-white">

      {/* Brand */}
      <div className="flex h-16 items-center border-b border-[--color-rule] px-5">
        <div>
          <p className="font-serif text-lg font-bold text-[--color-ink]">Sunduza</p>
          <p className="text-xs text-[--color-muted]">Admin</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5" aria-label="Admin navigation">
        {NAV_ITEMS.map((item) => {
          const { label, href, icon: Icon } = item;
          const exact = "exact" in item ? item.exact : undefined;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                isActive(href, exact)
                  ? "bg-[--color-paper2] text-[--color-primary]"
                  : "text-[--color-muted] hover:bg-[--color-paper2] hover:text-[--color-ink]"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[--color-rule] p-3 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-sm px-3 py-2 text-sm text-[--color-muted] hover:text-[--color-ink] hover:bg-[--color-paper2] transition-colors"
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          View Site
        </Link>

        {adminEmail && (
          <div className="px-3 py-2 text-xs text-[--color-muted] truncate">
            {adminName ?? adminEmail}
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 text-[--color-muted] hover:text-red-600"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
