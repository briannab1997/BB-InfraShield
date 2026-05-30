const seedAssets = [
  {
    id: "INF-2101",
    name: "identity-core-01",
    type: "Identity Server",
    environment: "Production",
    owner: "Infrastructure",
    risk: "Critical",
    patchAgeDays: 41,
    mfaEnabled: false,
    firewallExposure: "Internet-Facing",
    encryptionEnabled: true,
    backupStatus: "Stale",
    endpointProtection: "Disabled",
    lastScan: "2026-05-29 07:45",
    tags: ["identity", "privileged-access", "windows"],
    findings: [
      "Privileged admin portal does not enforce MFA.",
      "Operating system patch baseline is 41 days behind.",
      "Endpoint protection policy is not reporting healthy telemetry."
    ],
    remediation: [
      "Enable MFA enforcement for all privileged access.",
      "Schedule emergency patch window.",
      "Restore endpoint protection telemetry and confirm service account group membership."
    ]
  },
  {
    id: "INF-2114",
    name: "vpn-edge-02",
    type: "Network Appliance",
    environment: "Production",
    owner: "Network Operations",
    risk: "High",
    patchAgeDays: 28,
    mfaEnabled: true,
    firewallExposure: "Internet-Facing",
    encryptionEnabled: true,
    backupStatus: "Stale",
    endpointProtection: "Not Applicable",
    lastScan: "2026-05-29 08:10",
    tags: ["vpn", "remote-access", "network"],
    findings: [
      "Internet-facing appliance is near patch threshold.",
      "Configuration backup is older than policy allows.",
      "Admin login attempts increased over baseline."
    ],
    remediation: [
      "Update firmware during approved maintenance window.",
      "Refresh appliance configuration backup.",
      "Review remote access logs for unusual login patterns."
    ]
  },
  {
    id: "INF-2126",
    name: "ehr-db-replica",
    type: "Database",
    environment: "Production",
    owner: "Data Services",
    risk: "High",
    patchAgeDays: 17,
    mfaEnabled: true,
    firewallExposure: "Internal",
    encryptionEnabled: false,
    backupStatus: "Healthy",
    endpointProtection: "Enabled",
    lastScan: "2026-05-29 08:35",
    tags: ["database", "healthcare-data", "sql"],
    findings: [
      "Database encryption setting does not meet baseline.",
      "Privileged data access policy needs owner attestation.",
      "Patch status is acceptable but should be monitored."
    ],
    remediation: [
      "Enable encryption at rest.",
      "Document business owner approval for privileged access.",
      "Retest database connectivity after encryption change."
    ]
  },
  {
    id: "INF-2133",
    name: "claims-api-03",
    type: "Application Server",
    environment: "Staging",
    owner: "Platform Engineering",
    risk: "Medium",
    patchAgeDays: 22,
    mfaEnabled: true,
    firewallExposure: "Internal",
    encryptionEnabled: true,
    backupStatus: "Healthy",
    endpointProtection: "Enabled",
    lastScan: "2026-05-29 09:05",
    tags: ["api", "claims", "linux"],
    findings: [
      "Patch window due within the next sprint.",
      "Unused test service is still enabled.",
      "Baseline drift detected in logging configuration."
    ],
    remediation: [
      "Schedule regular patch cycle.",
      "Disable unused test service.",
      "Restore approved logging configuration."
    ]
  },
  {
    id: "INF-2148",
    name: "training-lab-07",
    type: "Workstation",
    environment: "Training",
    owner: "Cyber Training",
    risk: "Medium",
    patchAgeDays: 9,
    mfaEnabled: false,
    firewallExposure: "Restricted",
    encryptionEnabled: true,
    backupStatus: "Not Required",
    endpointProtection: "Enabled",
    lastScan: "2026-05-29 09:22",
    tags: ["training", "lab", "endpoint"],
    findings: [
      "Local training account does not require MFA.",
      "Endpoint protection is healthy.",
      "No external exposure detected."
    ],
    remediation: [
      "Enable MFA for lab administrator account.",
      "Confirm training exceptions are documented.",
      "Keep endpoint policy aligned with baseline."
    ]
  },
  {
    id: "INF-2160",
    name: "reporting-worker-02",
    type: "Batch Worker",
    environment: "Development",
    owner: "Analytics",
    risk: "Low",
    patchAgeDays: 6,
    mfaEnabled: true,
    firewallExposure: "Internal",
    encryptionEnabled: true,
    backupStatus: "Healthy",
    endpointProtection: "Enabled",
    lastScan: "2026-05-29 09:40",
    tags: ["analytics", "worker", "linux"],
    findings: [
      "All baseline controls are currently passing.",
      "Patch age is within policy.",
      "No exposed services detected."
    ],
    remediation: [
      "Continue normal monitoring.",
      "Review again during next scheduled scan."
    ]
  }
];

if (typeof module !== "undefined") {
  module.exports = { seedAssets };
}
