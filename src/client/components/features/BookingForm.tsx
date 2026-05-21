"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BookingSchema,
  BOOKING_SERVICES,
  BOOKING_SERVICE_LABELS,
  type BookingInput,
} from "@/types/booking";
import { api, ApiClientError } from "@/lib/api-client";
import { Button } from "@/src/client/components/ui/button";
import { Input } from "@/src/client/components/ui/input";
import { Textarea } from "@/src/client/components/ui/textarea";
import { FormField } from "@/src/client/components/ui/form-field";
import { Checkbox } from "@/src/client/components/ui/checkbox";
import { Label } from "@/src/client/components/ui/label";
import type { ApiSuccess } from "@/src/client/lib/api-types";
import type { BookingConfirm } from "@/types/db";

export function BookingForm() {
  const searchParams = useSearchParams();
  const serviceParam = searchParams.get("service");
  const [bookingId, setBookingId] = React.useState<string | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const defaultService =
    serviceParam && BOOKING_SERVICES.includes(serviceParam as (typeof BOOKING_SERVICES)[number])
      ? (serviceParam as BookingInput["service"])
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
      const res = await api.post<ApiSuccess<BookingConfirm>>("/api/bookings", {
        ...data,
        ...utm,
      });
      setBookingId(res.data.id);
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : "Something went wrong. Please try again.";
      setSubmitError(message);
    }
  }

  if (bookingId) {
    return (
      <div className="rounded-sm border border-[--color-primary]/30 bg-[--color-paper2] p-8">
        <h3 className="font-serif text-xl font-bold text-[--color-ink]">Consultation requested</h3>
        <p className="mt-2 text-[--color-muted]">
          Your reference is <strong className="text-[--color-ink]">{bookingId}</strong>. We will
          contact you within one business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FormField label="Service" error={errors.service?.message} required>
        <select
          id="service"
          className="flex h-10 w-full rounded-sm border border-[--color-rule] bg-white px-3 text-sm"
          {...register("service")}
        >
          <option value="">Select a service</option>
          {BOOKING_SERVICES.map((s) => (
            <option key={s} value={s}>
              {BOOKING_SERVICE_LABELS[s]}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="Full name" error={errors.name?.message} required>
        <Input id="name" autoComplete="name" {...register("name")} />
      </FormField>
      <FormField label="Email" error={errors.email?.message} required>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
      </FormField>
      <FormField label="Phone" error={errors.phone?.message} required>
        <Input id="phone" type="tel" autoComplete="tel" {...register("phone")} />
      </FormField>
      <FormField label="Project location" error={errors.location?.message} required>
        <Input id="location" placeholder="City / suburb" {...register("location")} />
      </FormField>
      <FormField
        label="Project description"
        error={errors.description?.message}
        hint="At least 20 characters — the more detail, the better we can prepare."
        required
      >
        <Textarea id="description" rows={5} {...register("description")} />
      </FormField>
      <FormField label="Preferred meeting date (optional)" error={errors.meetingDate?.message}>
        <Input id="meetingDate" type="date" {...register("meetingDate")} />
      </FormField>
      <FormField label="Budget range (optional)" error={errors.budget?.message}>
        <Input id="budget" placeholder="e.g. R300,000 – R500,000" {...register("budget")} />
      </FormField>

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
        <Label htmlFor="consentGiven" className="text-sm font-normal leading-snug cursor-pointer">
          I consent to Sunduza processing my personal information in accordance with the{" "}
          <Link href="/privacy" className="text-[--color-primary] underline">
            privacy policy
          </Link>
          . (Required)
        </Label>
      </div>
      {errors.consentGiven && (
        <p className="text-xs text-red-600">{errors.consentGiven.message}</p>
      )}

      {submitError && (
        <p className="text-sm text-red-600" role="alert">
          {submitError}
        </p>
      )}
      <Button type="submit" disabled={isSubmitting} size="lg">
        {isSubmitting ? "Submitting…" : "Request consultation"}
      </Button>
    </form>
  );
}
