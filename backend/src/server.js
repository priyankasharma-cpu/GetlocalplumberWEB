import mongoose from "mongoose";
import { createApp } from "./app.js";
if (
  !process.env.MONGODB_URI ||
  !process.env.SESSION_SECRET ||
  process.env.SESSION_SECRET.length < 32
)
  throw new Error(
    "Configure MONGODB_URI and a SESSION_SECRET of at least 32 characters in backend/.env",
  );
await mongoose.connect(process.env.MONGODB_URI);
const server = createApp({
  mongoUrl: process.env.MONGODB_URI,
  secret: process.env.SESSION_SECRET,
  origin: process.env.APP_ORIGIN,
}).listen(process.env.PORT || 4000, () =>
  console.log("API listening on port " + (process.env.PORT || 4000)),
);
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () =>
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    }),
  );
