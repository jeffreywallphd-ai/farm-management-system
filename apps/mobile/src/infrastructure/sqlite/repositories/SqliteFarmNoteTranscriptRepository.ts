import type { SQLiteDatabase } from "expo-sqlite";

import type { FarmNoteTranscript } from "../../../domain/events/FarmNoteTranscript";
import type { FarmEventId } from "../../../domain/events/FarmEvent";
import type { FarmId } from "../../../domain/farm/Farm";
import type { FarmNoteTranscriptRepository } from "../../../application/ports/FarmNoteTranscriptRepository";

interface TranscriptRow {
  id: string;
  farm_id: string;
  farm_event_id: string;
  source_attachment_id: string;
  text: string | null;
  status: FarmNoteTranscript["status"];
  model_name: string;
  generated_locally: number;
  error_summary: string | null;
  created_at: string;
  updated_at: string;
  privacy: "privateToFarm";
}

export class SqliteFarmNoteTranscriptRepository implements FarmNoteTranscriptRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  async saveTranscript(transcript: FarmNoteTranscript): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO farm_note_transcripts (
        id, farm_id, farm_event_id, source_attachment_id, text, status, model_name,
        generated_locally, error_summary, created_at, updated_at, privacy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(farm_id, farm_event_id) DO UPDATE SET
        source_attachment_id = excluded.source_attachment_id,
        text = excluded.text,
        status = excluded.status,
        model_name = excluded.model_name,
        generated_locally = excluded.generated_locally,
        error_summary = excluded.error_summary,
        updated_at = excluded.updated_at,
        privacy = excluded.privacy;`,
      [
        transcript.id,
        transcript.farmId,
        transcript.farmEventId,
        transcript.sourceAttachmentId,
        transcript.text ?? null,
        transcript.status,
        transcript.modelName,
        transcript.generatedLocally ? 1 : 0,
        transcript.errorSummary ?? null,
        transcript.createdAt,
        transcript.updatedAt,
        transcript.privacy,
      ],
    );
  }

  async getTranscript(farmId: FarmId, farmEventId: FarmEventId): Promise<FarmNoteTranscript | null> {
    const row = await this.database.getFirstAsync<TranscriptRow>(
      `SELECT id, farm_id, farm_event_id, source_attachment_id, text, status, model_name,
        generated_locally, error_summary, created_at, updated_at, privacy
       FROM farm_note_transcripts
       WHERE farm_id = ? AND farm_event_id = ?
       LIMIT 1;`,
      [farmId, farmEventId],
    );

    return row ? mapTranscript(row) : null;
  }

  async listTranscriptsForExport(farmId: FarmId): Promise<FarmNoteTranscript[]> {
    const rows = await this.database.getAllAsync<TranscriptRow>(
      `SELECT id, farm_id, farm_event_id, source_attachment_id, text, status, model_name,
        generated_locally, error_summary, created_at, updated_at, privacy
       FROM farm_note_transcripts
       WHERE farm_id = ?
       ORDER BY updated_at DESC;`,
      [farmId],
    );

    return rows.map(mapTranscript);
  }
}

function mapTranscript(row: TranscriptRow): FarmNoteTranscript {
  return {
    id: row.id,
    farmId: row.farm_id,
    farmEventId: row.farm_event_id,
    sourceAttachmentId: row.source_attachment_id,
    text: row.text ?? undefined,
    status: row.status,
    modelName: row.model_name,
    generatedLocally: true,
    errorSummary: row.error_summary ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    privacy: row.privacy,
  };
}
