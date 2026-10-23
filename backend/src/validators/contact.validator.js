import { z } from "zod";
import { contactStates, contactServices } from "./formOptions.js";

export const contactInput = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254).transform(value => value.toLowerCase()),
  phone: z.string().trim().regex(/^[+\d\s().-]{7,25}$/).refine(
    value => value.replace(/\D/g, "").length >= 7, "Enter a valid phone number.",
  ),
  state: z.enum(contactStates),
  service: z.enum(contactServices),
  message: z.string().trim().min(10).max(4000),
  website: z.string().max(0).optional(),
});
