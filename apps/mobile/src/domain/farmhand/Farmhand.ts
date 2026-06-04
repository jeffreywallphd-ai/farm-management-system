import type { FarmId } from "../farm/Farm";
import type { IsoDateTimeString } from "../records/OperationalRecord";

export type FarmhandId = string;
export type FarmhandScheduleId = string;

export const FARMHAND_STATUSES = ["active", "inactive"] as const;

export type FarmhandStatus = (typeof FARMHAND_STATUSES)[number];

export const FARMHAND_STATUS_LABELS: Record<FarmhandStatus, string> = {
  active: "Active",
  inactive: "Inactive",
};

export const FARMHAND_WEEKDAYS = [0, 1, 2, 3, 4, 5, 6] as const;

export type FarmhandWeekday = (typeof FARMHAND_WEEKDAYS)[number];

export type FarmhandWeekStartsOn = 0 | 1;

export const FARMHAND_WEEKDAY_LABELS: Record<FarmhandWeekday, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

export interface Farmhand {
  id: FarmhandId;
  farmId: FarmId;
  name: string;
  phoneNumber?: string;
  notes?: string;
  status: FarmhandStatus;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}

export interface FarmhandRecurringSchedule {
  id: FarmhandScheduleId;
  farmId: FarmId;
  farmhandId: FarmhandId;
  weekday: FarmhandWeekday;
  startTime: string;
  endTime: string;
  effectiveStartDate?: string;
  effectiveEndDate?: string;
  notes?: string;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}

export interface FarmhandWeeklyScheduleBlock {
  id: FarmhandScheduleId;
  farmId: FarmId;
  farmhandId: FarmhandId;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}

export interface FarmhandScheduleOccurrence {
  id: string;
  farmId: FarmId;
  farmhandId: FarmhandId;
  source: "recurring" | "weekly";
  sourceId: FarmhandScheduleId;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

export interface FarmhandScheduleSettings {
  farmId: FarmId;
  weekStartsOn: FarmhandWeekStartsOn;
  updatedAt: IsoDateTimeString;
}
