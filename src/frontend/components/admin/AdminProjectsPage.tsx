"use client";

import * as React from "react";
import Image from "next/image";
import {
  Plus,
  Star,
  Trash2,
  X,
  ImageIcon,
  FolderOpen,
} from "lucide-react";
import {
  useAdminProjects,
  useAdminProjectMutations,
} from "@/frontend/hooks/admin/useAdminProjects";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { Textarea } from "@/frontend/components/ui/textarea";

const CATEGORIES = ["Residential", "Commercial", "Development"] as const;

const EMPTY_FORM = {
  title: "",
  description: "",
  imagePath: "/images/projects/placeholder.webp",
  category: "Residential",
  isFeatured: false,
  sortOrder: 0,
};

export function AdminProjectsPage() {
  const { data: projects, isLoading } = useAdminProjects();
  const { create, update, remove } = useAdminProjectMutations();
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState(EMPTY_FORM);
  const [formError, setFormError] = React.useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    try {
      await create.mutateAsync(form);
      setShowForm(false);
      setForm(EMPTY_FORM);
    } catch {
      setFormError("Failed to save project. Please try again.");
    }
  }

  const total = projects?.length ?? 0;
  const featuredCount = projects?.filter((p) => p.isFeatured).length ?? 0;

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <p className="admin-page-head-eyebrow">Portfolio manager</p>
          <h1 className="admin-page-head-title">
            Projects &amp;<br />
            <em>case studies.</em>
          </h1>
          <p className="admin-page-head-sub">
            The work that shows up on the public site. Toggle featured to pin
            to the homepage spotlight.
          </p>
        </div>
        <div className="admin-page-head-actions">
          <span className="admin-pill" data-tone="neutral">
            {total} total
          </span>
          <span className="admin-pill" data-tone="primary">
            {featuredCount} featured
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
                <Plus size={14} /> Add project
              </>
            )}
          </Button>
        </div>
      </header>

      {showForm && (
        <form onSubmit={handleCreate} className="admin-form">
          <div className="admin-form-head">
            <h2 className="admin-form-title">New project</h2>
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
            <div className="admin-form-field admin-form-grid-full">
              <Label htmlFor="title" required>
                Title
              </Label>
              <Input
                id="title"
                placeholder="e.g. Hilltop Family Home"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="admin-form-field admin-form-grid-full">
              <Label htmlFor="description" required>
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="One or two paragraphs about the brief and outcome"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={4}
                required
              />
            </div>

            <div className="admin-form-field">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className="flex h-11 w-full rounded border border-rule/90 bg-white px-3 text-sm text-ink focus:border-primary focus:outline-none"
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-form-field">
              <Label htmlFor="sortOrder">Sort order</Label>
              <Input
                id="sortOrder"
                type="number"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm({ ...form, sortOrder: Number(e.target.value) })
                }
              />
            </div>

            <div className="admin-form-field admin-form-grid-full">
              <Label htmlFor="imagePath">Image path</Label>
              <Input
                id="imagePath"
                placeholder="/images/projects/yourfile.webp"
                value={form.imagePath}
                onChange={(e) =>
                  setForm({ ...form, imagePath: e.target.value })
                }
              />
            </div>

            <label className="admin-toggle-row admin-form-grid-full">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) =>
                  setForm({ ...form, isFeatured: e.target.checked })
                }
              />
              <span>Featured on homepage spotlight</span>
            </label>
          </div>

          {formError && (
            <p className="text-sm font-medium text-red-700" role="alert">
              {formError}
            </p>
          )}
          <div className="admin-form-foot">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Saving…" : "Save project"}
            </Button>
          </div>
        </form>
      )}

      {isLoading && (
        <div className="admin-list-empty">
          <span className="admin-list-empty-icon">
            <FolderOpen size={18} strokeWidth={1.75} />
          </span>
          <p>Loading projects…</p>
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
            <FolderOpen size={18} strokeWidth={1.75} />
          </span>
          <p>No projects yet. Add your first one above.</p>
        </div>
      )}

      <div className="admin-grid">
        {projects?.map((p) => (
          <article key={p.id} className="admin-project-card">
            <div className="admin-project-card-media">
              {p.imagePath ? (
                <Image
                  src={p.imagePath}
                  alt={p.title}
                  fill
                  sizes="(min-width: 1100px) 33vw, (min-width: 720px) 50vw, 100vw"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div className="admin-project-card-img-fallback">
                  <ImageIcon size={20} strokeWidth={1.5} />
                </div>
              )}
              <span className="admin-project-card-chip">
                {p.category ?? "Project"}
              </span>
              {p.isFeatured && (
                <span className="admin-project-card-featured">
                  <Star
                    size={9}
                    strokeWidth={2.5}
                    fill="currentColor"
                    aria-hidden="true"
                  />
                  Featured
                </span>
              )}
            </div>
            <div className="admin-project-card-body">
              <h3 className="admin-project-card-title">{p.title}</h3>
              <p className="admin-project-card-meta">
                {new Date(p.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="admin-project-card-actions">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  update.mutate({
                    id: p.id,
                    data: { isFeatured: !p.isFeatured },
                  })
                }
              >
                <Star size={12} strokeWidth={2} />
                {p.isFeatured ? "Unfeature" : "Feature"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (confirm(`Delete "${p.title}"? This can't be undone.`)) {
                    remove.mutate(p.id);
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
