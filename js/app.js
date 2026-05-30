const storageKey = "bb-infrashield-assets";

const elements = {
  assetBrief: document.querySelector("#assetBrief"),
  assetCount: document.querySelector("#assetCount"),
  assetList: document.querySelector("#assetList"),
  backupStatus: document.querySelector("#backupStatus"),
  closeDrawer: document.querySelector("#closeDrawer"),
  criticalCount: document.querySelector("#criticalCount"),
  detailDrawer: document.querySelector("#detailDrawer"),
  drawerContent: document.querySelector("#drawerContent"),
  encryptionStatus: document.querySelector("#encryptionStatus"),
  environmentFilter: document.querySelector("#environmentFilter"),
  mfaGapCount: document.querySelector("#mfaGapCount"),
  mfaStatus: document.querySelector("#mfaStatus"),
  patchGapCount: document.querySelector("#patchGapCount"),
  patchStatus: document.querySelector("#patchStatus"),
  postureGrade: document.querySelector("#postureGrade"),
  postureSummary: document.querySelector("#postureSummary"),
  remediationList: document.querySelector("#remediationList"),
  resetDemo: document.querySelector("#resetDemo"),
  resultCount: document.querySelector("#resultCount"),
  riskFilter: document.querySelector("#riskFilter"),
  scrim: document.querySelector("#scrim"),
  searchInput: document.querySelector("#searchInput"),
  typeFilter: document.querySelector("#typeFilter")
};

let assets = loadAssets();
let selectedAssetId = assets[0]?.id;

function loadAssets() {
  const storedAssets = localStorage.getItem(storageKey);
  if (!storedAssets) return infrastructureService.cloneAssets(seedAssets);

  try {
    return JSON.parse(storedAssets);
  } catch {
    return infrastructureService.cloneAssets(seedAssets);
  }
}

function saveAssets() {
  localStorage.setItem(storageKey, JSON.stringify(assets));
}

function render() {
  renderFilters();
  renderMetrics();
  renderAssetList();
  renderBrief();
  renderRemediation();
}

function getFilters() {
  return {
    query: elements.searchInput.value,
    environment: elements.environmentFilter.value,
    risk: elements.riskFilter.value,
    type: elements.typeFilter.value
  };
}

function renderFilters() {
  const currentEnvironment = elements.environmentFilter.value || "all";
  const currentRisk = elements.riskFilter.value || "all";
  const currentType = elements.typeFilter.value || "all";

  populateSelect(elements.environmentFilter, "All Environments", infrastructureService.getUniqueValues(assets, "environment"));
  populateSelect(elements.riskFilter, "All Risk Levels", ["Critical", "High", "Medium", "Low"]);
  populateSelect(elements.typeFilter, "All Types", infrastructureService.getUniqueValues(assets, "type"));

  elements.environmentFilter.value = currentEnvironment;
  elements.riskFilter.value = currentRisk;
  elements.typeFilter.value = currentType;
}

function populateSelect(select, defaultLabel, options) {
  select.innerHTML = `<option value="all">${defaultLabel}</option>`;
  options.forEach((option) => {
    const item = document.createElement("option");
    item.value = option;
    item.textContent = option;
    select.appendChild(item);
  });
}

function renderMetrics() {
  const metrics = infrastructureService.calculateMetrics(assets);

  elements.assetCount.textContent = metrics.total;
  elements.criticalCount.textContent = metrics.critical;
  elements.patchGapCount.textContent = metrics.patchGaps;
  elements.mfaGapCount.textContent = metrics.mfaGaps;
  elements.postureGrade.textContent = metrics.postureGrade;
  elements.postureGrade.dataset.grade = metrics.postureGrade.toLowerCase();
  elements.postureSummary.textContent = `${metrics.remediationNeeded} assets require remediation.`;
}

function renderAssetList() {
  const filteredAssets = infrastructureService.sortAssetsByRisk(infrastructureService.filterAssets(assets, getFilters()));
  elements.resultCount.textContent = `${filteredAssets.length} system${filteredAssets.length === 1 ? "" : "s"}`;

  if (!filteredAssets.length) {
    elements.assetList.innerHTML = `
      <div class="empty-state">
        <strong>No systems match those filters.</strong>
        <p>Adjust the search or reset the demo inventory.</p>
      </div>
    `;
    return;
  }

  elements.assetList.innerHTML = filteredAssets.map((asset) => `
    <article class="asset-card ${selectedAssetId === asset.id ? "selected" : ""}" data-asset-id="${asset.id}">
      <div class="asset-main">
        <div>
          <span class="asset-id">${asset.id}</span>
          <h3>${asset.name}</h3>
          <p>${asset.type} · ${asset.environment} · ${asset.owner}</p>
        </div>
        <div class="risk-score">
          <span class="risk ${asset.computedRisk.toLowerCase()}">${asset.computedRisk}</span>
          <strong>${asset.score}</strong>
        </div>
      </div>
      <div class="control-strip">
        <span>${asset.patchAgeDays}d patch age</span>
        <span>${asset.mfaEnabled ? "MFA enabled" : "MFA gap"}</span>
        <span>${asset.firewallExposure}</span>
      </div>
    </article>
  `).join("");
}

