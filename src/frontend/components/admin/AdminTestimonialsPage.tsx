"use client";

import * as React from "react";
import {
  useAdminTestimonials,
  useAdminTestimonialMutations,
} from "@/frontend/hooks/admin/useAdminTestimonials";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Textarea } from "@/frontend/components/ui/textarea";
import { StarRating } from "@/frontend/components/features/StarRating";

export function AdminTestimonialsPage() {
  const { data: testimonials, isLoading } = useAdminTestimonials();
  const { create, update, remove } = useAdminTestimonialMutations();
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState({
    clientName: "",
    review: "",
    rating: 5,
    isActive: true,
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await create.mutateAsync(form);
    setShowForm(false);
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Social proof
          </p>
          <h1 className="mt-2 font-serif text-3xl font-black tracking-tight text-ink">
            Testimonials
          </h1>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add testimonial"}
        </Button>
      </div>
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-8 space-y-3 rounded-md border border-rule/75 bg-white p-6 shadow-soft"
        >
          <Input
            placeholder="Client name"
            value={form.clientName}
            onChange={(e) => setForm({ ...form, clientName: e.target.value })}
            required
          />
          <Textarea
            placeholder="Review"
            value={form.review}
            onChange={(e) => setForm({ ...form, review: e.target.value })}
            required
          />
          <Input
            type="number"
            min={1}
            max={5}
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
          />
          <Button type="submit" disabled={create.isPending}>
            Save
          </Button>
        </form>
      )}
      {isLoading && <p className="text-muted">Loading...</p>}
      <div className="space-y-3">
        {testimonials?.map((t) => (
          <div
            key={t.id}
            className="rounded-md border border-rule/75 bg-white p-4 shadow-sm shadow-ink/5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold text-ink">{t.clientName}</p>
                {t.rating && <StarRating rating={t.rating} className="my-2" />}
                <p className="text-sm text-muted line-clamp-2">{t.review}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    update.mutate({ id: t.id, data: { isActive: !t.isActive } })
                  }
                >
                  {t.isActive ? "Hide" : "Show"}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    if (confirm("Delete testimonial?")) remove.mutate(t.id);
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
