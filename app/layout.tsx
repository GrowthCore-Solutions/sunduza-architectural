import type { Metadata } from "next";
import { Playfair_Display, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FloatingWhatsApp } from "@/components/layout/floating-whatsapp";
import { Providers } from "@/components/providers";

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
  keywords: ["architectural services", "house planning", "South Africa", "architectural drawings", "drafting"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${ibmPlex.variable}`}>
      <body className={`${playfair.variable} ${ibmPlex.variable} antialiased bg-[#fffdf0] text-[#0f172a]`}>
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <FloatingWhatsApp />
        </Providers>
      </body>
    </html>
  );
}