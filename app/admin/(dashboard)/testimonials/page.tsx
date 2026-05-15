"use client";

import * as React from "react";
import { Plus, Pencil, Trash2, Star, CheckCircle2 } from "lucide-react";
import { Button } from "@/src/client/components/ui/button";
import { Input } from "@/src/client/components/ui/input";
import { Label } from "@/src/client/components/ui/label";
import { Skeleton } from "@/src/client/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useAdminTestimonials, useCreateTestimonial, useUpdateTestimonial, useDeleteTestimonial,
  type AdminTestimonial,
} from "@/src/client/hooks/use-admin-testimonials";

interface TestimonialForm { clientName: string; review: string; rating: number; isActive: boolean; }
const EMPTY: TestimonialForm = { clientName: "", review: "", rating: 5, isActive: true };

function TestimonialModal({ editing, onClose }: { editing: AdminTestimonial | null; onClose: () => void }) {
  const [form, setForm] = React.useState<TestimonialForm>(
    editing ? { clientName: editing.clientName, review: editing.review, rating: editing.rating ?? 5, isActive: editing.isActive } : EMPTY
  );
  const create = useCreateTestimonial();
  const update = useUpdateTestimonial();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) await update.mutateAsync({ id: editing.id, ...form });
    else await create.mutateAsync({ ...form, projectId: null } as Omit<AdminTestimonial, "id" | "createdAt" | "project">);
    onClose();
  }
  const saving = create.isPending || update.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-sm border border-[--color-rule] bg-white p-6 shadow-xl">
        <h2 className="font-serif text-xl font-bold text-[--color-ink] mb-5">{editing ? "Edit Testimonial" : "New Testimonial"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="clientName" required>Client Name</Label>
            <Input id="clientName" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} required placeholder="e.g. Thandi M." />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="review" required>Review</Label>
            <textarea id="review" value={form.review} onChange={(e) => setForm({ ...form, review: e.target.value })} required rows={4} placeholder="What did the client say?" className="flex w-full rounded-sm border border-[--color-rule] bg-white px-3 py-2 text-sm focus:border-[--color-primary] focus:outline-none focus:ring-2 focus:ring-[--color-primary]/20 resize-none" />
          </div>
          <div className="space-y-1.5">
            <Label>Rating</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((r) => (
                <button key={r} type="button" onClick={() => setForm({ ...form, rating: r })}>
                  <Star className={cn("h-7 w-7 transition-colors", r <= form.rating ? "fill-[--color-primary] text-[--color-primary]" : "text-[--color-rule]")} />
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-[--color-primary]" />
            <span className="text-sm text-[--color-ink]">Active (visible on site)</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : editing ? "Update" : "Create"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminTestimonialsPage() {
  const { data, isLoading } = useAdminTestimonials();
  const deleteT = useDeleteTestimonial();
  const updateT = useUpdateTestimonial();
  const [modal, setModal] = React.useState<"new" | AdminTestimonial | null>(null);

  const testimonials = data?.testimonials ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[--color-ink]">Testimonials</h1>
          <p className="text-[--color-muted] mt-1">{testimonials.length} reviews</p>
        </div>
        <Button onClick={() => setModal("new")}><Plus className="h-4 w-4" /> Add Testimonial</Button>
      </div>

      {isLoading ? <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}</div>
        : testimonials.length === 0 ? (
          <div className="rounded-sm border border-[--color-rule] bg-[--color-paper2] p-16 text-center"><p className="text-[--color-muted]">No testimonials yet.</p></div>
        ) : (
          <div className="space-y-3">
            {testimonials.map((t) => (
              <div key={t.id} className={cn("rounded-sm border bg-white p-5", t.isActive ? "border-[--color-rule]" : "border-[--color-rule] opacity-60")}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="font-semibold text-[--color-ink]">{t.clientName}</h3>
                      {t.rating && <div className="flex gap-0.5">{[1,2,3,4,5].map((r) => <Star key={r} className={cn("h-3.5 w-3.5", r <= t.rating! ? "fill-[--color-primary] text-[--color-primary]" : "text-[--color-rule]")} />)}</div>}
                      {!t.isActive && <span className="text-xs text-[--color-muted] bg-[--color-paper2] px-2 py-0.5 rounded-full">Hidden</span>}
                    </div>
                    <p className="text-sm text-[--color-muted] italic">"{t.review}"</p>
                    {t.project && <p className="text-xs text-[--color-primary] mt-1">Re: {t.project.title}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => updateT.mutate({ id: t.id, isActive: !t.isActive })} title={t.isActive ? "Hide" : "Show"} className="rounded-sm p-1.5 text-[--color-muted] hover:bg-[--color-paper2] transition-colors">
                      <CheckCircle2 className={cn("h-4 w-4", t.isActive && "text-[--color-primary]")} />
                    </button>
                    <button onClick={() => setModal(t)} className="rounded-sm p-1.5 text-[--color-muted] hover:bg-[--color-paper2] transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => { if (confirm(`Delete "${t.clientName}"'s review?`)) deleteT.mutate(t.id); }} className="rounded-sm p-1.5 text-[--color-muted] hover:bg-red-50 hover:text-red-600 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      {modal && <TestimonialModal editing={modal === "new" ? null : modal} onClose={() => setModal(null)} />}
    </div>
  );
}
