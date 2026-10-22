import mongoose from "mongoose";
import { Project } from "../models/index.js";
import { projectInput, quoteInput } from "../validators/index.js";
import { z } from "zod";
export function registerProjects(app, auth) {
  app.use("/api/projects", auth);
  const owned = async (req) => {
    if (!mongoose.isValidObjectId(req.params.id)) return null;
    return Project.findOne({ _id: req.params.id, owner: req.session.userId });
  };
  app.get("/api/projects", async (req, res) =>
    res.json(
      await Project.find({ owner: req.session.userId }).sort({ createdAt: -1 }),
    ),
  );
  app.post("/api/projects", async (req, res) => {
    const d = projectInput.parse(req.body);
    const p = await Project.findOneAndUpdate(
      { owner: req.session.userId, clientId: d.clientId },
      {
        $setOnInsert: {
          ...d,
          owner: req.session.userId,
          history: [{ action: "Project planned", at: new Date() }],
        },
      },
      { upsert: true, new: true, runValidators: true },
    );
    res.status(201).json(p);
  });
  app.post("/api/projects/import", async (req, res) => {
    const d = projectInput
      .extend({
        status: z
          .enum(["Planned", "Called", "Quote in", "Decided"])
          .default("Planned"),
        notes: z.string().max(4000).default(""),
        quotes: z.array(quoteInput).max(100).default([]),
        createdAt: z.string().datetime(),
        history: z
          .array(
            z.object({
              action: z.string().max(200),
              at: z.string().datetime(),
            }),
          )
          .max(1000)
          .default([]),
      })
      .parse(req.body);
    d.history.push({
      action: "Guest project imported by homeowner",
      at: new Date().toISOString(),
    });
    const p = await Project.findOneAndUpdate(
      { owner: req.session.userId, clientId: d.clientId },
      { $setOnInsert: { ...d, owner: req.session.userId } },
      { upsert: true, new: true, runValidators: true },
    );
    res.status(201).json(p);
  });
  app.get("/api/projects/:id", async (req, res) => {
    const p = await owned(req);
    p ? res.json(p) : res.status(404).json({ error: "Project not found" });
  });
  app.patch("/api/projects/:id", async (req, res) => {
    const d = z
        .object({
          status: z
            .enum(["Planned", "Called", "Quote in", "Decided"])
            .optional(),
          notes: z.string().max(4000).optional(),
        })
        .strict()
        .parse(req.body),
      p = await owned(req);
    if (!p) return res.status(404).json({ error: "Project not found" });
    Object.assign(p, d);
    p.history.push({
      action: d.status
        ? "Status set by homeowner: " + d.status
        : "Notes updated",
      at: new Date(),
    });
    await p.save();
    res.json(p);
  });
  app.delete("/api/projects/:id", async (req, res) => {
    const p = await owned(req);
    if (!p) return res.status(404).json({ error: "Project not found" });
    await p.deleteOne();
    res.status(204).end();
  });
  for (const method of ["post", "patch", "delete"])
    app[method](
      "/api/projects/:id/quotes" + (method === "post" ? "" : "/:quoteId"),
      async (req, res) => {
        const p = await owned(req);
        if (!p) return res.status(404).json({ error: "Project not found" });
        if (method === "post") p.quotes.push(quoteInput.parse(req.body));
        else {
          const q = mongoose.isValidObjectId(req.params.quoteId)
            ? p.quotes.id(req.params.quoteId)
            : null;
          if (!q) return res.status(404).json({ error: "Quote not found" });
          if (method === "delete") q.deleteOne();
          else Object.assign(q, quoteInput.parse(req.body));
        }
        if (method === "post") p.status = "Quote in";
        p.history.push({
          action:
            "Quote " +
            { post: "added", patch: "edited", delete: "deleted" }[method],
          at: new Date(),
        });
        await p.save();
        res.json(p);
      },
    );
}
