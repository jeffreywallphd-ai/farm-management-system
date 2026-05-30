import type { Migration } from "./migrationRunner";

const eventTypeCheck =
  "('general', 'harvest', 'materialUse', 'inventoryCount', 'fieldObservation', 'equipment', 'weather', 'other')";

const attachmentKindCheck = "('voiceMemo', 'photo')";

export const createFarmEvents: Migration = {
  version: 6,
  name: "create_farm_events",
  statements: [
    `CREATE TABLE IF NOT EXISTS farm_events (
      id TEXT PRIMARY KEY NOT NULL,
      farm_id TEXT NOT NULL,
      event_type TEXT NOT NULL CHECK (event_type IN ${eventTypeCheck}),
      place_id TEXT,
      note TEXT,
      captured_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      privacy TEXT NOT NULL CHECK (privacy = 'privateToFarm'),
      schema_version INTEGER NOT NULL CHECK (schema_version = 1),
      FOREIGN KEY (farm_id) REFERENCES farms(id),
      FOREIGN KEY (place_id) REFERENCES farm_locations(id)
    );`,
    `CREATE TABLE IF NOT EXISTS farm_event_attachments (
      id TEXT PRIMARY KEY NOT NULL,
      farm_id TEXT NOT NULL,
      event_id TEXT NOT NULL,
      kind TEXT NOT NULL CHECK (kind IN ${attachmentKindCheck}),
      local_uri TEXT NOT NULL,
      mime_type TEXT,
      duration_ms INTEGER CHECK (duration_ms IS NULL OR duration_ms >= 0),
      width INTEGER CHECK (width IS NULL OR width > 0),
      height INTEGER CHECK (height IS NULL OR height > 0),
      file_size_bytes INTEGER CHECK (file_size_bytes IS NULL OR file_size_bytes >= 0),
      created_at TEXT NOT NULL,
      FOREIGN KEY (farm_id) REFERENCES farms(id),
      FOREIGN KEY (event_id) REFERENCES farm_events(id) ON DELETE CASCADE
    );`,
    "CREATE INDEX IF NOT EXISTS idx_farm_events_farm_captured ON farm_events(farm_id, captured_at DESC, created_at DESC);",
    "CREATE INDEX IF NOT EXISTS idx_farm_events_place ON farm_events(place_id);",
    "CREATE INDEX IF NOT EXISTS idx_farm_event_attachments_event ON farm_event_attachments(event_id);",
    "CREATE INDEX IF NOT EXISTS idx_farm_event_attachments_farm ON farm_event_attachments(farm_id);",
  ],
};

