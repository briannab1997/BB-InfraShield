const assert = require("assert");
const { seedAssets } = require("../js/data");
const infrastructureService = require("../js/infrastructureService");

const assets = infrastructureService.cloneAssets(seedAssets);

assert.strictEqual(assets.length, 6, "seed data should include six assets");
assert.notStrictEqual(assets[0], seedAssets[0], "assets should be cloned before use");
assert.notStrictEqual(assets[0].findings, seedAssets[0].findings, "nested arrays should be cloned");

const identityScore = infrastructureService.calculateAssetScore(assets[0]);
assert.strictEqual(identityScore, 100, "identity server should score from multiple baseline gaps");
assert.strictEqual(infrastructureService.scoreToRisk(identityScore), "Critical", "score should map to critical risk");

const databaseScore = infrastructureService.calculateAssetScore(assets[2]);
assert.strictEqual(databaseScore, 30, "database should score from patch age and encryption gap");
assert.strictEqual(infrastructureService.scoreToRisk(databaseScore), "Medium");

const metrics = infrastructureService.calculateMetrics(assets);
assert.strictEqual(metrics.total, 6, "metrics should count all assets");
assert.strictEqual(metrics.critical, 1, "metrics should count critical systems");
assert.strictEqual(metrics.patchGaps, 3, "metrics should count systems past patch threshold");
assert.strictEqual(metrics.mfaGaps, 2, "metrics should count MFA gaps");
assert.strictEqual(metrics.remediationNeeded, 5, "metrics should count non-low systems");

const prodAssets = infrastructureService.filterAssets(assets, {
  query: "",
  environment: "Production",
  risk: "all",
  type: "all"
});
assert.strictEqual(prodAssets.length, 3, "environment filter should match production assets");

const vpnAssets = infrastructureService.filterAssets(assets, {
  query: "vpn",
  environment: "all",
  risk: "all",
  type: "all"
});
assert.strictEqual(vpnAssets.length, 1, "query filter should match tags and names");
assert.strictEqual(vpnAssets[0].name, "vpn-edge-02");

const sortedAssets = infrastructureService.sortAssetsByRisk(infrastructureService.enrichAssets(assets));
assert.strictEqual(sortedAssets[0].computedRisk, "Critical", "highest risk assets should sort first");

const updatedAssets = infrastructureService.updateAsset(assets, "INF-2101", {
  mfaEnabled: true,
  patchAgeDays: 0
});
const updatedIdentity = updatedAssets.find((asset) => asset.id === "INF-2101");
assert.strictEqual(updatedIdentity.mfaEnabled, true, "MFA updates should be applied");
assert.strictEqual(updatedIdentity.patchAgeDays, 0, "patch updates should be applied");

console.log("All InfraShield tests passed.");
