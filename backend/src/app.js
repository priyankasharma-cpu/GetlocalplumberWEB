import express from "express";
import helmet from "helmet";
import { DEFAULT_APP_ORIGIN } from "./config/env.js";
import { createSession } from "./config/session.js";
import { createApiLimiter } from "./middleware/rateLimit.middleware.js";
import { csrfProtection, issueCsrfToken } from "./middleware/csrf.middleware.js";
import { apiNotFound, handleError } from "./middleware/error.middleware.js";
import { createAuthRouter } from "./routes/auth.routes.js";
import { createContactRouter } from "./routes/contact.routes.js";
import { createProjectRouter } from "./routes/project.routes.js";
import { createTicketRouter } from "./routes/ticket.routes.js";

// Existing tests/scripts can retain these exports while domain services use direct model imports.
export { User, Project } from "./models/index.js";

export function createApp({ mongoUrl, secret, origin = DEFAULT_APP_ORIGIN, allowedOrigins = [], memorySession = false } = {}) {
  const app = express();
  const production = process.env.NODE_ENV === "production";
  app.disable("x-powered-by");
  if (production) app.set("trust proxy", 1);
  app.use(helmet());
  app.use(express.json({ limit: "32kb" }));
  app.use("/api", createApiLimiter());
  app.use("/api", (req, res, next) => { res.set("Cache-Control", "no-store"); next(); });
  const { middleware, store } = createSession({ mongoUrl, secret, memorySession, production });
  app.locals.sessionStore = store;
  app.use(middleware);
  app.get("/api/csrf", issueCsrfToken);
  app.use("/api", csrfProtection(origin, allowedOrigins));
  app.use("/api/auth", createAuthRouter());
  app.use("/api/projects", createProjectRouter());
  app.use("/api/contact", createContactRouter());
  app.use("/api/call-tickets", createTicketRouter());
  app.use("/api", apiNotFound);
  app.use(handleError);
  return app;
}
