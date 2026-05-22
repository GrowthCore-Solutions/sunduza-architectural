"use client";

import * as React from "react";
import {
  useAdminProjects,
  useAdminProjectMutations,
} from "@/frontend/hooks/admin/useAdminProjects";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Textarea } from "@/frontend/components/ui/textarea";
import { Badge } from "@/frontend/components/ui/badge";

export function AdminProjectsPage() {
  const { data: projects, isLoading } = useAdminProjects();
  const { create, update, remove } = useAdminProjectMutations();
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState({
    title: "",
    description: "",
    imagePath: "/images/projects/placeholder.webp",
    category: "Residential",
    isFeatured: false,
    sortOrder: 0,
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await create.mutateAsync(form);
    setShowForm(false);
    setForm({
      title: "",
      description: "",
      imagePath: "/images/projects/placeholder.webp",
      category: "Residential",
      isFeatured: false,
      sortOrder: 0,
    });
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Portfolio manager
          </p>
          <h1 className="mt-2 font-serif text-3xl font-black tracking-tight text-ink">
            Projects
          </h1>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add project"}
        </Button>
      </div>
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-8 space-y-3 rounded-md border border-rule/75 bg-white p-6 shadow-soft"
        >
          <Input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <Textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <Input
            placeholder="Image path"
            value={form.imagePath}
            onChange={(e) => setForm({ ...form, imagePath: e.target.value })}
          />
          <Input
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
            />
            Featured on homepage
          </label>
          <Button type="submit" disabled={create.isPending}>
            Save project
          </Button>
        </form>
      )}
      {isLoading && <p className="text-muted">Loading...</p>}
      <div className="space-y-3">
        {projects?.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between gap-4 rounded-md border border-rule/75 bg-white p-4 shadow-sm shadow-ink/5"
          >
            <div className="min-w-0">
              <p className="font-semibold text-ink">{p.title}</p>
              <p className="text-sm text-muted">{p.category}</p>
              {p.isFeatured && <Badge className="mt-1">Featured</Badge>}
            </div>
            <div className="flex shrink-0 flex-wrap justify-end gap-2">
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
                Toggle featured
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  if (confirm("Delete this project?")) remove.mutate(p.id);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
