"use client";

import * as React from "react";
import { BookingStatus } from "@prisma/client";
import { useAdminBookings, useUpdateBookingStatus } from "@/frontend/hooks/admin/useAdminBookings";
import { useAdminUI } from "@/frontend/stores/admin-ui";
import { validNextStatuses, leadScoreColor } from "@/frontend/lib/booking-status";
import { ApiClientError } from "@/frontend/lib/api-client";
import { Badge } from "@/frontend/components/ui/badge";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Textarea } from "@/frontend/components/ui/textarea";
import { cn } from "@/frontend/lib/utils";

const STATUS_TABS: { label: string; value: BookingStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: BookingStatus.PENDING },
  { label: "Contacted", value: BookingStatus.CONTACTED },
  { label: "Confirmed", value: BookingStatus.CONFIRMED },
  { label: "Completed", value: BookingStatus.COMPLETED },
  { label: "Rejected", value: BookingStatus.REJECTED },
];

export function AdminBookingsPage() {
  const { bookingStatusFilter, setBookingStatusFilter, bookingSearch, setBookingSearch } =
    useAdminUI();
  const [page, setPage] = React.useState(1);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [notes, setNotes] = React.useState<Record<string, string>>({});
  const [error, setError] = React.useState<string | null>(null);

  const { data, isLoading } = useAdminBookings({ status: bookingStatusFilter, page });
  const updateStatus = useUpdateBookingStatus();

  const filtered =
    data?.bookings.filter((b) => {
      if (!bookingSearch) return true;
      const q = bookingSearch.toLowerCase();
      return (
        b.name.toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q) ||
        b.phone.toLowerCase().includes(q)
      );
    }) ?? [];

  async function handleStatusChange(id: string, status: BookingStatus) {
    setError(null);
    try {
      await updateStatus.mutateAsync({
        id,
        status,
        adminNotes: notes[id],
      });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Update failed");
    }
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          Lead pipeline
        </p>
        <h1 className="mt-2 font-serif text-3xl font-black tracking-tight text-ink">
          Bookings
        </h1>
      </div>
      <div className="mb-4 inline-flex flex-wrap gap-1 rounded-md border border-rule bg-white/90 p-1 shadow-sm shadow-ink/5">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => {
              setBookingStatusFilter(tab.value);
              setPage(1);
            }}
            className={cn(
              "h-9 rounded-sm px-3 text-sm font-semibold transition-colors",
              bookingStatusFilter === tab.value
                ? "bg-primary text-white"
                : "text-muted hover:bg-paper2 hover:text-ink"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <Input
        placeholder="Search name or email..."
        value={bookingSearch}
        onChange={(e) => setBookingSearch(e.target.value)}
        className="max-w-sm mb-6"
      />
      {error && <p className="mb-4 text-sm font-medium text-red-700">{error}</p>}
      {isLoading && <p className="text-muted">Loading...</p>}
      <div className="space-y-2">
        {filtered.map((booking) => (
          <div key={booking.id} className="rounded-md border border-rule/75 bg-white shadow-sm shadow-ink/5">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 p-4 text-left text-sm"
              onClick={() =>
                setExpandedId(expandedId === booking.id ? null : booking.id)
              }
            >
              <div className="min-w-0">
                <p className="font-semibold text-ink">{booking.name}</p>
                <p className="text-muted">{booking.email}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {booking.leadScore !== null && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${leadScoreColor(booking.leadScore)}`}
                  >
                    {booking.leadScore}
                  </span>
                )}
                <Badge>{booking.status}</Badge>
              </div>
            </button>
            {expandedId === booking.id && (
              <div className="space-y-3 border-t border-rule/75 bg-paper/40 p-4 text-sm">
                <p><strong>Service:</strong> {booking.service}</p>
                <p><strong>Location:</strong> {booking.location}</p>
                <p><strong>Description:</strong> {booking.description}</p>
                <Textarea
                  placeholder="Admin notes"
                  value={notes[booking.id] ?? booking.adminNotes ?? ""}
                  onChange={(e) =>
                    setNotes((n) => ({ ...n, [booking.id]: e.target.value }))
                  }
                  rows={2}
                />
                <div className="flex flex-wrap gap-2">
                  {validNextStatuses(booking.status).map((next) => (
                    <Button
                      key={next}
                      size="sm"
                      variant="outline"
                      disabled={updateStatus.isPending}
                      onClick={() => handleStatusChange(booking.id, next)}
                    >
                      → {next}
                    </Button>
                  ))}
                  {validNextStatuses(booking.status).length === 0 && (
                    <p className="text-muted">No further status changes.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {data && data.totalPages > 1 && (
        <div className="flex gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted self-center">
            Page {page} of {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
