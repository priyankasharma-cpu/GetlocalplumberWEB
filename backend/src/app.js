import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { registerAuth } from "./routes/auth.js";
import { registerProjects } from "./routes/projects.js";
import { registerContactAndTickets } from "./routes/contact.js";
export { User, Project } from "./models/index.js";
export function createApp({
  mongoUrl,
  secret,
  origin = "http://localhost:5173",
  memorySession = false,
} = {}) {
  const app = express();
  app.disable("x-powered-by");
  if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);
  app.use(helmet());
  app.use(express.json({ limit: "32kb" }));
  app.use("/api", rateLimit({ windowMs: 900000, limit: 200 }));
  app.use(
    session({
      name: "glp.sid",
      secret,
      resave: false,
      saveUninitialized: false,
      ...(!memorySession ? { store: MongoStore.create({ mongoUrl }) } : {}),
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 604800000,
      },
    }),
  );
  app.get("/api/csrf", (req, res) => {
    req.session.csrf ??= randomBytes(32).toString("hex");
    res.json({ token: req.session.csrf });
  });
  app.use("/api", (req, res, next) => {
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
    if (req.headers.origin && req.headers.origin !== origin)
      return res.status(403).json({ error: "Origin rejected" });
    if (!req.session.csrf || req.headers["x-csrf-token"] !== req.session.csrf)
      return res.status(403).json({ error: "Refresh the page and try again." });
    next();
  });
  const auth = (req, res, next) =>
    req.session.userId
      ? next()
      : res.status(401).json({ error: "Please sign in." });
  registerAuth(app);
  registerProjects(app, auth);
  registerContactAndTickets(app, auth);
  app.use("/api", (req, res) =>
    res.status(404).json({ error: "API endpoint not found." }),
  );
  app.use((err, req, res, next) => {
    if (err instanceof z.ZodError)
      return res
        .status(400)
        .json({ error: err.issues.map((i) => i.message).join("; ") });
    if (err.type === "entity.parse.failed")
      return res.status(400).json({ error: "Invalid JSON." });
    if (err.type === "entity.too.large")
      return res.status(413).json({ error: "Request is too large." });
    if (err.code === 11000)
      return res.status(409).json({ error: "This record already exists." });
    console.error(err.message);
    res
      .status(500)
      .json({ error: "The request could not be completed. Please try again." });
  });
  return app;
}
