import type { Migration } from "./migrationRunner";

const unitCheck = "('lb', 'oz', 'kg', 'g', 'each', 'bunch', 'crate', 'bag', 'gal', 'L', 'flat', 'tray')";

export const createMaterialUseAndInventoryCountRecords: Migration = {
  version: 3,
  name: "create_material_use_and_inventory_count_records",
  statements: [
    `CREATE TABLE IF NOT EXISTS material_use_records (
      id TEXT PRIMARY KEY NOT NULL,
      farm_id TEXT NOT NULL,
      material_id TEXT NOT NULL,
      use_location_id TEXT,
      quantity_amount REAL NOT NULL CHECK (quantity_amount > 0),
      quantity_unit TEXT NOT NULL CHECK (quantity_unit IN ${unitCheck}),
      effective_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      note TEXT,
      privacy TEXT NOT NULL CHECK (privacy = 'privateToFarm'),
      FOREIGN KEY (farm_id) REFERENCES farms(id),
      FOREIGN KEY (material_id) REFERENCES tracked_items(id),
      FOREIGN KEY (use_location_id) REFERENCES farm_locations(id)
    );`,
    `CREATE TABLE IF NOT EXISTS inventory_count_records (
      id TEXT PRIMARY KEY NOT NULL,
      farm_id TEXT NOT NULL,
      tracked_item_id TEXT NOT NULL,
      location_id TEXT,
      observed_quantity_amount REAL NOT NULL CHECK (observed_quantity_amount >= 0),
      observed_quantity_unit TEXT NOT NULL CHECK (observed_quantity_unit IN ${unitCheck}),
      effective_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      note TEXT,
      privacy TEXT NOT NULL CHECK (privacy = 'privateToFarm'),
      FOREIGN KEY (farm_id) REFERENCES farms(id),
      FOREIGN KEY (tracked_item_id) REFERENCES tracked_items(id),
      FOREIGN KEY (location_id) REFERENCES farm_locations(id)
    );`,
    "CREATE INDEX IF NOT EXISTS idx_material_use_records_farm_effective ON material_use_records(farm_id, effective_at DESC, created_at DESC);",
    "CREATE INDEX IF NOT EXISTS idx_material_use_records_material ON material_use_records(material_id);",
    "CREATE INDEX IF NOT EXISTS idx_inventory_count_records_farm_effective ON inventory_count_records(farm_id, effective_at DESC, created_at DESC);",
    "CREATE INDEX IF NOT EXISTS idx_inventory_count_records_item ON inventory_count_records(tracked_item_id);",
  ],
};
