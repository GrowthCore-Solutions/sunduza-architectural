"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CheckCircle } from "lucide-react";
import { ContactMessageSchema, type ContactMessageInput } from "@/shared/types/contact";
import { api, ApiClientError } from "@/frontend/lib/api-client";
import { useToast } from "@/frontend/components/ui/toast";
import { Button } from "@/frontend/components/ui/button";
import { FormField } from "@/frontend/components/ui/form-field";
import { Input } from "@/frontend/components/ui/input";
import { Textarea } from "@/frontend/components/ui/textarea";
import type { ApiSuccess } from "@/frontend/lib/api-types";

export function ContactForm() {
  const [submitted, setSubmitted] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
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
      toast.error(message, { title: "Message could not be sent" });
    }
  }

  if (submitted) {
    return (
      <div className="contact-success" role="status" aria-live="polite">
        <div className="contact-success-mark" aria-hidden="true">
          <CheckCircle size={24} strokeWidth={1.75} />
        </div>

        <div>
          <p className="type-eyebrow mb-2" style={{ color: "var(--color-sage)" }}>
            Message sent
          </p>
          <h3 className="contact-success-title">
            Thank you<br />
            <em style={{ fontStyle: "italic", fontWeight: 300, color: "var(--color-primary)" }}>
              for reaching out
            </em>
          </h3>
        </div>

        <p className="contact-success-copy">
          Your message has been received. We&rsquo;ll respond within 24 hours during business days
          — usually a lot sooner. In the meantime, feel free to explore our work.
        </p>

        <div className="contact-success-ctas">
          <Button asChild variant="default" size="lg">
            <Link href="/projects">
              View projects <ArrowRight size={15} />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              reset();
              setSubmitted(false);
            }}
          >
            Send another message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="form-field-row form-field-row-2">
        <FormField label="Full name" error={errors.name?.message} required>
          <Input id="name" autoComplete="name" placeholder="Jane Dlamini" {...register("name")} />
        </FormField>
        <FormField label="Email address" error={errors.email?.message} required>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="jane@example.com"
            {...register("email")}
          />
        </FormField>
      </div>

      <FormField label="Phone" error={errors.phone?.message} hint="Optional — for a quicker reply">
        <Input
          id="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+27 82 000 0000"
          {...register("phone")}
        />
      </FormField>

      <FormField
        label="Message"
        error={errors.message?.message}
        hint="At least 10 characters. Share what you'd like to discuss."
        required
      >
        <Textarea
          id="message"
          rows={6}
          placeholder="Tell us about your enquiry, project idea, or question..."
          {...register("message")}
        />
      </FormField>

      {submitError && (
        <p className="text-sm font-medium text-red-700" role="alert" aria-live="polite">
          {submitError}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} size="lg" className="w-full sm:w-auto">
        {isSubmitting ? "Sending…" : "Send message"}
        {!isSubmitting && <ArrowRight size={15} />}
      </Button>

      <p className="text-xs leading-relaxed text-muted">
        By submitting this form, you agree to our{" "}
        <Link href="/privacy" className="font-medium text-primary underline">
          privacy policy
        </Link>
        . We&rsquo;ll only use your details to respond to your enquiry.
      </p>
    </form>
  );
}
