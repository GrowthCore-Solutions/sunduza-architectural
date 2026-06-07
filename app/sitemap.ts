import type { MetadataRoute } from "next";
import { getProjectRefs } from "@/backend/services/projects";
import { SITE_URL } from "@/shared/constants/site";

// Force server-rendering so the sitemap reflects the live DB state on every
// request rather than being frozen at build time.
export const dynamic = "force-dynamic";

function url(path: string) {
  return `${SITE_URL}${path}`;
}

const STATIC_PAGES: MetadataRoute.Sitemap = [
  {
    url: url("/"),
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 1,
  },
  {
    url: url("/services"),
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.9,
  },
  {
    url: url("/projects"),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: url("/testimonials"),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  },
  {
    url: url("/contact"),
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.8,
  },
  {
    url: url("/booking"),
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.8,
  },
  {
    url: url("/privacy"),
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.3,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjectRefs();

  const projectPages: MetadataRoute.Sitemap = projects.map((p) => ({
    url: url(`/projects/${p.id}`),
    lastModified: p.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...STATIC_PAGES, ...projectPages];
}
