import { PageHeader } from "@/src/client/components/features/PageHeader";

export const metadata = {
  title: "Privacy Policy",
  description: "POPIA privacy policy for Sunduza Architectural & Projects.",
};

export default function PrivacyPage() {
  return (
    <div className="paper-grain">
      <div className="mx-auto max-w-3xl px-4 py-16 md:py-20">
        <PageHeader
          eyebrow="Legal"
          title="Privacy policy"
          description="Last updated: May 2026"
        />
        <div className="space-y-6 rounded-md border border-rule/75 bg-white/92 p-6 leading-relaxed text-ink shadow-soft md:p-8">
        <section>
          <h2 className="font-serif text-xl font-bold text-ink">Who we are</h2>
          <p className="text-muted mt-2">
            Sunduza Architectural & Projects (Pty) Ltd (&ldquo;Sunduza&rdquo;, &ldquo;we&rdquo;,
            &ldquo;us&rdquo;) is responsible for the personal information collected through this
            website and consultation booking forms.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-xl font-bold text-ink">What we collect</h2>
          <ul className="mt-2 list-disc pl-5 text-muted space-y-1">
            <li>Name, email address, and phone number</li>
            <li>Project location and description</li>
            <li>Optional budget and preferred meeting date</li>
            <li>IP address and browser user agent (for security and fraud prevention)</li>
            <li>Marketing attribution data (UTM parameters) when provided</li>
          </ul>
        </section>
        <section>
          <h2 className="font-serif text-xl font-bold text-ink">Why we collect it</h2>
          <p className="text-muted mt-2">
            We process your information to respond to consultation requests, manage project
            enquiries, and comply with South African law including the Protection of Personal
            Information Act (POPIA).
          </p>
        </section>
        <section>
          <h2 className="font-serif text-xl font-bold text-ink">How long we keep it</h2>
          <p className="text-muted mt-2">
            Booking and contact records are retained for up to two years after the last status
            update, unless a longer period is required by law or you request earlier deletion.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-xl font-bold text-ink">Your rights</h2>
          <p className="text-muted mt-2">
            You may request access to, correction of, or deletion of your personal information by
            emailing{" "}
            <a
              href="mailto:xivutisokevinsunduza@gmail.com"
              className="text-primary underline"
            >
              xivutisokevinsunduza@gmail.com
            </a>
            .
          </p>
        </section>
        <section>
          <h2 className="font-serif text-xl font-bold text-ink">Consent</h2>
          <p className="text-muted mt-2">
            When you submit the booking form, you must explicitly consent to this processing. We
            record the time of consent with each submission.
          </p>
        </section>
        </div>
      </div>
    </div>
  );
}
