import session from "express-session";
import MongoStore from "connect-mongo";
import { COLLECTIONS, DATABASE_NAME } from "./database.js";

export const SESSION_COOKIE_NAME = "glp.sid";

export function createSession({ mongoUrl, secret, memorySession, production }) {
  const store = memorySession ? undefined : MongoStore.create({
    mongoUrl,
    dbName: DATABASE_NAME,
    collectionName: COLLECTIONS.sessions,
    // TTL index provisioning belongs to database.js; never change existing indexes here.
    autoRemove: "disabled",
  });
  store?.on("error", () => console.error("Session storage failed; private details were not logged."));
  const middleware = session({
    name: SESSION_COOKIE_NAME, secret, resave: false, saveUninitialized: false,
    ...(store ? { store } : {}),
    cookie: { httpOnly: true, secure: production, sameSite: "lax", maxAge: 604800000 },
  });
  return { middleware, store };
}
