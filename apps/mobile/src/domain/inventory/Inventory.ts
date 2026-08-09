import type { FarmId } from "../farm/Farm";
import type { FarmLocationId } from "../farm/FarmLocation";
import type { TrackedItemId } from "../farm/TrackedItem";
import type { FarmEventId } from "../events/FarmEvent";
import type { Unit } from "../quantities/Unit";
import type { IsoDateTimeString } from "../records/OperationalRecord";

export type InventoryItemId = string;

export type InventoryItemKind = "material" | "equipment";

export type InventoryAcquisitionSource = "purchase" | "donation" | "selfProduced" | "alreadyOwned";

export type OrganicInventoryRelevance =
  | "none"
  | "cropProductionInput"
  | "soilAmendment"
  | "pestControlInput"
  | "seedOrPlantingStock"
  | "cleaningOrSanitation"
  | "packagingOrHandling"
  | "sharedEquipment";

export type OrganicInventoryApprovalStatus =
  | "notNeeded"
  | "unknown"
  | "needsReview"
  | "approvedByCertifier"
  | "omriListed"
  | "wsdaListed"
  | "allowedByNationalList"
  | "restricted"
  | "prohibited";

export type InventoryItemStatus = "active" | "inactive";

export interface InventoryItem {
  id: InventoryItemId;
  farmId: FarmId;
  kind: InventoryItemKind;
  name: string;
  category?: string;
  commonItemKey?: string;
  acquisitionSource: InventoryAcquisitionSource;
  trackedItemId?: TrackedItemId;
  status: InventoryItemStatus;
  storageLocationId?: FarmLocationId;
  defaultUnit?: Unit;
  currentAmount?: number;
  currentUnit?: Unit;
  supplier?: string;
  reorderPoint?: string;
  notes?: string;
  purchaseNoteFarmEventId?: FarmEventId;
  organicRelevance: OrganicInventoryRelevance;
  organicApprovalStatus: OrganicInventoryApprovalStatus;
  organicRegulationNotes?: string;
  organicEvidenceNotes?: string;
  equipmentContactRisk?: string;
  cleaningRequired: boolean;
  lastCleanedAt?: IsoDateTimeString;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}

export interface InventoryMaterialUsageSummary {
  materialId: TrackedItemId;
  materialName: string;
  unit: Unit;
  totalUsed: number;
  useCount: number;
  lastUsedAt?: IsoDateTimeString;
}
