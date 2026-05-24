"use client";

import Link from "next/link";
import {
  Calendar,
  MessageSquare,
  FolderOpen,
  Star,
  ArrowRight,
  Inbox,
  TrendingUp,
} from "lucide-react";
import { BookingStatus } from "@prisma/client";
import { useAdminBookings } from "@/frontend/hooks/admin/useAdminBookings";
import { useAdminMessages } from "@/frontend/hooks/admin/useAdminMessages";
import { useAdminProjects } from "@/frontend/hooks/admin/useAdminProjects";
import { useAdminTestimonials } from "@/frontend/hooks/admin/useAdminTestimonials";
import { leadTone } from "@/shared/lib/lead-score";
import { BOOKING_STATUS_TONE } from "@/frontend/lib/booking-display";

function formatRelative(date: Date | string): string {
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export function AdminDashboard() {
  const { data: pending } = useAdminBookings({
    status: BookingStatus.PENDING,
    page: 1,
  });
  const { data: unreadMessages } = useAdminMessages(true);
  const { data: projects } = useAdminProjects();
  const { data: testimonials } = useAdminTestimonials();

  const pendingCount = pending?.total ?? 0;
  const unreadCount = unreadMessages?.length ?? 0;
  const projectCount = projects?.length ?? 0;
  const testimonialCount = testimonials?.length ?? 0;

  const kpis = [
    {
      label: "Pending bookings",
      value: pendingCount,
      icon: Calendar,
      href: "/admin/bookings?status=PENDING",
      trend: pendingCount > 0 ? "Needs review" : "All clear",
    },
    {
      label: "Unread messages",
      value: unreadCount,
      icon: Inbox,
      href: "/admin/messages",
      trend: unreadCount > 0 ? `${unreadCount} waiting` : "Inbox zero",
    },
    {
      label: "Portfolio projects",
      value: projectCount,
      icon: FolderOpen,
      href: "/admin/projects",
      trend: "Manage",
    },
    {
      label: "Testimonials",
      value: testimonialCount,
      icon: Star,
      href: "/admin/testimonials",
      trend: "Social proof",
    },
  ];

  const recentBookings = pending?.bookings.slice(0, 6) ?? [];
  const recentMessages = unreadMessages?.slice(0, 5) ?? [];

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <p className="admin-page-head-eyebrow">Overview</p>
          <h1 className="admin-page-head-title">
            Welcome back,<br />
            <em>let&rsquo;s get to work.</em>
          </h1>
          <p className="admin-page-head-sub">
            Active leads, fresh enquiries, and the latest activity across the
            studio &mdash; all in one place.
          </p>
        </div>
      </header>

      {/* KPI strip */}
      <div className="admin-kpi-grid">
        {kpis.map((k) => (
          <Link key={k.label} href={k.href} className="admin-kpi">
            <div className="admin-kpi-head">
              <span className="admin-kpi-icon" aria-hidden="true">
                <k.icon size={15} strokeWidth={1.85} />
              </span>
              <span className="admin-kpi-trend">
                <TrendingUp size={11} strokeWidth={2} />
                {k.trend}
              </span>
            </div>
            <p className="admin-kpi-value">{k.value}</p>
            <p className="admin-kpi-label">{k.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent activity: bookings + messages */}
      <div className="admin-two-col">
        <div className="admin-card">
          <div className="admin-card-head">
            <h2 className="admin-card-title">Pending bookings</h2>
            <Link href="/admin/bookings" className="admin-card-link">
              View all <ArrowRight size={13} />
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <div className="admin-list-empty">
              <span className="admin-list-empty-icon">
                <Calendar size={18} strokeWidth={1.75} />
              </span>
              <p>No pending bookings &mdash; you&rsquo;re all caught up.</p>
            </div>
          ) : (
            <div className="admin-list">
              {recentBookings.map((b) => (
                <Link
                  key={b.id}
                  href="/admin/bookings"
                  className="admin-list-row"
                  style={{ textDecoration: "none" }}
                >
                  <div className="admin-list-row-main">
                    <p className="admin-list-row-title">{b.name}</p>
                    <p className="admin-list-row-sub">
                      {b.service} &middot; {b.location}
                    </p>
                  </div>
                  <div className="admin-list-row-side">
                    {b.leadScore !== null && (
                      <span
                        className="admin-lead"
                        data-tone={leadTone(b.leadScore)}
                      >
                        {b.leadScore}
                        <span className="admin-lead-suffix">/100</span>
                      </span>
                    )}
                    <span
                      className="admin-pill"
                      data-tone={BOOKING_STATUS_TONE[b.status]}
                    >
                      <span className="admin-pill-dot" aria-hidden="true" />
                      {b.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="admin-card">
          <div className="admin-card-head">
            <h2 className="admin-card-title">Unread messages</h2>
            <Link href="/admin/messages" className="admin-card-link">
              View inbox <ArrowRight size={13} />
            </Link>
          </div>

          {recentMessages.length === 0 ? (
            <div className="admin-list-empty">
              <span className="admin-list-empty-icon">
                <MessageSquare size={18} strokeWidth={1.75} />
              </span>
              <p>Inbox zero. Nicely done.</p>
            </div>
          ) : (
            <div className="admin-list">
              {recentMessages.map((m) => (
                <Link
                  key={m.id}
                  href="/admin/messages"
                  className="admin-list-row"
                  style={{ textDecoration: "none" }}
                >
                  <div className="admin-list-row-main">
                    <p className="admin-list-row-title">{m.name}</p>
                    <p className="admin-list-row-sub">{m.message}</p>
                  </div>
                  <div className="admin-list-row-side">
                    <span className="admin-pill" data-tone="primary">
                      {formatRelative(m.createdAt)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
