import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { siteConfig } from "../src/data/siteConfig.js";
import { telephoneHref } from "../src/utils/phone.js";

test("official identity has one consistent telephone destination", () => {
  assert.equal(siteConfig.siteName, "GetLocalPlumber.com");
  assert.equal(siteConfig.domain, "https://getlocalplumber.com");
  assert.equal(siteConfig.phone, "+1 (833) 699-8912");
  assert.equal(siteConfig.phoneHref, "tel:+18336998912");
  assert.equal(telephoneHref(siteConfig.phone), siteConfig.phoneHref);
});
test("public SEO output uses the official domain and singular branding", () => {
  const root = new URL("../dist/", import.meta.url);
  const sitemap = fs.readFileSync(new URL("sitemap.xml", root), "utf8");
  assert.ok(sitemap.includes(siteConfig.domain + "/services/drain-cleaning"));
  assert.ok(!sitemap.includes("getlocalplumbers.com"));
  for (const route of ["", "services/drain-cleaning/", "locations/alabama/"]) {
    const html = fs.readFileSync(new URL(route + "index.html", root), "utf8");
    assert.ok(html.includes(siteConfig.siteName));
    assert.ok(html.includes(`rel="canonical" href="${siteConfig.domain}`));
  }
});
