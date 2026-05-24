import { Suspense } from "react";
import { BookingForm } from "@/frontend/components/features/BookingForm";
import { Skeleton } from "@/frontend/components/ui/skeleton";
import { CONTACT } from "@/shared/constants/contact";

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

const TRUST_SIGNALS = [
  { label: "Response time", value: "< 1 day" },
  { label: "Projects delivered", value: "200+" },
  { label: "Years in practice", value: "10+" },
];

export default function BookingPage() {
  return (
    <>
      {/* Hero */}
      <section className="booking-hero" aria-label="Book a consultation">
        <div className="booking-hero-inner">
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
              <a href={`tel:${CONTACT.PHONE_E164}`} className="booking-contact-link">
                {CONTACT.PHONE_DISPLAY}
              </a>
              <a href="mailto:info@sunduza.co.za" className="booking-contact-link">
                info@sunduza.co.za
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
