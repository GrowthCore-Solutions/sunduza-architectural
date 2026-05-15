"use client";

import Link from "next/link";
import { Calendar, CheckCircle2, MessageSquare, FolderOpen, Star, Settings, TrendingUp, Clock, XCircle } from "lucide-react";
import { Card, CardContent } from "@/src/client/components/ui/card";
import { Skeleton } from "@/src/client/components/ui/skeleton";
import { Badge } from "@/src/client/components/ui/badge";
import { useDashboardStats } from "@/src/client/hooks/use-bookings";

function StatCard({ label, value, icon: Icon, color, href }: {
  label: string; value: number | string; icon: React.ElementType;
  color: string; href?: string;
}) {
  const content = (
    <Card className="hover:border-[--color-primary] transition-colors group">
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-[--color-muted]">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
        </div>
        <Icon className={`h-8 w-8 ${color} opacity-40 group-hover:opacity-70 transition-opacity`} />
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[--color-ink]">Dashboard</h1>
        <p className="text-[--color-muted] mt-1">Here is what is happening with Sunduza today.</p>
      </div>

      {/* KPI grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Bookings" value={stats?.total ?? 0} icon={Calendar} color="text-[--color-primary]" href="/admin/bookings" />
          <StatCard label="Pending" value={stats?.pending ?? 0} icon={Clock} color="text-blue-600" href="/admin/bookings?status=PENDING" />
          <StatCard label="Completed" value={stats?.completed ?? 0} icon={CheckCircle2} color="text-green-600" href="/admin/bookings?status=COMPLETED" />
          <StatCard label="Unread Messages" value={0} icon={MessageSquare} color="text-purple-600" href="/admin/messages" />
        </div>
      )}

      {/* Conversion funnel */}
      {stats && (
        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold text-[--color-ink] mb-5 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[--color-primary]" />
              Booking Pipeline
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              {[
                { label: "Pending", count: stats.pending, variant: "pending" as const },
                { label: "Contacted", count: stats.contacted, variant: "contacted" as const },
                { label: "Confirmed", count: stats.confirmed, variant: "confirmed" as const },
                { label: "Completed", count: stats.completed, variant: "completed" as const },
                { label: "Rejected", count: stats.rejected, variant: "rejected" as const },
              ].map(({ label, count, variant }) => (
                <div key={label} className="flex-1 text-center p-3 rounded-sm bg-[--color-paper2]">
                  <Badge variant={variant} className="mb-2">{label}</Badge>
                  <p className="text-2xl font-bold text-[--color-ink]">{count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="font-semibold text-[--color-ink] mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Manage Bookings", desc: "View and update leads", icon: Calendar, href: "/admin/bookings" },
            { label: "Manage Projects", desc: "Add or edit portfolio", icon: FolderOpen, href: "/admin/projects" },
            { label: "Testimonials", desc: "Feature client reviews", icon: Star, href: "/admin/testimonials" },
            { label: "Site Settings", desc: "Update contact info", icon: Settings, href: "/admin/settings" },
          ].map(({ label, desc, icon: Icon, href }) => (
            <Link key={href} href={href} className="flex items-center gap-4 rounded-sm border border-[--color-rule] bg-white p-5 hover:border-[--color-primary] hover:shadow-sm transition-all">
              <Icon className="h-9 w-9 text-[--color-primary] shrink-0" />
              <div>
                <p className="font-semibold text-[--color-ink] text-sm">{label}</p>
                <p className="text-xs text-[--color-muted]">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
