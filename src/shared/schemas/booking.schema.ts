import { z } from "zod";
import { BookingStatus } from "@prisma/client";

// Service values match DB CHECK constraint exactly
export const BOOKING_SERVICE_VALUES = [
  "house_planning",
  "arch_drawings",
  "drafting_services",
  "dev_project_planning",
] as const;

export type BookingServiceValue = (typeof BOOKING_SERVICE_VALUES)[number];

// Public booking submission schema — all fields a visitor submits
export const CreateBookingSchema = z.object({
  // Visitor contact
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Enter a valid email address").max(255),
  phone: z.string().min(10, "Enter a valid South African phone number").max(20),

  // Project details
  service: z.enum(BOOKING_SERVICE_VALUES, { error: "Please select a service" }),
  location: z.string().min(2, "Please enter your project location").max(200),
  description: z.string().min(20, "Please describe your project in at least 20 characters"),
  meetingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD").optional(),
  budget: z.string().max(50).optional(),

  // POPIA — must be true to submit (BR-009, S3.22)
  consentGiven: z.literal(true, {
    error: "You must accept the privacy policy to submit your request",
  }),

  // UTM attribution — captured client-side from URL params
  utmSource: z.string().max(100).optional(),
  utmMedium: z.string().max(100).optional(),
  utmCampaign: z.string().max(100).optional(),
  utmTerm: z.string().max(100).optional(),
  utmContent: z.string().max(100).optional(),
  referrerUrl: z.string().max(500).optional(),
  landingPage: z.string().max(500).optional(),

  // Honeypot — bots fill this, humans don't
  website: z.string().max(0, "").optional(),
});

export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;

// Admin status update schema
export const UpdateBookingStatusSchema = z.object({
  status: z.nativeEnum(BookingStatus),
  adminNotes: z.string().max(2000).optional(),
});

export type UpdateBookingStatusInput = z.infer<typeof UpdateBookingStatusSchema>;
