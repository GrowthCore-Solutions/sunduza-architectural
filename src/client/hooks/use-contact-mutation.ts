"use client";

import { useMutation } from "@tanstack/react-query";
import type { CreateContactInput } from "@/src/shared/schemas/contact.schema";

interface ContactResponse {
  success: boolean;
  data?: { id: string };
  error?: { message: string; code: string };
}

async function submitContact(input: CreateContactInput): Promise<{ id: string }> {
  const res = await fetch("/api/v1/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const json: ContactResponse = await res.json();

  if (!res.ok || !json.success || !json.data) {
    throw new Error(json.error?.message ?? "Submission failed. Please try again.");
  }

  return json.data;
}

export function useContactMutation() {
  return useMutation({
    mutationFn: submitContact,
  });
}
