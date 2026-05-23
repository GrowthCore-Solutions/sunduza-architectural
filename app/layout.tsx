import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/frontend/components/layout/Header";
import { Footer } from "@/frontend/components/layout/Footer";
import { FloatingWhatsApp } from "@/frontend/components/layout/FloatingWhatsApp";
import { Providers } from "@/frontend/components/providers";
import { unstable_cache } from "next/cache";
import { getSetting } from "@/backend/services/settings";
import { CONTACT } from "@/shared/constants/contact";
import { SITE_URL } from "@/shared/constants/site";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Sunduza Architectural & Projects | Professional Architectural Services",
    template: "%s | Sunduza Architectural",
  },
  description:
    "Sunduza Architectural & Projects (Pty) Ltd — Professional house planning, architectural drawings, drafting services, and development projects across South Africa.",
  keywords: [
    "architectural services",
    "house planning",
    "South Africa",
    "architectural drawings",
    "drafting services",
    "development projects",
    "council submissions",
  ],
  openGraph: {
    type: "website",
    locale: "en_ZA",
    siteName: "Sunduza Architectural & Projects",
    title: "Sunduza Architectural & Projects",
    description:
      "Professional house planning, architectural drawings, drafting, and development projects across South Africa.",
  },
};

const getWhatsAppNumber = unstable_cache(
  async () => {
    try {
      return (await getSetting("whatsapp_number")) ?? CONTACT.WHATSAPP_NUMBER;
    } catch {
      return CONTACT.WHATSAPP_NUMBER;
    }
  },
  ["whatsapp-number"],
  { revalidate: 3600 }
);

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const whatsAppNumber = await getWhatsAppNumber();

  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${dmSans.variable}`}
    >
      <body className="antialiased bg-paper text-ink flex flex-col min-h-screen">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <FloatingWhatsApp phoneNumber={whatsAppNumber} />
        </Providers>
      </body>
    </html>
  );
}
