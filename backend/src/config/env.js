export const DEFAULT_APP_ORIGIN = "http://localhost:5173";

// Accept exact origins only, never wildcard hosts, paths, or embedded credentials.
function validateOrigin(value, production) {
  let parsed;
  try { parsed = new URL(value); } catch { throw new Error("Invalid frontend origin configuration."); }
  if (parsed.origin !== value || !["http:", "https:"].includes(parsed.protocol)) throw new Error("Invalid frontend origin configuration.");
  if (production && parsed.protocol !== "https:") throw new Error("Configure production HTTPS origins.");
  return value;
}

// Read only on startup, not at import time: tests can create isolated application instances.
export function loadEnvironment(source = process.env) {
  const { MONGODB_URI, SESSION_SECRET, APP_ORIGIN, APP_ORIGINS, NODE_ENV, PORT = "4000" } = source;
  if (!MONGODB_URI || !SESSION_SECRET || SESSION_SECRET.length < 32) throw new Error("Configure backend database and session settings.");
  const port = Number(PORT);
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error("Invalid API port.");
  if (NODE_ENV === "production" && (!APP_ORIGIN || !APP_ORIGIN.startsWith("https://"))) throw new Error("Configure the production HTTPS origin.");
  const origin = validateOrigin(APP_ORIGIN || DEFAULT_APP_ORIGIN, NODE_ENV === "production");
  const allowedOrigins = Object.freeze([...new Set((APP_ORIGINS || "").split(",").map(value => value.trim()).filter(Boolean).map(value => validateOrigin(value, NODE_ENV === "production")))]);
  return Object.freeze({ mongoUrl: MONGODB_URI, secret: SESSION_SECRET, origin, allowedOrigins, port });
}
