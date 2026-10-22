import { test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../src/app.js";
const app = createApp({
  secret: "isolated-test-secret-at-least-32-characters",
  memorySession: true,
});
test("anonymous users cannot read projects or call tickets", async () => {
  for (const path of [
    "/api/projects",
    "/api/projects/123",
    "/api/call-tickets",
  ])
    assert.equal((await request(app).get(path)).status, 401);
});
test("mutations reject missing CSRF and foreign origins before database use", async () => {
  const agent = request.agent(app);
  assert.equal((await agent.post("/api/contact").send({})).status, 403);
  const r = await agent.get("/api/csrf");
  assert.equal(typeof r.body.token, "string");
  assert.match(r.headers["set-cookie"][0], /HttpOnly/);
  assert.match(r.headers["set-cookie"][0], /SameSite=Lax/);
  assert.equal(
    (
      await agent
        .post("/api/contact")
        .set("X-CSRF-Token", r.body.token)
        .set("Origin", "https://foreign.example")
        .send({})
    ).status,
    403,
  );
  assert.equal(
    (
      await agent
        .post("/api/contact")
        .set("X-CSRF-Token", r.body.token)
        .send({})
    ).status,
    400,
  );
});
test("security headers and API not-found responses are present", async () => {
  const r = await request(app).get("/api/missing");
  assert.equal(r.status, 404);
  assert.ok(r.headers["content-security-policy"]);
  assert.equal(r.headers["x-content-type-options"], "nosniff");
  assert.equal(r.headers["x-powered-by"], undefined);
});
