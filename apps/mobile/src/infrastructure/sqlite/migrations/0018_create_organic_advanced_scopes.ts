import type { Migration } from "./migrationRunner";

export const createOrganicAdvancedScopes: Migration = {
  version: 18,
  name: "create_organic_advanced_scopes",
  statements: [
    `CREATE TABLE IF NOT EXISTS organic_advanced_scope_records (
      id TEXT PRIMARY KEY NOT NULL,
      farm_id TEXT NOT NULL,
      scope_type TEXT NOT NULL CHECK (scope_type IN ('livestock', 'wildCrops', 'mushrooms', 'producerGroup', 'imports', 'labeling')),
      topic TEXT NOT NULL,
      description TEXT NOT NULL,
      readiness_status TEXT NOT NULL CHECK (readiness_status IN ('notStarted', 'needsWork', 'readyForReview', 'notApplicable')),
      evidence_attachment_ids_json TEXT NOT NULL DEFAULT '[]',
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );`,
    "CREATE INDEX IF NOT EXISTS idx_organic_advanced_scope_records_farm ON organic_advanced_scope_records(farm_id);",
  ],
};
