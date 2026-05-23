import { z } from "zod";
import { BookingStatus } from "@prisma/client";

// Booking services — snake_case values match database CHECK constraint
export const BOOKING_SERVICES = [
  "house_planning",
  "arch_drawings",
  "drafting_services",
  "dev_project_planning",
] as const;

export type BookingService = (typeof BOOKING_SERVICES)[number];

// Display labels for booking services (UI only)
export const BOOKING_SERVICE_LABELS: Record<BookingService, string> = {
  house_planning: "House Planning",
  arch_drawings: "Architectural Drawings",
  drafting_services: "Drafting Services",
  dev_project_planning: "Development Project Planning",
};

export const BookingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  service: z.enum(BOOKING_SERVICES, { error: "Invalid service selected" }),
  location: z.string().min(2, "Location is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  meetingDate: z
    .string()
    .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), "Must be YYYY-MM-DD")
    .optional(),
  budget: z.string().optional(),
  // POPIA consent — required field, must be true to submit (BR-009)
  consentGiven: z.literal(true, {
    error: "You must accept the privacy policy to submit",
  }),
  // UTM parameters — captured from query string, optional
  utmSource: z.string().max(100).optional(),
  utmMedium: z.string().max(100).optional(),
  utmCampaign: z.string().max(100).optional(),
  utmTerm: z.string().max(100).optional(),
  utmContent: z.string().max(100).optional(),
  referrerUrl: z.string().max(500).optional(),
  landingPage: z.string().max(500).optional(),
});

export const BookingIdSchema = z.object({
  id: z.string().cuid("Invalid booking ID format"),
});

export const BookingListQuerySchema = z.object({
  status: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const BookingUpdateSchema = z.object({
  id: z.string().cuid().optional(),
  status: z.nativeEnum(BookingStatus).optional(),
  adminNotes: z.string().optional(),
});

export type BookingInput = z.infer<typeof BookingSchema>;
export type BookingUpdateInput = z.infer<typeof BookingUpdateSchema>;
export type BookingId = z.infer<typeof BookingIdSchema>;
