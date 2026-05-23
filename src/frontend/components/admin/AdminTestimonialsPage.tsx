"use client";

import * as React from "react";
import { Eye, EyeOff, Plus, Star, Trash2, X } from "lucide-react";
import {
  useAdminTestimonials,
  useAdminTestimonialMutations,
} from "@/frontend/hooks/admin/useAdminTestimonials";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { Textarea } from "@/frontend/components/ui/textarea";

const EMPTY_FORM = {
  clientName: "",
  review: "",
  rating: 5,
  isActive: true,
};

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div
      style={{ display: "inline-flex", gap: "0.15rem" }}
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          strokeWidth={1.75}
          fill={i < rating ? "currentColor" : "none"}
          style={{
            color:
              i < rating
                ? "var(--color-primary)"
                : "var(--color-rule)",
          }}
        />
      ))}
    </div>
  );
}

export function AdminTestimonialsPage() {
  const { data: testimonials, isLoading } = useAdminTestimonials();
  const { create, update, remove } = useAdminTestimonialMutations();
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState(EMPTY_FORM);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await create.mutateAsync(form);
    setShowForm(false);
    setForm(EMPTY_FORM);
  }

  const total = testimonials?.length ?? 0;
  const live = testimonials?.filter((t) => t.isActive).length ?? 0;
  const avg = total
    ? (
        (testimonials?.reduce((sum, t) => sum + (t.rating ?? 0), 0) ?? 0) /
        total
      ).toFixed(1)
    : "—";

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <p className="admin-page-head-eyebrow">Social proof</p>
          <h1 className="admin-page-head-title">
            Reviews &amp;<br />
            <em>testimonials.</em>
          </h1>
          <p className="admin-page-head-sub">
            What clients have said. Hide drafts and unverified reviews; only
            active ones show on the public site.
          </p>
        </div>
        <div className="admin-page-head-actions">
          <span className="admin-pill" data-tone="neutral">
            {total} total
          </span>
          <span className="admin-pill" data-tone="success">
            {live} live
          </span>
          <span className="admin-pill" data-tone="primary">
            {avg} avg
          </span>
          <Button
            onClick={() => setShowForm((s) => !s)}
            variant={showForm ? "outline" : "default"}
            size="sm"
          >
            {showForm ? (
              <>
                <X size={14} /> Cancel
              </>
            ) : (
              <>
                <Plus size={14} /> Add testimonial
              </>
            )}
          </Button>
        </div>
      </header>

      {showForm && (
        <form onSubmit={handleCreate} className="admin-form">
          <div className="admin-form-head">
            <h2 className="admin-form-title">New testimonial</h2>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowForm(false)}
              aria-label="Close form"
            >
              <X size={16} />
            </Button>
          </div>

          <div className="admin-form-grid">
            <div className="admin-form-field">
              <Label htmlFor="clientName" required>
                Client name
              </Label>
              <Input
                id="clientName"
                placeholder="e.g. Thandi N."
                value={form.clientName}
                onChange={(e) =>
                  setForm({ ...form, clientName: e.target.value })
                }
                required
              />
            </div>

            <div className="admin-form-field">
              <Label htmlFor="rating">Rating (1–5)</Label>
              <Input
                id="rating"
                type="number"
                min={1}
                max={5}
                value={form.rating}
                onChange={(e) =>
                  setForm({ ...form, rating: Number(e.target.value) })
                }
              />
            </div>

            <div className="admin-form-field admin-form-grid-full">
              <Label htmlFor="review" required>
                Review
              </Label>
              <Textarea
                id="review"
                placeholder="What did the client say about the work?"
                value={form.review}
                onChange={(e) => setForm({ ...form, review: e.target.value })}
                rows={4}
                required
              />
            </div>

            <label className="admin-toggle-row admin-form-grid-full">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.checked })
                }
              />
              <span>Publish on the public testimonials page</span>
            </label>
          </div>

          <div className="admin-form-foot">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Saving…" : "Save testimonial"}
            </Button>
          </div>
        </form>
      )}

      {isLoading && (
        <div className="admin-list-empty">
          <span className="admin-list-empty-icon">
            <Star size={18} strokeWidth={1.75} />
          </span>
          <p>Loading testimonials…</p>
        </div>
      )}

      {!isLoading && total === 0 && (
        <div
          className="admin-list-empty"
          style={{
            background: "#fff",
            border: "1px dashed var(--color-rule)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <span className="admin-list-empty-icon">
            <Star size={18} strokeWidth={1.75} />
          </span>
          <p>No testimonials yet.</p>
        </div>
      )}

      <div>
        {testimonials?.map((t) => (
          <article
            key={t.id}
            className="admin-testimonial-card"
            data-hidden={!t.isActive}
          >
            <div>
              <div className="admin-testimonial-head">
                <p className="admin-testimonial-name">{t.clientName}</p>
                {t.rating && <StarRow rating={t.rating} />}
                {!t.isActive && (
                  <span className="admin-pill" data-tone="neutral">
                    Hidden
                  </span>
                )}
              </div>
              <p className="admin-testimonial-review">{t.review}</p>
            </div>

            <div className="admin-testimonial-actions">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  update.mutate({
                    id: t.id,
                    data: { isActive: !t.isActive },
                  })
                }
              >
                {t.isActive ? (
                  <>
                    <EyeOff size={12} strokeWidth={2} />
                    Hide
                  </>
                ) : (
                  <>
                    <Eye size={12} strokeWidth={2} />
                    Show
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (confirm(`Delete testimonial from ${t.clientName}?`)) {
                    remove.mutate(t.id);
                  }
                }}
                style={{ color: "rgb(185 28 28)" }}
              >
                <Trash2 size={12} strokeWidth={2} />
                Delete
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
