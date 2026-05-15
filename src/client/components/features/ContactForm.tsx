"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/src/client/components/ui/button";
import { Input } from "@/src/client/components/ui/input";
import { Label } from "@/src/client/components/ui/label";
import { Textarea } from "@/src/client/components/ui/textarea";
import { CreateContactSchema, type CreateContactInput } from "@/src/shared/schemas/contact.schema";
import { useContactMutation } from "@/src/client/hooks/use-contact-mutation";

export function ContactForm() {
  const { mutateAsync, isPending, isSuccess } = useContactMutation();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateContactInput>({
    resolver: zodResolver(CreateContactSchema),
  });

  const onSubmit = async (data: CreateContactInput) => {
    setServerError(null);
    try {
      await mutateAsync(data);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  if (isSuccess) {
    return (
      <div className="rounded-sm border border-[--color-rule] bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-[--color-ink] mb-2">
          Message Sent
        </h3>
        <p className="text-[--color-muted] text-sm leading-relaxed">
          Thank you for reaching out. We will get back to you within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <div>
      {serverError && (
        <div className="mb-5 flex items-start gap-3 rounded-sm border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{serverError}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-5"
      >
        <div className="space-y-1.5">
          <Label htmlFor="cname" required>Full Name</Label>
          <Input
            id="cname"
            placeholder="Your name"
            autoComplete="name"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label htmlFor="cemail" required>Email</Label>
            <Input
              id="cemail"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cphone">Phone / WhatsApp</Label>
            <Input
              id="cphone"
              type="tel"
              placeholder="+27 XX XXX XXXX"
              autoComplete="tel"
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-xs text-red-600">{errors.phone.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cmessage" required>Message</Label>
          <Textarea
            id="cmessage"
            rows={5}
            placeholder="Tell us about your project or enquiry…"
            {...register("message")}
          />
          {errors.message && (
            <p className="text-xs text-red-600">{errors.message.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Sending…" : "Send Message"}
        </Button>
      </form>
    </div>
  );
}
