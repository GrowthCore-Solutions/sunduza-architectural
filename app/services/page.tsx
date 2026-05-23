import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Check,
  ClipboardList,
  Layers,
  PenTool,
  Ruler,
  Workflow,
} from "lucide-react";
import { SERVICES } from "@/frontend/data/services";
import { Button } from "@/frontend/components/ui/button";
import { JsonLd } from "@/frontend/components/seo/JsonLd";
import { SITE_URL } from "@/shared/constants/site";

const SERVICE_ICONS = [Building2, PenTool, Ruler, Layers] as const;

const SERVICE_PROCESS: Record<string, { title: string; body: string }[]> = {
  house_planning: [
    { title: "Brief & site analysis", body: "We map zoning, orientation, and site constraints before drawing a single line." },
    { title: "Concept design", body: "Floor plan options and 3D massing studies until the layout sings." },
    { title: "Working drawings", body: "SANS-compliant plans, elevations, and sections ready for council." },
    { title: "Council submission", body: "We package, submit, and respond to comments through to approval." },
  ],
  arch_drawings: [
    { title: "Drawing brief", body: "Scope discussion: what builders need on site to deliver your design." },
    { title: "Dimensioning & detail", body: "Full dimensioned set with material and finish schedules." },
    { title: "Construction details", body: "Sections, junctions, and standard details for clean construction." },
    { title: "Issue & support", body: "Drawings issued in DWG and PDF, with RFI support during build." },
  ],
  drafting_services: [
    { title: "Source intake", body: "We work from sketches, hand drawings, or measured surveys you provide." },
    { title: "CAD drafting", body: "Clean, structured CAD files prepared to your standard or template." },
    { title: "Review cycle", body: "Iterations with redlines and revisions until the set is correct." },
    { title: "Final deliverables", body: "Stamped, layer-organised files in DWG plus archival PDF set." },
  ],
  dev_project_planning: [
    { title: "Feasibility", body: "Coverage, FAR, and massing assessment against zoning and site capacity." },
    { title: "Concept masterplan", body: "Unit mix, road layouts, and bulk services strategy." },
    { title: "Development application", body: "Town planning drawings and supporting documentation for submission." },
    { title: "Coordination", body: "Civil, structural, and municipal liaison through approval." },
  ],
};

const SERVICE_IDEAL: Record<string, string> = {
  house_planning: "New residential builds",
  arch_drawings: "Builders & contractors",
  drafting_services: "Sketch-to-CAD conversions",
  dev_project_planning: "Multi-unit developments",
};

const LIFECYCLE = [
  { num: "01", title: "Brief & site", tags: ["House Planning", "Development"] },
  { num: "02", title: "Concept design", tags: ["House Planning", "Development"] },
  { num: "03", title: "Documentation", tags: ["House Planning", "Drawings", "Drafting"] },
  { num: "04", title: "Council submission", tags: ["House Planning", "Development"] },
  { num: "05", title: "Build support", tags: ["Drawings", "Drafting"] },
] as const;

const SCENARIOS = [
  {
    eyebrow: "Scenario 01",
    title: "I'm building a new home from scratch.",
    serviceId: "house_planning",
    serviceLabel: "House Planning",
  },
  {
    eyebrow: "Scenario 02",
    title: "I have plans, I need builder drawings.",
    serviceId: "arch_drawings",
    serviceLabel: "Architectural Drawings",
  },
  {
    eyebrow: "Scenario 03",
    title: "I have sketches, I need them in CAD.",
    serviceId: "drafting_services",
    serviceLabel: "Drafting Services",
  },
  {
    eyebrow: "Scenario 04",
    title: "I'm planning a multi-unit development.",
    serviceId: "dev_project_planning",
    serviceLabel: "Development Projects",
  },
] as const;

const COMPARE_ROWS = [
  { label: "Initial consultation", values: [true, true, true, true] },
  { label: "Site analysis & zoning review", values: [true, false, false, true] },
  { label: "Floor plans, elevations & sections", values: [true, true, false, true] },
  { label: "Council submission package", values: [true, false, true, true] },
  { label: "Construction details", values: [true, true, true, false] },
  { label: "Material & finish schedules", values: [false, true, true, false] },
  { label: "CAD file deliverables (DWG)", values: [true, true, true, true] },
  { label: "Municipal coordination", values: [true, false, false, true] },
] as const;

