import type { HarvestRecorded } from "../../domain/records/HarvestRecorded";
import type { InventoryCountRecorded } from "../../domain/records/InventoryCountRecorded";
import type { MaterialUseRecorded } from "../../domain/records/MaterialUseRecorded";
import type { OperationalRecordId } from "../../domain/records/OperationalRecord";

export type MobilePilotOperationalRecord =
  | HarvestRecorded
  | MaterialUseRecorded
  | InventoryCountRecorded;

export interface LocalRecordRepository {
  save(record: MobilePilotOperationalRecord): Promise<void>;
  getById(id: OperationalRecordId): Promise<MobilePilotOperationalRecord | null>;
  listRecent(): Promise<MobilePilotOperationalRecord[]>;
}
