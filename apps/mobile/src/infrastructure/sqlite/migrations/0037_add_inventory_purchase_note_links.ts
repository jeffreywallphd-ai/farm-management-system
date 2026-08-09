import type { Migration } from "./migrationRunner";

export const addInventoryPurchaseNoteLinks: Migration = {
  version: 37,
  name: "add_inventory_purchase_note_links",
  statements: [
    "ALTER TABLE inventory_items ADD COLUMN purchase_note_farm_event_id TEXT REFERENCES farm_events(id);",
    "CREATE INDEX IF NOT EXISTS idx_inventory_items_purchase_note ON inventory_items(purchase_note_farm_event_id);",
  ],
};
