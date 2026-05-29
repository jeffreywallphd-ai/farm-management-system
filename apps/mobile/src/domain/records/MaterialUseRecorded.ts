import type { FarmLocationId } from "../farm/FarmLocation";
import type { TrackedItemId } from "../farm/TrackedItem";
import type { Quantity } from "../quantities/Quantity";
import type { OperationalRecordBase } from "./OperationalRecord";

export interface MaterialUseRecorded extends OperationalRecordBase {
  kind: "MaterialUseRecorded";
  materialId: TrackedItemId;
  quantity: Quantity;
  useLocationId?: FarmLocationId;
}
