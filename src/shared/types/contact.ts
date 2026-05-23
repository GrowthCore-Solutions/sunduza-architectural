import { z } from "zod";

export const ContactMessageSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Enter a valid email address"),
  phone: z
    .string()
    .refine((v) => !v || v.length >= 10, "Phone must be at least 10 digits")
    .optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

export type ContactMessageInput = z.infer<typeof ContactMessageSchema>;
