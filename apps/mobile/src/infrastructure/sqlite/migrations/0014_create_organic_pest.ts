import type { Migration } from "./migrationRunner";

export const createOrganicPest: Migration = {
  version: 14,
  name: "create_organic_pest",
  statements: [
    `CREATE TABLE IF NOT EXISTS pest_weed_disease_observations (
      id TEXT PRIMARY KEY NOT NULL,
      farm_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('pest', 'weed', 'disease')),
      place_id TEXT,
      crop_id TEXT,
      observed_at TEXT NOT NULL,
      severity TEXT,
      description TEXT NOT NULL,
      photo_attachment_ids_json TEXT NOT NULL DEFAULT '[]',
      linked_farm_note_id TEXT,
      created_at TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS pest_weed_disease_actions (
      id TEXT PRIMARY KEY NOT NULL,
      farm_id TEXT NOT NULL,
      observation_id TEXT NOT NULL,
      action_type TEXT NOT NULL CHECK (action_type IN ('prevention', 'sanitation', 'cultural', 'mechanical', 'physical', 'biological', 'botanical', 'allowedSynthetic', 'other')),
      action_date TEXT NOT NULL,
      description TEXT NOT NULL,
      input_application_id TEXT,
      why_needed TEXT,
      effectiveness_notes TEXT,
      evidence_attachment_ids_json TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS plastic_mulch_records (
      id TEXT PRIMARY KEY NOT NULL,
      farm_id TEXT NOT NULL,
      place_id TEXT,
      crop_id TEXT,
      installed_date TEXT,
      removed_date TEXT,
      material TEXT,
      notes TEXT,
      evidence_attachment_ids_json TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL
    );`,
    "CREATE INDEX IF NOT EXISTS idx_pest_weed_disease_observations_farm ON pest_weed_disease_observations(farm_id);",
    "CREATE INDEX IF NOT EXISTS idx_pest_weed_disease_actions_farm ON pest_weed_disease_actions(farm_id);",
    "CREATE INDEX IF NOT EXISTS idx_plastic_mulch_records_farm ON plastic_mulch_records(farm_id);",
  ],
};
