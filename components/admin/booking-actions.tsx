"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api-client";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const NEXT_STATUS: Record<string, string> = {
  new: "contacted",
  contacted: "in_review",
  in_review: "confirmed",
  confirmed: "completed",
};

const STATUS_LABELS: Record<string, string> = {
  new: "Mark Contacted",
  contacted: "Start Review",
  in_review: "Confirm",
  confirmed: "Mark Done",
};

interface BookingActionsProps {
  bookingId: string;
  currentStatus: string;
  onUpdate: () => void;
}

export function BookingActions({
  bookingId,
  currentStatus,
  onUpdate,
}: BookingActionsProps) {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  async function advance() {
    setLoading(true);
    try {
      const next = NEXT_STATUS[currentStatus];
      if (!next) return;
      await api.patch("/api/admin/bookings", {
        id: bookingId,
        status: next,
        notes,
      });
      onUpdate();
    } finally {
      setLoading(false);
    }
  }

  async function cancel() {
    setLoading(true);
    try {
      await api.patch("/api/admin/bookings", {
        id: bookingId,
        status: "cancelled",
        notes,
      });
      onUpdate();
    } finally {
      setLoading(false);
    }
  }

  if (currentStatus === "completed" || currentStatus === "cancelled") {
    return (
      <div className="flex items-center gap-2">
        <BookingStatusBadge status={currentStatus} />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <BookingStatusBadge status={currentStatus} />
        {NEXT_STATUS[currentStatus] && (
          <Button
            size="sm"
            onClick={advance}
            disabled={loading}
          >
            {STATUS_LABELS[currentStatus] ?? "Advance"}
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowNotes(!showNotes)}
        >
          Notes
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-red-600 hover:text-red-700"
          onClick={cancel}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>

      {showNotes && (
        <div className="flex gap-2">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add a note..."
            rows={2}
            className="flex-1"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              setLoading(true);
              try {
                await api.patch("/api/admin/bookings", {
                  id: bookingId,
                  status: currentStatus,
                  notes,
                });
                setShowNotes(false);
                onUpdate();
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            Save
          </Button>
        </div>
      )}
    </div>
  );
}
