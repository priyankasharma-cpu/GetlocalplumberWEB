import { Ticket, Contact } from "../models/index.js";
import { projectInput } from "../validators/index.js";
import { z } from "zod";
import rateLimit from "express-rate-limit";
export function registerContactAndTickets(app, auth) {
  app.get("/api/call-tickets", auth, async (req, res) =>
    res.json(await Ticket.find({ owner: req.session.userId })),
  );
  app.post("/api/call-tickets", auth, async (req, res) =>
    res
      .status(201)
      .json(
        await Ticket.create({
          ...projectInput.omit({ clientId: true }).parse(req.body),
          owner: req.session.userId,
        }),
      ),
  );
  app.post(
    "/api/contact",
    rateLimit({ windowMs: 3600000, limit: 5 }),
    async (req, res) => {
      const d = z
        .object({
          name: z.string().trim().min(2).max(100),
          email: z.string().email().max(254),
          phone: z.string().regex(/^[+\d\s().-]{7,25}$/),
          state: z.string().min(2).max(80),
          service: z.string().min(2).max(100),
          message: z.string().trim().min(10).max(4000),
          website: z.string().max(0).optional(),
        })
        .parse(req.body);
      await Contact.create(d);
      res
        .status(201)
        .json({
          message:
            "Your request has been saved. This is not an emergency dispatch service.",
        });
    },
  );
}
