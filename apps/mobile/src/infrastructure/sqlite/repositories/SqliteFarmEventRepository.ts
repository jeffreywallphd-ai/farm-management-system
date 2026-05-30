import type { SQLiteDatabase } from "expo-sqlite";

import type {
  FarmEvent,
  FarmEventAttachment,
  FarmEventAttachmentKind,
  FarmEventId,
  FarmEventType,
} from "../../../domain/events/FarmEvent";
import type { FarmId } from "../../../domain/farm/Farm";
import type { FarmLocation } from "../../../domain/farm/FarmLocation";
import type { FarmEventRepository, FarmEventView } from "../../../application/ports/FarmEventRepository";

interface FarmEventRow {
  id: string;
  farm_id: string;
  event_type: FarmEventType;
  place_id: string | null;
  note: string | null;
  captured_at: string;
  created_at: string;
  privacy: "privateToFarm";
  schema_version: 1;
  place_name?: string | null;
  place_kind?: FarmLocation["kind"] | null;
  place_parent_id?: string | null;
  place_created_at?: string | null;
}

interface FarmEventAttachmentRow {
  id: string;
  farm_id: string;
  event_id: string;
  kind: FarmEventAttachmentKind;
  local_uri: string;
  mime_type: string | null;
  duration_ms: number | null;
  width: number | null;
  height: number | null;
  file_size_bytes: number | null;
  created_at: string;
}

export class SqliteFarmEventRepository implements FarmEventRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  async saveFarmEvent(event: FarmEvent, attachments: FarmEventAttachment[]): Promise<void> {
    if (event.placeId) {
      const place = await this.database.getFirstAsync<{ id: string }>(
        "SELECT id FROM farm_locations WHERE id = ? AND farm_id = ? LIMIT 1;",
        [event.placeId, event.farmId],
      );
      if (!place) {
        throw new Error("Farm note place must already exist on this device.");
      }
    }

    await this.database.runAsync(
      `INSERT INTO farm_events (
        id, farm_id, event_type, place_id, note, captured_at, created_at, privacy, schema_version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        event.id,
        event.farmId,
        event.eventType,
        event.placeId ?? null,
        event.note ?? null,
        event.capturedAt,
        event.createdAt,
        event.privacy,
        event.schemaVersion,
      ],
    );

    for (const attachment of attachments) {
      await this.database.runAsync(
        `INSERT INTO farm_event_attachments (
          id, farm_id, event_id, kind, local_uri, mime_type, duration_ms, width, height, file_size_bytes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          attachment.id,
          attachment.farmId,
          attachment.eventId,
          attachment.kind,
          attachment.localUri,
          attachment.mimeType ?? null,
          attachment.durationMs ?? null,
          attachment.width ?? null,
          attachment.height ?? null,
          attachment.fileSizeBytes ?? null,
          attachment.createdAt,
        ],
      );
    }
  }

  async listFarmEvents(farmId: FarmId): Promise<FarmEventView[]> {
    const rows = await this.database.getAllAsync<FarmEventRow>(
      `${FARM_EVENT_VIEW_SELECT}
       WHERE farm_events.farm_id = ?
       ORDER BY farm_events.captured_at DESC, farm_events.created_at DESC;`,
      [farmId],
    );

    return this.mapViews(rows);
  }

  async getFarmEventDetail(farmId: FarmId, id: FarmEventId): Promise<FarmEventView | null> {
    const row = await this.database.getFirstAsync<FarmEventRow>(
      `${FARM_EVENT_VIEW_SELECT}
       WHERE farm_events.farm_id = ? AND farm_events.id = ?
       LIMIT 1;`,
      [farmId, id],
    );

    if (!row) {
      return null;
    }

    const [view] = await this.mapViews([row]);
    return view ?? null;
  }

  private async mapViews(rows: FarmEventRow[]): Promise<FarmEventView[]> {
    const attachmentsByEvent = await this.loadAttachments(rows.map((row) => row.id));
    return rows.map((row) => ({
      event: mapFarmEvent(row),
      place: row.place_id ? mapPlace(row) : undefined,
      attachments: attachmentsByEvent.get(row.id) ?? [],
    }));
  }

  private async loadAttachments(eventIds: string[]): Promise<Map<string, FarmEventAttachment[]>> {
    const attachmentsByEvent = new Map<string, FarmEventAttachment[]>();

    for (const eventId of eventIds) {
      const rows = await this.database.getAllAsync<FarmEventAttachmentRow>(
        `SELECT id, farm_id, event_id, kind, local_uri, mime_type, duration_ms, width, height, file_size_bytes, created_at
         FROM farm_event_attachments
         WHERE event_id = ?
         ORDER BY created_at ASC, id ASC;`,
        [eventId],
      );
      attachmentsByEvent.set(eventId, rows.map(mapAttachment));
    }

    return attachmentsByEvent;
  }
}

const FARM_EVENT_VIEW_SELECT = `SELECT
  farm_events.id,
  farm_events.farm_id,
  farm_events.event_type,
  farm_events.place_id,
  farm_events.note,
  farm_events.captured_at,
  farm_events.created_at,
  farm_events.privacy,
  farm_events.schema_version,
  places.name AS place_name,
  places.kind AS place_kind,
  places.parent_id AS place_parent_id,
  places.created_at AS place_created_at
FROM farm_events
LEFT JOIN farm_locations places ON places.id = farm_events.place_id`;

function mapFarmEvent(row: FarmEventRow): FarmEvent {
  return {
    id: row.id,
    kind: "FarmEvent",
    farmId: row.farm_id,
    eventType: row.event_type,
    placeId: row.place_id ?? undefined,
    note: row.note ?? undefined,
    capturedAt: row.captured_at,
    createdAt: row.created_at,
    privacy: row.privacy,
    schemaVersion: row.schema_version,
  };
}

function mapPlace(row: FarmEventRow): FarmLocation {
  return {
    id: row.place_id ?? "",
    farmId: row.farm_id,
    name: row.place_name ?? "Farm place",
    kind: row.place_kind ?? "other",
    parentId: row.place_parent_id ?? undefined,
    createdAt: row.place_created_at ?? row.created_at,
  };
}

function mapAttachment(row: FarmEventAttachmentRow): FarmEventAttachment {
  return {
    id: row.id,
    farmId: row.farm_id,
    eventId: row.event_id,
    kind: row.kind,
    localUri: row.local_uri,
    mimeType: row.mime_type ?? undefined,
    durationMs: row.duration_ms ?? undefined,
    width: row.width ?? undefined,
    height: row.height ?? undefined,
    fileSizeBytes: row.file_size_bytes ?? undefined,
    createdAt: row.created_at,
  };
}

