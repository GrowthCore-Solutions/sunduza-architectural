"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/src/client/components/ui/button";
import { Input } from "@/src/client/components/ui/input";
import { Label } from "@/src/client/components/ui/label";
import { Textarea } from "@/src/client/components/ui/textarea";
import { SERVICES } from "@/src/shared/constants/services";
import { CreateBookingSchema, type CreateBookingInput } from "@/src/shared/schemas/booking.schema";
import { useBookingMutation } from "@/src/client/hooks/use-booking-mutation";

// ── Dynamic description prompts per service ──────────────────────────────────
const SERVICE_PROMPTS: Record<string, string> = {
  house_planning:
    "Describe your house: plot size, number of bedrooms, preferred style (modern, traditional, etc.), and any specific requirements such as a double garage, pool, or accessibility features.",
  arch_drawings:
    "Describe the drawings you need: is this a new build, extension, or renovation? What is the approximate floor area, and do you need structural coordination included?",
  drafting_services:
    "Describe the project: is this for a new build, an as-built survey, or town planning support? What format do you need the drawings in (PDF, DWG)?",
  dev_project_planning:
    "Describe your development: number of units, site size, development type (residential, commercial, mixed-use), and the stage you are at (concept, planning application, or full drawings).",
};

const DEFAULT_PROMPT =
  "Describe your project, goals, and any specific requirements you have in mind.";

export function BookingForm() {
  const searchParams = useSearchParams();
  const { mutateAsync, isPending, error: mutationError, isSuccess } = useBookingMutation();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateBookingInput>({
    resolver: zodResolver(CreateBookingSchema),
    defaultValues: {
      utmSource: searchParams.get("utm_source") ?? undefined,
      utmMedium: searchParams.get("utm_medium") ?? undefined,
      utmCampaign: searchParams.get("utm_campaign") ?? undefined,
      utmTerm: searchParams.get("utm_term") ?? undefined,
      utmContent: searchParams.get("utm_content") ?? undefined,
    },
  });

  const selectedService = watch("service");
  const descriptionPrompt = SERVICE_PROMPTS[selectedService] ?? DEFAULT_PROMPT;

  const onSubmit = async (data: CreateBookingInput) => {
    setServerError(null);
    try {
      await mutateAsync({
        ...data,
        referrerUrl:
          typeof document !== "undefined" ? document.referrer || undefined : undefined,
        landingPage:
          typeof window !== "undefined" ? window.location.href : undefined,
      });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  // ── Success state ────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="mx-auto max-w-2xl px-4">
        <div className="rounded-sm border border-[--color-rule] bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="font-serif text-3xl font-black text-[--color-ink] mb-3">
            Request Received
          </h2>
          <p className="text-[--color-muted] max-w-sm mx-auto leading-relaxed">
            Thank you. We have received your consultation request and will contact
            you within 24 hours to confirm your appointment.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/projects">View Our Work</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const displayError = serverError ?? (mutationError instanceof Error ? mutationError.message : null);

  return (
    <div className="mx-auto max-w-2xl px-4">
      {displayError && (
        <div className="mb-6 flex items-start gap-3 rounded-sm border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{displayError}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-6 rounded-sm border border-[--color-rule] bg-white p-8 shadow-sm"
      >
        {/* Honeypot — hidden from humans, bots fill it (S3.4) */}
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden"
          {...register("website")}
        />

        {/* Hidden UTM fields */}
        <input type="hidden" {...register("utmSource")} />
        <input type="hidden" {...register("utmMedium")} />
        <input type="hidden" {...register("utmCampaign")} />
        <input type="hidden" {...register("utmTerm")} />
        <input type="hidden" {...register("utmContent")} />

        {/* Row 1: Name + Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="name" required>Full Name</Label>
            <Input
              id="name"
              placeholder="Your full name"
              autoComplete="name"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" required>Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>
        </div>

        {/* Row 2: Phone + Service */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="phone" required>Phone / WhatsApp</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+27 XX XXX XXXX"
              autoComplete="tel"
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-xs text-red-600">{errors.phone.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="service" required>Service Needed</Label>
            <select
              id="service"
              {...register("service")}
              className="flex h-10 w-full rounded-sm border border-[--color-rule] bg-white px-3 py-2 text-sm text-[--color-ink] transition-colors focus:border-[--color-primary] focus:outline-none focus:ring-2 focus:ring-[--color-primary]/20"
            >
              <option value="">Select a service</option>
              {SERVICES.map((s) => (
                <option key={s.key} value={s.key}>{s.title}</option>
              ))}
            </select>
            {errors.service && (
              <p className="text-xs text-red-600">{errors.service.message}</p>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="space-y-1.5">
          <Label htmlFor="location" required>Project Location</Label>
          <Input
            id="location"
            placeholder="City, suburb, or area — e.g. Sandton, Johannesburg"
            {...register("location")}
          />
          {errors.location && (
            <p className="text-xs text-red-600">{errors.location.message}</p>
          )}
        </div>

        {/* Description — prompt changes per service */}
        <div className="space-y-1.5">
          <Label htmlFor="description" required>Project Description</Label>
          <Textarea
            id="description"
            rows={5}
            placeholder={descriptionPrompt}
            {...register("description")}
          />
          {errors.description && (
            <p className="text-xs text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Row 3: Date + Budget */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="meetingDate">Preferred Consultation Date</Label>
            <Input
              id="meetingDate"
              type="date"
              min={new Date().toISOString().split("T")[0]}
              {...register("meetingDate")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="budget">Estimated Budget (Optional)</Label>
            <Input
              id="budget"
              placeholder="e.g. R50,000 – R150,000"
              {...register("budget")}
            />
          </div>
        </div>

        {/* POPIA consent — required (BR-009) */}
        <div className="rounded-sm border border-[--color-rule] bg-[--color-paper2] p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-[--color-rule] accent-[--color-primary] cursor-pointer"
              {...register("consentGiven")}
            />
            <span className="text-sm text-[--color-muted] leading-relaxed">
              I agree that Sunduza Architectural & Projects may store and use my
              personal information to contact me about my consultation request,
              in accordance with the{" "}
              <Link
                href="/privacy"
                target="_blank"
                className="text-[--color-primary] hover:underline font-medium"
              >
                Privacy Policy
              </Link>{" "}
              and POPIA.{" "}
              <span className="text-red-600 font-medium">*</span>
            </span>
          </label>
          {errors.consentGiven && (
            <p className="text-xs text-red-600 mt-2 ml-7">
              {errors.consentGiven.message}
            </p>
          )}
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={isPending}>
          {isPending ? "Submitting…" : "Submit Consultation Request"}
        </Button>

        <p className="text-xs text-center text-[--color-muted]">
          We respond within 24 hours. No spam, no unsolicited calls.
        </p>
      </form>
    </div>
  );
}
