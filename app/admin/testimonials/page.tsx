"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Star, Plus, Pencil, Trash2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Testimonial {
  id: string;
  clientName: string;
  review: string;
  rating: number;
  featured: boolean;
  createdAt: string;
}

interface TestimonialForm {
  clientName: string;
  review: string;
  rating: number;
  featured: boolean;
}

export default function AdminTestimonialsPage() {
  const { data: session, status } = useSession();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState<TestimonialForm>({
    clientName: "",
    review: "",
    rating: 5,
    featured: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") redirect("/admin/login");
  }, [status]);

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/testimonials");
      const data = await res.json();
      setTestimonials(data?.data?.testimonials ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") fetchTestimonials();
  }, [status, fetchTestimonials]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editing
        ? `/api/testimonials/${editing.id}`
        : "/api/testimonials";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Save failed");
      setShowForm(false);
      fetchTestimonials();
    } catch {
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(t: Testimonial) {
    if (!confirm(`Delete testimonial from "${t.clientName}"?`)) return;
    await fetch(`/api/testimonials/${t.id}`, { method: "DELETE" });
    fetchTestimonials();
  }

  async function toggleFeatured(t: Testimonial) {
    await fetch(`/api/testimonials/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: !t.featured }),
    });
    fetchTestimonials();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0e0e0e]">Testimonials</h1>
          <p className="text-[#5a5040] mt-1">
            {testimonials.length} testimonial{testimonials.length !== 1 ? "s" : ""} total.
          </p>
        </div>
        <Button onClick={() => {
          setEditing(null);
          setForm({ clientName: "", review: "", rating: 5, featured: false });
          setShowForm(true);
        }} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Testimonial
        </Button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-sm border border-[#c8bfa8] bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-[#0e0e0e] mb-4">
              {editing ? "Edit Testimonial" : "New Testimonial"}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0e0e0e] mb-1">Client Name</label>
                <Input
                  value={form.clientName}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                  required
                  placeholder="e.g. Thandi M."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0e0e0e] mb-1">Review</label>
                <textarea
                  value={form.review}
                  onChange={(e) => setForm({ ...form, review: e.target.value })}
                  required
                  rows={4}
                  className="w-full rounded-sm border border-[#c8bfa8] bg-white px-3 py-2 text-sm text-[#0e0e0e] focus:outline-none focus:ring-2 focus:ring-[#b88b4a] resize-none"
                  placeholder="What did the client say?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0e0e0e] mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm({ ...form, rating: r })}
                      className="text-2xl transition-transform hover:scale-110"
                    >
                      <Star
                        className={cn(
                          "h-7 w-7",
                          r <= form.rating
                            ? "fill-[#b88b4a] text-[#b88b4a]"
                            : "text-[#c8bfa8]"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="t-featured"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="h-4 w-4 accent-[#b88b4a]"
                />
                <label htmlFor="t-featured" className="text-sm text-[#0e0e0e]">
                  Feature on homepage
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : editing ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-sm border border-[#c8bfa8] bg-[#ede8de]" />
          ))}
        </div>
      ) : testimonials.length === 0 ? (
        <div className="rounded-sm border border-[#c8bfa8] bg-[#ede8de] p-12 text-center">
          <Star className="h-12 w-12 mx-auto text-[#c8bfa8] mb-3" />
          <p className="text-[#5a5040]">No testimonials yet. Add your first above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className={cn(
                "rounded-sm border border-[#c8bfa8] bg-white p-6",
                t.featured && "border-[#b88b4a] bg-[#fff8d6]"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-[#0e0e0e]">{t.clientName}</h3>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((r) => (
                        <Star
                          key={r}
                          className={cn(
                            "h-4 w-4",
                            r <= t.rating
                              ? "fill-[#b88b4a] text-[#b88b4a]"
                              : "text-[#c8bfa8]"
                          )}
                        />
                      ))}
                    </div>
                    {t.featured && (
                      <span className="rounded-full bg-[#b88b4a] px-2 py-0.5 text-xs font-bold text-white">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="text-[#5a5040] leading-relaxed italic">"{t.review}"</p>
                  <p className="text-xs text-[#c8bfa8] mt-2">
                    Added {new Date(t.createdAt).toLocaleDateString("en-ZA")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleFeatured(t)}
                    className={cn(
                      "flex items-center gap-1",
                      t.featured ? "text-[#b88b4a]" : "text-[#5a5040]"
                    )}
                  >
                    <CheckCircle className="h-4 w-4" />
                    {t.featured ? "Featured" : "Feature"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditing(t);
                      setForm({
                        clientName: t.clientName,
                        review: t.review,
                        rating: t.rating,
                        featured: t.featured,
                      });
                      setShowForm(true);
                    }}
                    className="text-[#5a5040]"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(t)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
