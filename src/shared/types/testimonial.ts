import { z } from "zod";

export const TestimonialCreateSchema = z.object({
  clientName: z.string().min(1).max(200),
  review: z.string().min(1).max(2000),
  rating: z.number().int().min(1).max(5).optional(),
  projectId: z.string().cuid().optional(),
  isActive: z.boolean().optional().default(true),
});

export const TestimonialUpdateSchema = z.object({
  clientName: z.string().min(1).max(200).optional(),
  review: z.string().min(1).max(2000).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  projectId: z.string().cuid().nullable().optional(),
  isActive: z.boolean().optional(),
});

export type TestimonialCreateInput = z.infer<typeof TestimonialCreateSchema>;
export type TestimonialUpdateInput = z.infer<typeof TestimonialUpdateSchema>;

/** @deprecated Use TestimonialRow from types/db */
export interface Testimonial {
  id: string;
  clientName: string;
  review: string;
  rating: number;
  createdAt: string;
}
