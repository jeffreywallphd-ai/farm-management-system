import type { IsoDateTimeString } from "../records/OperationalRecord";
import type { Unit } from "../quantities/Unit";
import type { FarmId } from "./Farm";

export type TrackedItemId = string;

export type TrackedItemKind = "crop" | "material" | "countableItem";

export interface TrackedItem {
  id: TrackedItemId;
  farmId: FarmId;
  kind: TrackedItemKind;
  name: string;
  createdAt: IsoDateTimeString;
  defaultUnit?: Unit;
}
