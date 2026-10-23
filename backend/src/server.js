import mongoose from "mongoose";
import { createApp } from "./app.js";
import { loadEnvironment } from "./config/env.js";
import { connectDatabase, databaseFailure, DATABASE_NAME } from "./config/database.js";

// Startup failures never print URIs, credentials, or raw driver errors.
try {
  const { mongoUrl, secret, origin, allowedOrigins, port } = loadEnvironment();
  await connectDatabase(mongoUrl);
  console.log(`MongoDB connected to ${DATABASE_NAME}.`);
  const app = createApp({ mongoUrl, secret, origin, allowedOrigins });
  const server = app.listen(port, async (error) => {
    if (error) {
      if (error.code === "EADDRINUSE") {
        console.error(`Port ${port} is already in use (EADDRINUSE). Stop the existing API server with Ctrl+C, then restart this one.`);
        console.error("Run either npm run dev --workspace backend OR npm start --workspace backend, not both on the same port.");
      } else if (error.code === "EACCES") {
        console.error(`Permission denied for API port ${port} (EACCES). Check port permissions or configure an available port.`);
      } else {
        console.error(`API could not listen on port ${port}. Check the port configuration and try again.`);
      }
      await app.locals.sessionStore?.close();
      await mongoose.disconnect();
      process.exitCode = 1;
      return;
    }
    console.log("API listening on port " + server.address().port);
  });
  for (const signal of ["SIGTERM", "SIGINT"]) process.on(signal, () => server.close(async () => {
    await app.locals.sessionStore?.close();
    await mongoose.disconnect();
    process.exit(0);
  }));
} catch (error) {
  console.error(`Failure category: ${databaseFailure(error)}.`);
  console.error("Backend startup failed. Check backend MONGODB_URI, SESSION_SECRET, APP_ORIGIN, Atlas access, database name, and required indexes. Credentials were not logged.");
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
}
