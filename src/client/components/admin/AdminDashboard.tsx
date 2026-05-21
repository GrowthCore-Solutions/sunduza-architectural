"use client";

import Link from "next/link";
import { Calendar, MessageSquare, FolderOpen, ArrowRight } from "lucide-react";
import { BookingStatus } from "@prisma/client";
import { useAdminBookings } from "@/src/client/hooks/admin/useAdminBookings";
import { useAdminMessages } from "@/src/client/hooks/admin/useAdminMessages";
import { Badge } from "@/src/client/components/ui/badge";
import { leadScoreColor } from "@/src/client/lib/booking-status";

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
    <div>
      <h1 className="font-serif text-2xl font-black text-[--color-ink] mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-sm border border-[--color-rule] bg-white p-5 hover:border-[--color-primary]/40 transition-colors"
          >
            <stat.icon className="h-5 w-5 text-[--color-primary] mb-3" />
            <p className="text-2xl font-bold text-[--color-ink]">{stat.value}</p>
            <p className="text-sm text-[--color-muted] mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>
      <h2 className="font-serif text-lg font-bold mb-4">Recent bookings</h2>
      <div className="rounded-sm border border-[--color-rule] bg-white divide-y divide-[--color-rule]">
        {pending?.bookings.slice(0, 5).map((b) => (
          <div key={b.id} className="flex items-center justify-between p-4 text-sm">
            <div>
              <p className="font-medium">{b.name}</p>
              <p className="text-[--color-muted]">{b.service}</p>
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
          <p className="p-6 text-[--color-muted] text-sm">No pending bookings.</p>
        )}
      </div>
      <Link
        href="/admin/bookings"
        className="inline-flex items-center gap-1 mt-4 text-sm text-[--color-primary] hover:underline"
      >
        View all bookings <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
