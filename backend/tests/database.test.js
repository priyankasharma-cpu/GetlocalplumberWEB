import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import fs from "node:fs";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";
import { createApp } from "../src/app.js";
import { User, Contact, Project, Ticket } from "../src/models/index.js";
import { connectDatabase, prepareCollections, databaseOptions, DATABASE_NAME, COLLECTIONS } from "../src/config/database.js";
import { contactStates, contactServices } from "../src/validators/formOptions.js";
let mongo, app, alice, token, originalCollections, restoredApp;
const csrf = async agent => (await agent.get("/api/csrf")).body.token;
const legacy = ["contacts", "leads", "users", "projects", "tickets", "sessions"];
const secret = "isolated-persistent-session-secret-at-least-32-characters";
const contact = { name: "Isolated test", email: " Test@Example.com ", phone: "+1 (833) 699-8912", state: "Alabama", service: "Drain Cleaning", message: "This is an isolated contact persistence test.", website: "", source: "forged.example", status: "approved", owner: "forged" };

before(async () => {
  const cached = fileURLToPath(new URL("../../node_modules/.cache/mongo-runtime/mongod.exe", import.meta.url));
  const binary = process.env.MONGOMS_SYSTEM_BINARY || (fs.existsSync(cached) ? cached : undefined);
  mongo = await MongoMemoryServer.create(binary ? { binary: { systemBinary: binary } } : {});
  // Seed protected/legacy data in this disposable server only.
  await mongoose.connect(mongo.getUri(), { dbName: DATABASE_NAME, autoIndex: false, autoCreate: false });
  for (const name of legacy) await mongoose.connection.db.collection(name).insertOne({ sentinel: name, untouched: true });
  originalCollections = Object.fromEntries(await Promise.all(legacy.map(async name => [name, {
    docs: await mongoose.connection.db.collection(name).find().toArray(),
    indexes: await mongoose.connection.db.collection(name).indexes(),
  }])));
  await mongoose.disconnect();
  await connectDatabase(mongo.getUri());
  app = createApp({ mongoUrl: mongo.getUri(), secret });
  alice = request.agent(app); token = await csrf(alice);
}, { timeout: 180000 });
after(async () => {
  await app?.locals.sessionStore?.close();
  await restoredApp?.locals.sessionStore?.close();
  await mongoose.disconnect();
  await mongo?.stop(); // Removes only this disposable instance, never an environment URI.
});

