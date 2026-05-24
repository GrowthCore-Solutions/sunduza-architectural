"use client";

import * as React from "react";
import {
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Users,
  Calendar,
  TrendingUp,
} from "lucide-react";
import {
  useAdminLeads,
  useAdminLead,
} from "@/frontend/hooks/admin/useAdminLeads";
import { Button } from "@/frontend/components/ui/button";
import { leadTone } from "@/shared/lib/lead-score";
import { BOOKING_STATUS_TONE } from "@/frontend/lib/booking-display";

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatRelative(date: Date | string): string {
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
}

function LeadDetail({ id }: { id: string }) {
  const { data, isLoading } = useAdminLead(id);

  if (isLoading) {
    return (
      <div className="admin-list-empty">
        <p>Loading lead history…</p>
      </div>
    );
  }
  if (!data) return null;

  const { lead, bookings } = data;

  return (
    <div className="admin-booking-body">
      <div className="admin-booking-detail-block">
        <div className="admin-detail-row">
          <span className="admin-detail-key">
            <Mail size={11} style={{ display: "inline", verticalAlign: "-1px", marginRight: "0.3rem" }} />
            Email
          </span>
          <span className="admin-detail-val">
            <a
              href={`mailto:${lead.email}`}
              style={{ color: "var(--color-primary)", textDecoration: "none" }}
            >
              {lead.email}
            </a>
          </span>
        </div>
        {lead.phone && (
          <div className="admin-detail-row">
            <span className="admin-detail-key">
              <Phone size={11} style={{ display: "inline", verticalAlign: "-1px", marginRight: "0.3rem" }} />
              Phone
            </span>
            <span className="admin-detail-val">{lead.phone}</span>
          </div>
        )}
        <div className="admin-detail-row">
          <span className="admin-detail-key">First seen</span>
          <span className="admin-detail-val">{formatDate(lead.firstSeenAt)}</span>
        </div>
        <div className="admin-detail-row">
          <span className="admin-detail-key">Last activity</span>
          <span className="admin-detail-val">{formatRelative(lead.lastSeenAt)}</span>
        </div>
        <div className="admin-detail-row">
          <span className="admin-detail-key">Total bookings</span>
          <span className="admin-detail-val">{lead.bookingCount}</span>
        </div>
      </div>

      <div>
        <p className="admin-action-block-title">Booking history</p>
        {bookings.length === 0 ? (
          <p style={{ fontSize: "0.85rem", color: "var(--color-muted)", fontStyle: "italic" }}>
            No bookings on file for this lead.
          </p>
        ) : (
          <div className="admin-list">
            {bookings.map((b) => (
              <div key={b.id} className="admin-list-row">
                <div className="admin-list-row-main">
                  <p className="admin-list-row-title">{b.service}</p>
                  <p className="admin-list-row-sub">
                    {formatDate(b.createdAt)} · {b.location}
                  </p>
                </div>
                <div className="admin-list-row-side">
                  {b.leadScore !== null && (
                    <span
                      className="admin-lead"
                      data-tone={leadTone(b.leadScore)}
                      aria-label={`Lead score ${b.leadScore} out of 100`}
                    >
                      {b.leadScore}
                      <span className="admin-lead-suffix">/100</span>
                    </span>
                  )}
                  <span className="admin-pill" data-tone={BOOKING_STATUS_TONE[b.status]}>
                    <span className="admin-pill-dot" aria-hidden="true" />
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminLeadsPage() {
  const [page, setPage] = React.useState(1);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const { data, isLoading } = useAdminLeads({ page });

  const repeatCount =
    data?.leads.filter((l) => l.bookingCount >= 2).length ?? 0;

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <p className="admin-page-head-eyebrow">Customer relationships</p>
          <h1 className="admin-page-head-title">
            Leads &amp;<br />
            <em>repeat enquirers.</em>
          </h1>
          <p className="admin-page-head-sub">
            Every unique email that has ever submitted a booking, with the full
            history attached. Repeat visitors light up here.
          </p>
        </div>
        {data && (
          <div className="admin-page-head-actions">
            <span className="admin-pill" data-tone="primary">
              {data.total} total
            </span>
            <span className="admin-pill" data-tone="success">
              <TrendingUp size={11} strokeWidth={2} /> {repeatCount} repeat
            </span>
          </div>
        )}
      </header>

      {isLoading && (
        <div className="admin-list-empty">
          <span className="admin-list-empty-icon">
            <Users size={18} strokeWidth={1.75} />
          </span>
          <p>Loading leads…</p>
        </div>
      )}

      {!isLoading && (!data || data.leads.length === 0) && (
        <div
          className="admin-list-empty"
          style={{
            background: "#fff",
            border: "1px dashed var(--color-rule)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <span className="admin-list-empty-icon">
            <Users size={18} strokeWidth={1.75} />
          </span>
          <p>No leads on file yet.</p>
        </div>
      )}

      <div>
        {data?.leads.map((lead) => {
          const open = expandedId === lead.id;
          return (
            <article key={lead.id} className="admin-booking" data-open={open}>
              <button
                type="button"
                className="admin-booking-summary"
                onClick={() => setExpandedId(open ? null : lead.id)}
                aria-expanded={open}
              >
                <div className="admin-booking-summary-main">
                  <p className="admin-booking-summary-name">{lead.name}</p>
                  <div className="admin-booking-summary-meta">
                    <span>{lead.email}</span>
                    {lead.phone && <span>{lead.phone}</span>}
                    <span>
                      <Calendar
                        size={11}
                        style={{
                          display: "inline",
                          verticalAlign: "-1px",
                          marginRight: "0.3rem",
                        }}
                      />
                      {formatRelative(lead.lastSeenAt)}
                    </span>
                  </div>
                </div>
                <div className="admin-booking-summary-side">
                  <span
                    className="admin-pill"
                    data-tone={lead.bookingCount >= 2 ? "success" : "neutral"}
                  >
                    {lead.bookingCount} booking{lead.bookingCount === 1 ? "" : "s"}
                  </span>
                  {open ? (
                    <ChevronUp size={15} strokeWidth={2} aria-hidden="true" />
                  ) : (
                    <ChevronDown size={15} strokeWidth={2} aria-hidden="true" />
                  )}
                </div>
              </button>

              {open && <LeadDetail id={lead.id} />}
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
