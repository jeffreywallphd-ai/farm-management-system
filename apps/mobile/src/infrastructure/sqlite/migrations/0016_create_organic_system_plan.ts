import type { Migration } from "./migrationRunner";

export const createOrganicSystemPlan: Migration = {
  version: 16,
  name: "create_organic_system_plan",
  statements: [
    `CREATE TABLE IF NOT EXISTS organic_system_plan_sections (
      id TEXT PRIMARY KEY NOT NULL,
      farm_id TEXT NOT NULL,
      section_type TEXT NOT NULL CHECK (section_type IN ('practicesProcedures', 'inputsSubstances', 'monitoring', 'recordkeeping', 'comminglingPrevention', 'additionalInformation')),
      title TEXT NOT NULL,
      narrative TEXT NOT NULL,
      readiness_status TEXT NOT NULL CHECK (readiness_status IN ('notStarted', 'needsWork', 'readyForReview', 'notApplicable')),
      evidence_attachment_ids_json TEXT NOT NULL DEFAULT '[]',
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS organic_inspection_readiness_items (
      id TEXT PRIMARY KEY NOT NULL,
      farm_id TEXT NOT NULL,
      category TEXT NOT NULL CHECK (category IN ('profile', 'land', 'inputs', 'seeds', 'soil', 'pest', 'traceability', 'records')),
      prompt TEXT NOT NULL,
      readiness_status TEXT NOT NULL CHECK (readiness_status IN ('notStarted', 'needsWork', 'readyForReview', 'notApplicable')),
      notes TEXT,
      evidence_attachment_ids_json TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );`,
    "CREATE INDEX IF NOT EXISTS idx_organic_system_plan_sections_farm ON organic_system_plan_sections(farm_id);",
    "CREATE INDEX IF NOT EXISTS idx_organic_inspection_readiness_items_farm ON organic_inspection_readiness_items(farm_id);",
  ],
};
