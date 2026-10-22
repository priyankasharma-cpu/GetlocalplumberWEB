import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { telephoneHref } from "../src/utils/phone.js";
import { locations } from "../src/data/locations.js";
test("phone links only exist for a configured valid number", () => {
  assert.equal(telephoneHref(null), null);
  assert.equal(telephoneHref("------"), null);
  assert.equal(telephoneHref("Call us"), null);
  assert.equal(telephoneHref("+1 (202) 555-0100"), "tel:+12025550100");
});
test("Census places are real state-scoped records with stable unique identifiers", () => {
  const cities = JSON.parse(
    fs.readFileSync(
      new URL("../src/data/cities.json", import.meta.url),
      "utf8",
    ),
  );
  assert.ok(cities.length > 30000);
  assert.equal(new Set(cities.map((c) => c.id)).size, cities.length);
  assert.ok(cities.some((c) => c.name === "Los Angeles" && c.abbr === "CA"));
  for (const c of cities) assert.ok(locations.some((l) => l.abbr === c.abbr));
});
test("all 24 service collages resolve to three actual image files", () => {
  const records = JSON.parse(
    fs.readFileSync(
      new URL("../src/data/services.json", import.meta.url),
      "utf8",
    ),
  );
  for (const s of records)
    for (const image of ["main", "detail-1", "detail-2"]) {
      const p = new URL(
        "../src/images/services/" + s.slug + "/" + image + ".webp",
        import.meta.url,
      );
      assert.ok(fs.statSync(p).size > 0);
    }
});
