import "server-only";
import { BookingStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { createId } from "@paralleldrive/cuid2";

export interface CreateBookingData {
  name: string;
  email: string;
  phone: string;
  service: string;
  location: string;
  description: string;
  meetingDate?: Date | null;
  budget?: string;
  status: BookingStatus;
  leadScore: number;
  consentGiven: boolean;
  consentGivenAt: Date;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  referrerUrl?: string;
  landingPage?: string;
  userAgent?: string | null;
  ipAddress?: string | null;
}

// Creates a booking row inside a caller-controlled transaction.
// Returns only safe fields — no password leakage possible (S5.11).
export function buildBookingCreate(data: CreateBookingData) {
  return db.booking.create({
    data: {
      id: createId(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      service: data.service,
      location: data.location,
      description: data.description,
      meetingDate: data.meetingDate ?? null,
      budget: data.budget ?? null,
      status: data.status,
      leadScore: data.leadScore,
      consentGiven: data.consentGiven,
      consentGivenAt: data.consentGivenAt,
      utmSource: data.utmSource ?? null,
      utmMedium: data.utmMedium ?? null,
      utmCampaign: data.utmCampaign ?? null,
      utmTerm: data.utmTerm ?? null,
      utmContent: data.utmContent ?? null,
      referrerUrl: data.referrerUrl ?? null,
      landingPage: data.landingPage ?? null,
      userAgent: data.userAgent ?? null,
      ipAddress: data.ipAddress ?? null,
    },
    select: {
      id: true,
      status: true,
      leadScore: true,
      createdAt: true,
    },
  });
}
