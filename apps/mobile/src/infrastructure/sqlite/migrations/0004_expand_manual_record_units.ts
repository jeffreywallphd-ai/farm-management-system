import type { Migration } from "./migrationRunner";

const unitCheck = "('lb', 'oz', 'kg', 'g', 'each', 'bunch', 'crate', 'bag', 'gal', 'L', 'flat', 'tray')";

export const expandManualRecordUnits: Migration = {
  version: 4,
  name: "expand_manual_record_units",
  statements: [
    "PRAGMA foreign_keys = OFF;",
    `CREATE TABLE IF NOT EXISTS harvest_records_next (
      id TEXT PRIMARY KEY NOT NULL,
      farm_id TEXT NOT NULL,
      crop_id TEXT NOT NULL,
      source_location_id TEXT NOT NULL,
      quantity_amount REAL NOT NULL CHECK (quantity_amount > 0),
      quantity_unit TEXT NOT NULL CHECK (quantity_unit IN ${unitCheck}),
      effective_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      note TEXT,
      privacy TEXT NOT NULL CHECK (privacy = 'privateToFarm'),
      FOREIGN KEY (farm_id) REFERENCES farms(id),
      FOREIGN KEY (crop_id) REFERENCES tracked_items(id),
      FOREIGN KEY (source_location_id) REFERENCES farm_locations(id)
    );`,
    `INSERT INTO harvest_records_next (
      id, farm_id, crop_id, source_location_id, quantity_amount, quantity_unit,
      effective_at, created_at, note, privacy
    )
    SELECT id, farm_id, crop_id, source_location_id, quantity_amount, quantity_unit,
      effective_at, created_at, note, privacy
    FROM harvest_records;`,
    "DROP TABLE harvest_records;",
    "ALTER TABLE harvest_records_next RENAME TO harvest_records;",
    "CREATE INDEX IF NOT EXISTS idx_harvest_records_farm_effective ON harvest_records(farm_id, effective_at DESC, created_at DESC);",
    "CREATE INDEX IF NOT EXISTS idx_harvest_records_crop ON harvest_records(crop_id);",
    "CREATE INDEX IF NOT EXISTS idx_harvest_records_location ON harvest_records(source_location_id);",
    `CREATE TABLE IF NOT EXISTS material_use_records_next (
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
    `INSERT INTO material_use_records_next (
      id, farm_id, material_id, use_location_id, quantity_amount, quantity_unit,
      effective_at, created_at, note, privacy
    )
    SELECT id, farm_id, material_id, use_location_id, quantity_amount, quantity_unit,
      effective_at, created_at, note, privacy
    FROM material_use_records;`,
    "DROP TABLE material_use_records;",
    "ALTER TABLE material_use_records_next RENAME TO material_use_records;",
    "CREATE INDEX IF NOT EXISTS idx_material_use_records_farm_effective ON material_use_records(farm_id, effective_at DESC, created_at DESC);",
    "CREATE INDEX IF NOT EXISTS idx_material_use_records_material ON material_use_records(material_id);",
    `CREATE TABLE IF NOT EXISTS inventory_count_records_next (
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
    `INSERT INTO inventory_count_records_next (
      id, farm_id, tracked_item_id, location_id, observed_quantity_amount,
      observed_quantity_unit, effective_at, created_at, note, privacy
    )
    SELECT id, farm_id, tracked_item_id, location_id, observed_quantity_amount,
      observed_quantity_unit, effective_at, created_at, note, privacy
    FROM inventory_count_records;`,
    "DROP TABLE inventory_count_records;",
    "ALTER TABLE inventory_count_records_next RENAME TO inventory_count_records;",
    "CREATE INDEX IF NOT EXISTS idx_inventory_count_records_farm_effective ON inventory_count_records(farm_id, effective_at DESC, created_at DESC);",
    "CREATE INDEX IF NOT EXISTS idx_inventory_count_records_item ON inventory_count_records(tracked_item_id);",
    "PRAGMA foreign_keys = ON;",
  ],
};
