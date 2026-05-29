import type { Farm } from "../farm/Farm";
import type { FarmLocation } from "../farm/FarmLocation";
import type { TrackedItem } from "../farm/TrackedItem";
import type { IsoDateTimeString } from "../records/OperationalRecord";
import type { HarvestRecorded } from "../records/HarvestRecorded";
import type { InventoryCountRecorded } from "../records/InventoryCountRecorded";
import type { MaterialUseRecorded } from "../records/MaterialUseRecorded";

export const MOBILE_PILOT_RECOVERY_COPY_EXPORT_VERSION = 2;
export const MOBILE_PILOT_APP_DATA_SCHEMA_VERSION = 3;

export interface MobilePilotRecoveryCopy {
  exportVersion: typeof MOBILE_PILOT_RECOVERY_COPY_EXPORT_VERSION;
  createdAt: IsoDateTimeString;
  appDataSchemaVersion: typeof MOBILE_PILOT_APP_DATA_SCHEMA_VERSION;
  farm: Farm;
  locations: FarmLocation[];
  trackedItems: TrackedItem[];
  harvestRecords: HarvestRecorded[];
  materialUseRecords: MaterialUseRecorded[];
  inventoryCountRecords: InventoryCountRecorded[];
}
