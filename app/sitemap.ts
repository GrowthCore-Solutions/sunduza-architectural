import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const BASE_URL = process.env.NEXTAUTH_URL ?? "https://sunduza.co.za";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/services`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/projects`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/testimonials`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/booking`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Dynamic project pages
  let projectRoutes: MetadataRoute.Sitemap = [];
  try {
    const projects = await db.project.findMany({
      select: { id: true, updatedAt: true },
      orderBy: { sortOrder: "asc" },
    });

    projectRoutes = projects.map((p) => ({
      url: `${BASE_URL}/projects/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch {
    // If DB is unavailable at build time, skip project routes
  }

  return [...staticRoutes, ...projectRoutes];
}
