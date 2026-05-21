"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ContactMessageSchema, type ContactMessageInput } from "@/types/contact";
import { api, ApiClientError } from "@/lib/api-client";
import { Button } from "@/src/client/components/ui/button";
import { Input } from "@/src/client/components/ui/input";
import { Textarea } from "@/src/client/components/ui/textarea";
import { FormField } from "@/src/client/components/ui/form-field";
import type { ApiSuccess } from "@/src/client/lib/api-types";

export function ContactForm() {
  const [submitted, setSubmitted] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactMessageInput>({
    resolver: zodResolver(ContactMessageSchema),
  });

  async function onSubmit(data: ContactMessageInput) {
    setSubmitError(null);
    try {
      await api.post<ApiSuccess<{ id: string }>>("/api/contact", data);
      setSubmitted(true);
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : "Something went wrong. Please try again.";
      setSubmitError(message);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-sm border border-[--color-primary]/30 bg-[--color-paper2] p-8 text-center">
        <h3 className="font-serif text-xl font-bold text-[--color-ink]">Message sent</h3>
        <p className="mt-2 text-[--color-muted]">
          Thank you. We will be in touch within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FormField label="Full name" error={errors.name?.message} required>
        <Input id="name" autoComplete="name" {...register("name")} />
      </FormField>
      <FormField label="Email address" error={errors.email?.message} required>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
      </FormField>
      <FormField label="Phone (optional)" error={errors.phone?.message}>
        <Input id="phone" type="tel" autoComplete="tel" {...register("phone")} />
      </FormField>
      <FormField label="Message" error={errors.message?.message} required>
        <Textarea id="message" rows={5} {...register("message")} />
      </FormField>
      {submitError && (
        <p className="text-sm text-red-600" role="alert">
          {submitError}
        </p>
      )}
      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
