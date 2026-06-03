import type { FarmId } from "../farm/Farm";
import type { FarmLocationId } from "../farm/FarmLocation";
import type { TrackedItemId } from "../farm/TrackedItem";
import type { IsoDateTimeString } from "../records/OperationalRecord";

export const SEED_LOT_ORGANIC_STATUSES = [
  "organic",
  "untreatedNonOrganic",
  "treatedAllowed",
  "treatedProhibited",
  "unknown",
] as const;

export type SeedLotOrganicStatus = (typeof SEED_LOT_ORGANIC_STATUSES)[number];

export const SEED_LOT_ORGANIC_STATUS_LABELS: Record<SeedLotOrganicStatus, string> = {
  organic: "Organic",
  untreatedNonOrganic: "Untreated nonorganic",
  treatedAllowed: "Treated with allowed substance",
  treatedProhibited: "Treated with prohibited substance",
  unknown: "Unknown",
};

export const COMMERCIAL_AVAILABILITY_RESULTS = [
  "available",
  "unavailable",
  "wrongVariety",
  "wrongQuantity",
  "wrongQuality",
  "tooLate",
  "other",
] as const;

export type CommercialAvailabilityResult = (typeof COMMERCIAL_AVAILABILITY_RESULTS)[number];

export const COMMERCIAL_AVAILABILITY_RESULT_LABELS: Record<CommercialAvailabilityResult, string> = {
  available: "Available",
  unavailable: "Unavailable",
  wrongVariety: "Wrong variety",
  wrongQuantity: "Wrong quantity",
  wrongQuality: "Wrong quality",
  tooLate: "Too late",
  other: "Other",
};

export interface SeedLot {
  id: string;
  farmId: FarmId;
  cropId?: TrackedItemId;
  variety: string;
  supplier?: string;
  lotNumber?: string;
  purchaseDate?: string;
  quantity?: string;
  organicStatus: SeedLotOrganicStatus;
  seedTreatment?: string;
  invoiceAttachmentId?: string;
  labelAttachmentId?: string;
  notes?: string;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}

export interface CommercialAvailabilitySearch {
  id: string;
  farmId: FarmId;
  seedLotId: string;
  crop?: string;
  variety?: string;
  searchedOn: string;
  supplierName: string;
  result: CommercialAvailabilityResult;
  evidenceAttachmentId?: string;
  notes?: string;
  createdAt: IsoDateTimeString;
}

export interface OrganicPlantingEvent {
  id: string;
  farmId: FarmId;
  seedLotId: string;
  cropId?: TrackedItemId;
  placeId?: FarmLocationId;
  date: IsoDateTimeString;
  quantityPlanted?: string;
  transplantOrDirectSeed?: "transplant" | "directSeed";
  linkedFarmNoteId?: string;
  createdAt: IsoDateTimeString;
}
