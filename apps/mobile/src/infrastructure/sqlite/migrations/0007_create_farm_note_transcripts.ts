import type { Migration } from "./migrationRunner";

export const createFarmNoteTranscripts: Migration = {
  version: 7,
  name: "create_farm_note_transcripts",
  statements: [
    `CREATE TABLE IF NOT EXISTS farm_note_transcripts (
      id TEXT PRIMARY KEY NOT NULL,
      farm_id TEXT NOT NULL,
      farm_event_id TEXT NOT NULL,
      source_attachment_id TEXT NOT NULL,
      text TEXT,
      status TEXT NOT NULL CHECK (status IN ('completed', 'failed')),
      model_name TEXT NOT NULL,
      generated_locally INTEGER NOT NULL CHECK (generated_locally = 1),
      error_summary TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      privacy TEXT NOT NULL CHECK (privacy = 'privateToFarm'),
      FOREIGN KEY (farm_id) REFERENCES farms(id),
      FOREIGN KEY (farm_event_id) REFERENCES farm_events(id) ON DELETE CASCADE,
      FOREIGN KEY (source_attachment_id) REFERENCES farm_event_attachments(id),
      UNIQUE(farm_id, farm_event_id)
    );`,
    "CREATE INDEX IF NOT EXISTS idx_farm_note_transcripts_farm ON farm_note_transcripts(farm_id);",
    "CREATE INDEX IF NOT EXISTS idx_farm_note_transcripts_event ON farm_note_transcripts(farm_event_id);",
  ],
};
