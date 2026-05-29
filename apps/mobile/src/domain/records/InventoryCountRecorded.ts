import type { FarmLocationId } from "../farm/FarmLocation";
import type { TrackedItemId } from "../farm/TrackedItem";
import type { Quantity } from "../quantities/Quantity";
import type { OperationalRecordBase } from "./OperationalRecord";

export interface InventoryCountRecorded extends OperationalRecordBase {
  kind: "InventoryCountRecorded";
  trackedItemId: TrackedItemId;
  observedQuantity: Quantity;
  locationId?: FarmLocationId;
}
