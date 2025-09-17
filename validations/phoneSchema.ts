import { z } from "zod";

export const phoneObjectSchema = z.object({
  phone: z.object({
    raw: z.string().min(6, "Invalid phone number"),
    formatted: z.string().optional(),
    country: z.string(),
    valid: z.boolean().refine((v) => v === true, {
      message: "Enter a valid phone number",
    }),
  }),
});

export type PhoneObjectSchema = z.infer<typeof phoneObjectSchema>;
