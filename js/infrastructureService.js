(function initInfrastructureService(globalScope) {
  const riskRank = {
    Critical: 4,
    High: 3,
    Medium: 2,
    Low: 1
  };

  function cloneAssets(assets) {
    return assets.map((asset) => ({
      ...asset,
      tags: [...asset.tags],
      findings: [...asset.findings],
      remediation: [...asset.remediation]
    }));
  }

  function calculateAssetScore(asset) {
    let score = 0;

    if (asset.patchAgeDays > 30) score += 30;
    else if (asset.patchAgeDays > 21) score += 20;
    else if (asset.patchAgeDays > 14) score += 10;

    if (!asset.mfaEnabled) score += 25;
    if (asset.firewallExposure === "Internet-Facing") score += 20;
    if (!asset.encryptionEnabled) score += 20;
    if (asset.backupStatus === "Stale") score += 12;
    if (asset.backupStatus === "Missing") score += 18;
    if (asset.endpointProtection === "Disabled") score += 15;

    return Math.min(score, 100);
  }

  function scoreToRisk(score) {
    if (score >= 70) return "Critical";
    if (score >= 45) return "High";
    if (score >= 20) return "Medium";
    return "Low";
  }

  function enrichAssets(assets) {
    return assets.map((asset) => {
      const score = calculateAssetScore(asset);
      return {
        ...asset,
        score,
        computedRisk: scoreToRisk(score)
      };
    });
  }

  function calculateMetrics(assets) {
    const enriched = enrichAssets(assets);
    const critical = enriched.filter((asset) => asset.computedRisk === "Critical");
    const patchGaps = enriched.filter((asset) => asset.patchAgeDays > 21);
    const mfaGaps = enriched.filter((asset) => !asset.mfaEnabled);
    const remediationNeeded = enriched.filter((asset) => asset.computedRisk !== "Low");
    const averageScore = Math.round(enriched.reduce((sum, asset) => sum + asset.score, 0) / enriched.length);

    return {
      total: enriched.length,
      critical: critical.length,
      patchGaps: patchGaps.length,
      mfaGaps: mfaGaps.length,
      remediationNeeded: remediationNeeded.length,
      averageScore,
      postureGrade: getPostureGrade(averageScore, critical.length)
    };
  }

  function getPostureGrade(averageScore, criticalCount) {
    if (criticalCount > 0 || averageScore >= 60) return "C";
    if (averageScore >= 35) return "B";
    return "A";
  }

  function filterAssets(assets, filters) {
    const query = (filters.query || "").trim().toLowerCase();

    return enrichAssets(assets).filter((asset) => {
      const matchesQuery = !query || [
        asset.id,
        asset.name,
        asset.type,
        asset.owner,
        asset.environment,
        ...asset.tags
      ].some((value) => String(value).toLowerCase().includes(query));
      const matchesEnvironment = filters.environment === "all" || asset.environment === filters.environment;
      const matchesRisk = filters.risk === "all" || asset.computedRisk === filters.risk;
      const matchesType = filters.type === "all" || asset.type === filters.type;

      return matchesQuery && matchesEnvironment && matchesRisk && matchesType;
    });
  }

  function sortAssetsByRisk(assets) {
    return [...assets].sort((a, b) => {
      const riskDifference = (riskRank[b.computedRisk || b.risk] || 0) - (riskRank[a.computedRisk || a.risk] || 0);
      if (riskDifference !== 0) return riskDifference;
      return (b.score || 0) - (a.score || 0);
    });
  }

  function updateAsset(assets, assetId, changes) {
    return assets.map((asset) => (asset.id === assetId ? { ...asset, ...changes } : asset));
  }

  function getUniqueValues(assets, key) {
    return [...new Set(assets.map((asset) => asset[key]))].sort();
  }

  const infrastructureService = {
    riskRank,
    cloneAssets,
    calculateAssetScore,
    scoreToRisk,
    enrichAssets,
    calculateMetrics,
    filterAssets,
    sortAssetsByRisk,
    updateAsset,
    getUniqueValues
  };

  globalScope.infrastructureService = infrastructureService;

  if (typeof module !== "undefined") {
    module.exports = infrastructureService;
  }
})(typeof window !== "undefined" ? window : globalThis);
