import { z } from "zod";
import AppError from "../utils/AppError.js";

export function apiNotFound(req, res) {
  res.status(404).json({ error: "API endpoint not found." });
}
export function handleError(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error instanceof AppError) return res.status(error.status).json({ error: error.message });
  if (error instanceof z.ZodError) return res.status(400).json({ error: error.issues.map(i => i.message).join("; ") });
  if (error.type === "entity.parse.failed") return res.status(400).json({ error: "Invalid JSON." });
  if (error.type === "entity.too.large") return res.status(413).json({ error: "Request is too large." });
  if (error.code === 11000) return res.status(409).json({ error: "This record already exists." });
  // Never log raw driver errors, request bodies, credentials or session tokens.
  console.error("API request failed; private error details were not logged.");
  res.status(500).json({ error: "The request could not be completed. Please try again." });
}
