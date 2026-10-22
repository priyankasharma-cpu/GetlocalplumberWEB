// Local preview using a real loopback MongoDB instance. Session secret is ephemeral.
import { randomBytes } from "node:crypto";
import mongoose from "mongoose";
import { createApp } from "../src/app.js";
const mongoUrl = "mongodb://127.0.0.1:27018/getlocalplumbers_preview";
await mongoose.connect(mongoUrl);
const server = createApp({
  mongoUrl,
  secret: randomBytes(48).toString("hex"),
  origin: "http://127.0.0.1:5174",
}).listen(4000, "127.0.0.1", () =>
  console.log("Local preview API: http://127.0.0.1:4000"),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () =>
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    }),
  );
