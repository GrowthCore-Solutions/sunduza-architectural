"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { BookingStatus } from "@prisma/client";
import { Search, MessageCircle, ChevronUp, ChevronDown, Calendar, MapPin, Phone, Mail } from "lucide-react";
import { Input } from "@/src/client/components/ui/input";
import { Button } from "@/src/client/components/ui/button";
import { Badge } from "@/src/client/components/ui/badge";
import { Skeleton } from "@/src/client/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useBookings, useUpdateBookingStatus, type AdminBooking } from "@/src/client/hooks/use-bookings";
import { useAdminUI } from "@/src/client/stores/admin-ui";

const SERVICE_LABELS: Record<string, string> = {
  house_planning: "House Planning",
  arch_drawings: "Architectural Drawings",
  drafting_services: "Drafting Services",
  dev_project_planning: "Development Project Planning",
};

const STATUS_TABS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "CONTACTED", label: "Contacted" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "COMPLETED", label: "Completed" },
  { key: "REJECTED", label: "Rejected" },
];

const NEXT_STATUS: Record<string, BookingStatus> = {
  PENDING: BookingStatus.CONTACTED,
  CONTACTED: BookingStatus.CONFIRMED,
  CONFIRMED: BookingStatus.COMPLETED,
};
const NEXT_LABEL: Record<string, string> = {
  PENDING: "Mark Contacted",
  CONTACTED: "Mark Confirmed",
  CONFIRMED: "Mark Completed",
};

function LeadScore({ score }: { score: number | null }) {
  if (score === null) return <span className="text-[--color-muted]">—</span>;
  const color = score >= 70 ? "text-green-600" : score >= 40 ? "text-amber-600" : "text-red-500";
  return <span className={`font-bold text-sm ${color}`}>{score}</span>;
}

function BookingCard({ booking, onUpdate }: { booking: AdminBooking; onUpdate: () => void }) {
  const [notesOpen, setNotesOpen] = React.useState(false);
  const [notes, setNotes] = React.useState(booking.adminNotes ?? "");
  const { mutate: updateStatus, isPending } = useUpdateBookingStatus();

  const waUrl = `https://wa.me/${booking.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${booking.name}, this is Sunduza Architectural regarding your ${SERVICE_LABELS[booking.service] ?? booking.service} enquiry.`)}`;

  function advance() {
    const next = NEXT_STATUS[booking.status];
    if (!next) return;
    updateStatus({ id: booking.id, status: next, adminNotes: notes || undefined }, { onSuccess: onUpdate });
  }

  function reject() {
    updateStatus({ id: booking.id, status: BookingStatus.REJECTED, adminNotes: notes || undefined }, { onSuccess: onUpdate });
  }

  const statusVariant: Record<string, "pending" | "contacted" | "confirmed" | "completed" | "rejected"> = {
    PENDING: "pending", CONTACTED: "contacted", CONFIRMED: "confirmed",
    COMPLETED: "completed", REJECTED: "rejected",
  };

  return (
    <div className="rounded-sm border border-[--color-rule] bg-white p-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-[--color-ink]">{booking.name}</h3>
            <Badge variant={statusVariant[booking.status] ?? "default"}>{booking.status}</Badge>
            <span className="text-xs text-[--color-muted]">Score: <LeadScore score={booking.leadScore} /></span>
          </div>
          <div className="flex flex-wrap gap-3 mt-1 text-xs text-[--color-muted]">
            <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{booking.email}</span>
            <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{booking.phone}</span>
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{booking.location}</span>
            {booking.meetingDate && (
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />
                {new Date(booking.meetingDate).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            )}
          </div>
        </div>
        <a href={waUrl} target="_blank" rel="noopener noreferrer">
          <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50">
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
          </Button>
        </a>
      </div>

      {/* Service + budget */}
      <p className="text-sm font-medium text-[--color-ink] mb-1">
        {SERVICE_LABELS[booking.service] ?? booking.service}
        {booking.budget && <span className="text-[--color-muted] font-normal"> · {booking.budget}</span>}
      </p>
      <p className="text-sm text-[--color-muted] leading-relaxed line-clamp-2 mb-3">{booking.description}</p>

      {/* Notes */}
      {booking.adminNotes && (
        <div className="mb-3 rounded-sm bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
          <strong>Notes:</strong> {booking.adminNotes}
        </div>
      )}

      {/* Actions */}
      {booking.status !== "COMPLETED" && booking.status !== "REJECTED" && (
        <div className="flex flex-wrap gap-2 items-center">
          {NEXT_STATUS[booking.status] && (
            <Button size="sm" onClick={advance} disabled={isPending}>
              {NEXT_LABEL[booking.status]}
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => setNotesOpen(!notesOpen)} className="text-[--color-muted]">
            {notesOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            Notes
          </Button>
          <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={reject} disabled={isPending}>
            Reject
          </Button>
        </div>
      )}

      {notesOpen && (
        <div className="mt-3 flex gap-2">
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add admin note…"
            className="text-sm"
          />
          <Button size="sm" variant="outline" onClick={() => {
            updateStatus({ id: booking.id, status: booking.status as BookingStatus, adminNotes: notes }, { onSuccess: () => { setNotesOpen(false); onUpdate(); } });
          }} disabled={isPending}>Save</Button>
        </div>
      )}
    </div>
  );
}

export default function AdminBookingsPage() {
  const searchParams = useSearchParams();
  const { bookingStatusFilter, bookingSearch, setBookingStatusFilter, setBookingSearch } = useAdminUI();
  const [sort, setSort] = React.useState<"date" | "score">("date");

  const initialStatus = searchParams.get("status") ?? "all";
  React.useEffect(() => {
    if (initialStatus !== "all") setBookingStatusFilter(initialStatus as BookingStatus);
  }, []);

  const { data, isLoading, refetch } = useBookings({
    status: bookingStatusFilter !== "all" ? bookingStatusFilter as BookingStatus : undefined,
    search: bookingSearch || undefined,
    sort,
  });

  const bookings = data?.bookings ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[--color-ink]">Bookings</h1>
        <p className="text-[--color-muted] mt-1">Manage consultation requests · {data?.total ?? 0} total</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setBookingStatusFilter(tab.key as BookingStatus | "all")}
              className={cn(
                "px-3 py-1.5 rounded-sm text-sm font-medium border transition-colors",
                bookingStatusFilter === tab.key
                  ? "bg-[--color-primary] text-white border-[--color-primary]"
                  : "bg-white text-[--color-muted] border-[--color-rule] hover:border-[--color-primary]"
              )}
            >{tab.label}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[--color-muted]" />
            <Input
              placeholder="Search…"
              value={bookingSearch}
              onChange={(e) => setBookingSearch(e.target.value)}
              className="pl-9 w-48"
            />
          </div>
          <Button size="sm" variant="outline" onClick={() => setSort(sort === "date" ? "score" : "date")}>
            Sort: {sort === "date" ? "Date" : "Score"}
          </Button>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-36" />)}
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-sm border border-[--color-rule] bg-[--color-paper2] p-16 text-center">
          <Calendar className="h-12 w-12 mx-auto text-[--color-rule] mb-3" />
          <p className="text-[--color-muted]">No bookings found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} onUpdate={refetch} />
          ))}
        </div>
      )}
    </div>
  );
}
