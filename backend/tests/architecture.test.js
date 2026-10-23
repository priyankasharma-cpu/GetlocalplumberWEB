import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import request from "supertest";
import { createApp } from "../src/app.js";
import { loadEnvironment } from "../src/config/env.js";

const root = fileURLToPath(new URL("../src/", import.meta.url));
const files = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
const source = files(root).filter(file => file.endsWith(".js"));

test("backend relative imports resolve and the module graph has no cycles", () => {
  const graph = new Map(source.map(file => [file, [...fs.readFileSync(file, "utf8").matchAll(/(?:from\s*|import\s*)["'](\.[^"']+)["']/g)].map(match => path.resolve(path.dirname(file), match[1]))]));
  for (const [file, dependencies] of graph) for (const dependency of dependencies) assert.ok(fs.existsSync(dependency), `Unresolved import in ${path.relative(root, file)}`);
  const visiting = new Set(), visited = new Set();
  function visit(file) {
    assert.ok(!visiting.has(file), `Circular import at ${path.relative(root, file)}`);
    if (visited.has(file)) return;
    visiting.add(file);
    for (const dependency of graph.get(file) || []) visit(dependency);
    visiting.delete(file); visited.add(file);
  }
  for (const file of source) visit(file);
});
test("domain layers have real implementations and routes contain no persistence logic", () => {
  for (const folder of ["config", "controllers", "middleware", "models", "routes", "services", "utils", "validators"]) {
    const implementations = source.filter(file => path.dirname(file) === path.join(root, folder));
    assert.ok(implementations.length > 0, `Empty architecture folder: ${folder}`);
    assert.ok(implementations.every(file => fs.readFileSync(file, "utf8").trim().length > 50));
  }
  for (const file of source) {
    const text = fs.readFileSync(file, "utf8");
    if (path.dirname(file) === path.join(root, "routes")) {
      assert.ok(!/from\s*["'][^"']*(?:models|services)\//.test(text), `Route bypasses controller: ${file}`);
      assert.ok(!/\.find(?:One|ById|OneAndUpdate)?\(|\.save\(|bcrypt|mongoose/.test(text), `Persistence in route: ${file}`);
    }
    if (path.dirname(file) === path.join(root, "controllers")) assert.ok(!/from\s*["'][^"']*models\//.test(text));
    if (path.dirname(file) === path.join(root, "services")) assert.ok(!/\b(?:req|res)\.|from\s*["']express["']/.test(text));
  }
});
test("startup environment validates secret, production origin, and API port before connecting", () => {
  const valid = { MONGODB_URI: "mongodb://localhost/excellenthomeoffers_db", SESSION_SECRET: "isolated-test-secret-at-least-32-characters", APP_ORIGIN: "https://getlocalplumber.com", NODE_ENV: "production" };
  assert.equal(loadEnvironment(valid).port, 4000);
  assert.equal(loadEnvironment({ ...valid, PORT: "0" }).port, 0);
  for (const patch of [{ SESSION_SECRET: "short" }, { PORT: "invalid" }, { PORT: "65536" }, { APP_ORIGIN: "http://example.com" }]) assert.throws(() => loadEnvironment({ ...valid, ...patch }));
  assert.deepEqual(loadEnvironment({ ...valid, NODE_ENV: "development", APP_ORIGINS: "http://localhost:5173,http://127.0.0.1:5174" }).allowedOrigins, ["http://localhost:5173", "http://127.0.0.1:5174"]);
  for (const APP_ORIGINS of ["*", "https://example.com/path", "https://user:password@example.com", "null", "http://localhost:5173"]) {
    assert.throws(() => loadEnvironment({ ...valid, APP_ORIGINS }));
  }
});
const app = createApp({ secret: "isolated-http-contract-secret-at-least-32-characters", memorySession: true });
test("central error middleware preserves malformed JSON and body-limit error contracts", async () => {
  const malformed = await request(app).post("/api/contact").set("Content-Type", "application/json").send("{");
  assert.equal(malformed.status, 400);
  assert.deepEqual(malformed.body, { error: "Invalid JSON." });
  const oversized = await request(app).post("/api/contact").send({ message: "x".repeat(40000) });
  assert.equal(oversized.status, 413);
  assert.deepEqual(oversized.body, { error: "Request is too large." });
});
test("separated routers preserve anonymous account, private routes and JSON validation responses", async () => {
  assert.deepEqual((await request(app).get("/api/auth/me")).body, { user: null });
  for (const url of ["/api/projects", "/api/projects/bad-id/quotes", "/api/call-tickets"]) assert.equal((await request(app).post(url).send({})).status, 403);
  const agent = request.agent(app);
  const token = (await agent.get("/api/csrf")).body.token;
  assert.equal((await agent.post("/api/projects").set("X-CSRF-Token", token).send({})).status, 401);
  const invalidContact = await agent.post("/api/contact").set("X-CSRF-Token", token).send({});
  assert.equal(invalidContact.status, 400);
  assert.equal(typeof invalidContact.body.error, "string");
  const missing = await agent.get("/api/does-not-exist");
  assert.equal(missing.status, 404);
  assert.deepEqual(missing.body, { error: "API endpoint not found." });
});
