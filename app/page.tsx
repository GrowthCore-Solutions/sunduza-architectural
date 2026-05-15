import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Star } from "lucide-react";
import { Button } from "@/src/client/components/ui/button";
import { Card, CardContent } from "@/src/client/components/ui/card";
import { SectionLabel } from "@/src/client/components/sections/SectionLabel";
import { SERVICES } from "@/src/shared/constants/services";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Sunduza Architectural & Projects | Professional Architectural Services",
  description:
    "Sunduza Architectural & Projects (Pty) Ltd — Professional house planning, architectural drawings, drafting services, and development projects across South Africa. Council-compliant plans that get approved first time.",
  openGraph: {
    title: "Sunduza Architectural & Projects",
    description:
      "Professional house planning, architectural drawings, and development projects across South Africa.",
    type: "website",
  },
};

export const revalidate = 60;

async function getHomepageData() {
  const [featuredProjects, featuredTestimonials, settings] = await Promise.all([
    db.project.findMany({
      where: { isFeatured: true },
      orderBy: { sortOrder: "asc" },
      take: 3,
      select: {
        id: true,
        title: true,
        description: true,
        imagePath: true,
        category: true,
      },
    }),
    db.testimonial.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, clientName: true, review: true, rating: true },
    }),
    db.siteSettings.findMany({
      where: { key: { in: ["years_experience", "projects_completed", "hero_tagline"] } },
      select: { key: true, value: true },
    }),
  ]);

  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  return { featuredProjects, featuredTestimonials, settingsMap };
}