export const metadata = {
  title: "Services",
  description:
    "Professional architectural services: house planning, working drawings, drafting, and development projects across South Africa.",
};

const servicesSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Architectural Services — Sunduza Architectural & Projects",
  url: `${SITE_URL}/services`,
  itemListElement: SERVICES.map((svc, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Service",
      name: svc.title,
      description: svc.description,
      url: `${SITE_URL}/services#${svc.id}`,
      provider: {
        "@type": "LocalBusiness",
        name: "Sunduza Architectural & Projects (Pty) Ltd",
        url: SITE_URL,
      },
      areaServed: { "@type": "Country", name: "South Africa" },
    },
  })),
};

export default function ServicesPage() {
  return (
    <>
      <JsonLd schema={servicesSchema} />
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="services-hero" aria-label="What we offer">
        <div className="services-hero-inner">
          <div className="services-hero-grid">
            <div>
              <p className="type-eyebrow">What we offer</p>
              <h1 className="services-hero-title">
                Architecture,<br />
                <em>end&#8209;to&#8209;end</em>
              </h1>
              <p className="services-hero-sub">
                From the first site visit through to council approval and construction support —
                four focused services delivered with the same craft, precision, and care across
                every project we touch.
              </p>
            </div>

            <aside className="services-hero-aside" aria-label="Quick service navigation">
              <p className="services-hero-aside-label">Jump to a service</p>
              <ul className="services-hero-aside-list">
                {SERVICES.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="services-hero-aside-item">
                      <span className="services-hero-aside-num">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>{s.title}</span>
                      <ArrowRight
                        size={14}
                        className="services-hero-aside-arrow"
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>

      {/* ── Lifecycle ribbon ─────────────────────────────────────────── */}
      <section className="services-lifecycle" aria-label="Project lifecycle">
        <div className="services-lifecycle-inner">
          <div className="services-lifecycle-header">
            <div>
              <p className="services-lifecycle-eyebrow">Where we fit</p>
              <h2 className="services-lifecycle-title">
                The lifecycle of a<br />
                <em>well-built project</em>
              </h2>
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs text-white/50">
              <Workflow size={14} aria-hidden="true" />
              <span>Brief → Build</span>
            </div>
          </div>

          <div className="services-lifecycle-rail" role="list">
            {LIFECYCLE.map((step) => (
              <div key={step.num} className="services-lifecycle-step" role="listitem">
                <p className="services-lifecycle-step-num">{step.num}</p>
                <p className="services-lifecycle-step-title">{step.title}</p>
                <div className="services-lifecycle-step-tags">
                  {step.tags.map((t) => (
                    <span key={t} className="services-lifecycle-step-tag">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Service spreads ─────────────────────────────────────────── */}
      <div className="services-spreads">
        {SERVICES.map((service, index) => {
          const Icon = SERVICE_ICONS[index];
          const num = String(index + 1).padStart(2, "0");
          const process = SERVICE_PROCESS[service.id] ?? [];
          const ideal = SERVICE_IDEAL[service.id] ?? "Architectural commissions";

          return (
            <section
              key={service.id}
              id={service.id}
              className="services-spread"
              aria-label={service.title}
            >
              <div className="services-spread-inner">
                <header className="services-spread-header">
                  <div>
                    <div className="services-spread-marker">
                      <span className="services-spread-num" aria-hidden="true">
                        {num}
                      </span>
                      <span className="services-spread-rule" aria-hidden="true" />
                    </div>
                    <p className="services-spread-eyebrow">Service {num}</p>
                    <h2 className="services-spread-title">{service.title}</h2>
                    <p className="services-spread-lead">{service.description}</p>
                  </div>
                  <div className="services-spread-icon" aria-hidden="true">
                    <Icon size={26} strokeWidth={1.5} />
                  </div>
                </header>

                <div className="services-spread-body">
                  <div>
                    <p className="services-spread-col-eyebrow">What you get</p>
                    <ul className="services-spread-deliverables">
                      {service.features.map((feature) => (
                        <li key={feature} className="services-spread-deliverable">
                          <Check
                            size={16}
                            strokeWidth={2.25}
                            className="services-spread-deliverable-check"
                            aria-hidden="true"
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="services-spread-col-eyebrow">How it goes</p>
                    <ol className="services-spread-process">
                      {process.map((step, i) => (
                        <li key={step.title} className="services-spread-process-step">
                          <span
                            className="services-spread-process-num"
                            aria-hidden="true"
                          >
                            {i + 1}
                          </span>
                          <div className="services-spread-process-content">
                            <p className="services-spread-process-title">{step.title}</p>
                            <p className="services-spread-process-body">{step.body}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                <div className="services-spread-footer">
                  <div className="services-spread-ideal">
                    <span>Ideal for</span>
                    <span className="services-spread-ideal-pill">
                      <ClipboardList size={12} aria-hidden="true" />
                      {ideal}
                    </span>
                  </div>
                  <Button asChild variant="default" size="lg">
                    <Link href={`/booking?service=${service.id}`}>
                      Book this service <ArrowRight size={15} />
                    </Link>
                  </Button>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* ── Comparison matrix ────────────────────────────────────────── */}
      <section className="services-compare" aria-label="Service comparison">
        <div className="services-compare-inner">
          <div className="services-compare-header">
            <p className="type-eyebrow">At a glance</p>
            <h2 className="services-compare-title">
              What&rsquo;s included<br />
              <em>in each service</em>
            </h2>
            <p className="services-compare-sub">
              A quick reference for what&rsquo;s covered across our four services. Customisations
              are always discussed during your consultation.
            </p>
          </div>

          <div className="services-compare-table-wrap">
            <table className="services-compare-table">
              <thead>
                <tr>
                  <th scope="col">Deliverable</th>
                  {SERVICES.map((s) => (
                    <th key={s.id} scope="col">
                      {s.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row) => (
                  <tr key={row.label}>
                    <td>{row.label}</td>
                    {row.values.map((v, i) => (
                      <td key={i}>
                        {v ? (
                          <span className="services-compare-check" aria-label="Included">
                            <Check size={13} strokeWidth={2.5} aria-hidden="true" />
                          </span>
                        ) : (
                          <span className="services-compare-dash" aria-label="Not included">
                            —
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Scenarios chooser ────────────────────────────────────────── */}
      <section className="services-scenarios" aria-label="Which service is right for you">
        <div className="services-scenarios-inner">
          <div className="services-scenarios-header">
            <p className="type-eyebrow">Not sure which?</p>
            <h2 className="services-scenarios-title">
              Pick the scenario<br />
              <em>that sounds like you</em>
            </h2>
            <p className="services-scenarios-sub">
              Tap a scenario to start a booking pre-filled with the right service. We&rsquo;ll
              tailor everything else in the consultation.
            </p>
          </div>

          <div className="services-scenarios-grid">
            {SCENARIOS.map((s) => (
              <Link
                key={s.eyebrow}
                href={`/booking?service=${s.serviceId}`}
                className="scenario-card"
              >
                <p className="scenario-card-eyebrow">{s.eyebrow}</p>
                <p className="scenario-card-title">{s.title}</p>
                <div className="scenario-card-service">
                  <span>{s.serviceLabel}</span>
                  <ArrowRight
                    size={14}
                    className="scenario-card-arrow ml-auto"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Closing CTA ──────────────────────────────────────────────── */}
      <section className="portfolio-cta-band" aria-label="Start your project">
        <div className="portfolio-cta-inner">
          <div className="portfolio-cta-text">
            <h2>
              Still not sure where<br />
              <em>to begin?</em>
            </h2>
            <p>
              Book a free 20-minute consultation and we&rsquo;ll help you pick the right service
              for your project — no commitment, no obligation.
            </p>
          </div>
          <div className="portfolio-cta-actions">
            <Button asChild variant="default" size="lg">
              <Link href="/booking">
                Book a consultation <ArrowRight size={15} />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">Ask a question</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
