import type { IsoDateTimeString } from "../records/OperationalRecord";
import type { FarmId } from "./Farm";

export type FarmLocationId = string;

export const FARM_PLACE_KINDS = [
  "field",
  "bed",
  "row",
  "greenhouse",
  "highTunnel",
  "greenhouseBed",
  "bench",
  "storageArea",
  "washPack",
  "cooler",
  "freezer",
  "barnShed",
  "other",
] as const;

export type FarmPlaceKind = (typeof FARM_PLACE_KINDS)[number];

export const FARM_PLACE_KIND_LABELS: Record<FarmPlaceKind, string> = {
  field: "Field",
  bed: "Bed",
  row: "Row",
  greenhouse: "Greenhouse",
  highTunnel: "High tunnel",
  greenhouseBed: "Greenhouse bed",
  bench: "Bench",
  storageArea: "Storage area",
  washPack: "Wash/Pack area",
  cooler: "Cooler",
  freezer: "Freezer",
  barnShed: "Barn/Shed",
  other: "Other",
};

export interface FarmLocation {
  id: FarmLocationId;
  farmId: FarmId;
  name: string;
  kind: FarmPlaceKind;
  parentId?: FarmLocationId;
  createdAt: IsoDateTimeString;
}
