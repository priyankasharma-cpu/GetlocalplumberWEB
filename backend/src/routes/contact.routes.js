import { Router } from "express";
import { submit } from "../controllers/contact.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { createContactLimiter } from "../middleware/rateLimit.middleware.js";
import { contactInput } from "../validators/contact.validator.js";

export function createContactRouter() {
  const router = Router();
  router.post("/", createContactLimiter(), validate(contactInput), submit);
  return router;
}
