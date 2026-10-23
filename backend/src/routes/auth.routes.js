import { Router } from "express";
import * as auth from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { createAuthLimiter } from "../middleware/rateLimit.middleware.js";
import { credentials, registrationInput } from "../validators/auth.validator.js";

export function createAuthRouter() {
  const router = Router();
  router.get("/me", auth.me);
  router.use(createAuthLimiter());
  router.post("/register", validate(registrationInput), auth.register);
  router.post("/login", validate(credentials), auth.login);
  router.post("/logout", auth.logout);
  return router;
}
