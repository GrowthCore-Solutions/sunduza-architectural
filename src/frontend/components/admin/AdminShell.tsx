"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import { AdminSidebar } from "@/frontend/components/admin/AdminSidebar";
import { useAdminUI } from "@/frontend/stores/admin-ui";
import { Button } from "@/frontend/components/ui/button";
import { cn } from "@/frontend/lib/utils";

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
    <div className="flex h-screen overflow-hidden bg-mist">
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform transition-transform md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <AdminSidebar adminEmail={adminEmail} adminName={adminName} />
      </div>
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center border-b border-rule/80 bg-white/95 px-4 md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
          <span className="ml-2 font-serif font-black">Sunduza Admin</span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
