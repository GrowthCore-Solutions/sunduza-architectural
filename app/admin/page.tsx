"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import { Calendar, CheckCircle, Clock, Eye, LogOut, MessageSquare, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Stat {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") redirect("/admin/login");
  }, [status]);

  useEffect(() => {
    async function load() {
      try {
        const [bookingsRes, messagesRes] = await Promise.all([
          fetch("/api/admin/bookings"),
          fetch("/api/contact"),
        ]);
        const bookingsData = bookingsRes.ok ? await bookingsRes.json() : { data: { bookings: [] } };
        const messagesData = messagesRes.ok ? await messagesRes.json() : { data: [] };
        const bookings = bookingsData.data?.bookings ?? [];
        const messages = messagesData.data ?? [];
        setStats([
          {
            label: "Total Bookings",
            value: Array.isArray(bookings) ? bookings.length : 0,
            icon: Calendar,
            color: "text-[#b88b4a]",
          },
          {
            label: "New (Unread)",
            value: Array.isArray(bookings)
              ? bookings.filter((b: { status: string }) => b.status === "new").length
              : 0,
            icon: Clock,
            color: "text-blue-600",
          },
          {
            label: "Messages",
            value: Array.isArray(messages) ? messages.length : 0,
            icon: MessageSquare,
            color: "text-purple-600",
          },
          {
            label: "Completed",
            value: Array.isArray(bookings)
              ? bookings.filter((b: { status: string }) => b.status === "completed").length
              : 0,
            icon: CheckCircle,
            color: "text-green-600",
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
    if (session) load();
  }, [session]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-[#b88b4a]">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0e0e0e]">
            Welcome back, {session?.user?.name ?? "Admin"}
          </h1>
          <p className="text-[#5a5040] mt-1">
            Here is what is happening with Sunduza today.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-sm border border-[#c8bfa8] bg-white p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#5a5040]">{label}</p>
                <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
              </div>
              <Icon className={`h-8 w-8 ${color} opacity-50`} />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <a
          href="/admin/bookings"
          className="flex items-center gap-4 rounded-sm border border-[#c8bfa8] bg-white p-6 hover:border-[#b88b4a] transition-colors"
        >
          <Calendar className="h-10 w-10 text-[#b88b4a]" />
          <div>
            <p className="font-semibold text-[#0e0e0e]">Manage Bookings</p>
            <p className="text-sm text-[#5a5040]">View and update booking statuses</p>
          </div>
        </a>
        <a
          href="/admin/projects"
          className="flex items-center gap-4 rounded-sm border border-[#c8bfa8] bg-white p-6 hover:border-[#b88b4a] transition-colors"
        >
          <Star className="h-10 w-10 text-[#b88b4a]" />
          <div>
            <p className="font-semibold text-[#0e0e0e]">Manage Projects</p>
            <p className="text-sm text-[#5a5040]">Add or update portfolio items</p>
          </div>
        </a>
        <a
          href="/admin/testimonials"
          className="flex items-center gap-4 rounded-sm border border-[#c8bfa8] bg-white p-6 hover:border-[#b88b4a] transition-colors"
        >
          <Users className="h-10 w-10 text-[#b88b4a]" />
          <div>
            <p className="font-semibold text-[#0e0e0e]">Manage Testimonials</p>
            <p className="text-sm text-[#5a5040]">Feature or hide client reviews</p>
          </div>
        </a>
      </div>
    </div>
  );
}
