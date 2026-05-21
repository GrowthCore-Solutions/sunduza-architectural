"use client";

import * as React from "react";
import { BookingStatus } from "@prisma/client";
import { useAdminBookings, useUpdateBookingStatus } from "@/src/client/hooks/admin/useAdminBookings";
import { useAdminUI } from "@/src/client/stores/admin-ui";
import { validNextStatuses, leadScoreColor } from "@/src/client/lib/booking-status";
import { ApiClientError } from "@/lib/api-client";
import { Badge } from "@/src/client/components/ui/badge";
import { Button } from "@/src/client/components/ui/button";
import { Input } from "@/src/client/components/ui/input";
import { Textarea } from "@/src/client/components/ui/textarea";
import { cn } from "@/lib/utils";

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
    <div>
      <h1 className="font-serif text-2xl font-black mb-6">Bookings</h1>
      <div className="flex flex-wrap gap-2 mb-4 border-b border-[--color-rule] pb-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => {
              setBookingStatusFilter(tab.value);
              setPage(1);
            }}
            className={cn(
              "px-3 py-1.5 text-sm rounded-sm",
              bookingStatusFilter === tab.value
                ? "bg-[--color-primary] text-white"
                : "text-[--color-muted] hover:bg-[--color-paper2]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <Input
        placeholder="Search name or email…"
        value={bookingSearch}
        onChange={(e) => setBookingSearch(e.target.value)}
        className="max-w-sm mb-6"
      />
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {isLoading && <p className="text-[--color-muted]">Loading…</p>}
      <div className="space-y-2">
        {filtered.map((booking) => (
          <div key={booking.id} className="rounded-sm border border-[--color-rule] bg-white">
            <button
              type="button"
              className="w-full flex items-center justify-between p-4 text-left text-sm"
              onClick={() =>
                setExpandedId(expandedId === booking.id ? null : booking.id)
              }
            >
              <div>
                <p className="font-medium">{booking.name}</p>
                <p className="text-[--color-muted]">{booking.email}</p>
              </div>
              <div className="flex items-center gap-2">
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
              <div className="border-t border-[--color-rule] p-4 space-y-3 text-sm">
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
                    <p className="text-[--color-muted]">No further status changes.</p>
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
          <span className="text-sm text-[--color-muted] self-center">
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
