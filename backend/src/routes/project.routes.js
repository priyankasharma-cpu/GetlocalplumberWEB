import { Router } from "express";
import * as projects from "../controllers/project.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { loadOwnedProject, loadOwnedQuote } from "../middleware/project.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { projectInput, projectImportInput, projectPatchInput, quoteInput } from "../validators/project.validator.js";

export function createProjectRouter() {
  const router = Router();
  router.use(requireAuth);
  router.get("/", projects.list);
  router.post("/", validate(projectInput), projects.create);
  router.post("/import", validate(projectImportInput), projects.importGuest);
  router.get("/:id", loadOwnedProject, projects.get);
  router.patch("/:id", validate(projectPatchInput), loadOwnedProject, projects.update);
  router.delete("/:id", loadOwnedProject, projects.remove);
  router.post("/:id/quotes", loadOwnedProject, validate(quoteInput), projects.addQuote);
  router.patch("/:id/quotes/:quoteId", loadOwnedProject, loadOwnedQuote, validate(quoteInput), projects.updateQuote);
  router.delete("/:id/quotes/:quoteId", loadOwnedProject, loadOwnedQuote, projects.removeQuote);
  return router;
}
