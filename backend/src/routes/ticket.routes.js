import { Router } from "express";
import * as tickets from "../controllers/ticket.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { ticketInput } from "../validators/project.validator.js";

export function createTicketRouter() {
  const router = Router();
  router.get("/", requireAuth, tickets.list);
  router.post("/", requireAuth, validate(ticketInput), tickets.create);
  return router;
}
