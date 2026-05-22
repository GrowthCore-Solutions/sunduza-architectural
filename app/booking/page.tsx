import { Suspense } from "react";
import { CheckCircle2, Clock, FileText, MessageSquare } from "lucide-react";
import { BookingForm } from "@/src/client/components/features/BookingForm";
import { Skeleton } from "@/src/client/components/ui/skeleton";

export const metadata = {
  title: "Book a Consultation",
  description: "Request a consultation with Sunduza Architectural & Projects.",
};

const PROCESS_STEPS = [
  {
    icon: MessageSquare,
    title: "Submit your request",
    body: "Fill in your project details — the more context, the better prepared we will be.",
  },
  {
    icon: Clock,
    title: "We respond within 1 business day",
    body: "Our team reviews your submission and schedules a suitable time to connect.",
  },
  {
    icon: FileText,
    title: "Consultation & brief",
    body: "We discuss scope, budget, and timeline, then agree on a clear plan of action.",
  },
  {
    icon: CheckCircle2,
    title: "Drawings delivered",
    body: "Council-ready documentation prepared to the exact standard your project requires.",
  },
];

export default function BookingPage() {
  return (
    <div className="paper-grain min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 md:py-24">

        {/* Page heading */}
        <div className="mb-14 max-w-2xl">
          <p className="type-eyebrow mb-4">Start your project</p>
          <h1 className="font-serif text-[2.75rem] font-semibold leading-tight tracking-[-0.025em] text-ink md:text-6xl">
            Book a<br />
            <span className="font-light italic">consultation</span>
          </h1>
          <p className="mt-5 text-[1.0625rem] leading-relaxed text-muted">
            Tell us about your project and we will contact you within one business day.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.4fr]">

          {/* Left: process + note */}
          <div className="space-y-8">
            <div>
              <h2 className="font-serif text-xl font-semibold text-ink mb-5">
                How it works
              </h2>
              <ol className="space-y-5">
                {PROCESS_STEPS.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <li key={step.title} className="flex gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-paper2 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-ink">{step.title}</p>
                        <p className="mt-0.5 text-sm leading-relaxed text-muted">{step.body}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="rounded border border-primary/20 bg-primary/5 p-5 text-sm leading-relaxed text-ink">
              <p className="font-semibold text-primary mb-1.5">Tip for a better first call</p>
              Share your location, project type, rough budget, and any municipal deadlines — the more we know upfront, the more productive your consultation will be.
            </div>
          </div>

          {/* Right: form */}
          <div className="surface-panel p-6 md:p-8">
            <Suspense fallback={<Skeleton className="h-[32rem] w-full" />}>
              <BookingForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
