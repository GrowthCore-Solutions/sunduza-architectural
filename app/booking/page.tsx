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
    <div className="paper-grain">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-16 md:py-20 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <PageHeader
            eyebrow="Start your project"
            title="Book a consultation"
            description="Tell us about your project and we will contact you within one business day."
          />
          <div className="rounded-md border border-rule/75 bg-white/80 p-5 text-sm leading-relaxed text-muted shadow-soft">
            The more context you share, the better prepared the first call will
            be: location, project type, budget range, and any municipal deadlines.
          </div>
        </div>
        <div className="rounded-md border border-rule/75 bg-white/95 p-5 shadow-soft md:p-8">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <BookingForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
