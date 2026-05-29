import type { PrivacyClassification } from "../privacy/PrivacyClassification";

export type OperationalRecordId = string;

export type IsoDateTimeString = string;

export type OperationalRecordKind =
  | "HarvestRecorded"
  | "MaterialUseRecorded"
  | "InventoryCountRecorded";

export interface OperationalRecordBase {
  id: OperationalRecordId;
  kind: OperationalRecordKind;
  recordedAt: IsoDateTimeString;
  effectiveAt: IsoDateTimeString;
  privacy: PrivacyClassification;
  note?: string;
}
