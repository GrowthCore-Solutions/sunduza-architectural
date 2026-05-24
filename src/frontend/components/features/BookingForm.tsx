"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Home, FileText, Ruler, Building2, CheckCircle, ArrowRight } from "lucide-react";
import {
  BOOKING_SERVICE_LABELS,
  BOOKING_SERVICES,
  BookingSchema,
  type BookingInput,
} from "@/shared/types/booking";
import { api, ApiClientError } from "@/frontend/lib/api-client";
import { useServices } from "@/frontend/hooks/useServices";
import { Button } from "@/frontend/components/ui/button";
import { Checkbox } from "@/frontend/components/ui/checkbox";
import { FormField } from "@/frontend/components/ui/form-field";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { Textarea } from "@/frontend/components/ui/textarea";
import type { ApiSuccess } from "@/frontend/lib/api-types";
import type { BookingConfirm } from "@/shared/types/db";

const SERVICE_ICONS: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  house_planning: Home,
  arch_drawings: FileText,
  drafting_services: Ruler,
  dev_project_planning: Building2,
};

const NEXT_STEPS = [
  "We'll review your request and reach out within one business day to confirm details.",
  "A suitable consultation time will be agreed upon via your preferred contact method.",
  "We'll prepare a tailored brief and scope of work before our first meeting.",
];

