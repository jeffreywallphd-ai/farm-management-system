import type { FarmLocationId } from "../farm/FarmLocation";
import type { Quantity } from "../quantities/Quantity";
import type { OperationalRecordBase } from "./OperationalRecord";

export interface HarvestRecorded extends OperationalRecordBase {
  kind: "HarvestRecorded";
  cropName: string;
  sourceLocationId: FarmLocationId;
  quantity: Quantity;
}
