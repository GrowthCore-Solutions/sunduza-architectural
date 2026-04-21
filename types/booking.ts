import { z } from "zod";

// Booking validation schema — Zod (Code Quality Q1, Backend B11)
// Matches Database Booking model fields
export const BookingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  service: z.enum([
    "House Planning",
    "Architectural Drawings",
    "Drafting Services",
    "Development Projects",
  ]),
  location: z.string().min(2, "Location is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  meetingDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  budget: z.string().optional(),
});

export const BookingIdSchema = z.object({
  id: z.string().cuid("Invalid booking ID format"),
});

export const BookingListQuerySchema = z.object({
  status: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type BookingInput = z.infer<typeof BookingSchema>;
export type BookingId = z.infer<typeof BookingIdSchema>;
