import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy policy for Sunduza Architectural & Projects — how we collect, use, and protect your personal information in compliance with POPIA.",
};

const EFFECTIVE_DATE = "15 May 2026";
const BUSINESS_NAME = "Sunduza Architectural & Projects (Pty) Ltd";
const CONTACT_EMAIL = "xivutisokevinsunduza@gmail.com";
const CONTACT_PHONE = "+27 78 672 3364";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[--color-paper] py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4">

        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[--color-primary] mb-3">
            Legal
          </p>
          <h1 className="font-serif text-4xl font-black text-[--color-ink] mb-3">
            Privacy Policy
          </h1>
          <p className="text-sm text-[--color-muted]">
            Effective date: {EFFECTIVE_DATE}
          </p>
        </div>

        <div className="prose prose-sm max-w-none space-y-8 text-[--color-muted] leading-relaxed">

          <section>
            <h2 className="font-serif text-xl font-bold text-[--color-ink] mb-3">
              1. Who We Are
            </h2>
            <p>
              This privacy policy applies to {BUSINESS_NAME} (&ldquo;Sunduza&rdquo;,
              &ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;), a professional
              architectural services company operating in South Africa.
            </p>
            <p className="mt-2">
              We are committed to protecting your personal information in compliance
              with the Protection of Personal Information Act, 4 of 2013
              (&ldquo;POPIA&rdquo;).
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[--color-ink] mb-3">
              2. Information We Collect
            </h2>
            <p>
              When you submit a consultation booking or contact form on our website,
              we collect the following personal information:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone / WhatsApp number</li>
              <li>Project location</li>
              <li>Project description and budget (optional)</li>
              <li>Preferred meeting date</li>
            </ul>
            <p className="mt-3">
              We also automatically collect non-personally identifiable technical
              information including the page you visited, your browser type, and a
              hashed (non-reversible) version of your IP address for security
              purposes. Your raw IP address is never stored.
            </p>
            <p className="mt-3">
              If you arrived via a Google Ad or organic search, we may also record
              the campaign that referred you (UTM parameters) for advertising
              optimisation. This data is linked to your booking enquiry and used
              only for internal reporting.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[--color-ink] mb-3">
              3. Why We Collect It
            </h2>
            <p>We use your personal information exclusively to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Contact you to confirm and manage your consultation appointment</li>
              <li>Provide the architectural services you have requested</li>
              <li>Respond to your general enquiries</li>
              <li>Comply with our legal obligations</li>
            </ul>
            <p className="mt-3">
              We do not use your information for unsolicited marketing. We do not
              sell, rent, or share your personal information with third parties
              for their own marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[--color-ink] mb-3">
              4. Your Consent (POPIA Section 11)
            </h2>
            <p>
              By submitting a booking or contact form on this website, you
              voluntarily provide your personal information and consent to its
              processing for the purposes described in this policy. This consent
              is recorded at the time of submission alongside the date and time
              it was given.
            </p>
            <p className="mt-3">
              You may withdraw your consent at any time by contacting us at
              the details below. Withdrawal of consent does not affect the
              lawfulness of processing based on consent before its withdrawal.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[--color-ink] mb-3">
              5. How Long We Keep Your Data
            </h2>
            <p>
              We retain personal information for as long as is necessary to
              fulfil the purpose for which it was collected:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                Active consultation bookings: retained for the duration of the
                engagement plus 2 years.
              </li>
              <li>
                Completed or rejected bookings: retained for 2 years, then
                securely deleted.
              </li>
              <li>
                Contact messages: retained for 1 year unless a service
                engagement results from the enquiry.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[--color-ink] mb-3">
              6. Your Rights (POPIA Section 23–25)
            </h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                <strong>Access</strong> — request a copy of the personal
                information we hold about you.
              </li>
              <li>
                <strong>Correction</strong> — request that we correct inaccurate
                information.
              </li>
              <li>
                <strong>Deletion (Right to Erasure)</strong> — request that we
                delete your personal information, subject to our legal
                obligations to retain certain records.
              </li>
              <li>
                <strong>Object</strong> — object to processing of your personal
                information in certain circumstances.
              </li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at {CONTACT_EMAIL}.
              We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[--color-ink] mb-3">
              7. Security
            </h2>
            <p>
              We implement appropriate technical and organisational measures to
              protect your personal information against unauthorised access,
              disclosure, alteration, or destruction. Our website is served over
              HTTPS. Access to personal information is restricted to authorised
              personnel only.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[--color-ink] mb-3">
              8. Cookies & Analytics
            </h2>
            <p>
              We use Google Analytics 4 to understand how visitors use our
              website. This involves setting cookies on your device. You will be
              asked for your consent before any analytics cookies are set. If you
              decline, your browsing is not tracked by Google Analytics.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[--color-ink] mb-3">
              9. Contact & Complaints
            </h2>
            <p>
              For any privacy-related questions, requests, or complaints, contact
              our Information Officer:
            </p>
            <address className="mt-3 not-italic space-y-1">
              <p>
                <strong>Xivutiso Kevin Sunduza</strong>
              </p>
              <p>{BUSINESS_NAME}</p>
              <p>
                Email:{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-[--color-primary] hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>
              </p>
              <p>Phone: {CONTACT_PHONE}</p>
            </address>
            <p className="mt-4">
              If you are not satisfied with our response, you have the right to
              lodge a complaint with the Information Regulator of South Africa:
              <br />
              Website:{" "}
              <a
                href="https://inforegulator.org.za"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[--color-primary] hover:underline"
              >
                inforegulator.org.za
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[--color-ink] mb-3">
              10. Changes to This Policy
            </h2>
            <p>
              We may update this policy from time to time. The effective date at
              the top of this page will reflect any changes. Continued use of
              our website after changes constitutes acceptance of the updated policy.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
