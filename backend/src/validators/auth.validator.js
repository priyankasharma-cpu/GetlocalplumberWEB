import { z } from "zod";
export const credentials = z.object({
  email: z
    .string()
    .trim()
    .email()
    .max(254)
    .transform((s) => s.toLowerCase()),
  password: z.string().min(12).max(128),
});

export const registrationInput = credentials.extend({
  name: z.string().trim().min(2).max(80),
  password: credentials.shape.password.refine(
    value => Buffer.byteLength(value, "utf8") <= 72,
    "Use a password of at most 72 UTF-8 bytes.",
  ),
});
