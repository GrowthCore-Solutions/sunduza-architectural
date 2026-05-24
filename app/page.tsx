import { HomePageContent } from "@/frontend/components/features/HomePageContent";
import { JsonLd } from "@/frontend/components/seo/JsonLd";
import { CONTACT } from "@/shared/constants/contact";
import { SITE_URL } from "@/shared/constants/site";

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "ProfessionalService"],
  name: "Sunduza Architectural & Projects (Pty) Ltd",
  description:
    "Professional architectural services across South Africa — house planning, architectural drawings, drafting services, and development project planning.",
  url: SITE_URL,
  telephone: CONTACT.PHONE_E164,
  email: CONTACT.EMAIL,
  address: {
    "@type": "PostalAddress",
    addressCountry: "ZA",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "17:00",
    },
  ],
  areaServed: {
    "@type": "Country",
    name: "South Africa",
  },
  priceRange: "$$",
  currenciesAccepted: "ZAR",
  paymentAccepted: "EFT, Bank Transfer",
};

export default function HomePage() {
  return (
    <>
      <JsonLd schema={localBusinessSchema} />
      <HomePageContent />
    </>
  );
}
