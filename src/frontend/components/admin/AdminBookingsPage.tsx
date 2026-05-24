"use client";

import * as React from "react";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Mail,
  MapPin,
  Phone,
  Search,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { BookingStatus } from "@prisma/client";
import {
  useAdminBookings,
  useUpdateBookingStatus,
} from "@/frontend/hooks/admin/useAdminBookings";
import { useAdminUI } from "@/frontend/stores/admin-ui";
import { validNextStatuses } from "@/shared/lib/booking-transitions";
import { leadTone } from "@/shared/lib/lead-score";
import { BOOKING_STATUS_TONE } from "@/frontend/lib/booking-display";
import { ApiClientError } from "@/frontend/lib/api-client";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Textarea } from "@/frontend/components/ui/textarea";

const STATUS_TABS: { label: string; value: BookingStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: BookingStatus.PENDING },
  { label: "Contacted", value: BookingStatus.CONTACTED },
  { label: "Confirmed", value: BookingStatus.CONFIRMED },
  { label: "Completed", value: BookingStatus.COMPLETED },
  { label: "Rejected", value: BookingStatus.REJECTED },
];

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AdminBookingsPage() {
  const {
    bookingStatusFilter,
    setBookingStatusFilter,
    bookingSearch,
    setBookingSearch,
  } = useAdminUI();
  const [page, setPage] = React.useState(1);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [notes, setNotes] = React.useState<Record<string, string>>({});
  const [error, setError] = React.useState<string | null>(null);

  const { data, isLoading } = useAdminBookings({
    status: bookingStatusFilter,
    page,
  });
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
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <p className="admin-page-head-eyebrow">Lead pipeline</p>
          <h1 className="admin-page-head-title">
            Bookings &amp;<br />
            <em>consultations.</em>
          </h1>
          <p className="admin-page-head-sub">
            Move enquiries through the pipeline &mdash; pending, contacted,
            confirmed, completed. Search by name, email, or phone.
          </p>
        </div>
        {data && (
          <div className="admin-page-head-actions">
            <span className="admin-pill" data-tone="primary">
              {data.total} total
            </span>
          </div>
        )}
      </header>

      <div className="admin-filter-bar">
        <div className="admin-tabs">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className="admin-tab"
              data-active={bookingStatusFilter === tab.value}
              onClick={() => {
                setBookingStatusFilter(tab.value);
                setPage(1);
                setExpandedId(null);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="admin-search">
          <Search
            size={14}
            strokeWidth={2}
            className="admin-search-icon"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search name, email, or phone…"
            value={bookingSearch}
            onChange={(e) => setBookingSearch(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="admin-notice" data-tone="danger" role="alert">
          <AlertCircle size={15} strokeWidth={2} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {isLoading && (
        <div className="admin-list-empty">
          <span className="admin-list-empty-icon">
            <Calendar size={18} strokeWidth={1.75} />
          </span>
          <p>Loading bookings…</p>
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="admin-list-empty" style={{ background: "#fff", border: "1px dashed var(--color-rule)", borderRadius: "var(--radius-md)" }}>
          <span className="admin-list-empty-icon">
            <Calendar size={18} strokeWidth={1.75} />
          </span>
          <p>No bookings match these filters.</p>
        </div>
      )}

      <div>
        {filtered.map((booking) => {
          const open = expandedId === booking.id;
          const transitions = validNextStatuses(booking.status);
          return (
            <article
              key={booking.id}
              className="admin-booking"
              data-open={open}
            >
              <button
                type="button"
                className="admin-booking-summary"
                onClick={() => setExpandedId(open ? null : booking.id)}
                aria-expanded={open}
              >
                <div className="admin-booking-summary-main">
                  <p className="admin-booking-summary-name">{booking.name}</p>
                  <div className="admin-booking-summary-meta">
                    <span>{booking.service}</span>
                    <span>{booking.email}</span>
                    <span>{formatDate(booking.createdAt)}</span>
                  </div>
                </div>
                <div className="admin-booking-summary-side">
                  {booking.leadScore !== null && (
                    <span
                      className="admin-lead"
                      data-tone={leadTone(booking.leadScore)}
                      aria-label={`Lead score ${booking.leadScore} out of 100`}
                    >
                      {booking.leadScore}
                      <span className="admin-lead-suffix">/100</span>
                    </span>
                  )}
                  <span
                    className="admin-pill"
                    data-tone={BOOKING_STATUS_TONE[booking.status]}
                  >
                    <span className="admin-pill-dot" aria-hidden="true" />
                    {booking.status}
                  </span>
                  {open ? (
                    <ChevronUp size={15} strokeWidth={2} aria-hidden="true" />
                  ) : (
                    <ChevronDown size={15} strokeWidth={2} aria-hidden="true" />
                  )}
                </div>
              </button>

              {open && (
                <div className="admin-booking-body">
                  <div className="admin-booking-detail-block">
                    <div className="admin-detail-row">
                      <span className="admin-detail-key">
                        <Mail size={11} style={{ display: "inline", verticalAlign: "-1px", marginRight: "0.3rem" }} />
                        Email
                      </span>
                      <span className="admin-detail-val">
                        <a
                          href={`mailto:${booking.email}`}
                          style={{ color: "var(--color-primary)", textDecoration: "none" }}
                        >
                          {booking.email}
                        </a>
                      </span>
                    </div>
                    <div className="admin-detail-row">
                      <span className="admin-detail-key">
                        <Phone size={11} style={{ display: "inline", verticalAlign: "-1px", marginRight: "0.3rem" }} />
                        Phone
                      </span>
                      <span className="admin-detail-val">{booking.phone}</span>
                    </div>
                    <div className="admin-detail-row">
                      <span className="admin-detail-key">
                        <MapPin size={11} style={{ display: "inline", verticalAlign: "-1px", marginRight: "0.3rem" }} />
                        Location
                      </span>
                      <span className="admin-detail-val">{booking.location}</span>
                    </div>
                    <div className="admin-detail-row">
                      <span className="admin-detail-key">Service</span>
                      <span className="admin-detail-val">{booking.service}</span>
                    </div>
                    <div className="admin-detail-row">
                      <span className="admin-detail-key">Brief</span>
                      <span className="admin-detail-val">
                        {booking.description}
                      </span>
                    </div>
                    <div className="admin-detail-row">
                      <span className="admin-detail-key">Received</span>
                      <span className="admin-detail-val">
                        {formatDate(booking.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="admin-booking-actions">
                    <div>
                      <p className="admin-action-block-title">Admin notes</p>
                      <Textarea
                        placeholder="Internal notes &mdash; only visible here"
                        value={notes[booking.id] ?? booking.adminNotes ?? ""}
                        onChange={(e) =>
                          setNotes((n) => ({
                            ...n,
                            [booking.id]: e.target.value,
                          }))
                        }
                        rows={3}
                      />
                    </div>

                    <div>
                      <p className="admin-action-block-title">Move to</p>
                      {transitions.length === 0 ? (
                        <p
                          style={{
                            fontSize: "0.85rem",
                            color: "var(--color-muted)",
                            fontStyle: "italic",
                          }}
                        >
                          No further transitions available.
                        </p>
                      ) : (
                        <div className="admin-transition-list">
                          {transitions.map((next) => (
                            <Button
                              key={next}
                              size="sm"
                              variant="outline"
                              disabled={updateStatus.isPending}
                              onClick={() => handleStatusChange(booking.id, next)}
                            >
                              {next} <ArrowRight size={12} />
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {data && data.totalPages > 1 && (
        <div className="admin-pagination">
          <span className="admin-pagination-info">
            Page <strong>{page}</strong> of {data.totalPages} &middot;{" "}
            {data.total} total
          </span>
          <div className="admin-pagination-actions">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
