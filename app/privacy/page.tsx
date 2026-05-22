import { PageHeader } from "@/frontend/components/features/PageHeader";

export const metadata = {
  title: "Privacy Policy",
  description: "POPIA privacy policy for Sunduza Architectural & Projects.",
};

const SECTIONS = [
  {
    title: "Who we are",
    content:
      'Sunduza Architectural & Projects (Pty) Ltd ("Sunduza", "we", "us") is responsible for the personal information collected through this website and consultation booking forms.',
  },
  {
    title: "What we collect",
    list: [
      "Name, email address, and phone number",
      "Project location and description",
      "Optional budget and preferred meeting date",
      "IP address and browser user agent (for security and fraud prevention)",
      "Marketing attribution data (UTM parameters) when provided",
    ],
  },
  {
    title: "Why we collect it",
    content:
      "We process your information to respond to consultation requests, manage project enquiries, and comply with South African law including the Protection of Personal Information Act (POPIA).",
  },
  {
    title: "How long we keep it",
    content:
      "Booking and contact records are retained for up to two years after the last status update, unless a longer period is required by law or you request earlier deletion.",
  },
  {
    title: "Your rights",
    content: null,
    contact: true,
  },
  {
    title: "Consent",
    content:
      "When you submit the booking form, you must explicitly consent to this processing. We record the time of consent with each submission.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="paper-grain min-h-screen">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 md:py-24">
        <PageHeader
          eyebrow="Legal"
          title="Privacy policy"
          description="Last updated: May 2026"
        />

        <div className="surface-panel divide-y divide-rule/40 overflow-hidden">
          {SECTIONS.map((section) => (
            <div key={section.title} className="px-6 py-6 md:px-8 md:py-7">
              <h2 className="font-serif text-xl font-semibold text-ink mb-3">
                {section.title}
              </h2>
              {section.content && (
                <p className="text-[0.9375rem] leading-relaxed text-muted">
                  {section.content}
                </p>
              )}
              {section.list && (
                <ul className="mt-2 space-y-1.5">
                  {section.list.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[0.9375rem] leading-relaxed text-muted">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              {section.contact && (
                <p className="text-[0.9375rem] leading-relaxed text-muted">
                  You may request access to, correction of, or deletion of your personal
                  information by emailing{" "}
                  <a
                    href="mailto:xivutisokevinsunduza@gmail.com"
                    className="font-medium text-primary hover:underline"
                  >
                    xivutisokevinsunduza@gmail.com
                  </a>
                  .
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
