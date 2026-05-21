"use client";

import * as React from "react";
import {
  useAdminProjects,
  useAdminProjectMutations,
} from "@/src/client/hooks/admin/useAdminProjects";
import { Button } from "@/src/client/components/ui/button";
import { Input } from "@/src/client/components/ui/input";
import { Textarea } from "@/src/client/components/ui/textarea";
import { Badge } from "@/src/client/components/ui/badge";

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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-black">Projects</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add project"}
        </Button>
      </div>
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-8 rounded-sm border border-[--color-rule] bg-white p-6 space-y-3"
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
      {isLoading && <p className="text-[--color-muted]">Loading…</p>}
      <div className="space-y-3">
        {projects?.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-sm border border-[--color-rule] bg-white p-4"
          >
            <div>
              <p className="font-medium">{p.title}</p>
              <p className="text-sm text-[--color-muted]">{p.category}</p>
              {p.isFeatured && <Badge className="mt-1">Featured</Badge>}
            </div>
            <div className="flex gap-2">
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
