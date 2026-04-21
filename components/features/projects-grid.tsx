"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Project } from "@/types/project";

export function ProjectsClientView({ projects }: { projects: Project[] }) {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#0f172a] mb-4">Our Portfolio</h2>
          <p className="text-[#5a5040] max-w-2xl mx-auto">
            A selection of completed architectural projects across residential and commercial developments.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group block rounded-sm overflow-hidden border border-[#e8ddd0] hover:shadow-lg transition-all duration-300"
            >
              <div className="aspect-[4/3] overflow-hidden bg-[#f5f0e8]">
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <span className="text-xs font-mono uppercase tracking-widest text-[#b88b4a] mb-2 block">
                  {project.category}
                </span>
                <h3 className="font-serif text-lg font-bold text-[#0f172a] mb-2 leading-snug">
                  {project.title}
                </h3>
                <p className="text-sm text-[#5a5040] line-clamp-2">{project.shortDescription}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/booking">
            <Button variant="outline" className="gap-2">
              Discuss Your Project <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
