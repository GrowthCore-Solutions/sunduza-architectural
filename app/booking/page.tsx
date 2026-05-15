import type { Metadata } from "next";
import { BookingForm } from "@/src/client/components/features/BookingForm";
import { PageHero } from "@/src/client/components/sections/PageHero";

export const metadata: Metadata = {
  title: "Book a Consultation",
  description:
    "Book a free consultation with Sunduza Architectural & Projects. Tell us about your project — house planning, architectural drawings, drafting services, or development project planning.",
  openGraph: {
    title: "Book a Consultation — Sunduza Architectural & Projects",
    description:
      "Start your architectural project. Book a free consultation and receive professional drawings that get approved first time.",
  },
};

export default function BookingPage() {
  return (
    <div className="bg-[--color-paper2]">
      <PageHero
        label="Get Started"
        title="Book a Consultation"
        description="Tell us about your project and we will be in touch within 24 hours to confirm your appointment."
      />
      <section className="py-16 md:py-20">
        <BookingForm />
      </section>
    </div>
  );
}
