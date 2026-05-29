import type { IsoDateTimeString } from "../records/OperationalRecord";
import type { FarmId } from "./Farm";

export type FarmLocationId = string;

export interface FarmLocation {
  id: FarmLocationId;
  farmId: FarmId;
  name: string;
  createdAt: IsoDateTimeString;
}