function renderBrief() {
  const enrichedAssets = infrastructureService.enrichAssets(assets);
  const selectedAsset = enrichedAssets.find((asset) => asset.id === selectedAssetId) || infrastructureService.sortAssetsByRisk(enrichedAssets)[0];
  if (!selectedAsset) return;

  selectedAssetId = selectedAsset.id;
  elements.assetBrief.innerHTML = `
    <span class="asset-id">${selectedAsset.id}</span>
    <h3>${selectedAsset.name}</h3>
    <p>${selectedAsset.findings[0]}</p>
    <div class="score-ring ${selectedAsset.computedRisk.toLowerCase()}">
      <span>Risk Score</span>
      <strong>${selectedAsset.score}</strong>
    </div>
    <button type="button" class="primary-action" data-open-detail="${selectedAsset.id}">Open Remediation Plan</button>
  `;
  elements.patchStatus.textContent = `${selectedAsset.patchAgeDays} days`;
  elements.mfaStatus.textContent = selectedAsset.mfaEnabled ? "Enabled" : "Gap";
  elements.backupStatus.textContent = selectedAsset.backupStatus;
  elements.encryptionStatus.textContent = selectedAsset.encryptionEnabled ? "Enabled" : "Gap";
}

function renderRemediation() {
  const riskyAssets = infrastructureService
    .sortAssetsByRisk(infrastructureService.enrichAssets(assets))
    .filter((asset) => asset.computedRisk !== "Low");

  elements.remediationList.innerHTML = riskyAssets.map((asset) => `
    <article class="remediation-card">
      <div>
        <span class="risk ${asset.computedRisk.toLowerCase()}">${asset.computedRisk}</span>
        <h3>${asset.name}</h3>
        <p>${asset.remediation[0]}</p>
      </div>
      <button type="button" data-open-detail="${asset.id}">Review</button>
    </article>
  `).join("");
}

function openDrawer(assetId) {
  const asset = infrastructureService.enrichAssets(assets).find((item) => item.id === assetId);
  if (!asset) return;

  selectedAssetId = assetId;
  elements.drawerContent.innerHTML = `
    <p class="eyebrow">Asset Detail</p>
    <h2>${asset.name}</h2>
    <div class="drawer-badges">
      <span class="risk ${asset.computedRisk.toLowerCase()}">${asset.computedRisk}</span>
      <span>${asset.type}</span>
      <span>${asset.environment}</span>
    </div>
    <dl class="detail-list">
      <div><dt>Asset ID</dt><dd>${asset.id}</dd></div>
      <div><dt>Owner</dt><dd>${asset.owner}</dd></div>
      <div><dt>Risk Score</dt><dd>${asset.score}/100</dd></div>
      <div><dt>Patch Age</dt><dd>${asset.patchAgeDays} days</dd></div>
      <div><dt>Firewall Exposure</dt><dd>${asset.firewallExposure}</dd></div>
      <div><dt>Last Scan</dt><dd>${asset.lastScan}</dd></div>
    </dl>
    <section>
      <h3>Findings</h3>
      <ul>
        ${asset.findings.map((finding) => `<li>${finding}</li>`).join("")}
      </ul>
    </section>
    <section>
      <h3>Remediation Plan</h3>
      <ol>
        ${asset.remediation.map((step) => `<li>${step}</li>`).join("")}
      </ol>
    </section>
    <section>
      <h3>Baseline Controls</h3>
      <div class="control-grid">
        <button type="button" data-toggle="mfaEnabled">${asset.mfaEnabled ? "MFA Enabled" : "Enable MFA"}</button>
        <button type="button" data-toggle="encryptionEnabled">${asset.encryptionEnabled ? "Encryption Enabled" : "Enable Encryption"}</button>
        <button type="button" data-patch="true">Mark Patched</button>
        <button type="button" data-backup="true">Refresh Backup</button>
      </div>
    </section>
  `;

  elements.detailDrawer.classList.add("open");
  elements.scrim.classList.add("active");
  elements.detailDrawer.setAttribute("aria-hidden", "false");
  renderAssetList();
  renderBrief();
}

function closeDrawer() {
  elements.detailDrawer.classList.remove("open");
  elements.scrim.classList.remove("active");
  elements.detailDrawer.setAttribute("aria-hidden", "true");
}

function updateSelectedAsset(changes) {
  assets = infrastructureService.updateAsset(assets, selectedAssetId, changes);
  saveAssets();
  render();
  openDrawer(selectedAssetId);
}

function resetDemo() {
  assets = infrastructureService.cloneAssets(seedAssets);
  selectedAssetId = assets[0]?.id;
  saveAssets();
  closeDrawer();
  render();
}

document.addEventListener("click", (event) => {
  const assetCard = event.target.closest("[data-asset-id]");
  const detailButton = event.target.closest("[data-open-detail]");
  const toggleButton = event.target.closest("[data-toggle]");
  const patchButton = event.target.closest("[data-patch]");
  const backupButton = event.target.closest("[data-backup]");
  const scrollButton = event.target.closest("[data-scroll-target]");

  if (assetCard) openDrawer(assetCard.dataset.assetId);
  if (detailButton) openDrawer(detailButton.dataset.openDetail);
  if (toggleButton) updateSelectedAsset({ [toggleButton.dataset.toggle]: true });
  if (patchButton) updateSelectedAsset({ patchAgeDays: 0 });
  if (backupButton) updateSelectedAsset({ backupStatus: "Healthy" });

  if (scrollButton) {
    document.querySelectorAll(".nav-button").forEach((button) => button.classList.remove("active"));
    scrollButton.classList.add("active");
    document.querySelector(`#${scrollButton.dataset.scrollTarget}`).scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

[elements.searchInput, elements.environmentFilter, elements.riskFilter, elements.typeFilter].forEach((control) => {
  control.addEventListener("input", render);
});

elements.closeDrawer.addEventListener("click", closeDrawer);
elements.scrim.addEventListener("click", closeDrawer);
elements.resetDemo.addEventListener("click", resetDemo);

render();
