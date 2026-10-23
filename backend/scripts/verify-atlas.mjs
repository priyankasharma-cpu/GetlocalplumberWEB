// Explicit opt-in live database check. Only this run's UUID-tagged test records are removed.
import fs from "node:fs";
import { randomUUID, randomBytes, createHash } from "node:crypto";
import mongoose from "mongoose";
import request from "supertest";
import { createApp } from "../src/app.js";
import { User, Contact, Project } from "../src/models/index.js";
import { connectDatabase, databaseFailure, DATABASE_NAME, COLLECTIONS } from "../src/config/database.js";

if (!process.argv.includes("--write-test-data")) {
  console.error("Use check:database for read-only checks. Live persistence tests require --write-test-data.");
  process.exit(1);
}
const run = randomUUID(), prefix = `glp-audit-${run}`;
const emails = [`${prefix}-a@example.invalid`, `${prefix}-b@example.invalid`];
const clientId = randomUUID(), sessionIds = new Set();
const report = { database: DATABASE_NAME, isolatedRun: run, checks: [], passed: false };
let app, server, phase = "connection", protectedBefore;
const verify = (value, label) => {
  phase = label;
  if (!value) throw new Error("Verification failed.");
  report.checks.push(label);
};
const invoke = async operation => {
  const response = await operation;
  for (const cookie of response.headers["set-cookie"] || []) {
    if (!cookie.startsWith("glp.sid=")) continue;
    const value = decodeURIComponent(cookie.split(";")[0].slice(8));
    if (value.startsWith("s:")) sessionIds.add(value.slice(2, value.lastIndexOf(".")));
  }
  return response;
};
const tokenFor = async agent => (await invoke(agent.get("/api/csrf"))).body.token;
const snapshotProtected = async () => {
  const names = new Set((await mongoose.connection.db.listCollections({}, { nameOnly: true }).toArray()).map(c => c.name));
  const result = {};
  for (const name of ["contacts", "leads"]) {
    if (!names.has(name)) { result[name] = { exists: false }; continue; }
    const collection = mongoose.connection.db.collection(name);
    result[name] = { exists: true, count: await collection.countDocuments(), indexHash: createHash("sha256").update(JSON.stringify(await collection.indexes())).digest("hex") };
  }
  return result;
};
try {
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) throw new Error("Configure session secret.");
  await connectDatabase(process.env.MONGODB_URI);
  verify(mongoose.connection.name === DATABASE_NAME, "Atlas database connected and pinged");
  protectedBefore = await snapshotProtected();
  // This isolated verification server uses loopback HTTP. Deployment HTTPS settings stay unchanged.
  process.env.NODE_ENV = "test";
  app = createApp({ mongoUrl: process.env.MONGODB_URI, secret: process.env.SESSION_SECRET, origin: "http://127.0.0.1:5174" });
  server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  const alice = request.agent(server), bob = request.agent(server);
  const password = randomBytes(30).toString("base64url");
  let a = await tokenFor(alice), b = await tokenFor(bob);
  let response = await invoke(alice.post("/api/auth/register").set("X-CSRF-Token", a).send({ name: prefix, email: emails[0], password }));
  verify(response.status === 201 && !response.body.user.password, "Registration creates a safe account response");
  const aliceId = response.body.user.id;
  const user = await User.findById(aliceId).select("+password");
  verify(Boolean(user && user.password !== password && /^\$2[aby]\$12\$/.test(user.password)), "plumbing_users stores a bcrypt hash");
  a = await tokenFor(alice);
  response = await invoke(alice.post("/api/auth/register").set("X-CSRF-Token", a).send({ name: prefix, email: emails[0].toUpperCase(), password }));
  verify(response.status === 409, "Duplicate normalized email is rejected");
  response = await invoke(bob.post("/api/auth/register").set("X-CSRF-Token", b).send({ name: prefix, email: emails[1], password }));
  verify(response.status === 201, "Second isolated account created for ownership checks");
  b = await tokenFor(bob);
  const plan = { clientId, service: "Drain Cleaning", state: "Alabama", answers: ["Repair or fix", "Within a month", "Single-family house", "Yes, I own it"] };
  response = await invoke(alice.post("/api/projects").set("X-CSRF-Token", a).send(plan));
  verify(response.status === 201 && response.body.owner === aliceId, "Project persists with authenticated ownership");
  const projectId = response.body._id;
  verify(Boolean(await Project.findOne({ _id: projectId, clientId, owner: aliceId })), "Project exists in plumbing_projects");
  response = await invoke(bob.get(`/api/projects/${projectId}`));
  verify(response.status === 404, "Another user cannot read the private project");
  response = await invoke(bob.patch(`/api/projects/${projectId}`).set("X-CSRF-Token", b).send({ status: "Decided" }));
  verify(response.status === 404, "Another user cannot change the private project");
  response = await invoke(alice.post(`/api/projects/${projectId}/quotes`).set("X-CSRF-Token", a).send({ provider: prefix, amount: 125, notes: "Isolated verification" }));
  verify(response.status === 200 && response.body.quotes.length === 1 && response.body.status === "Quote in", "Existing quote and progress workflow persists");
  response = await invoke(alice.get("/api/auth/me"));
  verify(response.body.user?.id === aliceId && !response.body.user.password, "Authenticated account loads from database without password data");
  const submission = { name: prefix, email: emails[0], phone: "+1 (833) 699-8912", state: "Alabama", service: "Drain Cleaning", message: `Isolated backend verification ${run}.`, website: "", source: "untrusted.example", status: "approved" };
  response = await invoke(alice.post("/api/contact").set("X-CSRF-Token", a).send({ ...submission, message: "short" }));
  verify(response.status === 400 && !(await Contact.exists({ email: emails[0] })), "Invalid contact submissions are not stored");
  response = await invoke(alice.post("/api/contact").set("X-CSRF-Token", a).send(submission));
  const saved = await Contact.findOne({ email: emails[0], name: prefix }).lean();
  verify(response.status === 201 && saved?.source === "getlocalplumber.com" && saved.createdAt && saved.status === undefined, "Contact saved in plumbing_contacts with trusted source and timestamps");
  response = await invoke(alice.post("/api/auth/logout").set("X-CSRF-Token", a));
  verify(response.status === 204 && (await invoke(alice.get("/api/projects"))).status === 401, "Logout invalidates private access");
  a = await tokenFor(alice);
  response = await invoke(alice.post("/api/auth/login").set("X-CSRF-Token", a).send({ email: emails[0], password: "invalid-test-password" }));
  verify(response.status === 401, "Invalid login is rejected");
  response = await invoke(alice.post("/api/auth/login").set("X-CSRF-Token", a).send({ email: emails[0], password }));
  verify(response.status === 200, "Valid login succeeds");
  a = await tokenFor(alice);
  response = await invoke(alice.get("/api/projects"));
  verify(response.body.some(p => p._id === projectId && p.quotes.length === 1), "Project and quote survive logout and login");
  await invoke(alice.post("/api/auth/logout").set("X-CSRF-Token", a));
  await invoke(bob.post("/api/auth/logout").set("X-CSRF-Token", b));
  report.passed = true;
} catch (error) {
  report.failure = { phase, category: databaseFailure(error) };
  process.exitCode = 1;
} finally {
  await new Promise(resolve => server ? server.close(resolve) : resolve());
  await app?.locals.sessionStore?.close();
  if (mongoose.connection.readyState === 1) {
    // Only unique identities generated by this run are eligible for cleanup.
    for (const email of emails) {
      const user = await User.findOne({ email, name: prefix });
      if (user) {
        await Project.deleteMany({ owner: user._id, clientId });
        await User.deleteOne({ _id: user._id, email, name: prefix });
      }
      await Contact.deleteMany({ email, name: prefix, source: "getlocalplumber.com" });
    }
    await mongoose.connection.db.collection(COLLECTIONS.sessions).deleteMany({ _id: { $in: [...sessionIds] } });
    report.cleanupVerified = !(await User.exists({ email: { $in: emails } })) && !(await Contact.exists({ email: { $in: emails } })) && !(await Project.exists({ clientId }));
    if (protectedBefore) report.protectedCollectionsUnchanged = JSON.stringify(protectedBefore) === JSON.stringify(await snapshotProtected());
    if (!report.cleanupVerified || report.protectedCollectionsUnchanged === false) { report.passed = false; process.exitCode = 1; }
  }
  await mongoose.disconnect();
  fs.mkdirSync(new URL("../test-results/", import.meta.url), { recursive: true });
  fs.writeFileSync(new URL("../test-results/atlas-integration.json", import.meta.url), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