export default async function HomePage() {
  const { featuredProjects, featuredTestimonials, settingsMap } =
    await getHomepageData();

  const heroTagline = settingsMap["hero_tagline"] ?? "Architecture That Builds Confidence";
  const yearsExp = settingsMap["years_experience"] ?? "5";
  const projectsCompleted = settingsMap["projects_completed"] ?? "50";

  const STATS = [
    { value: `${yearsExp}+`, label: "Years Experience" },
    { value: `${projectsCompleted}+`, label: "Projects Delivered" },
    { value: "100%", label: "SA Council Compliant" },
  ];

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/hero/hero-desktop.webp')" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-[--color-paper]/60" aria-hidden="true" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <SectionLabel className="mb-5">
            Sunduza Architectural & Projects
          </SectionLabel>
          <h1 className="font-serif text-5xl md:text-7xl font-black text-[--color-ink] mb-6 leading-tight">
            {heroTagline}
          </h1>
          <p className="text-lg text-[--color-muted] mb-10 max-w-2xl mx-auto leading-relaxed">
            We create professional architectural plans and drawings that give you
            clarity, compliance, and control over your building project.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/booking">
                Book Consultation
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/projects">View Our Work</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <section className="bg-[--color-ink] py-12" aria-label="Business statistics">
        <div className="mx-auto max-w-5xl px-4 grid grid-cols-3 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="font-serif text-4xl font-black text-[--color-primary]">
                {s.value}
              </div>
              <div className="text-xs text-white/50 uppercase tracking-widest mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Services preview ─────────────────────────────────────────────── */}
      <section className="py-24 bg-[--color-paper2]" aria-labelledby="services-heading">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <SectionLabel className="mb-3">What We Do</SectionLabel>
            <h2
              id="services-heading"
              className="font-serif text-4xl font-black text-[--color-ink]"
            >
              Our Services
            </h2>
            <p className="mt-4 text-[--color-muted] max-w-xl mx-auto">
              From a single house plan to a full development project — we deliver
              drawings that get approved and built.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((svc) => {
              const Icon = svc.icon;
              return (
                <Card
                  key={svc.key}
                  className="group hover:border-[--color-primary] transition-colors duration-300"
                >
                  <CardContent className="pt-8">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-sm bg-[--color-paper2] text-[--color-primary] group-hover:bg-[--color-primary] group-hover:text-white transition-colors duration-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-[--color-ink] mb-2">
                      {svc.title}
                    </h3>
                    <p className="text-sm text-[--color-muted] leading-relaxed">
                      {svc.shortDescription}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" asChild>
              <Link href="/services">
                View All Services
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Featured portfolio ───────────────────────────────────────────── */}
      {featuredProjects.length > 0 && (
        <section className="py-24 bg-white" aria-labelledby="portfolio-heading">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center mb-16">
              <SectionLabel className="mb-3">Our Work</SectionLabel>
              <h2
                id="portfolio-heading"
                className="font-serif text-4xl font-black text-[--color-ink]"
              >
                Featured Projects
              </h2>
              <p className="mt-4 text-[--color-muted] max-w-xl mx-auto">
                A selection of completed architectural projects across residential
                and commercial developments.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="group block rounded-sm overflow-hidden border border-[--color-rule] hover:shadow-lg transition-all duration-300"
                  aria-label={`View project: ${project.title}`}
                >
                  <div className="aspect-[4/3] overflow-hidden bg-[--color-paper2] relative">
                    <Image
                      src={project.imagePath}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      onError={undefined}
                    />
                  </div>
                  <div className="p-5">
                    {project.category && (
                      <span className="text-xs font-semibold uppercase tracking-widest text-[--color-primary] mb-2 block">
                        {project.category}
                      </span>
                    )}
                    <h3 className="font-serif text-lg font-bold text-[--color-ink] leading-snug">
                      {project.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button variant="outline" asChild>
                <Link href="/projects">
                  View All Projects
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      {featuredTestimonials.length > 0 && (
        <section className="py-24 bg-[--color-paper2]" aria-labelledby="testimonials-heading">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center mb-16">
              <SectionLabel className="mb-3">Client Reviews</SectionLabel>
              <h2
                id="testimonials-heading"
                className="font-serif text-4xl font-black text-[--color-ink]"
              >
                What Our Clients Say
              </h2>
              <p className="mt-4 text-[--color-muted]">
                Trusted by homeowners, developers, and businesses across South Africa.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredTestimonials.map((t) => (
                <div
                  key={t.id}
                  className="bg-white rounded-sm p-6 border border-[--color-rule] shadow-sm"
                >
                  {t.rating && (
                    <div className="flex gap-1 mb-4" aria-label={`${t.rating} out of 5 stars`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < t.rating!
                              ? "text-[--color-primary] fill-[--color-primary]"
                              : "text-[--color-rule]"
                          }`}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                  )}
                  <blockquote>
                    <p className="text-sm text-[--color-muted] leading-relaxed mb-4 italic">
                      &ldquo;{t.review}&rdquo;
                    </p>
                    <footer className="text-sm font-semibold text-[--color-ink]">
                      — {t.clientName}
                    </footer>
                  </blockquote>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button variant="outline" asChild>
                <Link href="/testimonials">
                  Read All Reviews
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ── Why us ───────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white" aria-labelledby="why-heading">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <SectionLabel className="mb-3">Why Sunduza</SectionLabel>
              <h2
                id="why-heading"
                className="font-serif text-3xl font-black text-[--color-ink] mb-6"
              >
                Plans That Pass. Drawings That Build.
              </h2>
              <p className="text-[--color-muted] leading-relaxed mb-8">
                With 5+ years of experience delivering council-compliant plans
                across South Africa, we understand exactly what approval authorities
                need to see — and how to present it.
              </p>
              <ul className="space-y-3">
                {[
                  "Council submission packages that get approved first time",
                  "Drawings clear enough for your contractor to build from directly",
                  "Professional communication from brief to final delivery",
                  "SANS-compliant documentation for residential and commercial work",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-[--color-primary] shrink-0 mt-0.5" />
                    <span className="text-[--color-muted]">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[--color-paper2] rounded-sm aspect-square flex items-center justify-center">
              <span className="font-serif text-7xl font-black text-[--color-rule]">
                KS
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA strip ────────────────────────────────────────────────────── */}
      <section className="bg-[--color-primary] py-20 text-center">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="font-serif text-3xl font-bold text-white mb-4">
            Ready to Start Your Project?
          </h2>
          <p className="text-white/80 mb-8 leading-relaxed">
            Book a consultation and get professional architectural plans tailored
            to your vision. We respond within 24 hours.
          </p>
          <Button
            size="lg"
            className="bg-white text-[--color-primary] hover:bg-[--color-paper2]"
            asChild
          >
            <Link href="/booking">
              Book a Free Consultation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
