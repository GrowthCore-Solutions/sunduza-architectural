import { Suspense } from "react";
import { BookingForm } from "@/frontend/components/features/BookingForm";
import { Skeleton } from "@/frontend/components/ui/skeleton";
import { LiveDot } from "@/frontend/components/ui/LiveDot";
import { getPublicSiteSettings } from "@/backend/services/settings";

export const metadata = {
  title: "Book a Consultation",
  description:
    "Request a consultation with Sunduza Architectural & Projects. We respond within one business day.",
};

const PROCESS_STEPS = [
  {
    number: "01",
    title: "Submit your request",
    body: "Fill in your project details — the more context, the better prepared we will be.",
  },
  {
    number: "02",
    title: "We respond within 1 business day",
    body: "Our team reviews your submission and contacts you to schedule a consultation.",
  },
  {
    number: "03",
    title: "Consultation & brief",
    body: "We discuss scope, budget, and timeline, then agree on a clear plan of action.",
  },
  {
    number: "04",
    title: "Drawings delivered",
    body: "Council-ready documentation prepared to the exact standard your project requires.",
  },
];

export default async function BookingPage() {
  const settings = await getPublicSiteSettings();

  const TRUST_SIGNALS = [
    { label: "Response time", value: "< 1 day" },
    {
      label: "Projects delivered",
      value: settings.projectsCompleted ? `${settings.projectsCompleted}+` : "—",
    },
    {
      label: "Years in practice",
      value: settings.yearsExperience ? `${settings.yearsExperience}+` : "—",
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="booking-hero" aria-label="Book a consultation">
        <div className="booking-hero-inner">
          <p className="booking-hero-status" aria-label="Studio is accepting new consultations">
            <LiveDot color="bg-primary-light" size={2} />
            <span>Studio open for 2026 consultations</span>
          </p>
          <p className="type-eyebrow" style={{ color: "rgba(255,255,255,0.55)" }}>
            Start your project
          </p>
          <h1 className="booking-hero-title">
            Book a<br />
            <em>consultation</em>
          </h1>
          <p className="booking-hero-sub">
            Tell us about your project and we will contact you within one business day.
          </p>
          <div className="booking-trust-row" aria-label="Key figures">
            {TRUST_SIGNALS.map((s) => (
              <div key={s.label} className="booking-trust-item">
                <span className="booking-trust-value">{s.value}</span>
                <span className="booking-trust-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main layout */}
      <section className="booking-body" aria-label="Consultation request form">
        <div className="booking-body-inner">
          {/* Sidebar */}
          <aside className="booking-sidebar" aria-label="How the process works">
            <h2 className="booking-sidebar-heading">How it works</h2>

            <ol className="booking-steps" aria-label="Process steps">
              {PROCESS_STEPS.map((step) => (
                <li key={step.number} className="booking-step">
                  <span className="booking-step-num" aria-hidden="true">
                    {step.number}
                  </span>
                  <div>
                    <p className="booking-step-title">{step.title}</p>
                    <p className="booking-step-body">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="booking-tip-card" role="note" aria-label="Tip for a better consultation">
              <p className="booking-tip-label">Tip for a better first call</p>
              <p className="booking-tip-body">
                Share your location, project type, rough budget, and any municipal deadlines — the
                more we know upfront, the more productive your consultation will be.
              </p>
            </div>

            <address className="booking-contact-note" aria-label="Direct contact options">
              <p className="booking-contact-note-label">Prefer to call?</p>
              <a href={`tel:${settings.phoneE164}`} className="booking-contact-link">
                {settings.phone}
              </a>
              <a href={`mailto:${settings.email}`} className="booking-contact-link">
                {settings.email}
              </a>
            </address>
          </aside>

          {/* Form panel */}
          <div className="booking-form-panel">
            <Suspense fallback={<Skeleton className="h-[38rem] w-full rounded-lg" />}>
              <BookingForm />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  );
}
