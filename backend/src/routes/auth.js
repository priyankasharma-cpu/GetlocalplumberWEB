import { User } from "../models/index.js";
import { credentials } from "../validators/index.js";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import rateLimit from "express-rate-limit";
export function registerAuth(app) {
  const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email });
  const establish = (req, id) =>
    new Promise((resolve, reject) =>
      req.session.regenerate((err) => {
        if (err) return reject(err);
        req.session.userId = id;
        req.session.csrf = randomBytes(32).toString("hex");
        req.session.save((err) => (err ? reject(err) : resolve()));
      }),
    );
  app.get("/api/auth/me", async (req, res) => {
    const u = req.session.userId
      ? await User.findById(req.session.userId)
      : null;
    res.json({ user: u ? publicUser(u) : null });
  });
  app.use("/api/auth", rateLimit({ windowMs: 900000, limit: 30 }));
  app.post("/api/auth/register", async (req, res) => {
    const d = credentials
      .extend({ name: z.string().trim().min(2).max(80) })
      .parse(req.body);
    if (await User.exists({ email: d.email }))
      return res
        .status(409)
        .json({ error: "Unable to register with this email." });
    const u = await User.create({
      ...d,
      password: await bcrypt.hash(d.password, 12),
    });
    await establish(req, String(u._id));
    res.status(201).json({ user: publicUser(u) });
  });
  app.post("/api/auth/login", async (req, res) => {
    const d = credentials.parse(req.body),
      u = await User.findOne({ email: d.email });
    if (!u || !(await bcrypt.compare(d.password, u.password)))
      return res.status(401).json({ error: "Email or password is incorrect." });
    await establish(req, String(u._id));
    res.json({ user: publicUser(u) });
  });
  app.post("/api/auth/logout", (req, res, next) =>
    req.session.destroy((err) => {
      if (err) return next(err);
      res.clearCookie("glp.sid");
      res.status(204).end();
    }),
  );
}
