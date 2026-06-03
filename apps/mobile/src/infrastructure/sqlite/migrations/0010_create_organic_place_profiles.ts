import type { Migration } from "./migrationRunner";

export const createOrganicPlaceProfiles: Migration = {
  version: 10,
  name: "create_organic_place_profiles",
  statements: [
    `CREATE TABLE IF NOT EXISTS organic_place_profiles (
      farm_id TEXT NOT NULL,
      place_id TEXT NOT NULL,
      organic_status TEXT NOT NULL CHECK (organic_status IN ('nonOrganic', 'transitioning', 'eligibleOrganic', 'certifiedOrganic', 'buffer', 'excluded')),
      transition_start_date TEXT,
      last_prohibited_substance_date TEXT,
      organic_eligibility_date TEXT,
      certified_organic_since_date TEXT,
      boundary_description TEXT,
      buffer_description TEXT,
      adjacent_land_use TEXT,
      contamination_risks TEXT,
      certifier_approved INTEGER NOT NULL CHECK (certifier_approved IN (0, 1)),
      certifier_notes TEXT,
      evidence_attachment_ids_json TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (farm_id, place_id),
      FOREIGN KEY (farm_id) REFERENCES farms(id),
      FOREIGN KEY (place_id) REFERENCES farm_locations(id)
    );`,
    `CREATE TABLE IF NOT EXISTS organic_boundary_evidence (
      id TEXT PRIMARY KEY NOT NULL,
      farm_id TEXT NOT NULL,
      place_id TEXT NOT NULL,
      evidence_type TEXT NOT NULL CHECK (evidence_type IN ('photo', 'map', 'note', 'document')),
      description TEXT NOT NULL,
      attachment_uri TEXT,
      captured_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (farm_id) REFERENCES farms(id),
      FOREIGN KEY (place_id) REFERENCES farm_locations(id)
    );`,
    "CREATE INDEX IF NOT EXISTS idx_organic_place_profiles_farm ON organic_place_profiles(farm_id);",
    "CREATE INDEX IF NOT EXISTS idx_organic_boundary_evidence_place ON organic_boundary_evidence(farm_id, place_id);",
  ],
};
