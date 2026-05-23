"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import { AdminSidebar } from "@/frontend/components/admin/AdminSidebar";
import { useAdminUI } from "@/frontend/stores/admin-ui";
import { Button } from "@/frontend/components/ui/button";

export function AdminShell({
  children,
  adminEmail,
  adminName,
}: {
  children: React.ReactNode;
  adminEmail?: string;
  adminName?: string;
}) {
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useAdminUI();

  return (
    <div className="admin-shell">
      <div
        className="admin-sidebar-mobile-wrap"
        data-open={sidebarOpen}
      >
        <AdminSidebar adminEmail={adminEmail} adminName={adminName} />
      </div>

      {sidebarOpen && (
        <button
          type="button"
          className="admin-sidebar-overlay md:hidden"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="admin-main">
        <header className="admin-topbar">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="admin-topbar-title">Sunduza Admin</span>
        </header>

        <div className="admin-content">
          <div className="admin-content-inner">{children}</div>
        </div>
      </div>
    </div>
  );
}
