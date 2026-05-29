import type { PrivacyClassification } from "../privacy/PrivacyClassification";
import type { FarmId } from "../farm/Farm";

export type OperationalRecordId = string;

export type IsoDateTimeString = string;

export type OperationalRecordKind =
  | "HarvestRecorded"
  | "MaterialUseRecorded"
  | "InventoryCountRecorded";

export interface OperationalRecordBase {
  id: OperationalRecordId;
  kind: OperationalRecordKind;
  farmId: FarmId;
  createdAt: IsoDateTimeString;
  effectiveAt: IsoDateTimeString;
  privacy: PrivacyClassification;
  note?: string;
}
