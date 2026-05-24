"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  FileText,
  Layers,
  Mail,
  MapPin,
  PenTool,
  Phone,
  Plus,
  Ruler,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { Skeleton } from "@/frontend/components/ui/skeleton";
import { useProjects } from "@/frontend/hooks/useProjects";
import { useTestimonials } from "@/frontend/hooks/useTestimonials";
import { ProjectCard } from "@/frontend/components/features/ProjectCard";
import { TestimonialsCarousel } from "@/frontend/components/features/TestimonialsCarousel";
import { CountUp } from "@/frontend/components/ui/CountUp";
import { SERVICES } from "@/frontend/data/services";
import { CONTACT } from "@/shared/constants/contact";

const SERVICE_ICONS = [Building2, PenTool, Ruler, Layers] as const;

const STATS = [
  { label: "Projects completed", end: 50, suffix: "+", detail: "Residential & commercial" },
  { label: "Years of practice", end: 5, suffix: "+", detail: "Industry expertise" },
  { label: "Core services", end: 4, suffix: "", detail: "End-to-end delivery" },
];

const TRUST_POINTS = [
  { label: "Council-ready documentation", icon: ShieldCheck },
  { label: "Residential & development work", icon: Building2 },
  { label: "Based in Malamulele, Limpopo", icon: MapPin },
];

const APPROACH = [
  {
    icon: Compass,
    title: "Brief & site",
    description:
      "We walk through your vision, budget, and site constraints. Zoning, services, and orientation are mapped before a line is drawn.",
  },
  {
    icon: PenTool,
    title: "Concept design",
    description:
      "Massing, layouts, and elevations are explored until the plan resolves on paper and on the ground. You see every revision.",
  },
  {
    icon: FileText,
    title: "Documentation",
    description:
      "Full working drawings, schedules, and SANS-compliant documentation ready for council submission and the build team.",
  },
  {
    icon: ClipboardCheck,
    title: "Submission & build",
    description:
      "We coordinate council revisions through approval and remain available to the build team for queries and clarifications.",
  },
];

const DIFFERENTIATORS = [
  {
    icon: ShieldCheck,
    title: "Submission-ready, every time",
    description:
      "Every drawing leaves the studio meeting SANS 10400 and municipal standards. No re-submissions. No surprises.",
  },
  {
    icon: Sparkles,
    title: "Drawings that build cleanly",
    description:
      "Builders work from our documentation without guesswork. Dimensions, schedules, and details are resolved before you break ground.",
  },
  {
    icon: ClipboardCheck,
    title: "Direct contact with the architect",
    description:
      "You speak to the person drawing your plans — not a junior, not a call centre. Decisions happen quickly and without dilution.",
  },
];

const FAQS = [
  {
    q: "How long does a typical house plan take?",
    a: "From brief to council-ready drawings, expect 3–6 weeks depending on the scope, site complexity, and how quickly revisions are signed off. Larger developments take longer.",
  },
  {
    q: "Do you handle council submission?",
    a: "Yes. We prepare the full submission package, lodge it with the municipality, and manage revisions through to approval — so you don't have to navigate council yourself.",
  },
  {
    q: "What areas do you serve?",
    a: "We are based in Malamulele and most of our work is across the Vhembe District — Mhinga, Makuleke, Saselamani, Xikundu, Maphophe and the Malamulele town blocks among others. We travel beyond the district for development-scale projects and offer remote consultations countrywide.",
  },
  {
    q: "Can you work with my existing builder or contractor?",
    a: "Absolutely. Our drawings are prepared to construction-issue standard, so any competent builder can build from them. We're available to answer queries during the build.",
  },
  {
    q: "How are your services priced?",
    a: "Pricing is project-based, calculated on scope and area. After your free consultation, you'll receive a fixed-fee quotation — no hourly billing, no surprises.",
  },
];

