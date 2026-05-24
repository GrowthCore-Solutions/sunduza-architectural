import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { ContactForm } from "@/frontend/components/features/ContactForm";
import { CONTACT } from "@/shared/constants/contact";

export const metadata = {
  title: "Contact",
  description:
    "Get in touch with Sunduza Architectural & Projects. We respond to all enquiries within 24 hours.",
};

const CHANNELS = [
  {
    icon: Phone,
    label: "Call",
    value: CONTACT.PHONE_DISPLAY,
    hint: CONTACT.HOURS,
    href: `tel:${CONTACT.PHONE_E164}`,
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: CONTACT.PHONE_DISPLAY,
    hint: "Fastest response",
    href: `https://wa.me/${CONTACT.WHATSAPP_NUMBER}`,
  },
  {
    icon: Mail,
    label: "Email",
    value: CONTACT.EMAIL,
    hint: "Reply within 24 hours",
    href: `mailto:${CONTACT.EMAIL}`,
  },
  {
    icon: MapPin,
    label: "Studio",
    value: CONTACT.LOCATION,
    hint: "By appointment",
    href: null,
  },
] as const;

const META = [
  { icon: Clock, label: "Response time", value: "Within 24 hours" },
  { icon: Mail, label: "Office hours", value: CONTACT.HOURS_FULL },
];

const WHAT_TO_INCLUDE = [
  "A short summary of your project or enquiry",
  "Your preferred contact method and best time to reach you",
  "Any relevant timelines, budget range, or municipality",
  "Links to references or inspiration, if available",
];

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="contact-hero-light" aria-label="Contact Sunduza">
        <div className="contact-hero-inner">
          <div className="contact-hero-grid">
            <div>
              <p className="type-eyebrow">Get in touch</p>
              <h1 className="contact-hero-title">
                Let&rsquo;s start a<br />
                <em>conversation</em>
              </h1>
              <p className="contact-hero-sub">
                Have a question, a project in mind, or want to understand our process? Reach out
                through any channel below — we read every message and respond within one business day.
              </p>
            </div>

            <div className="contact-hero-meta" role="complementary" aria-label="At a glance">
              {META.map((m) => {
                const Icon = m.icon;
                return (
                  <div key={m.label} className="contact-hero-meta-row">
                    <div className="contact-hero-meta-icon" aria-hidden="true">
                      <Icon size={16} strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="contact-hero-meta-label">{m.label}</p>
                      <p className="contact-hero-meta-value">{m.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Channels strip */}
      <section className="contact-channels" aria-label="Contact channels">
        <div className="contact-channels-inner">
          {CHANNELS.map((c) => {
            const Icon = c.icon;
            const inner = (
              <>
                <div className="contact-channel-icon" aria-hidden="true">
                  <Icon size={18} strokeWidth={1.75} />
                </div>
                <div>
                  <p className="contact-channel-label">{c.label}</p>
                  <p className="contact-channel-value">{c.value}</p>
                  <p className="contact-channel-hint">{c.hint}</p>
                </div>
              </>
            );

            return c.href ? (
              <a
                key={c.label}
                href={c.href}
                className="contact-channel-card"
                {...(c.href.startsWith("http")
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {inner}
              </a>
            ) : (
              <div key={c.label} className="contact-channel-card">
                {inner}
              </div>
            );
          })}
        </div>
      </section>

      {/* Body */}
      <section className="contact-body" aria-label="Send a message">
        <div className="contact-body-inner">
          {/* Aside */}
          <aside className="contact-aside" aria-label="Guidance and resources">
            <div>
              <h2 className="contact-aside-heading">Before you write</h2>
              <p className="text-sm leading-relaxed text-muted mt-1">
                A few details help us reply with something useful from the first message.
              </p>
            </div>

            <div className="contact-info-card">
              <p className="contact-info-card-eyebrow">What to include</p>
              <p className="contact-info-card-title">Tell us a little, get a lot back.</p>
              <ul className="contact-checklist mt-3">
                {WHAT_TO_INCLUDE.map((item) => (
                  <li key={item} className="contact-checklist-item">
                    <span className="contact-checklist-mark" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="contact-handoff">
              <p className="text-sm leading-relaxed text-ink">
                Have a defined project? The <a href="/booking">booking form</a> captures everything
                we need to prepare a proper consultation — recommended for new commissions.
              </p>
            </div>
          </aside>

          {/* Form panel */}
          <div className="contact-form-panel">
            <p className="contact-form-eyebrow">Send a message</p>
            <h2 className="contact-form-title">We&rsquo;ll get back to you soon</h2>
            <p className="contact-form-lead">
              Fill in the form below and our team will reply within 24 hours during business days.
            </p>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
