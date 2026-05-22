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
import { cn } from "@/frontend/lib/utils";
import { Button } from "@/frontend/components/ui/button";

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
    <aside className="flex h-full w-64 flex-col border-r border-rule/80 bg-white">
      <div className="flex h-18 items-center border-b border-rule/80 px-5">
        <span className="mr-3 flex h-10 w-10 items-center justify-center rounded-md bg-ink text-sm font-black text-white">
          SA
        </span>
        <div>
          <p className="font-serif text-lg font-black leading-none text-ink">Sunduza</p>
          <p className="text-xs text-muted">Admin</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5" aria-label="Admin navigation">
        {NAV_ITEMS.map((item) => {
          const { label, href, icon: Icon } = item;
          const exact = "exact" in item ? item.exact : undefined;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors duration-200",
                isActive(href, exact)
                  ? "bg-paper2 text-primary"
                  : "text-muted hover:bg-mist hover:text-ink"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-rule/80 p-3 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-mist hover:text-ink"
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          View Site
        </Link>

        {adminEmail && (
          <div className="px-3 py-2 text-xs text-muted truncate">
            {adminName ?? adminEmail}
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 text-muted hover:text-red-600"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
