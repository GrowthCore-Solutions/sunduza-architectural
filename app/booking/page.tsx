"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BookingSchema, type BookingInput } from "@/types/booking";
import { cn } from "@/lib/utils";

const SERVICES = [
  "House Planning",
  "Architectural Drawings",
  "Drafting Services",
  "Development Projects",
] as const;

function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label required={required}>{label}</Label>
      {children}
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}

export default function BookingPage() {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BookingInput>({
    resolver: zodResolver(BookingSchema),
  });

  const onSubmit = async (data: BookingInput) => {
    setServerError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setServerError(json.message ?? "Something went wrong.");
        return;
      }
      setSubmitted(true);
    } catch {
      setServerError("Network error. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#1a5c2e]/10 mx-auto">
            <svg className="h-8 w-8 text-[#1a5c2e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-serif text-3xl font-black text-[#0f172a] mb-4">Request Received</h1>
          <p className="text-[#5a5040] mb-8">
            Thank you. We have received your consultation request and will contact you within 24 hours to confirm your appointment.
          </p>
          <Button variant="outline" onClick={() => router.push("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-24 bg-[#faf8f2]">
      <div className="mx-auto max-w-2xl px-4">
        <div className="text-center mb-12">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#b88b4a] mb-3">Get Started</p>
          <h1 className="font-serif text-4xl font-black text-[#0f172a]">Book a Consultation</h1>
          <p className="mt-4 text-[#5a5040]">
            Tell us about your project and we will be in touch within 24 hours.
          </p>
        </div>

        {serverError && (
          <div className="mb-6 rounded-sm border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-sm border border-[#e8ddd0] bg-white p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Full Name" required error={errors.name?.message}>
              <Input placeholder="Your full name" {...register("name")} />
            </FormField>
            <FormField label="Email Address" required error={errors.email?.message}>
              <Input type="email" placeholder="you@example.com" {...register("email")} />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Phone / WhatsApp" required error={errors.phone?.message}>
              <Input type="tel" placeholder="+27 XX XXX XXXX" {...register("phone")} />
            </FormField>
            <FormField label="Service Needed" required error={errors.service?.message}>
              <select
                {...register("service")}
                className="flex h-10 w-full rounded-sm border border-[#c8bfa8] bg-white px-3 py-2 text-sm focus:border-[#b88b4a] focus:outline-none focus:ring-2 focus:ring-[#b88b4a]/20"
              >
                <option value="">Select a service</option>
                {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormField>
          </div>

          <FormField label="Project Location" required error={errors.location?.message}>
            <Input placeholder="City, suburb, or area" {...register("location")} />
          </FormField>

          <FormField label="Project Description" required error={errors.description?.message}>
            <Textarea placeholder="Describe your project, goals, and any specific requirements..." {...register("description")} />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Preferred Consultation Date" required error={errors.meetingDate?.message}>
              <Input type="date" {...register("meetingDate")} />
            </FormField>
            <FormField label="Estimated Budget (Optional)" error={errors.budget?.message}>
              <Input placeholder="e.g. R50,000 – R100,000" {...register("budget")} />
            </FormField>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Consultation Request"}
          </Button>
        </form>
      </div>
    </div>
  );
}
