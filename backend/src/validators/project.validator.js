import { z } from "zod";
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

export const projectImportInput = projectInput.extend({
  status: z.enum(["Planned", "Called", "Quote in", "Decided"]).default("Planned"),
  notes: z.string().max(4000).default(""),
  quotes: z.array(quoteInput).max(100).default([]),
  createdAt: z.string().datetime(),
  history: z.array(z.object({ action: z.string().max(200), at: z.string().datetime() })).max(1000).default([]),
});
export const projectPatchInput = z.object({
  status: z.enum(["Planned", "Called", "Quote in", "Decided"]).optional(),
  notes: z.string().max(4000).optional(),
}).strict();
export const ticketInput = projectInput.omit({ clientId: true });
