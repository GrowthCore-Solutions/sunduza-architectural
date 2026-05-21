import type { Metadata } from "next";
import { Playfair_Display, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/src/client/components/layout/Header";
import { Footer } from "@/src/client/components/layout/Footer";
import { FloatingWhatsApp } from "@/src/client/components/layout/FloatingWhatsApp";
import { Providers } from "@/src/client/components/providers";
import { unstable_cache } from "next/cache";
import { getSetting } from "@/server/settings";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-serif",
  display: "swap",
});

const ibmPlex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
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
      return (await getSetting("whatsapp_number")) ?? "27786723364";
    } catch {
      return "27786723364";
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
      className={`${playfair.variable} ${ibmPlex.variable}`}
    >
      <body
        className={`${playfair.variable} ${ibmPlex.variable} antialiased bg-[--color-paper] text-[--color-ink] flex flex-col min-h-screen`}
      >
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
