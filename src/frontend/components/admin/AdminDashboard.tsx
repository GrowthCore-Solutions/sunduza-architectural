"use client";

import Link from "next/link";
import { Calendar, MessageSquare, FolderOpen, ArrowRight } from "lucide-react";
import { BookingStatus } from "@prisma/client";
import { useAdminBookings } from "@/frontend/hooks/admin/useAdminBookings";
import { useAdminMessages } from "@/frontend/hooks/admin/useAdminMessages";
import { Badge } from "@/frontend/components/ui/badge";
import { leadScoreColor } from "@/frontend/lib/booking-status";

export function AdminDashboard() {
  const { data: pending } = useAdminBookings({ status: BookingStatus.PENDING, page: 1 });
  const { data: unreadMessages } = useAdminMessages(true);

  const stats = [
    {
      label: "Pending bookings",
      value: pending?.total ?? "—",
      href: "/admin/bookings?status=PENDING",
      icon: Calendar,
    },
    {
      label: "Unread messages",
      value: unreadMessages?.length ?? "—",
      href: "/admin/messages",
      icon: MessageSquare,
    },
    {
      label: "Portfolio",
      value: "Manage",
      href: "/admin/projects",
      icon: FolderOpen,
    },
  ];

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          Admin overview
        </p>
        <h1 className="mt-2 font-serif text-3xl font-black tracking-tight text-ink">
          Dashboard
        </h1>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-10">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-md border border-rule/75 bg-white p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-paper2 text-primary">
              <stat.icon className="h-5 w-5" />
            </div>
            <p className="text-3xl font-bold text-ink">{stat.value}</p>
            <p className="mt-1 text-sm font-medium text-muted">{stat.label}</p>
          </Link>
        ))}
      </div>
      <h2 className="mb-4 font-serif text-xl font-bold text-ink">Recent bookings</h2>
      <div className="divide-y divide-rule/70 rounded-md border border-rule/75 bg-white shadow-soft">
        {pending?.bookings.slice(0, 5).map((b) => (
          <div key={b.id} className="flex items-center justify-between p-4 text-sm">
            <div>
              <p className="font-semibold text-ink">{b.name}</p>
              <p className="text-muted">{b.service}</p>
            </div>
            <div className="flex items-center gap-2">
              {b.leadScore !== null && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${leadScoreColor(b.leadScore)}`}
                >
                  {b.leadScore}
                </span>
              )}
              <Badge variant="secondary">{b.status}</Badge>
            </div>
          </div>
        ))}
        {(!pending?.bookings.length) && (
          <p className="p-6 text-muted text-sm">No pending bookings.</p>
        )}
      </div>
      <Link
        href="/admin/bookings"
        className="inline-flex items-center gap-1 mt-4 text-sm text-primary hover:underline"
      >
        View all bookings <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