test("database configuration pins the exact database and rejects another database", () => {
  assert.equal(mongoose.connection.name, DATABASE_NAME);
  assert.equal(databaseOptions("mongodb+srv://test:fake@cluster.example/excellenthomeoffers_db?appName=Cluster0").dbName, DATABASE_NAME);
  assert.throws(() => databaseOptions("mongodb://127.0.0.1:27017/unrelated_database"));
  assert.throws(() => databaseOptions("https://example.com"));
  assert.deepEqual([User.collection.name, Contact.collection.name, Project.collection.name], ["plumbing_users", "plumbing_contacts", "plumbing_projects"]);
  assert.equal(Ticket.collection.name, COLLECTIONS.tickets);
});
test("registration normalizes email, hides passwords and enforces race-safe uniqueness", async () => {
  const result = await alice.post("/api/auth/register").set("X-CSRF-Token", token).send({ name: "Alice", email: "  Alice@Example.com ", password: "an-isolated-test-password" });
  assert.equal(result.status, 201);
  assert.deepEqual(Object.keys(result.body.user).sort(), ["email", "id", "name"]);
  assert.equal(result.body.user.email, "alice@example.com");
  assert.equal((await User.findOne({ email: "alice@example.com" })).password, undefined);
  const stored = await User.findOne({ email: "alice@example.com" }).select("+password");
  assert.match(stored.password, /^\$2[aby]\$12\$/);
  token = await csrf(alice);
  const duplicate = await alice.post("/api/auth/register").set("X-CSRF-Token", token).send({ name: "Duplicate", email: "ALICE@example.com", password: "another-test-password" });
  assert.equal(duplicate.status, 409);
  const results = await Promise.all([1, 2].map(async () => {
    const competitor = request.agent(app);
    const competitorToken = await csrf(competitor);
    return competitor.post("/api/auth/register").set("X-CSRF-Token", competitorToken).send({ name: "Concurrent", email: "race@example.com", password: "an-isolated-test-password" });
  }));
  assert.deepEqual(results.map(r => r.status).sort(), [201, 409]);
  // Restore the original account after the successful concurrent registration.
  token = await csrf(alice);
  assert.equal((await alice.post("/api/auth/login").set("X-CSRF-Token", token).send({ email: "alice@example.com", password: "an-isolated-test-password" })).status, 200);
  token = await csrf(alice);
});
test("registration rejects bcrypt-truncated passwords without creating an account", async () => {
  const result = await alice.post("/api/auth/register").set("X-CSRF-Token", token).send({ name: "Invalid", email: "too-long@example.com", password: "a".repeat(73) });
  assert.equal(result.status, 400);
  assert.equal(await User.countDocuments({ email: "too-long@example.com" }), 0);
});
test("sessions persist across app instances and logout revokes a replayed cookie", async () => {
  const response = await alice.get("/api/csrf");
  const me = await alice.get("/api/auth/me");
  assert.equal(me.body.user.email, "alice@example.com");
  assert.equal(me.headers["cache-control"], "no-store");
  assert.equal(me.body.user.password, undefined);
  assert.ok(await mongoose.connection.db.collection(COLLECTIONS.sessions).countDocuments());
  // Re-authenticate to capture a fresh cookie, then exercise the same session in another app.
  const login = await alice.post("/api/auth/login").set("X-CSRF-Token", response.body.token).send({ email: "alice@example.com", password: "an-isolated-test-password" });
  const cookie = login.headers["set-cookie"][0].split(";")[0];
  restoredApp = createApp({ mongoUrl: mongo.getUri(), secret });
  assert.equal((await request(restoredApp).get("/api/auth/me").set("Cookie", cookie)).body.user.email, "alice@example.com");
  token = await csrf(alice);
  assert.equal((await alice.post("/api/auth/logout").set("X-CSRF-Token", token)).status, 204);
  assert.equal((await request(restoredApp).get("/api/auth/me").set("Cookie", cookie)).body.user, null);
  assert.equal((await request(restoredApp).get("/api/projects").set("Cookie", cookie)).status, 401);
  token = await csrf(alice);
});
test("contact persistence uses plumbing_contacts with trusted metadata and timestamps", async () => {
  const response = await alice.post("/api/contact").set("X-CSRF-Token", token).send(contact);
  assert.equal(response.status, 201);
  const stored = await Contact.findOne({ email: "test@example.com" }).lean();
  assert.equal(stored.source, "getlocalplumber.com");
  assert.ok(stored.createdAt instanceof Date && stored.updatedAt instanceof Date);
  assert.equal(stored.status, undefined); assert.equal(stored.owner, undefined); assert.equal(stored.website, undefined);
  assert.equal((await alice.get("/api/contact")).status, 404);
});
test("contact validation rejects invalid phone/options and database failures never report success", async () => {
  for (const patch of [{ phone: "-------" }, { state: "Invented state" }, { service: "Invented service" }]) {
    assert.equal((await alice.post("/api/contact").set("X-CSRF-Token", token).send({ ...contact, ...patch })).status, 400);
  }
  const create = Contact.create;
  try {
    Contact.create = async () => { throw new Error("private-connection-details-must-not-leak"); };
    const result = await alice.post("/api/contact").set("X-CSRF-Token", token).send(contact);
    assert.equal(result.status, 500);
    assert.ok(!JSON.stringify(result.body).includes("private-connection"));
  } finally { Contact.create = create; }
  assert.equal(await Contact.countDocuments(), 1);
});
test("existing collection data and indexes are never changed by provisioning or APIs", async () => {
  await prepareCollections(mongoose.connection.db);
  for (const name of legacy) {
    assert.deepEqual(await mongoose.connection.db.collection(name).find().toArray(), originalCollections[name].docs);
    assert.deepEqual(await mongoose.connection.db.collection(name).indexes(), originalCollections[name].indexes);
  }
});
test("server contact allowlists match every existing frontend form option", async () => {
  const { locations } = await import("../../frontend/src/data/locations.js");
  const services = JSON.parse(fs.readFileSync(new URL("../../frontend/src/data/services.json", import.meta.url), "utf8"));
  assert.deepEqual(contactStates, locations.map(l => l.name));
  assert.deepEqual(contactServices, services.map(s => s.title));
});

