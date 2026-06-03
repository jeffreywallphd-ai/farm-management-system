import type { Migration } from "./migrationRunner";

export const createOrganicCertificationProfile: Migration = {
  version: 9,
  name: "create_organic_certification_profile",
  statements: [
    `CREATE TABLE IF NOT EXISTS organic_operation_profiles (
      id TEXT PRIMARY KEY NOT NULL,
      farm_id TEXT NOT NULL UNIQUE,
      organic_status TEXT NOT NULL CHECK (organic_status IN ('notOrganic', 'transitioning', 'exempt', 'certified', 'splitOperation')),
      certifier_name TEXT,
      certifier_contact TEXT,
      certificate_number TEXT,
      certificate_effective_date TEXT,
      annual_update_due_date TEXT,
      inspection_due_window TEXT,
      record_retention_years INTEGER NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (farm_id) REFERENCES farms(id)
    );`,
    `CREATE TABLE IF NOT EXISTS organic_certification_scopes (
      profile_id TEXT NOT NULL,
      farm_id TEXT NOT NULL,
      scope_type TEXT NOT NULL CHECK (scope_type IN ('crops', 'livestock', 'wildCrops', 'handling', 'mushrooms', 'producerGroup', 'imports', 'packagedProductLabeling')),
      enabled INTEGER NOT NULL CHECK (enabled IN (0, 1)),
      status TEXT NOT NULL CHECK (status IN ('active', 'planned', 'notApplicable')),
      certifier_notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (farm_id, scope_type),
      FOREIGN KEY (profile_id) REFERENCES organic_operation_profiles(id),
      FOREIGN KEY (farm_id) REFERENCES farms(id)
    );`,
    "CREATE INDEX IF NOT EXISTS idx_organic_scopes_profile_id ON organic_certification_scopes(profile_id);",
  ],
};
