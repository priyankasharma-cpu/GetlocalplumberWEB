import { findOwnedProject, findQuote } from "../services/project.service.js";

export async function loadOwnedProject(req, res, next) {
  req.project = await findOwnedProject(req.session.userId, req.params.id);
  next();
}
export function loadOwnedQuote(req, res, next) {
  req.quote = findQuote(req.project, req.params.quoteId);
  next();
}
