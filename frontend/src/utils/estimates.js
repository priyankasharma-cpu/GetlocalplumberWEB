// Ranges must explicitly match all three inputs. No unsupported geographic multipliers.
export function estimateRange(cost, { state, size, complexity }) {
  if (!cost || !["verified", "illustrative"].includes(cost.kind)) return null;
  if (
    cost.kind === "verified" &&
    (!cost.sourceUrl?.startsWith("https://") || !cost.verifiedOn)
  )
    return null;
  const row = cost.ranges?.find(
    (r) => r.state === state && r.size === size && r.complexity === complexity,
  );
  if (
    !row ||
    !Number.isFinite(row.low) ||
    !Number.isFinite(row.high) ||
    row.low < 0 ||
    row.high < row.low
  )
    return null;
  return {
    ...row,
    kind: cost.kind,
    sourceUrl: cost.sourceUrl,
    verifiedOn: cost.verifiedOn,
  };
}
