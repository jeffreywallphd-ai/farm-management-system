import type { Migration } from "./migrationRunner";

export const removeCountableItems: Migration = {
  version: 22,
  name: "remove_countable_items",
  statements: [
    "DELETE FROM inventory_count_records WHERE tracked_item_id IN (SELECT id FROM tracked_items WHERE kind = 'countableItem');",
    "DELETE FROM tracked_items WHERE kind = 'countableItem';",
  ],
};
