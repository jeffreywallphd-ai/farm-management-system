import type { Migration } from "./migrationRunner";

export const addInventoryCatalogQuantityAndSource: Migration = {
  version: 38,
  name: "add_inventory_catalog_quantity_and_source",
  statements: [
    "ALTER TABLE inventory_items ADD COLUMN category TEXT;",
    "ALTER TABLE inventory_items ADD COLUMN common_item_key TEXT;",
    "ALTER TABLE inventory_items ADD COLUMN acquisition_source TEXT NOT NULL DEFAULT 'alreadyOwned' CHECK (acquisition_source IN ('purchase', 'donation', 'selfProduced', 'alreadyOwned'));",
    "ALTER TABLE inventory_items ADD COLUMN current_amount REAL;",
    "ALTER TABLE inventory_items ADD COLUMN current_unit TEXT;",
    "CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(farm_id, kind, category);",
  ],
};
