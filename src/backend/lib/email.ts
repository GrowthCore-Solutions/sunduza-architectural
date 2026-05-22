import "server-only";

import { Resend } from "resend";
import { getAdminEmail } from "@/backend/lib/env";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const resend = getResend();
  if (!resend) {
    return { ok: false, error: "RESEND_API_KEY not configured" };
  }

  const from = process.env.RESEND_FROM_EMAIL ?? "Sunduza <onboarding@resend.dev>";

  const { error } = await resend.emails.send({ from, to, subject, html });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export function newBookingEmailHtml(payload: {
  name: string;
  email: string;
  service: string;
  leadScore?: number | null;
}) {
  return `
    <h2>New consultation booking</h2>
    <p><strong>Name:</strong> ${payload.name}</p>
    <p><strong>Email:</strong> ${payload.email}</p>
    <p><strong>Service:</strong> ${payload.service}</p>
    ${payload.leadScore != null ? `<p><strong>Lead score:</strong> ${payload.leadScore}</p>` : ""}
    <p>Log in to the admin dashboard to respond.</p>
  `;
}

export function newContactEmailHtml(payload: {
  name: string;
  email: string;
  message: string;
}) {
  return `
    <h2>New contact message</h2>
    <p><strong>From:</strong> ${payload.name} (${payload.email})</p>
    <p>${payload.message}</p>
  `;
}

export async function notifyAdminNewBooking(payload: {
  name: string;
  email: string;
  service: string;
  leadScore?: number | null;
}) {
  return sendEmail({
    to: getAdminEmail(),
    subject: `New booking: ${payload.name}`,
    html: newBookingEmailHtml(payload),
  });
}

export async function notifyAdminNewContact(payload: {
  name: string;
  email: string;
  message: string;
}) {
  return sendEmail({
    to: getAdminEmail(),
    subject: `New message from ${payload.name}`,
    html: newContactEmailHtml(payload),
  });
}
