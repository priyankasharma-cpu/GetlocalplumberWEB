import { test } from "node:test";
import assert from "node:assert/strict";
import { estimateRange } from "../src/utils/estimates.js";
const selection = {
  state: "Test state",
  size: "Typical job",
  complexity: "Test complexity",
};
const fixture = {
  kind: "illustrative",
  ranges: [{ ...selection, low: 10, high: 20 }],
};
test("unconfigured and unmatched pricing never produces an estimate", () => {
  assert.equal(estimateRange(null, selection), null);
  assert.equal(
    estimateRange(fixture, { ...selection, state: "Other state" }),
    null,
  );
  assert.equal(
    estimateRange({ ...fixture, kind: "verified" }, selection),
    null,
  );
});
test("illustrative fixtures remain labeled; invalid ranges are rejected", () => {
  assert.equal(estimateRange(fixture, selection).kind, "illustrative");
  assert.equal(
    estimateRange(
      { ...fixture, ranges: [{ ...selection, low: 20, high: 10 }] },
      selection,
    ),
    null,
  );
});
