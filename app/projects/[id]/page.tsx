"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = React.useState<{
    id: string;
    title: string;
    shortDescription: string;
    imageUrl: string;
    category: string;
    createdAt: string;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!id) return;
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setProject(d.data.project); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-[60vh] bg-[#faf8f2]" />;
  if (!project) return (
    <div className="min-h-[60vh] bg-[#faf8f2] flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-serif text-3xl font-bold text-[#0f172a] mb-4">Project Not Found</h1>
        <Link href="/projects"><Button variant="outline"><ArrowLeft className="h-4 w-4" /> Back to Projects</Button></Link>
      </div>
    </div>
  );

  return (
    <div className="bg-[#faf8f2]">
      <section className="mx-auto max-w-4xl px-4 py-24">
        <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-[#5a5040] hover:text-[#b88b4a] mb-8">
          <ArrowLeft className="h-4 w-4" /> All Projects
        </Link>
        <span className="text-xs font-medium uppercase tracking-widest text-[#b88b4a]">{project.category}</span>
        <h1 className="font-serif text-4xl font-black text-[#0f172a] mt-2 mb-6">{project.title}</h1>
        <div className="aspect-video bg-[#e8ddd0] rounded-sm overflow-hidden mb-8">
          <img src={project.imageUrl} alt={project.title} className="h-full w-full object-cover" />
        </div>
        <p className="text-[#5a5040] text-lg leading-relaxed">{project.shortDescription}</p>
        <div className="mt-12">
          <Link href="/booking"><Button size="lg">Book a Consultation <ArrowRight className="h-4 w-4" /></Button></Link>
        </div>
      </section>
    </div>
  );
}
