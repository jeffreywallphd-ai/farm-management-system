import type { Migration } from "./migrationRunner";

export const createReferenceTables: Migration = {
  version: 1,
  name: "create_reference_tables",
  statements: [
    `CREATE TABLE IF NOT EXISTS farms (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS farm_locations (
      id TEXT PRIMARY KEY NOT NULL,
      farm_id TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (farm_id) REFERENCES farms(id)
    );`,
    `CREATE TABLE IF NOT EXISTS tracked_items (
      id TEXT PRIMARY KEY NOT NULL,
      farm_id TEXT NOT NULL,
      kind TEXT NOT NULL CHECK (kind IN ('crop', 'material', 'countableItem')),
      name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      default_unit TEXT,
      FOREIGN KEY (farm_id) REFERENCES farms(id)
    );`,
    "CREATE INDEX IF NOT EXISTS idx_farm_locations_farm_id ON farm_locations(farm_id);",
    "CREATE INDEX IF NOT EXISTS idx_tracked_items_farm_kind ON tracked_items(farm_id, kind);",
  ],
};
