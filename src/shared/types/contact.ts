import { z } from "zod";

export const ContactMessageSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Enter a valid email address"),
  // An unfilled optional text input submits "" (not undefined), and this
  // refine correctly treats that as "no phone provided" and lets it
  // through. The empty string must NOT reach the database unchanged
  // though - src/backend/services/contact.ts normalizes it to null there
  // (phone_min_length CHECK constraint rejects "" outright: 500, message
  // silently lost). See 2026-08-24 incident. Deliberately not normalizing
  // here in the schema - z.preprocess/transform changes the inferred type
  // shape in a way that breaks react-hook-form's zodResolver typing.
  phone: z
    .string()
    .refine((v) => !v || v.length >= 10, "Phone must be at least 10 digits")
    .optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

export type ContactMessageInput = z.infer<typeof ContactMessageSchema>;
