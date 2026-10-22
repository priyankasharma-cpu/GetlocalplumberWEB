import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { locations } from "../src/data/locations.js";
const services = JSON.parse(
  fs.readFileSync(
    new URL("../src/data/services.json", import.meta.url),
    "utf8",
  ),
);
test("all 24 services have complete data and valid related services", () => {
  assert.equal(services.length, 24);
  assert.equal(new Set(services.map((s) => s.slug)).size, 24);
  for (const s of services) {
    assert.ok(s.short && s.description && s.seoTitle && s.seoDescription);
    assert.ok(s.benefits.length && s.faqs.length);
    assert.ok(
      fs.existsSync(
        new URL("../src/images/services/" + s.slug, import.meta.url),
      ),
    );
    for (const id of s.related) assert.ok(services.some((s) => s.id === id));
    assert.equal(s.cost, null);
  }
});
test("location directory contains all 50 states and DC without duplicate URLs", () => {
  assert.equal(locations.length, 51);
  assert.equal(new Set(locations.map((l) => l.slug)).size, 51);
  assert.equal(new Set(locations.map((l) => l.abbr)).size, 51);
  assert.ok(locations.some((l) => l.abbr === "DC"));
  for (const l of locations) assert.match(l.slug, /^[a-z]+(?:-[a-z]+)*$/);
});
test("SEO output includes every public service and state route", () => {
  for (const route of [
    ...services.map((s) => "services/" + s.slug),
    ...locations.map((l) => "locations/" + l.slug),
  ]) {
    const html = fs.readFileSync(
      new URL("../dist/" + route + "/index.html", import.meta.url),
      "utf8",
    );
    assert.ok(html.includes('rel="canonical"'));
    assert.ok(html.includes("<h1>"));
    assert.ok(html.includes('name="description"'));
  }
  const sitemap = fs.readFileSync(
    new URL("../dist/sitemap.xml", import.meta.url),
    "utf8",
  );
  assert.equal((sitemap.match(/<loc>/g) || []).length, 79);
});
