"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Star, Plus, Pencil, Trash2, Eye, EyeOff, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "House Plan",
  "Architectural Drawing",
  "Drafting Services",
  "Development Projects",
] as const;

interface Project {
  id: string;
  title: string;
  shortDescription: string;
  imageUrl: string;
  category: string;
  featured: boolean;
  createdAt: string;
}

interface ProjectForm {
  title: string;
  shortDescription: string;
  imageUrl: string;
  category: string;
  featured: boolean;
}

export default function AdminProjectsPage() {
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<ProjectForm>({
    title: "",
    shortDescription: "",
    imageUrl: "",
    category: "House Plan",
    featured: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") redirect("/admin/login");
  }, [status]);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data?.data?.projects ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") fetchProjects();
  }, [status, fetchProjects]);

  function openEdit(project: Project) {
    setEditing(project);
    setForm({
      title: project.title,
      shortDescription: project.shortDescription,
      imageUrl: project.imageUrl,
      category: project.category,
      featured: project.featured,
    });
    setShowForm(true);
  }

  function openNew() {
    setEditing(null);
    setForm({
      title: "",
      shortDescription: "",
      imageUrl: "",
      category: "House Plan",
      featured: false,
    });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editing
        ? `/api/projects/${editing.id}`
        : "/api/projects";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Save failed");
      setShowForm(false);
      fetchProjects();
    } catch (err) {
      alert("Failed to save project. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(project: Project) {
    if (!confirm(`Delete "${project.title}"?`)) return;
    await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
    fetchProjects();
  }

  async function toggleFeatured(project: Project) {
    await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: !project.featured }),
    });
    fetchProjects();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0e0e0e]">Projects</h1>
          <p className="text-[#5a5040] mt-1">
            Manage your portfolio — {projects.length} projects total.
          </p>
        </div>
        <Button onClick={openNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Project
        </Button>
      </div>

      {/* Project form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-sm border border-[#c8bfa8] bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-[#0e0e0e] mb-4">
              {editing ? "Edit Project" : "New Project"}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0e0e0e] mb-1">Title</label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  maxLength={200}
                  placeholder="e.g. Residential Planning Set 01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0e0e0e] mb-1">Short Description</label>
                <textarea
                  value={form.shortDescription}
                  onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                  required
                  maxLength={500}
                  rows={3}
                  className="w-full rounded-sm border border-[#c8bfa8] bg-white px-3 py-2 text-sm text-[#0e0e0e] placeholder-[#c8bfa8] focus:outline-none focus:ring-2 focus:ring-[#b88b4a] resize-none"
                  placeholder="Brief project description..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0e0e0e] mb-1">Image URL</label>
                <Input
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  required
                  placeholder="/images/projects/project-01.png"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0e0e0e] mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-sm border border-[#c8bfa8] bg-white px-3 py-2 text-sm text-[#0e0e0e] focus:outline-none focus:ring-2 focus:ring-[#b88b4a]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="h-4 w-4 accent-[#b88b4a]"
                />
                <label htmlFor="featured" className="text-sm text-[#0e0e0e]">
                  Featured on homepage
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
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

      {/* Projects grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-sm border border-[#c8bfa8] bg-[#ede8de]" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-sm border border-[#c8bfa8] bg-[#ede8de] p-12 text-center">
          <ImageIcon className="h-12 w-12 mx-auto text-[#c8bfa8] mb-3" />
          <p className="text-[#5a5040]">No projects yet. Add your first project above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="rounded-sm border border-[#c8bfa8] bg-white overflow-hidden"
            >
              {/* Image */}
              <div className="relative h-48 bg-[#ede8de]">
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                {project.featured && (
                  <span className="absolute top-2 right-2 rounded-full bg-[#b88b4a] px-2 py-0.5 text-xs font-bold text-white">
                    Featured
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-[#0e0e0e] text-sm leading-tight">
                    {project.title}
                  </h3>
                  <span className="shrink-0 rounded-full bg-[#ede8de] px-2 py-0.5 text-xs text-[#5a5040]">
                    {project.category}
                  </span>
                </div>
                <p className="text-xs text-[#5a5040] line-clamp-2 mb-3">
                  {project.shortDescription}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => toggleFeatured(project)}
                    className={cn(
                      "flex items-center gap-1 text-xs font-medium transition-colors",
                      project.featured
                        ? "text-[#b88b4a]"
                        : "text-[#5a5040] hover:text-[#b88b4a]"
                    )}
                  >
                    <Star
                      className={cn("h-3.5 w-3.5", project.featured && "fill-current")}
                    />
                    {project.featured ? "Featured" : "Feature"}
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(project)}
                      className="rounded-sm p-1.5 text-[#5a5040] hover:bg-[#ede8de] hover:text-[#0e0e0e] transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(project)}
                      className="rounded-sm p-1.5 text-[#5a5040] hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
