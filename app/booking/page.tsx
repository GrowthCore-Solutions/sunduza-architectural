import { Suspense } from "react";
import { PageHeader } from "@/src/client/components/features/PageHeader";
import { BookingForm } from "@/src/client/components/features/BookingForm";
import { Skeleton } from "@/src/client/components/ui/skeleton";

export const metadata = {
  title: "Book a Consultation",
  description: "Request a consultation with Sunduza Architectural & Projects.",
};

export default function BookingPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <PageHeader
        eyebrow="Start your project"
        title="Book a consultation"
        description="Tell us about your project and we will contact you within one business day."
      />
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-sm" />}>
        <BookingForm />
      </Suspense>
    </div>
  );
}
