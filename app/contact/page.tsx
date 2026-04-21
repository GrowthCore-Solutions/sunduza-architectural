"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

const ContactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  message: z.string().min(10),
});

type ContactInput = z.infer<typeof ContactSchema>;

export default function ContactPage() {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(ContactSchema) });

  const onSubmit = async (data: ContactInput) => {
    setServerError(null);
    try {
      const res = await fetch("/api/contact", {
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
          <h1 className="font-serif text-3xl font-black text-[#0f172a] mb-4">Message Sent</h1>
          <p className="text-[#5a5040] mb-8">Thank you for reaching out. We will get back to you within 24 hours.</p>
          <Button variant="outline" onClick={() => router.push("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-24 bg-[#faf8f2]">
      <div className="mx-auto max-w-2xl px-4">
        <div className="text-center mb-12">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#b88b4a] mb-3">Get In Touch</p>
          <h1 className="font-serif text-4xl font-black text-[#0f172a]">Contact Us</h1>
          <p className="mt-4 text-[#5a5040]">We will respond within 24 hours.</p>
        </div>

        {serverError && (
          <div className="mb-6 rounded-sm border border-red-200 bg-red-50 p-4 text-sm text-red-700">{serverError}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-1.5">
            <Label htmlFor="name" required>Full Name</Label>
            <Input id="name" placeholder="Your name" {...register("name")} />
            {errors.name && <p className="text-xs text-red-700">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label htmlFor="email" required>Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
              {errors.email && <p className="text-xs text-red-700">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" required>Phone / WhatsApp</Label>
              <Input id="phone" type="tel" placeholder="+27 XX XXX XXXX" {...register("phone")} />
              {errors.phone && <p className="text-xs text-red-700">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="message" required>Message</Label>
            <Textarea id="message" placeholder="Tell us about your project..." {...register("message")} />
            {errors.message && <p className="text-xs text-red-700">{errors.message.message}</p>}
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </div>
    </div>
  );
}
