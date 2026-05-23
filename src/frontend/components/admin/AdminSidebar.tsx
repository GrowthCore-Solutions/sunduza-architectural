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

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  exact?: boolean;
};

const PRIMARY_NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Bookings", href: "/admin/bookings", icon: Calendar },
  { label: "Messages", href: "/admin/messages", icon: MessageSquare },
];

const CONTENT_NAV: NavItem[] = [
  { label: "Projects", href: "/admin/projects", icon: FolderOpen },
  { label: "Testimonials", href: "/admin/testimonials", icon: Star },
];

const SYSTEM_NAV: NavItem[] = [
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

interface AdminSidebarProps {
  adminEmail?: string;
  adminName?: string;
}

function initials(name?: string, email?: string): string {
  const source = name ?? email ?? "AD";
  return source
    .replace(/@.*$/, "")
    .split(/[ ._-]+/)
    .map((w) => w[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AdminSidebar({ adminEmail, adminName }: AdminSidebarProps) {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  function renderItem({ label, href, icon: Icon, exact }: NavItem) {
    const active = isActive(href, exact);
    return (
      <Link
        key={href}
        href={href}
        className="admin-sidebar-link"
        data-active={active}
      >
        <span className="admin-sidebar-link-icon" aria-hidden="true">
          <Icon size={15} strokeWidth={1.85} />
        </span>
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <aside className="admin-sidebar" aria-label="Admin navigation">
      <div className="admin-sidebar-brand">
        <span className="admin-sidebar-brand-mono" aria-hidden="true">
          SA
        </span>
        <div>
          <p className="admin-sidebar-brand-text">Sunduza</p>
          <p className="admin-sidebar-brand-sub">Studio admin</p>
        </div>
      </div>

      <nav className="admin-sidebar-nav">
        <p className="admin-sidebar-section-label">Overview</p>
        {PRIMARY_NAV.map(renderItem)}

        <p className="admin-sidebar-section-label">Content</p>
        {CONTENT_NAV.map(renderItem)}

        <p className="admin-sidebar-section-label">System</p>
        {SYSTEM_NAV.map(renderItem)}
      </nav>

      <div className="admin-sidebar-foot">
        <div className="admin-sidebar-user">
          <span className="admin-sidebar-user-avatar" aria-hidden="true">
            {initials(adminName, adminEmail)}
          </span>
          <div className="admin-sidebar-user-info">
            <p className="admin-sidebar-user-name" title={adminEmail ?? ""}>
              {adminName ?? adminEmail ?? "Studio admin"}
            </p>
            <p className="admin-sidebar-user-role">Administrator</p>
          </div>
        </div>

        <Link href="/" className="admin-sidebar-foot-link">
          <ExternalLink size={13} strokeWidth={1.85} aria-hidden="true" />
          View live site
        </Link>

        <button
          type="button"
          className="admin-sidebar-foot-link danger"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
        >
          <LogOut size={13} strokeWidth={1.85} aria-hidden="true" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
