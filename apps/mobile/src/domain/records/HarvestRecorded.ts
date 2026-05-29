import type { FarmLocationId } from "../farm/FarmLocation";
import type { TrackedItemId } from "../farm/TrackedItem";
import type { Quantity } from "../quantities/Quantity";
import type { OperationalRecordBase } from "./OperationalRecord";

export interface HarvestRecorded extends OperationalRecordBase {
  kind: "HarvestRecorded";
  cropId: TrackedItemId;
  sourceLocationId: FarmLocationId;
  quantity: Quantity;
}
