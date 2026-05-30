import type { FarmId } from "../farm/Farm";
import type { FarmLocationId } from "../farm/FarmLocation";
import type { PrivacyClassification } from "../privacy/PrivacyClassification";

export type FarmEventId = string;
export type FarmEventAttachmentId = string;

export const FARM_EVENT_TYPES = [
  "general",
  "harvest",
  "materialUse",
  "inventoryCount",
  "fieldObservation",
  "equipment",
  "weather",
  "other",
] as const;

export type FarmEventType = (typeof FARM_EVENT_TYPES)[number];

export const FARM_EVENT_TYPE_LABELS: Record<FarmEventType, string> = {
  general: "Farm note",
  harvest: "Harvest",
  materialUse: "Material use",
  inventoryCount: "Inventory count",
  fieldObservation: "Field observation",
  equipment: "Equipment",
  weather: "Weather",
  other: "Other",
};

export const FARM_EVENT_ATTACHMENT_KINDS = ["voiceMemo", "photo"] as const;

export type FarmEventAttachmentKind = (typeof FARM_EVENT_ATTACHMENT_KINDS)[number];

export interface FarmEventAttachment {
  id: FarmEventAttachmentId;
  farmId: FarmId;
  eventId: FarmEventId;
  kind: FarmEventAttachmentKind;
  localUri: string;
  mimeType?: string;
  durationMs?: number;
  width?: number;
  height?: number;
  fileSizeBytes?: number;
  createdAt: string;
}

export interface FarmEvent {
  id: FarmEventId;
  kind: "FarmEvent";
  farmId: FarmId;
  eventType: FarmEventType;
  placeId?: FarmLocationId;
  note?: string;
  capturedAt: string;
  createdAt: string;
  privacy: PrivacyClassification;
  schemaVersion: 1;
}

