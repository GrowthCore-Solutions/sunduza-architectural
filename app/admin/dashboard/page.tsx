"use client";

import * as React from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { BookingSchema } from "@/types/booking";

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  consultation_scheduled: "Consultation Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-50 text-blue-700",
  contacted: "bg-amber-50 text-amber-700",
  consultation_scheduled: "bg-purple-50 text-purple-700",
  in_progress: "bg-orange-50 text-orange-700",
  completed: "bg-green-50 text-green-700",
};

function formatDate(d: string) {
  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric", month: "short", year: "numeric",
  }).format(new Date(d));
}

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [bookings, setBookings] = React.useState<Array<{
    id: string; name: string; email: string; phone: string;
    service: string; location: string; status: string;
    createdAt: string; meetingDate: string;
  }>>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/admin/bookings")
      .then((r) => r.json())
      .then((d) => { if (d.success) setBookings(d.data.bookings); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#faf8f2]">
      {/* Admin header */}
      <header className="bg-[#0f172a] text-white">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/40">Admin</p>
            <p className="font-serif text-lg font-bold">{session?.user?.email ?? "Dashboard"}</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-white/60 hover:text-white">View Site</Link>
            <button onClick={() => signOut()} className="text-sm text-white/60 hover:text-white">Sign Out</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="font-serif text-3xl font-bold text-[#0f172a] mb-8">Bookings</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {["new", "contacted", "consultation_scheduled", "in_progress"].map((s) => (
            <div key={s} className="rounded-sm border border-[#e8ddd0] bg-white p-5">
              <div className="text-2xl font-bold text-[#0f172a]">
                {bookings.filter((b) => b.status === s).length}
              </div>
              <div className="text-xs text-[#5a5040] mt-1">{STATUS_LABELS[s]}</div>
            </div>
          ))}
        </div>

        {/* Bookings table */}
        {loading ? (
          <div className="text-center py-20 text-[#5a5040]">Loading...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 text-[#5a5040]">No bookings yet.</div>
        ) : (
          <div className="overflow-x-auto rounded-sm border border-[#e8ddd0] bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e8ddd0] bg-[#f5f0e8]">
                  <th className="px-4 py-3 text-left font-semibold text-[#0f172a]">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#0f172a]">Service</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#0f172a]">Location</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#0f172a]">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#0f172a]">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#0f172a]">Contact</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b border-[#e8ddd0] last:border-0 hover:bg-[#faf8f2]">
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#0f172a]">{b.name}</div>
                      <div className="text-xs text-[#5a5040]">{b.email}</div>
                    </td>
                    <td className="px-4 py-3 text-[#5a5040]">{b.service}</td>
                    <td className="px-4 py-3 text-[#5a5040]">{b.location}</td>
                    <td className="px-4 py-3 text-[#5a5040]">
                      <div>{formatDate(b.createdAt)}</div>
                      <div className="text-xs text-[#b88b4a]">Meeting: {formatDate(b.meetingDate)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[b.status] ?? "bg-gray-100 text-gray-700"}`}>
                        {STATUS_LABELS[b.status] ?? b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#5a5040]">{b.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
