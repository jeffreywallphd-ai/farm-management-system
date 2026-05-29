import type { IsoDateTimeString } from "../records/OperationalRecord";

export type FarmId = string;

export interface Farm {
  id: FarmId;
  name: string;
  createdAt: IsoDateTimeString;
}
