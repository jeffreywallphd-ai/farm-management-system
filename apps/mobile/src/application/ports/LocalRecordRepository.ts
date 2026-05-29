import type { HarvestRecorded } from "../../domain/records/HarvestRecorded";
import type { FarmLocation } from "../../domain/farm/FarmLocation";
import type { FarmId } from "../../domain/farm/Farm";
import type { TrackedItem } from "../../domain/farm/TrackedItem";
import type { InventoryCountRecorded } from "../../domain/records/InventoryCountRecorded";
import type { MaterialUseRecorded } from "../../domain/records/MaterialUseRecorded";
import type { OperationalRecordId, OperationalRecordKind } from "../../domain/records/OperationalRecord";

export interface HarvestRecordView {
  record: HarvestRecorded;
  crop: TrackedItem;
  sourceLocation: FarmLocation;
}

export interface MaterialUseRecordView {
  record: MaterialUseRecorded;
  material: TrackedItem;
  useLocation?: FarmLocation;
}

export interface InventoryCountRecordView {
  record: InventoryCountRecorded;
  trackedItem: TrackedItem;
  location?: FarmLocation;
}

export type LocalActivityRecordView =
  | HarvestRecordView
  | MaterialUseRecordView
  | InventoryCountRecordView;

export interface LocalRecordRepository {
  saveHarvest(record: HarvestRecorded): Promise<void>;
  saveMaterialUse(record: MaterialUseRecorded): Promise<void>;
  saveInventoryCount(record: InventoryCountRecorded): Promise<void>;
  listLocalActivityHistory(farmId: FarmId): Promise<LocalActivityRecordView[]>;
  getLocalActivityDetail(
    farmId: FarmId,
    kind: OperationalRecordKind,
    id: OperationalRecordId,
  ): Promise<LocalActivityRecordView | null>;
  listHarvestHistory(farmId: FarmId): Promise<HarvestRecordView[]>;
  getHarvestDetail(farmId: FarmId, id: OperationalRecordId): Promise<HarvestRecordView | null>;
  listHarvestRecordsForExport(farmId: FarmId): Promise<HarvestRecorded[]>;
  listMaterialUseRecordsForExport(farmId: FarmId): Promise<MaterialUseRecorded[]>;
  listInventoryCountRecordsForExport(farmId: FarmId): Promise<InventoryCountRecorded[]>;
}
