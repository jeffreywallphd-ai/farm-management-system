import type { Migration } from "./migrationRunner";

export const createOrganicReportPackages: Migration = {
  version: 17,
  name: "create_organic_report_packages",
  statements: [
    `CREATE TABLE IF NOT EXISTS organic_report_packages (
      id TEXT PRIMARY KEY NOT NULL,
      farm_id TEXT NOT NULL,
      package_type TEXT NOT NULL CHECK (package_type IN ('inspectionPrep', 'annualUpdate', 'renewalConversation', 'recordsArchive')),
      title TEXT NOT NULL,
      generated_at TEXT NOT NULL,
      report_names_json TEXT NOT NULL DEFAULT '[]',
      manifest_json TEXT NOT NULL,
      package_text TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL
    );`,
    "CREATE INDEX IF NOT EXISTS idx_organic_report_packages_farm ON organic_report_packages(farm_id);",
  ],
};
