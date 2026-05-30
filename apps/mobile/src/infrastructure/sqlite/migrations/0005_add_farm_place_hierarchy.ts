import type { Migration } from "./migrationRunner";

export const addFarmPlaceHierarchy: Migration = {
  version: 5,
  name: "add_farm_place_hierarchy",
  statements: [
    "ALTER TABLE farm_locations ADD COLUMN kind TEXT NOT NULL DEFAULT 'other' CHECK (kind IN ('field', 'bed', 'row', 'greenhouse', 'highTunnel', 'greenhouseBed', 'bench', 'storageArea', 'washPack', 'cooler', 'freezer', 'barnShed', 'other'));",
    "ALTER TABLE farm_locations ADD COLUMN parent_id TEXT;",
    "CREATE INDEX IF NOT EXISTS idx_farm_locations_parent_id ON farm_locations(parent_id);",
  ],
};
