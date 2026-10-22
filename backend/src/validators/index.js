import { z } from "zod";
export const credentials = z.object({
  email: z
    .string()
    .email()
    .max(254)
    .transform((s) => s.toLowerCase()),
  password: z.string().min(12).max(128),
});
export const projectInput = z.object({
  clientId: z.string().uuid(),
  service: z.string().min(1).max(100),
  state: z.string().max(80).default("Not selected"),
  answers: z.tuple([
    z.enum([
      "Repair or fix",
      "Replace or install new",
      "Just pricing for now",
      "Not sure yet",
    ]),
    z.enum([
      "As soon as possible",
      "Within a month",
      "In 1–3 months",
      "Just planning",
    ]),
    z.enum([
      "Single-family house",
      "Townhouse",
      "Condo",
      "Mobile or manufactured",
    ]),
    z.enum(["Yes, I own it", "No, I rent"]),
  ]),
});
export const quoteInput = z.object({
  provider: z.string().min(1).max(120),
  amount: z.number().finite().nonnegative().max(1e8),
  notes: z.string().max(2000).default(""),
});