export function HomePageContent() {
  const { data: featured, isLoading: projectsLoading, isError: projectsError } = useProjects({ featured: true });
  const { data: testimonials, isLoading: testimonialsLoading } = useTestimonials();
  const spotlight = featured?.[0];

  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────────────────── */}
      <section className="hero-band" aria-label="Introduction">
        <Image
          src="/images/hero/hero-mobile.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="hero-band-media md:hidden"
          aria-hidden="true"
        />
        <Image
          src="/images/hero/hero-desktop.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="hero-band-media hidden md:block"
          aria-hidden="true"
        />
        <div className="hero-overlay" />
        <div className="hero-grid architectural-grid" />

        <div className="hero-inner">
          <div className="max-w-[58rem]">
            <div className="hero-meta-row">
              <span className="hero-status-pill">Now booking 2026 consultations</span>
              <span className="hero-meta-rule" aria-hidden="true" />
              <span className="text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-white/55">
                Est. 2020 · Malamulele, Limpopo
              </span>
            </div>

            <h1 className="hero-headline">
              House plans,<br />
              <span className="hero-headline-italic">drawn with</span><br />
              <span>precision.</span>
            </h1>

            <p className="mt-7 max-w-[34rem] text-base leading-relaxed text-white/72 md:text-[1.0625rem] md:leading-[1.7]">
              Sunduza Architectural &amp; Projects prepares house plans, architectural
              drawings, drafting, and development documentation that read clearly to
              builders, satisfy council, and stay faithful to the client&rsquo;s
              brief — from the first sketch to the day the slab is cast.
            </p>

            <div className="hero-cta-row">
              <Button size="lg" asChild>
                <Link href="/booking">
                  Book a consultation
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/25 bg-white/8 text-white hover:bg-white/15 hover:border-white/40 hover:text-white"
                asChild
              >
                <Link href="/projects">
                  View our work
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="hero-trust-strip">
              {TRUST_POINTS.map(({ label, icon: Icon }) => (
                <div key={label} className="hero-trust-item">
                  <Icon aria-hidden="true" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="hero-scroll-cue" aria-hidden="true">
          <div className="hero-scroll-cue-line" />
          <span className="text-[0.6rem] uppercase tracking-[0.24em]">Scroll</span>
        </div>
      </section>

      {/* ─── Press / credentials strip ────────────────────────────────── */}
      <section className="press-strip" aria-label="What we deliver">
        <div className="press-strip-inner">
          <p className="press-strip-label">What we deliver</p>
          <div className="press-strip-items">
            <span className="press-strip-item">House plans <span>Residential</span></span>
            <span className="press-strip-item">Council submissions <span>Municipal</span></span>
            <span className="press-strip-item">Working drawings <span>Construction</span></span>
            <span className="press-strip-item">Development plans <span>Multi-unit</span></span>
            <span className="press-strip-item">As-built drawings <span>Compliance</span></span>
          </div>
        </div>
      </section>

      {/* ─── Stats strip ──────────────────────────────────────────────── */}
      <section className="stats-strip" aria-label="Studio at a glance">
        <div className="stats-strip-inner">
          {STATS.map((stat) => (
            <div key={stat.label} className="stats-cell">
              <p className="font-serif text-[2rem] font-semibold leading-none tracking-[-0.03em] text-ink sm:text-[3.5rem]">
                <CountUp end={stat.end} suffix={stat.suffix} />
              </p>
              <p className="mt-2 text-xs font-semibold text-ink sm:mt-3 sm:text-sm">{stat.label}</p>
              <p className="mt-0.5 text-[0.625rem] uppercase tracking-[0.1em] text-muted sm:mt-1 sm:text-xs sm:tracking-[0.14em]">{stat.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Approach / process ───────────────────────────────────────── */}
      <section className="approach-section" aria-label="Our approach">
        <div className="approach-inner">
          <div className="section-intro">
            <div className="section-intro-stack">
              <div className="section-divider-rule">
                <p className="type-eyebrow">How we work</p>
              </div>
              <h2 className="font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-ink md:text-5xl">
                A clear path from<br className="hidden sm:block" />
                <span className="font-light italic"> brief to building.</span>
              </h2>
              <p className="mt-5 max-w-2xl text-[0.9375rem] leading-relaxed text-muted md:text-base">
                Four stages, no shortcuts. Each one is sign-off driven so you always
                know what you&rsquo;re approving — and what comes next.
              </p>
            </div>
          </div>

          <ol className="approach-grid" aria-label="Project stages">
            {APPROACH.map((step, i) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="approach-step">
                  <div className="approach-step-head">
                    <span className="approach-step-number">{String(i + 1).padStart(2, "0")}</span>
                    <span className="approach-step-icon" aria-hidden="true">
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ─── Services ─────────────────────────────────────────────────── */}
      <section className="paper-grain py-16 md:py-24" aria-label="Services">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="section-intro">
            <div className="section-intro-stack">
              <div className="section-divider-rule">
                <p className="type-eyebrow">What we do</p>
              </div>
              <h2 className="font-serif text-4xl font-semibold leading-tight tracking-tight text-ink md:text-5xl">
                Practical architectural<br className="hidden sm:block" />
                <span className="font-light italic"> services for real projects.</span>
              </h2>
            </div>
            <Button variant="ghost" asChild className="hidden sm:inline-flex text-sm">
              <Link href="/services">
                All services
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((service, index) => {
              const Icon = SERVICE_ICONS[index];
              const num = String(index + 1).padStart(2, "0");
              return (
                <article key={service.id} className="surface-interactive service-card group">
                  <div className="mb-6 flex items-start justify-between">
                    <div className="service-card-icon">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-serif text-4xl font-light text-rule/70 leading-none select-none">
                      {num}
                    </span>
                  </div>
                  <h3 className="font-serif text-[1.3rem] font-semibold leading-tight text-ink">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {service.description}
                  </p>
                  <Link
                    href={`/booking?service=${service.id}`}
                    className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[0.8125rem] font-semibold text-primary hover:underline"
                  >
                    Book this service
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </article>
              );
            })}
          </div>

          <div className="mt-6 sm:hidden">
            <Button variant="outline" asChild className="w-full">
              <Link href="/services">
                All services
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Spotlight project ────────────────────────────────────────── */}
      {spotlight && (
        <section className="spotlight-band" aria-label="Featured project">
          <div className="spotlight-inner">
            <div className="spotlight-frame">
              {spotlight.imagePath ? (
                <Image
                  src={spotlight.imagePath}
                  alt={spotlight.title}
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="object-cover img-project"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-white/30">
                  <Building2 className="h-16 w-16" />
                </div>
              )}
            </div>
            <div>
              <p className="spotlight-tag">Featured project</p>
              <h2 className="spotlight-title">{spotlight.title}</h2>
              {spotlight.description && (
                <p className="mt-5 text-base leading-relaxed text-white/65 md:text-[1.0625rem]">
                  {spotlight.description}
                </p>
              )}

              <div className="spotlight-meta-grid">
                {spotlight.category && (
                  <div>
                    <p className="spotlight-meta-key">Category</p>
                    <p className="spotlight-meta-value capitalize">
                      {spotlight.category.replace(/_/g, " ")}
                    </p>
                  </div>
                )}
                <div>
                  <p className="spotlight-meta-key">Year</p>
                  <p className="spotlight-meta-value">
                    {new Date(spotlight.createdAt).getFullYear()}
                  </p>
                </div>
                <div>
                  <p className="spotlight-meta-key">Region</p>
                  <p className="spotlight-meta-value">Vhembe District, Limpopo</p>
                </div>
                <div>
                  <p className="spotlight-meta-key">Status</p>
                  <p className="spotlight-meta-value">Delivered</p>
                </div>
              </div>

              <Button
                size="lg"
                variant="outline"
                className="mt-10 border-white/25 bg-white/8 text-white hover:bg-white/15 hover:border-white/40 hover:text-white"
                asChild
              >
                <Link href={`/projects/${spotlight.id}`}>
                  Inside the project
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ─── Why Sunduza ───────────────────────────────────────────────── */}
      <section className="diff-section" aria-label="Why Sunduza">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="section-intro">
            <div className="section-intro-stack">
              <div className="section-divider-rule">
                <p className="type-eyebrow">Why Sunduza</p>
              </div>
              <h2 className="font-serif text-4xl font-semibold leading-tight tracking-tight text-ink md:text-5xl">
                Drawings that builders trust,<br className="hidden sm:block" />
                <span className="font-light italic"> and councils approve.</span>
              </h2>
            </div>
          </div>

          <div className="diff-grid">
            {DIFFERENTIATORS.map(({ icon: Icon, title, description }) => (
              <article key={title} className="diff-card">
                <span className="diff-card-icon" aria-hidden="true">
                  <Icon className="h-5 w-5" />
                </span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Founder ──────────────────────────────────────────────────── */}
      <section className="bg-ink py-16 md:py-24" aria-label="About the founder">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
              <div className="relative aspect-[3/4] overflow-hidden rounded bg-paper2">
                <Image
                  src="/images/founder-portrait.png"
                  alt="Xivutiso Kevin Sunduza — Founder, Sunduza Architectural & Projects"
                  fill
                  sizes="(min-width: 1024px) 40vw, 90vw"
                  className="object-cover object-top img-project"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-4 -right-4 h-24 w-24 border-b-2 border-r-2 border-primary/40 rounded-br hidden lg:block" />
            </div>

            <div>
              <div className="section-divider-rule">
                <p className="type-eyebrow">About the founder</p>
              </div>
              <h2 className="font-serif text-4xl font-semibold leading-tight text-white md:text-5xl">
                Xivutiso Kevin<br />
                <span className="font-light italic text-white/85">Sunduza</span>
              </h2>

              <p className="mt-7 text-[1.0625rem] leading-relaxed text-white/65">
                With over five years of hands-on experience in residential and development
                architecture, Kevin founded Sunduza Architectural &amp; Projects to bring
                precision and clarity to every project — from a single house plan to a
                full development application.
              </p>

              <blockquote className="founder-quote">
                &ldquo;A good plan is one a builder can hand to their team and not
                phone the architect every second day. That&rsquo;s the bar.&rdquo;
              </blockquote>

              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  { label: "Council submissions", value: "50+" },
                  { label: "Years in practice", value: "5+" },
                  { label: "Provinces served", value: "4+" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded border border-white/10 bg-white/[0.04] px-4 py-3 transition-colors hover:border-primary/50 hover:bg-white/[0.07]"
                  >
                    <p className="font-serif text-[1.6rem] font-semibold leading-none text-primary-light">
                      {item.value}
                    </p>
                    <p className="mt-2 text-[0.625rem] text-white/55 uppercase tracking-[0.16em]">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="founder-signature">
                <span className="founder-signature-mark">— X. K. Sunduza</span>
                <span className="founder-signature-meta">Founder &amp; Lead Architect</span>
              </div>

              <Button className="mt-10" asChild>
                <Link href="/booking">
                  Work with Kevin
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Featured projects grid ───────────────────────────────────── */}
      <section className="mist-section py-16 md:py-24" aria-label="Featured projects">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="section-intro">
            <div className="section-intro-stack">
              <div className="section-divider-rule">
                <p className="type-eyebrow">Portfolio</p>
              </div>
              <h2 className="font-serif text-4xl font-semibold tracking-tight text-ink md:text-5xl">
                Selected work
              </h2>
            </div>
            <Button variant="outline" asChild className="hidden sm:inline-flex">
              <Link href="/projects">
                View all projects
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {projectsLoading && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-80 w-full rounded" />
              ))}
            </div>
          )}

          {projectsError && (
            <div className="state-panel">
              Unable to load projects right now. The portfolio section is ready,
              but the database connection needs attention.
            </div>
          )}

          {!projectsLoading && !projectsError && featured?.length === 0 && (
            <div className="state-panel">
              Featured projects will appear here once they are marked in the admin dashboard.
            </div>
          )}

          {featured && featured.length > 1 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.slice(1, 4).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}

          <div className="mt-6 sm:hidden">
            <Button variant="outline" asChild className="w-full">
              <Link href="/projects">
                View all projects
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─────────────────────────────────────────────── */}
      <section className="paper-grain py-16 md:py-24" aria-label="Client reviews">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="section-intro">
            <div className="section-intro-stack">
              <div className="section-divider-rule">
                <p className="type-eyebrow">Client reviews</p>
              </div>
              <h2 className="font-serif text-4xl font-semibold tracking-tight text-ink md:text-5xl">
                What our clients say
              </h2>
            </div>
            <Button variant="outline" asChild className="hidden sm:inline-flex">
              <Link href="/testimonials">
                All reviews
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {testimonialsLoading && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-52 w-full rounded" />
              ))}
            </div>
          )}

          {!testimonialsLoading && testimonials && testimonials.length > 0 && (
            <TestimonialsCarousel testimonials={testimonials.slice(0, 3)} />
          )}

          {!testimonialsLoading && (!testimonials || testimonials.length === 0) && (
            <div className="state-panel">
              Client reviews will appear here once added from the admin dashboard.
            </div>
          )}

          <div className="mt-6 sm:hidden">
            <Button variant="outline" asChild className="w-full">
              <Link href="/testimonials">
                All reviews
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────────────── */}
      <section className="faq-section" aria-label="Frequently asked questions">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="section-divider-rule">
            <p className="type-eyebrow">FAQ</p>
          </div>
          <h2 className="font-serif text-4xl font-semibold tracking-tight text-ink md:text-5xl">
            Questions, answered.
          </h2>
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted md:text-base">
            The most common questions we get before the first consultation. If
            yours isn&rsquo;t here, send it through on the booking form.
          </p>

          <div className="faq-list">
            {FAQS.map((faq) => (
              <details key={faq.q} className="faq-item">
                <summary className="faq-summary">
                  <span>{faq.q}</span>
                  <span className="faq-summary-icon" aria-hidden="true">
                    <Plus className="h-4 w-4" />
                  </span>
                </summary>
                <div className="faq-body">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Contact band (rich CTA) ──────────────────────────────────── */}
      <section className="contact-band" aria-label="Get in touch">
        <div className="contact-inner">
          <div>
            <div className="section-divider-rule">
              <p className="type-eyebrow">Start a project</p>
            </div>
            <h2 className="contact-headline">
              Tell us what you want to build.<br />
              <em>We&rsquo;ll shape the next step.</em>
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/65 md:text-[1.0625rem]">
              Consultations are obligation-free. Bring a brief, a sketch, a Pinterest
              board, or just a piece of land. We&rsquo;ll take it from there.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/booking">
                  Book a consultation
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/25 bg-white/8 text-white hover:bg-white/15 hover:border-white/40 hover:text-white"
                asChild
              >
                <Link href="/contact">
                  Send a message
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="contact-cards">
            <Link href="/booking" className="contact-tile">
              <div className="contact-tile-head">
                <CheckCircle2 className="h-5 w-5" />
                <ArrowUpRight className="h-4 w-4" />
              </div>
              <p className="contact-tile-label">Book a consultation</p>
              <p className="contact-tile-value">Free 30-minute call</p>
            </Link>
            <a href={`tel:${CONTACT.PHONE_E164}`} className="contact-tile">
              <div className="contact-tile-head">
                <Phone className="h-5 w-5" />
                <ArrowUpRight className="h-4 w-4" />
              </div>
              <p className="contact-tile-label">Call the studio</p>
              <p className="contact-tile-value">{CONTACT.PHONE_DISPLAY}</p>
            </a>
            <a href={`mailto:${CONTACT.EMAIL}`} className="contact-tile">
              <div className="contact-tile-head">
                <Mail className="h-5 w-5" />
                <ArrowUpRight className="h-4 w-4" />
              </div>
              <p className="contact-tile-label">Email us</p>
              <p className="contact-tile-value">{CONTACT.EMAIL}</p>
            </a>
            <Link href="/projects" className="contact-tile">
              <div className="contact-tile-head">
                <Building2 className="h-5 w-5" />
                <ArrowUpRight className="h-4 w-4" />
              </div>
              <p className="contact-tile-label">View portfolio</p>
              <p className="contact-tile-value">Selected projects</p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
