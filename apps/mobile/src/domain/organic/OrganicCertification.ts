import type { FarmId } from "../farm/Farm";
import type { IsoDateTimeString } from "../records/OperationalRecord";

export type OrganicOperationProfileId = string;

export const ORGANIC_OPERATION_STATUSES = [
  "notOrganic",
  "transitioning",
  "exempt",
  "certified",
  "splitOperation",
] as const;

export type OrganicOperationStatus = (typeof ORGANIC_OPERATION_STATUSES)[number];

export const ORGANIC_OPERATION_STATUS_LABELS: Record<OrganicOperationStatus, string> = {
  notOrganic: "Not organic",
  transitioning: "Transitioning",
  exempt: "Exempt small organic operation",
  certified: "Certified organic",
  splitOperation: "Partially organic / split operation",
};

export const ORGANIC_CERTIFICATION_SCOPE_TYPES = [
  "crops",
  "livestock",
  "wildCrops",
  "handling",
  "mushrooms",
  "producerGroup",
  "imports",
  "packagedProductLabeling",
] as const;

export type OrganicCertificationScopeType = (typeof ORGANIC_CERTIFICATION_SCOPE_TYPES)[number];

export const ORGANIC_CERTIFICATION_SCOPE_LABELS: Record<OrganicCertificationScopeType, string> = {
  crops: "Crops",
  livestock: "Livestock",
  wildCrops: "Wild crops",
  handling: "Handling",
  mushrooms: "Mushrooms",
  producerGroup: "Producer group",
  imports: "Imports",
  packagedProductLabeling: "Packaged product labeling",
};

export const ORGANIC_CERTIFICATION_SCOPE_STATUSES = ["active", "planned", "notApplicable"] as const;

export type OrganicCertificationScopeStatus = (typeof ORGANIC_CERTIFICATION_SCOPE_STATUSES)[number];

export interface OrganicOperationProfile {
  id: OrganicOperationProfileId;
  farmId: FarmId;
  organicStatus: OrganicOperationStatus;
  certifierName?: string;
  certifierContact?: string;
  certificateNumber?: string;
  certificateEffectiveDate?: string;
  annualUpdateDueDate?: string;
  inspectionDueWindow?: string;
  recordRetentionYears: number;
  notes?: string;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}

export interface OrganicCertificationScope {
  profileId: OrganicOperationProfileId;
  farmId: FarmId;
  scopeType: OrganicCertificationScopeType;
  enabled: boolean;
  status: OrganicCertificationScopeStatus;
  certifierNotes?: string;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}
