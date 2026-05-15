import { z } from "zod";

export const CreateContactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Enter a valid email address").max(255),
  phone: z.string().min(10, "Enter a valid South African phone number").max(20).optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type CreateContactInput = z.infer<typeof CreateContactSchema>;
