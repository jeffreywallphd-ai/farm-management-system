import type { Migration } from "./migrationRunner";

export const createHarvestRecords: Migration = {
  version: 2,
  name: "create_harvest_records",
  statements: [
    `CREATE TABLE IF NOT EXISTS harvest_records (
      id TEXT PRIMARY KEY NOT NULL,
      farm_id TEXT NOT NULL,
      crop_id TEXT NOT NULL,
      source_location_id TEXT NOT NULL,
      quantity_amount REAL NOT NULL CHECK (quantity_amount > 0),
      quantity_unit TEXT NOT NULL CHECK (quantity_unit IN ('lb', 'oz', 'kg', 'g', 'each', 'bunch', 'crate')),
      effective_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      note TEXT,
      privacy TEXT NOT NULL CHECK (privacy = 'privateToFarm'),
      FOREIGN KEY (farm_id) REFERENCES farms(id),
      FOREIGN KEY (crop_id) REFERENCES tracked_items(id),
      FOREIGN KEY (source_location_id) REFERENCES farm_locations(id)
    );`,
    "CREATE INDEX IF NOT EXISTS idx_harvest_records_farm_effective ON harvest_records(farm_id, effective_at DESC, created_at DESC);",
    "CREATE INDEX IF NOT EXISTS idx_harvest_records_crop ON harvest_records(crop_id);",
    "CREATE INDEX IF NOT EXISTS idx_harvest_records_location ON harvest_records(source_location_id);",
  ],
};