test("real backend entry point starts against isolated MongoDB and serves existing routes", async () => {
  const child = spawn(process.execPath, ["src/server.js"], {
    cwd: fileURLToPath(new URL("../", import.meta.url)),
    env: { ...process.env, MONGODB_URI: mongo.getUri(), SESSION_SECRET: secret, APP_ORIGIN: "http://localhost:5173", NODE_ENV: "test", PORT: "0", MONGODB_DNS_SERVERS: "" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const exited = new Promise(resolve => child.once("exit", resolve));
  try {
    const port = await new Promise((resolve, reject) => {
      let output = "";
      const timer = setTimeout(() => reject(new Error("Backend startup timed out.")), 15000);
      child.once("exit", () => { clearTimeout(timer); reject(new Error("Backend exited before listening.")); });
      child.stdout.on("data", data => {
        output += data.toString();
        const match = output.match(/API listening on port (\d+)/);
        if (match) { clearTimeout(timer); assert.ok(output.includes(DATABASE_NAME)); resolve(Number(match[1])); }
      });
    });
    const response = await fetch(`http://127.0.0.1:${port}/api/auth/me`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { user: null });
  } finally { child.kill(); await exited; }
});

test("occupied API ports produce an actionable EADDRINUSE error and exit cleanly", async () => {
  const occupied = createServer();
  await new Promise(resolve => occupied.listen(0, resolve));
  const port = occupied.address().port;
  const child = spawn(process.execPath, ["src/server.js"], {
    cwd: fileURLToPath(new URL("../", import.meta.url)),
    env: { ...process.env, MONGODB_URI: mongo.getUri(), SESSION_SECRET: secret, APP_ORIGIN: "http://localhost:5173", NODE_ENV: "test", PORT: String(port), MONGODB_DNS_SERVERS: "" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  child.stderr.on("data", data => { output += data.toString(); });
  let timer;
  try {
    const code = await new Promise((resolve, reject) => {
      timer = setTimeout(() => { child.kill(); reject(new Error("Occupied-port startup did not exit.")); }, 15000);
      child.once("exit", resolve);
    });
    assert.equal(code, 1);
    assert.ok(output.includes(`Port ${port} is already in use (EADDRINUSE)`));
    assert.ok(output.includes("Ctrl+C"));
    assert.ok(!output.includes("TypeError"));
  } finally {
    clearTimeout(timer);
    child.kill();
    await new Promise(resolve => occupied.close(resolve));
  }
});

test("registration accepts configured local origins while retaining origin and CSRF protection", async () => {
  const origins = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"];
  const localApp = createApp({ secret, memorySession: true, origin: origins[0], allowedOrigins: origins.slice(1) });
  for (const [index, origin] of origins.entries()) {
    const agent = request.agent(localApp);
    const csrfToken = await csrf(agent);
    const result = await agent.post("/api/auth/register").set("Origin", origin).set("X-CSRF-Token", csrfToken).send({
      name: "Origin verification", email: `origin-${index}@example.com`, password: "an-origin-test-password",
    });
    assert.equal(result.status, 201, `Registration failed for ${origin}`);
    assert.equal((await agent.get("/api/auth/me")).body.user.email, `origin-${index}@example.com`);
  }
  const blocked = request.agent(localApp);
  const csrfToken = await csrf(blocked);
  assert.equal((await blocked.post("/api/auth/register").set("Origin", "https://evil.example").set("X-CSRF-Token", csrfToken).send({})).status, 403);
  assert.equal((await blocked.post("/api/auth/register").set("Origin", "http://localhost:5173.evil.example").set("X-CSRF-Token", csrfToken).send({})).status, 403);
  assert.equal((await blocked.post("/api/auth/register").set("Origin", origins[0]).send({})).status, 403);
});