export function BookingForm() {
  const searchParams = useSearchParams();
  const serviceParam = searchParams.get("service");
  const [bookingId, setBookingId] = React.useState<string | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const { data: liveServices } = useServices();

  // Live catalogue from the DB; fall back to the four static baseline slugs so
  // the form is never empty when the API is cold or unavailable.
  const services = liveServices ?? BOOKING_SERVICES.map((slug) => ({
    id: slug,
    slug,
    name: BOOKING_SERVICE_LABELS[slug as keyof typeof BOOKING_SERVICE_LABELS] ?? slug,
    description: null,
    icon: null,
    isActive: true,
    sortOrder: 0,
  }));

  const defaultService = serviceParam && services.some((s) => s.slug === serviceParam)
    ? serviceParam
    : undefined;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<BookingInput>({
    resolver: zodResolver(BookingSchema),
    defaultValues: {
      service: defaultService,
      consentGiven: undefined,
    },
  });

  async function onSubmit(data: BookingInput) {
    setSubmitError(null);
    const utm = {
      utmSource: searchParams.get("utm_source") ?? undefined,
      utmMedium: searchParams.get("utm_medium") ?? undefined,
      utmCampaign: searchParams.get("utm_campaign") ?? undefined,
      utmTerm: searchParams.get("utm_term") ?? undefined,
      utmContent: searchParams.get("utm_content") ?? undefined,
      referrerUrl: typeof document !== "undefined" ? document.referrer || undefined : undefined,
      landingPage: typeof window !== "undefined" ? window.location.href : undefined,
    };

    try {
      const res = await api.post<ApiSuccess<BookingConfirm>>("/api/bookings", { ...data, ...utm });
      setBookingId(res.data.id);
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : "Something went wrong. Please try again.";
      setSubmitError(message);
    }
  }

  if (bookingId) {
    return (
      <div className="booking-success" role="status" aria-live="polite">
        <div className="booking-success-icon" aria-hidden="true">
          <CheckCircle size={22} strokeWidth={1.75} />
        </div>

        <div>
          <p className="type-eyebrow mb-2" style={{ color: "var(--color-sage)" }}>
            Request received
          </p>
          <h2 className="booking-success-title">Consultation<br />request submitted</h2>
        </div>

        <p className="booking-success-copy">
          Your request has been received and we will be in touch shortly. Keep your reference number
          handy if you need to follow up.
        </p>

        <div
          className="booking-success-ref"
          aria-label={`Your booking reference is ${bookingId}`}
        >
          Reference: <strong>{bookingId}</strong>
        </div>

        <ol className="booking-success-next" aria-label="What happens next">
          {NEXT_STEPS.map((step, i) => (
            <li key={i} className="booking-success-next-item">
              <span className="booking-success-next-dot" aria-hidden="true" />
              <span>{step}</span>
            </li>
          ))}
        </ol>

        <div className="booking-success-ctas">
          <Button asChild variant="default" size="lg">
            <Link href="/projects">
              View our projects <ArrowRight size={15} />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Service selection */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-ink">
          Service<span aria-hidden="true" className="ml-0.5 text-red-600">*</span>
        </legend>
        <div className="service-radio-grid" role="radiogroup" aria-label="Select a service">
          {services.map((svc) => {
            const Icon = SERVICE_ICONS[svc.slug];
            return (
              <div key={svc.slug} className="service-radio-card">
                <input
                  type="radio"
                  id={`service-${svc.slug}`}
                  value={svc.slug}
                  {...register("service")}
                />
                <label htmlFor={`service-${svc.slug}`} className="service-radio-label">
                  {Icon && (
                    <span className="service-radio-icon" aria-hidden="true">
                      <Icon size={18} strokeWidth={1.75} />
                    </span>
                  )}
                  <span className="service-radio-name">{svc.name}</span>
                </label>
              </div>
            );
          })}
        </div>
        {errors.service && (
          <p className="text-xs font-medium text-red-700" role="alert" aria-live="polite">
            {errors.service.message}
          </p>
        )}
      </fieldset>

      {/* Personal details */}
      <div className="space-y-4">
        <div className="form-section-divider" aria-hidden="true">
          <span className="form-section-label">Your details</span>
        </div>

        <div className="form-field-row form-field-row-2">
          <FormField label="Full name" error={errors.name?.message} required>
            <Input id="name" autoComplete="name" placeholder="Jane Dlamini" {...register("name")} />
          </FormField>
          <FormField label="Email" error={errors.email?.message} required>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="jane@example.com"
              {...register("email")}
            />
          </FormField>
        </div>

        <div className="form-field-row form-field-row-2">
          <FormField label="Phone" error={errors.phone?.message} required>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+27 82 000 0000"
              {...register("phone")}
            />
          </FormField>
          <FormField label="Project location" error={errors.location?.message} required>
            <Input id="location" placeholder="City / suburb" {...register("location")} />
          </FormField>
        </div>
      </div>

      {/* Project details */}
      <div className="space-y-4">
        <div className="form-section-divider" aria-hidden="true">
          <span className="form-section-label">Project details</span>
        </div>

        <FormField
          label="Project description"
          error={errors.description?.message}
          hint="At least 20 characters — the more detail, the better we can prepare."
          required
        >
          <Textarea
            id="description"
            rows={5}
            placeholder="Describe your project, what you hope to achieve, and any constraints we should know about..."
            {...register("description")}
          />
        </FormField>
      </div>

      {/* Optional details */}
      <div className="space-y-4">
        <div className="form-section-divider" aria-hidden="true">
          <span className="form-section-label">Optional</span>
        </div>

        <div className="form-field-row form-field-row-2">
          <FormField label="Preferred meeting date" error={errors.meetingDate?.message}>
            <Input id="meetingDate" type="date" {...register("meetingDate")} />
          </FormField>
          <FormField label="Budget range" error={errors.budget?.message}>
            <Input
              id="budget"
              placeholder="e.g. R300 000 – R500 000"
              {...register("budget")}
            />
          </FormField>
        </div>
      </div>

      {/* POPIA consent */}
      <div className="rounded border border-rule/70 bg-paper/60 p-4">
        <div className="flex items-start gap-3">
          <Controller
            name="consentGiven"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="consentGiven"
                checked={field.value === true}
                onCheckedChange={(checked) => field.onChange(checked === true ? true : undefined)}
              />
            )}
          />
          <Label
            htmlFor="consentGiven"
            className="cursor-pointer text-sm font-normal leading-snug"
          >
            I consent to Sunduza Architectural processing my personal information in accordance with
            the{" "}
            <Link href="/privacy" className="font-medium text-primary underline">
              privacy policy
            </Link>
            .<span className="ml-1 text-red-600" aria-hidden="true">*</span>
          </Label>
        </div>
        {errors.consentGiven && (
          <p
            className="mt-2 text-xs font-medium text-red-700"
            role="alert"
            aria-live="polite"
          >
            {errors.consentGiven.message}
          </p>
        )}
      </div>

      {submitError && (
        <p className="text-sm font-medium text-red-700" role="alert" aria-live="polite">
          {submitError}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} size="lg" className="w-full sm:w-auto">
        {isSubmitting ? "Submitting…" : "Request consultation"}
        {!isSubmitting && <ArrowRight size={15} />}
      </Button>
    </form>
  );
}
