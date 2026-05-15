"use client";

import * as React from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { Button } from "@/src/client/components/ui/button";
import { Input } from "@/src/client/components/ui/input";
import { Label } from "@/src/client/components/ui/label";
import { Skeleton } from "@/src/client/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useAdminProjects, useCreateProject, useUpdateProject, useDeleteProject,
  type AdminProject,
} from "@/src/client/hooks/use-admin-projects";

interface ProjectForm {
  title: string; description: string; imagePath: string;
  category: string; isFeatured: boolean; sortOrder: number;
}

const EMPTY_FORM: ProjectForm = {
  title: "", description: "", imagePath: "", category: "", isFeatured: false, sortOrder: 0,
};

function ProjectModal({ editing, onClose }: { editing: AdminProject | null; onClose: () => void }) {
  const [form, setForm] = React.useState<ProjectForm>(
    editing ? { title: editing.title, description: editing.description, imagePath: editing.imagePath, category: editing.category ?? "", isFeatured: editing.isFeatured, sortOrder: editing.sortOrder } : EMPTY_FORM
  );
  const create = useCreateProject();
  const update = useUpdateProject();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = { ...form, category: form.category || undefined };
    if (editing) {
      await update.mutateAsync({ id: editing.id, ...data });
    } else {
      await create.mutateAsync(data as Omit<AdminProject, "id" | "createdAt">);
    }
    onClose();
  }

  const saving = create.isPending || update.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-sm border border-[--color-rule] bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="font-serif text-xl font-bold text-[--color-ink] mb-5">
          {editing ? "Edit Project" : "New Project"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { id: "title", label: "Title", placeholder: "e.g. Modern Family Residence — Sandton" },
            { id: "imagePath", label: "Image Path", placeholder: "/images/projects/filename.webp" },
          ].map(({ id, label, placeholder }) => (
            <div key={id} className="space-y-1.5">
              <Label htmlFor={id} required>{label}</Label>
              <Input id={id} placeholder={placeholder} required value={form[id as keyof ProjectForm] as string} onChange={(e) => setForm({ ...form, [id]: e.target.value })} />
            </div>
          ))}
          <div className="space-y-1.5">
            <Label htmlFor="description" required>Description</Label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              rows={3}
              className="flex w-full rounded-sm border border-[--color-rule] bg-white px-3 py-2 text-sm focus:border-[--color-primary] focus:outline-none focus:ring-2 focus:ring-[--color-primary]/20 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Input id="category" placeholder="Residential" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input id="sortOrder" type="number" min={0} value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="accent-[--color-primary]" />
            <span className="text-sm text-[--color-ink]">Featured on homepage</span>
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

export default function AdminProjectsPage() {
  const { data, isLoading } = useAdminProjects();
  const deleteProject = useDeleteProject();
  const [modal, setModal] = React.useState<"new" | AdminProject | null>(null);

  const projects = data?.projects ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[--color-ink]">Projects</h1>
          <p className="text-[--color-muted] mt-1">{projects.length} portfolio items</p>
        </div>
        <Button onClick={() => setModal("new")}>
          <Plus className="h-4 w-4" /> Add Project
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-64" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-sm border border-[--color-rule] bg-[--color-paper2] p-16 text-center">
          <p className="text-[--color-muted]">No projects yet. Add your first above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div key={project.id} className="rounded-sm border border-[--color-rule] bg-white overflow-hidden">
              <div className="relative h-44 bg-[--color-paper2]">
                <Image src={project.imagePath} alt={project.title} fill className="object-cover" sizes="320px" />
                {project.isFeatured && (
                  <span className="absolute top-2 right-2 rounded-full bg-[--color-primary] px-2 py-0.5 text-xs font-bold text-white flex items-center gap-1">
                    <Star className="h-3 w-3 fill-white" /> Featured
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-[--color-ink] text-sm leading-tight">{project.title}</h3>
                  {project.category && <span className="shrink-0 rounded-full bg-[--color-paper2] px-2 py-0.5 text-xs text-[--color-muted]">{project.category}</span>}
                </div>
                <p className="text-xs text-[--color-muted] line-clamp-2 mb-3">{project.description}</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setModal(project)} className="rounded-sm p-1.5 text-[--color-muted] hover:bg-[--color-paper2] hover:text-[--color-ink] transition-colors">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => { if (confirm(`Delete "${project.title}"?`)) deleteProject.mutate(project.id); }} className="rounded-sm p-1.5 text-[--color-muted] hover:bg-red-50 hover:text-red-600 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <ProjectModal editing={modal === "new" ? null : modal} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
