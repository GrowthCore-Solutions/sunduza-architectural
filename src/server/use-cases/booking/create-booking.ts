import "server-only";
import { BookingStatus, AuditAction } from "@prisma/client";
import { db } from "@/lib/db";
import { hashIpAddress } from "@/src/server/utils/hash-ip";
import { buildBookingCreate } from "@/src/server/repositories/booking.repository";
import { buildAuditLogCreate } from "@/src/server/repositories/audit.repository";
import { buildNotificationCreate } from "@/src/server/repositories/notification.repository";
import type { CreateBookingInput } from "@/src/shared/schemas/booking.schema";

// ── Lead scoring algorithm ────────────────────────────────────────────────────
// Stored as a materialised computed value — calculated once on creation.
// Historical scores are stable even if algorithm changes (see locked design §7.1).
function calculateLeadScore(input: CreateBookingInput): number {
  let score = 0;

  // Service weight (max 40 points) — higher-value services score higher
  const serviceWeights: Record<string, number> = {
    dev_project_planning: 40,
    arch_drawings: 30,
    house_planning: 25,
    drafting_services: 20,
  };
  score += serviceWeights[input.service] ?? 20;

  // Budget presence (max 30 points)
  if (input.budget) {
    const raw = input.budget.replace(/[^0-9]/g, "");
    const amount = parseInt(raw, 10) || 0;
    if (amount >= 200_000) score += 30;
    else if (amount >= 100_000) score += 22;
    else if (amount >= 50_000) score += 15;
    else score += 8;
  }

  // Meeting date provided (15 points) — higher intent signal
  if (input.meetingDate) score += 15;

  // Description quality — proxy for lead seriousness (max 15 points)
  const wordCount = input.description.trim().split(/\s+/).length;
  if (wordCount >= 50) score += 15;
  else if (wordCount >= 30) score += 10;
  else if (wordCount >= 15) score += 5;
  else score += 2;

  return Math.min(100, Math.max(0, score));
}

// ── Context passed from the API route ────────────────────────────────────────
export interface CreateBookingContext {
  ipAddress: string | null;
  userAgent: string | null;
}

// ── Use-case result ───────────────────────────────────────────────────────────
export interface CreateBookingResult {
  id: string;
  status: BookingStatus;
  leadScore: number;
}

// ── Main use-case ─────────────────────────────────────────────────────────────
// S2.1  — all business logic here, not in the API route
// S5.15 — booking + audit_log + notification written in a single transaction
// S5.11 — explicit select on all Prisma calls (in repositories)
// POPIA — consentGiven + consentGivenAt stored on every booking (BR-009)
export async function createBooking(
  input: CreateBookingInput,
  context: CreateBookingContext
): Promise<CreateBookingResult> {
  const leadScore = calculateLeadScore(input);
  const hashedIp = hashIpAddress(context.ipAddress);
  const consentAt = new Date();

  const [booking] = await db.$transaction([
    buildBookingCreate({
      name: input.name,
      email: input.email,
      phone: input.phone,
      service: input.service,
      location: input.location,
      description: input.description,
      meetingDate: input.meetingDate ? new Date(input.meetingDate) : null,
      budget: input.budget,
      status: BookingStatus.PENDING,
      leadScore,
      consentGiven: true,
      consentGivenAt: consentAt,
      utmSource: input.utmSource,
      utmMedium: input.utmMedium,
      utmCampaign: input.utmCampaign,
      utmTerm: input.utmTerm,
      utmContent: input.utmContent,
      referrerUrl: input.referrerUrl,
      landingPage: input.landingPage,
      userAgent: context.userAgent,
      ipAddress: hashedIp,
    }),
    buildAuditLogCreate({
      action: AuditAction.BOOKING_CREATE,
      entityType: "Booking",
      entityId: "pending",
      ipAddress: hashedIp,
      userAgent: context.userAgent,
      metadata: {
        service: input.service,
        leadScore,
        utmSource: input.utmSource ?? null,
      },
    }),
  ]);

  // Queue outbound notification (v2 worker processes this — v1 it just sits)
  try {
    const adminEmail = await db.siteSettings.findUnique({
      where: { key: "contact_email" },
      select: { value: true },
    });
    if (adminEmail?.value) {
      await buildNotificationCreate({
        type: "BOOKING_RECEIVED",
        channel: "email",
        recipient: adminEmail.value,
        payload: {
          bookingId: booking.id,
          name: input.name,
          service: input.service,
          leadScore,
          location: input.location,
        },
      });
    }
  } catch {
    // Notification queuing failure never blocks the booking from being saved
  }

  return {
    id: booking.id,
    status: booking.status,
    leadScore: booking.leadScore ?? leadScore,
  };
}
