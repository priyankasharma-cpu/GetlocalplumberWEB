import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { createApp, Project, User } from "../src/app.js";
let mongo, app, alice, bob, tokenA, tokenB, id;
const plan = {
  clientId: "11111111-1111-4111-8111-111111111111",
  service: "Drain Cleaning",
  state: "Alabama",
  answers: [
    "Repair or fix",
    "Within a month",
    "Single-family house",
    "Yes, I own it",
  ],
};
const token = async (agent) => (await agent.get("/api/csrf")).body.token;
before(
  async () => {
    const cached = fileURLToPath(
      new URL(
        "../../node_modules/.cache/mongo-runtime/mongod.exe",
        import.meta.url,
      ),
    );
    const systemBinary =
      process.env.MONGOMS_SYSTEM_BINARY ||
      (fs.existsSync(cached) ? cached : undefined);
    mongo = await MongoMemoryServer.create(
      systemBinary ? { binary: { systemBinary } } : {},
    );
    await mongoose.connect(mongo.getUri());
    await Promise.all([User.init(), Project.init()]);
    app = createApp({
      secret: "a-secure-test-session-secret-at-least-32",
      memorySession: true,
    });
    alice = request.agent(app);
    bob = request.agent(app);
    tokenA = await token(alice);
    tokenB = await token(bob);
  },
  { timeout: 180000 },
);
after(async () => {
  await mongoose.disconnect();
  await mongo?.stop();
});
test("private projects reject anonymous access", async () => {
  assert.equal((await request(app).get("/api/projects")).status, 401);
});
test("CSRF and foreign origins are rejected", async () => {
  assert.equal((await alice.post("/api/auth/register").send({})).status, 403);
  assert.equal(
    (
      await alice
        .post("/api/auth/register")
        .set("X-CSRF-Token", tokenA)
        .set("Origin", "https://evil.example")
        .send({})
    ).status,
    403,
  );
});
test("registration validates password and stores a hash", async () => {
  assert.equal(
    (
      await alice
        .post("/api/auth/register")
        .set("X-CSRF-Token", tokenA)
        .send({ name: "Alice", email: "alice@example.com", password: "weak" })
    ).status,
    400,
  );
  const r = await alice
    .post("/api/auth/register")
    .set("X-CSRF-Token", tokenA)
    .send({
      name: "Alice",
      email: "alice@example.com",
      password: "a-long-test-password",
    });
  assert.equal(r.status, 201);
  assert.equal(r.body.user.email, "alice@example.com");
  assert.equal(r.body.user.password, undefined);
  assert.notEqual(
    (await User.findOne({ email: "alice@example.com" })).password,
    "a-long-test-password",
  );
  assert.match(r.headers["set-cookie"][0], /HttpOnly/);
  tokenA = await token(alice);
  assert.equal(
    (
      await bob.post("/api/auth/register").set("X-CSRF-Token", tokenB).send({
        name: "Bob",
        email: "bob@example.com",
        password: "another-long-password",
      })
    ).status,
    201,
  );
  tokenB = await token(bob);
});
test("project creation is idempotent and scoped to owner", async () => {
  const r = await alice
    .post("/api/projects")
    .set("X-CSRF-Token", tokenA)
    .send(plan);
  assert.equal(r.status, 201);
  id = r.body._id;
  assert.equal(r.body.status, "Planned");
  await alice.post("/api/projects").set("X-CSRF-Token", tokenA).send(plan);
  assert.equal((await alice.get("/api/projects")).body.length, 1);
  assert.equal((await bob.get("/api/projects/" + id)).status, 404);
  assert.equal(
    (
      await bob
        .patch("/api/projects/" + id)
        .set("X-CSRF-Token", tokenB)
        .send({ status: "Decided" })
    ).status,
    404,
  );
  assert.equal(
    (await bob.delete("/api/projects/" + id).set("X-CSRF-Token", tokenB))
      .status,
    404,
  );
  assert.equal(
    (
      await alice
        .patch("/api/projects/" + id)
        .set("X-CSRF-Token", tokenA)
        .send({ owner: "bad" })
    ).status,
    400,
  );
});
test("quote create, edit, delete and manual progress work", async () => {
  let r = await alice
    .post(`/api/projects/${id}/quotes`)
    .set("X-CSRF-Token", tokenA)
    .send({ provider: "Local provider", amount: 123, notes: "Written quote" });
  assert.equal(r.status, 200);
  assert.equal(r.body.status, "Quote in");
  const q = r.body.quotes[0]._id;
  assert.equal(
    (
      await bob
        .post(`/api/projects/${id}/quotes`)
        .set("X-CSRF-Token", tokenB)
        .send({ provider: "Bad", amount: 1 })
    ).status,
    404,
  );
  r = await alice
    .patch(`/api/projects/${id}/quotes/${q}`)
    .set("X-CSRF-Token", tokenA)
    .send({ provider: "Updated provider", amount: 145, notes: "Revised" });
  assert.equal(r.body.quotes[0].amount, 145);
  r = await alice
    .delete(`/api/projects/${id}/quotes/${q}`)
    .set("X-CSRF-Token", tokenA);
  assert.equal(r.body.quotes.length, 0);
  r = await alice
    .patch("/api/projects/" + id)
    .set("X-CSRF-Token", tokenA)
    .send({ status: "Decided", notes: "Selected my provider" });
  assert.equal(r.body.status, "Decided");
  assert.ok(r.body.history.length >= 5);
});
test("guest import preserves notes and quotes without overwriting account data", async () => {
  const body = {
    ...plan,
    clientId: "22222222-2222-4222-8222-222222222222",
    status: "Called",
    notes: "Guest notes",
    quotes: [{ provider: "Guest provider", amount: 50, notes: "Guest quote" }],
    createdAt: new Date().toISOString(),
    history: [],
  };
  let r = await alice
    .post("/api/projects/import")
    .set("X-CSRF-Token", tokenA)
    .send(body);
  assert.equal(r.status, 201);
  assert.equal(r.body.notes, "Guest notes");
  assert.equal(r.body.quotes[0].amount, 50);
  r = await alice
    .post("/api/projects/import")
    .set("X-CSRF-Token", tokenA)
    .send({ ...body, notes: "Overwrite attempt" });
  assert.equal(r.body.notes, "Guest notes");
  assert.equal((await alice.get("/api/projects")).body.length, 2);
});
test("tickets are private and contact validation rejects spam", async () => {
  assert.equal(
    (
      await alice
        .post("/api/call-tickets")
        .set("X-CSRF-Token", tokenA)
        .send(plan)
    ).status,
    201,
  );
  assert.equal((await bob.get("/api/call-tickets")).body.length, 0);
  assert.equal(
    (
      await alice.post("/api/contact").set("X-CSRF-Token", tokenA).send({
        name: "Alice",
        email: "alice@example.com",
        phone: "1234567890",
        state: "Alabama",
        service: "Drain Cleaning",
        message: "Please save my plumbing request.",
        website: "spam",
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await alice.post("/api/contact").set("X-CSRF-Token", tokenA).send({
        name: "Alice",
        email: "alice@example.com",
        phone: "1234567890",
        state: "Alabama",
        service: "Drain Cleaning",
        message: "Please save my plumbing request.",
        website: "",
      })
    ).status,
    201,
  );
});
test("logout revokes the session and login restores account", async () => {
  assert.equal(
    (await alice.post("/api/auth/logout").set("X-CSRF-Token", tokenA)).status,
    204,
  );
  assert.equal((await alice.get("/api/projects")).status, 401);
  tokenA = await token(alice);
  assert.equal(
    (
      await alice.post("/api/auth/login").set("X-CSRF-Token", tokenA).send({
        email: "alice@example.com",
        password: "incorrect-long-password",
      })
    ).status,
    401,
  );
  assert.equal(
    (
      await alice
        .post("/api/auth/login")
        .set("X-CSRF-Token", tokenA)
        .send({ email: "alice@example.com", password: "a-long-test-password" })
    ).status,
    200,
  );
});
