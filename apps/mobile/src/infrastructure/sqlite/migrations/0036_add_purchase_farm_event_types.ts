import type { Migration } from "./migrationRunner";

const eventTypeCheck =
  "('general', 'harvest', 'materialUse', 'materialPurchase', 'equipmentPurchase', 'inventoryCount', 'fieldObservation', 'equipment', 'weather', 'other')";

export const addPurchaseFarmEventTypes: Migration = {
  version: 36,
  name: "add_purchase_farm_event_types",
  statements: [
    "PRAGMA foreign_keys = OFF;",
    "DROP TABLE IF EXISTS farm_events_event_type_rebuilt;",
    `CREATE TABLE farm_events_event_type_rebuilt (
      id TEXT PRIMARY KEY NOT NULL,
      farm_id TEXT NOT NULL,
      event_type TEXT NOT NULL CHECK (event_type IN ${eventTypeCheck}),
      place_id TEXT,
      note TEXT,
      needs_organic_review INTEGER NOT NULL DEFAULT 0 CHECK (needs_organic_review IN (0, 1)),
      captured_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      privacy TEXT NOT NULL CHECK (privacy = 'privateToFarm'),
      schema_version INTEGER NOT NULL CHECK (schema_version = 1),
      FOREIGN KEY (farm_id) REFERENCES farms(id),
      FOREIGN KEY (place_id) REFERENCES farm_locations(id)
    );`,
    `INSERT INTO farm_events_event_type_rebuilt (
      id, farm_id, event_type, place_id, note, needs_organic_review, captured_at, created_at, privacy, schema_version
    )
    SELECT
      id, farm_id, event_type, place_id, note, COALESCE(needs_organic_review, 0), captured_at, created_at, privacy, schema_version
    FROM farm_events;`,
    "DROP TABLE farm_events;",
    "ALTER TABLE farm_events_event_type_rebuilt RENAME TO farm_events;",
    "CREATE INDEX IF NOT EXISTS idx_farm_events_farm_captured ON farm_events(farm_id, captured_at DESC, created_at DESC);",
    "CREATE INDEX IF NOT EXISTS idx_farm_events_place ON farm_events(place_id);",
    "PRAGMA foreign_keys = ON;",
  ],
};
