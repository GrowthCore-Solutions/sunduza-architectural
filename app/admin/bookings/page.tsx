"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Calendar, MapPin, Search, Star, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { BookingActions } from "@/components/admin/booking-actions";
import { cn } from "@/lib/utils";

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  location: string;
  description: string;
  meetingDate: string;
  budget: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

const SERVICE_LABELS: Record<string, string> = {
  "House Planning": "🏠 House Planning",
  "Architectural Drawings": "📐 Architectural Drawings",
  "Drafting Services": "✏️ Drafting Services",
  "Development Projects": "🏗️ Development Projects",
};

export default function AdminBookingsPage() {
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (status === "unauthenticated") redirect("/admin/login");
  }, [status]);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      const url = `/api/admin/bookings${params.toString() ? `?${params}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      setBookings(data?.data?.bookings ?? []);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (status === "authenticated") fetchBookings();
  }, [status, fetchBookings]);

  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.email.toLowerCase().includes(q) ||
      b.service.toLowerCase().includes(q) ||
      b.location.toLowerCase().includes(q)
    );
  });

  const statusCounts = bookings.reduce<Record<string, number>>((acc, b) => {
    acc[b.status] = (acc[b.status] ?? 0) + 1;
    return acc;
  }, {});

  const STATUS_TABS = [
    { key: "all", label: `All (${bookings.length})` },
    { key: "new", label: `New (${statusCounts["new"] ?? 0})` },
    { key: "contacted", label: `Contacted (${statusCounts["contacted"] ?? 0})` },
    { key: "in_review", label: `In Review (${statusCounts["in_review"] ?? 0})` },
    { key: "confirmed", label: `Confirmed (${statusCounts["confirmed"] ?? 0})` },
    { key: "completed", label: `Done (${statusCounts["completed"] ?? 0})` },
    { key: "cancelled", label: `Cancelled (${statusCounts["cancelled"] ?? 0})` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#0e0e0e]">Bookings</h1>
        <p className="text-[#5a5040] mt-1">
          Manage consultation requests and track their status.
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Status tabs */}
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={cn(
                "px-3 py-1.5 rounded-sm text-sm font-medium border transition-colors",
                statusFilter === tab.key
                  ? "bg-[#b88b4a] text-white border-[#b88b4a]"
                  : "bg-white text-[#5a5040] border-[#c8bfa8] hover:border-[#b88b4a]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5a5040]" />
          <Input
            placeholder="Search name, email, service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-[#ede8de] rounded-sm" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-sm border border-[#c8bfa8] bg-[#ede8de] p-12 text-center">
          <Calendar className="h-12 w-12 mx-auto text-[#c8bfa8] mb-3" />
          <p className="text-[#5a5040]">No bookings found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => (
            <div
              key={booking.id}
              className="rounded-sm border border-[#c8bfa8] bg-white p-6"
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-semibold text-[#0e0e0e]">{booking.name}</h3>
                  <div className="flex flex-wrap gap-4 mt-1 text-sm text-[#5a5040]">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      {booking.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      {booking.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(booking.meetingDate).toLocaleDateString("en-ZA", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {booking.location}
                    </span>
                  </div>
                </div>
                <BookingActions
                  bookingId={booking.id}
                  currentStatus={booking.status}
                  onUpdate={fetchBookings}
                />
              </div>

              {/* Service + budget */}
              <div className="flex flex-wrap gap-4 text-sm mb-3">
                <span className="font-medium text-[#0e0e0e]">
                  {SERVICE_LABELS[booking.service] ?? booking.service}
                </span>
                {booking.budget && (
                  <span className="text-[#5a5040]">
                    Budget: <strong className="text-[#0e0e0e]">{booking.budget}</strong>
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-[#5a5040] leading-relaxed">
                {booking.description}
              </p>

              {/* Notes */}
              {booking.notes && (
                <div className="mt-3 rounded-sm bg-[#fff8d6] border border-[#d4bc6a] p-3 text-sm">
                  <strong className="text-[#5a4a00]">Admin notes:</strong>{" "}
                  {booking.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
