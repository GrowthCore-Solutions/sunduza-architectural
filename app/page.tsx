import { HomePageContent } from "@/frontend/components/features/HomePageContent";
import { JsonLd } from "@/frontend/components/seo/JsonLd";
import { SITE_URL } from "@/shared/constants/site";
import { getPublicSiteSettings } from "@/backend/services/settings";

export default async function HomePage() {
  const settings = await getPublicSiteSettings();

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService"],
    name: "Sunduza Architectural & Projects (Pty) Ltd",
    description:
      "Professional architectural services across South Africa — house planning, architectural drawings, drafting services, and development project planning.",
    url: SITE_URL,
    telephone: settings.phoneE164,
    email: settings.email,
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

  return (
    <>
      <JsonLd schema={localBusinessSchema} />
      <HomePageContent settings={settings} />
    </>
  );
}
