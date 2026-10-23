import mongoose from "mongoose";
import { setServers } from "node:dns";
import { isIP } from "node:net";

export const DATABASE_NAME = "excellenthomeoffers_db";
export const COLLECTIONS = Object.freeze({
  users: "plumbing_users",
  contacts: "plumbing_contacts",
  projects: "plumbing_projects",
  tickets: "plumbing_call_tickets",
  sessions: "plumbing_sessions",
});

// Reject conflicting database paths rather than silently writing into another database.
export function databaseOptions(uri) {
  if (typeof uri !== "string" || !/^mongodb(?:\+srv)?:\/\//.test(uri)) {
    throw new Error("Set a valid backend MONGODB_URI.");
  }
  const database = uri.replace(/^mongodb(?:\+srv)?:\/\/[^/]+/, "").split("?")[0].replace(/^\//, "");
  if (database && decodeURIComponent(database) !== DATABASE_NAME) {
    throw new Error(`MONGODB_URI must target ${DATABASE_NAME}.`);
  }
  return { dbName: DATABASE_NAME, autoIndex: false, autoCreate: false, serverSelectionTimeoutMS: 10000 };
}

// Only provision new plumbing collections. Never migrate legacy users/projects,
// touch contacts/leads, or rebuild indexes on existing collections automatically.
export async function prepareCollections(db) {
  const existing = new Set((await db.listCollections({}, { nameOnly: true }).toArray()).map(c => c.name));
  for (const name of Object.values(COLLECTIONS)) {
    if (existing.has(name)) continue;
    try { await db.createCollection(name); }
    catch (error) { if (error.code !== 48) throw error; continue; }
    if (name === COLLECTIONS.users) await db.collection(name).createIndex({ email: 1 }, { unique: true });
    if (name === COLLECTIONS.projects) await db.collection(name).createIndex({ owner: 1, clientId: 1 }, { unique: true });
    if ([COLLECTIONS.projects, COLLECTIONS.tickets].includes(name)) await db.collection(name).createIndex({ owner: 1 });
    if (name === COLLECTIONS.sessions) await db.collection(name).createIndex({ expires: 1 }, { expireAfterSeconds: 0 });
  }
  // Unique indexes are required for race-safe registration and idempotent guest imports.
  // An existing collection without them needs an explicitly approved index maintenance step.
  for (const [name, fields] of [[COLLECTIONS.users, { email: 1 }], [COLLECTIONS.projects, { owner: 1, clientId: 1 }]]) {
    const indexes = await db.collection(name).indexes();
    if (!indexes.some(i => i.unique && JSON.stringify(i.key) === JSON.stringify(fields) && !i.sparse && !i.partialFilterExpression)) {
      throw new Error(`Required unique index missing in ${name}; no existing data or indexes were changed.`);
    }
  }
}

// Optional process-local resolver override; never changes system DNS or TLS checks.
export function configureDatabaseDns(value = process.env.MONGODB_DNS_SERVERS) {
  if (!value) return;
  const servers = value.split(",").map(s => s.trim());
  if (servers.length > 3 || servers.some(s => !isIP(s))) throw new Error("Invalid backend DNS configuration.");
  setServers(servers);
}

export function databaseFailure(error) {
  if ([18, 8000].includes(error?.code) && /auth/i.test(error.message)) return "authentication";
  if (error?.code === 13) return "database-permissions";
  if (/^(?:E(?:CONNREFUSED|NOTFOUND|SERVFAIL|TIMEOUT)|ENODATA)$/.test(error?.code || "")) return "dns-or-network";
  if (error?.name === "MongoServerSelectionError") return "network-or-atlas-access";
  if (/unique index missing/.test(error?.message || "")) return "required-index";
  return "configuration-or-connection";
}

export async function connectDatabase(uri) {
  configureDatabaseDns();
  await mongoose.connect(uri, databaseOptions(uri));
  await prepareCollections(mongoose.connection.db);
  await mongoose.connection.db.command({ ping: 1 });
  return mongoose.connection;
}
