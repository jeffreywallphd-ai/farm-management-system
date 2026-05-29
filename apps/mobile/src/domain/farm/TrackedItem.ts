import type { Unit } from "../quantities/Unit";

export type TrackedItemId = string;

export type TrackedItemKind = "crop" | "material" | "countableItem";

export interface TrackedItem {
  id: TrackedItemId;
  kind: TrackedItemKind;
  name: string;
  defaultUnit?: Unit;
}
