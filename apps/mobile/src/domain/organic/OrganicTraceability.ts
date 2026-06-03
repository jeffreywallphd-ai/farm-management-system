import type { FarmId } from "../farm/Farm";
import type { FarmLocationId } from "../farm/FarmLocation";
import type { TrackedItemId } from "../farm/TrackedItem";
import type { IsoDateTimeString } from "../records/OperationalRecord";

export const ORGANIC_LOT_STATUSES = ["organic", "transitioning", "nonOrganic", "unknown"] as const;
export type OrganicLotStatus = (typeof ORGANIC_LOT_STATUSES)[number];

export const ORGANIC_LOT_STATUS_LABELS: Record<OrganicLotStatus, string> = {
  organic: "Organic",
  transitioning: "Transitioning",
  nonOrganic: "Nonorganic",
  unknown: "Unknown",
};

export const ORGANIC_HANDLING_EVENT_TYPES = [
  "wash",
  "pack",
  "cool",
  "dry",
  "freeze",
  "sort",
  "grade",
  "combine",
  "split",
  "relabel",
  "transport",
  "other",
] as const;
export type OrganicHandlingEventType = (typeof ORGANIC_HANDLING_EVENT_TYPES)[number];

export const ORGANIC_HANDLING_EVENT_TYPE_LABELS: Record<OrganicHandlingEventType, string> = {
  wash: "Wash",
  pack: "Pack",
  cool: "Cool",
  dry: "Dry",
  freeze: "Freeze",
  sort: "Sort",
  grade: "Grade",
  combine: "Combine",
  split: "Split",
  relabel: "Relabel",
  transport: "Transport",
  other: "Other",
};

export interface OrganicLot {
  id: string;
  farmId: FarmId;
  lotCode: string;
  cropId: TrackedItemId;
  placeId: FarmLocationId;
  harvestDate: IsoDateTimeString;
  organicStatus: OrganicLotStatus;
  quantityHarvested: number;
  unit: string;
  createdFromHarvestRecordId?: string;
  notes?: string;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}

export interface OrganicHandlingEvent {
  id: string;
  farmId: FarmId;
  lotId: string;
  eventType: OrganicHandlingEventType;
  eventDate: IsoDateTimeString;
  inputLotIds: string[];
  outputLotIds: string[];
  quantityIn?: number;
  quantityOut?: number;
  unit?: string;
  facilityPlaceId?: FarmLocationId;
  equipmentUsed?: string;
  cleaningRecordId?: string;
  notes?: string;
  createdAt: IsoDateTimeString;
}

export interface OrganicStorageRecord {
  id: string;
  farmId: FarmId;
  lotId: string;
  storagePlaceId: FarmLocationId;
  dateIn: IsoDateTimeString;
  dateOut?: IsoDateTimeString;
  quantityIn: number;
  quantityOut?: number;
  unit: string;
  containerId?: string;
  notes?: string;
  createdAt: IsoDateTimeString;
}

export interface OrganicSaleRecord {
  id: string;
  farmId: FarmId;
  lotId: string;
  buyer: string;
  saleDate: IsoDateTimeString;
  quantity: number;
  unit: string;
  invoiceNumber?: string;
  organicClaim?: string;
  evidenceAttachmentIds: string[];
  createdAt: IsoDateTimeString;
}

export interface OrganicMassBalanceSnapshot {
  cropId?: TrackedItemId;
  lotId?: string;
  dateRange: string;
  quantityHarvested: number;
  quantityPurchased: number;
  quantityHandled: number;
  quantityStored: number;
  quantitySold: number;
  quantityLost: number;
  expectedRemaining: number;
  actualRemaining: number;
  discrepancy: number;
  unit?: string;
}
