import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { prepareCollections, COLLECTIONS, configureDatabaseDns, databaseFailure } from "../src/config/database.js";

test("existing collections with missing uniqueness indexes are rejected without modification", async () => {
  let writes = 0;
  const db = {
    listCollections: () => ({ toArray: async () => Object.values(COLLECTIONS).map(name => ({ name })) }),
    createCollection: async () => { writes++; },
    collection: () => ({ indexes: async () => [{ key: { _id: 1 } }], createIndex: async () => { writes++; } }),
  };
  await assert.rejects(prepareCollections(db), /Required unique index missing/);
  assert.equal(writes, 0);
});
test("database diagnostics expose safe categories rather than private error text", () => {
  assert.equal(databaseFailure({ code: 8000, message: "bad auth: private-details" }), "authentication");
  assert.equal(databaseFailure({ code: 13, message: "private-details" }), "database-permissions");
  assert.equal(databaseFailure({ code: "ECONNREFUSED", message: "private-details" }), "dns-or-network");
  assert.throws(() => configureDatabaseDns("not-an-IP"), /Invalid backend DNS/);
});
test("startup configuration failures never print a supplied database credential", () => {
  const secret = "private-diagnostic-test-credential";
  const result = spawnSync(process.execPath, ["src/server.js"], {
    cwd: fileURLToPath(new URL("../", import.meta.url)),
    env: { ...process.env, MONGODB_URI: `mongodb+srv://test:${secret}@example.invalid/excellenthomeoffers_db`, SESSION_SECRET: "" },
    encoding: "utf8", timeout: 10000,
  });
  assert.equal(result.status, 1);
  assert.ok(result.stderr.includes("Credentials were not logged"));
  assert.ok(!result.stderr.includes(secret));
});
