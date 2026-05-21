"use client";

import * as React from "react";
import {
  useAdminTestimonials,
  useAdminTestimonialMutations,
} from "@/src/client/hooks/admin/useAdminTestimonials";
import { Button } from "@/src/client/components/ui/button";
import { Input } from "@/src/client/components/ui/input";
import { Textarea } from "@/src/client/components/ui/textarea";
import { StarRating } from "@/src/client/components/features/StarRating";

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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-black">Testimonials</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add testimonial"}
        </Button>
      </div>
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-8 rounded-sm border border-[--color-rule] bg-white p-6 space-y-3"
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
      {isLoading && <p className="text-[--color-muted]">Loading…</p>}
      <div className="space-y-3">
        {testimonials?.map((t) => (
          <div
            key={t.id}
            className="rounded-sm border border-[--color-rule] bg-white p-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{t.clientName}</p>
                {t.rating && <StarRating rating={t.rating} className="my-2" />}
                <p className="text-sm text-[--color-muted] line-clamp-2">{t.review}</p>
              </div>
              <div className="flex gap-2 shrink-0">
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
