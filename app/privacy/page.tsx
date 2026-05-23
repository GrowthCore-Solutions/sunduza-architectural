import Link from "next/link";
import {
  ArrowRight,
  Eye,
  Edit3,
  Trash2,
  Download,
  Shield,
  Mail,
  Building2,
  Lock,
} from "lucide-react";
import { Button } from "@/frontend/components/ui/button";

export const metadata = {
  title: "Privacy Policy",
  description:
    "How Sunduza Architectural & Projects collects, uses, and protects your personal information under POPIA.",
};

const SECTIONS = [
  {
    id: "who-we-are",
    num: "01",
    title: "Who we are",
    body: (
      <>
        <p>
          <strong>Sunduza Architectural &amp; Projects (Pty) Ltd</strong>{" "}
          (&ldquo;Sunduza&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is a South
          African architectural practice. We are the responsible party for the
          personal information you share through this website, the consultation
          booking form, and the contact channels listed at the end of this
          policy.
        </p>
        <p>
          This policy explains what we collect, why we collect it, how long we
          keep it, and the rights you hold under the{" "}
          <strong>Protection of Personal Information Act, 2013 (POPIA)</strong>.
        </p>
      </>
    ),
  },
  {
    id: "what-we-collect",
    num: "02",
    title: "What we collect",
    body: (
      <>
        <p>
          We collect only what we need to respond to your enquiry and run the
          project. Nothing is sold, traded, or used for advertising profiling.
        </p>
        <dl className="privacy-data-list">
          <div className="privacy-data-row">
            <dt className="privacy-data-key">Identity</dt>
            <dd className="privacy-data-val">
              Full name and how you&rsquo;d like to be addressed.
            </dd>
          </div>
          <div className="privacy-data-row">
            <dt className="privacy-data-key">Contact</dt>
            <dd className="privacy-data-val">
              Email address and phone number, used only to reply to your
              enquiry.
            </dd>
          </div>
          <div className="privacy-data-row">
            <dt className="privacy-data-key">Project details</dt>
            <dd className="privacy-data-val">
              Location, brief, optional budget range, and preferred meeting
              date.
            </dd>
          </div>
          <div className="privacy-data-row">
            <dt className="privacy-data-key">Technical</dt>
            <dd className="privacy-data-val">
              IP address and browser user-agent, recorded with submissions for
              fraud and abuse prevention.
            </dd>
          </div>
          <div className="privacy-data-row">
            <dt className="privacy-data-key">Attribution</dt>
            <dd className="privacy-data-val">
              UTM parameters when present in the link you arrived from, so we
              know which channels are working.
            </dd>
          </div>
        </dl>
      </>
    ),
  },
  {
    id: "why",
    num: "03",
    title: "Why we collect it",
    body: (
      <>
        <p>
          We process your information on the lawful bases of{" "}
          <strong>consent</strong> (when you submit a form) and{" "}
          <strong>legitimate interest</strong> (when we follow up on an active
          enquiry or maintain records required by professional regulation).
        </p>
        <p>Specifically, we use your data to:</p>
        <p>
          &mdash; respond to consultation and contact requests; &mdash; quote
          on, schedule, and deliver architectural work; &mdash; keep records
          required by SACAP and South African Revenue Service; &mdash; protect
          our systems against spam, scraping, and abuse.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    num: "04",
    title: "How long we keep it",
    body: (
      <>
        <p>
          Booking and contact records are retained for up to{" "}
          <strong>two years</strong> after the last status update on your
          enquiry, unless a longer period is required by law or you ask us to
          delete sooner.
        </p>
        <p>
          Project files, drawings, and correspondence are kept for the period
          required by the architectural profession&rsquo;s record-keeping
          standards (typically five years after project closure), then archived
          or destroyed.
        </p>
        <div className="privacy-callout">
          <p className="privacy-callout-label">Short version</p>
          <p className="privacy-callout-body">
            Enquiries: 2 years. Active project files: as long as the project
            runs, plus 5 years. Then deleted, unless you&rsquo;ve asked
            otherwise.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "rights",
    num: "05",
    title: "Your rights under POPIA",
    body: (
      <>
        <p>
          You hold the rights below over any personal information we process
          about you. To exercise any of them, email us at the address in the
          contact card &mdash; we respond within 14 days.
        </p>
        <div className="privacy-rights-grid">
          {[
            {
              icon: Eye,
              title: "Right of access",
              body: "See what information we hold about you, and how we use it.",
            },
            {
              icon: Edit3,
              title: "Right to correct",
              body: "Update inaccurate or incomplete records about you.",
            },
            {
              icon: Trash2,
              title: "Right to delete",
              body: "Request removal where retention is no longer required.",
            },
            {
              icon: Download,
              title: "Right to portability",
              body: "Receive your data in a structured, machine-readable form.",
            },
            {
              icon: Shield,
              title: "Right to object",
              body: "Object to processing or withdraw your consent at any time.",
            },
            {
              icon: Lock,
              title: "Right to complain",
              body: "Lodge a complaint with the Information Regulator (SA).",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="privacy-right-card">
              <div className="privacy-right-card-head">
                <span className="privacy-right-card-icon" aria-hidden="true">
                  <Icon size={14} strokeWidth={2} />
                </span>
                <p className="privacy-right-card-title">{title}</p>
              </div>
              <p className="privacy-right-card-body">{body}</p>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    id: "security",
    num: "06",
    title: "How we protect it",
    body: (
      <>
        <p>
          Data lives in encrypted databases hosted within reputable cloud
          infrastructure, with access restricted to authorised team members on
          a need-to-know basis. Transport between your browser and our servers
          is protected by TLS.
        </p>
        <p>
          We do not transfer your personal information outside South Africa
          except where the cloud or email provider stores it in another
          jurisdiction with comparable protections, as permitted under POPIA
          section 72.
        </p>
      </>
    ),
  },
  {
    id: "consent",
    num: "07",
    title: "Consent &amp; changes",
    body: (
      <>
        <p>
          When you submit the booking or contact form, you explicitly consent
          to the processing described above. We record the timestamp of consent
          with each submission.
        </p>
        <p>
          We may update this policy as our services or the law evolves. The
          &ldquo;last updated&rdquo; date at the top reflects the most recent
          revision. Material changes will be highlighted on the homepage for at
          least 14 days.
        </p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="privacy-hero" aria-label="Privacy policy overview">
        <div className="privacy-hero-inner">
          <div className="privacy-hero-meta">
            <span>Legal</span>
            <span
              className="privacy-hero-meta-dot"
              aria-hidden="true"
            />
            <span>POPIA compliant</span>
            <span
              className="privacy-hero-meta-dot"
              aria-hidden="true"
            />
            <span>Last updated · May 2026</span>
          </div>

          <h1 className="privacy-hero-title">
            Your information,<br />
            <em>handled with care.</em>
          </h1>

          <p className="privacy-hero-sub">
            Sunduza is a South African architectural practice &mdash; not an
            advertising network. We collect the minimum we need to respond to
            your enquiry and deliver your project, and we keep it private.
            Here&rsquo;s exactly what that means.
          </p>

          <div className="privacy-hero-chips">
            <span className="privacy-hero-chip">
              <Shield size={11} strokeWidth={2.25} aria-hidden="true" />
              POPIA aligned
            </span>
            <span className="privacy-hero-chip">
              <Lock size={11} strokeWidth={2.25} aria-hidden="true" />
              TLS encrypted
            </span>
            <span className="privacy-hero-chip">
              <Mail size={11} strokeWidth={2.25} aria-hidden="true" />
              No marketing lists
            </span>
          </div>
        </div>
      </section>

      {/* ── Body: TOC + sections ──────────────────────────────────────── */}
      <section className="privacy-body" aria-label="Privacy policy sections">
        <div className="privacy-body-inner">
          <aside className="privacy-toc" aria-label="On this page">
            <p className="privacy-toc-label">On this page</p>
            <ul className="privacy-toc-list">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a className="privacy-toc-link" href={`#${s.id}`}>
                    <span className="privacy-toc-link-num">{s.num}</span>
                    <span dangerouslySetInnerHTML={{ __html: s.title }} />
                  </a>
                </li>
              ))}
            </ul>
          </aside>

          <div className="privacy-sections">
            {SECTIONS.map((s) => (
              <article key={s.id} id={s.id} className="privacy-section">
                <header className="privacy-section-head">
                  <span className="privacy-section-num" aria-hidden="true">
                    {s.num}
                  </span>
                  <h2
                    className="privacy-section-title"
                    dangerouslySetInnerHTML={{ __html: s.title }}
                  />
                </header>
                <div className="privacy-section-body">{s.body}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact strip ─────────────────────────────────────────────── */}
      <section className="privacy-contact-strip" aria-label="Privacy contact">
        <div className="privacy-contact-inner">
          <div>
            <p className="privacy-contact-eyebrow">Information officer</p>
            <h2 className="privacy-contact-title">
              Questions about your<br />
              <em>data with us?</em>
            </h2>
            <p className="privacy-contact-sub">
              Email our information officer directly to access, correct, or
              delete your personal information. We respond to all POPIA
              requests within 14 days.
            </p>
          </div>

          <div className="privacy-contact-card">
            <div className="privacy-contact-row">
              <span className="privacy-contact-row-icon" aria-hidden="true">
                <Mail size={14} strokeWidth={2} />
              </span>
              <div>
                <p className="privacy-contact-row-label">Email</p>
                <p className="privacy-contact-row-value">
                  <a href="mailto:xivutisokevinsunduza@gmail.com">
                    xivutisokevinsunduza@gmail.com
                  </a>
                </p>
              </div>
            </div>
            <div className="privacy-contact-row">
              <span className="privacy-contact-row-icon" aria-hidden="true">
                <Building2 size={14} strokeWidth={2} />
              </span>
              <div>
                <p className="privacy-contact-row-label">Registered name</p>
                <p className="privacy-contact-row-value">
                  Sunduza Architectural &amp; Projects (Pty) Ltd
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Closing CTA ───────────────────────────────────────────────── */}
      <section className="portfolio-cta-band" aria-label="Get in touch">
        <div className="portfolio-cta-inner">
          <div className="portfolio-cta-text">
            <h2>
              Ready when<br />
              <em>you are.</em>
            </h2>
            <p>
              Now that the small print is out of the way &mdash; let&rsquo;s
              talk about your project. Book a consultation or send us a quick
              note.
            </p>
          </div>
          <div className="portfolio-cta-actions">
            <Button asChild variant="default" size="lg">
              <Link href="/booking">
                Book a consultation <ArrowRight size={15} />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">Get in touch</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
