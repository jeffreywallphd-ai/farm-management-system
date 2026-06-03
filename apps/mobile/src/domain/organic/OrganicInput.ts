import type { FarmId } from "../farm/Farm";
import type { FarmLocationId } from "../farm/FarmLocation";
import type { TrackedItemId } from "../farm/TrackedItem";
import type { IsoDateTimeString } from "../records/OperationalRecord";

export const ORGANIC_INPUT_CATEGORIES = [
  "fertility",
  "compost",
  "manure",
  "seedTreatment",
  "pestControl",
  "diseaseControl",
  "weedControl",
  "livestockHealth",
  "cleaning",
  "handling",
  "packaging",
  "other",
] as const;

export type OrganicInputCategory = (typeof ORGANIC_INPUT_CATEGORIES)[number];

export const ORGANIC_INPUT_CATEGORY_LABELS: Record<OrganicInputCategory, string> = {
  fertility: "Fertility",
  compost: "Compost",
  manure: "Manure",
  seedTreatment: "Seed treatment",
  pestControl: "Pest control",
  diseaseControl: "Disease control",
  weedControl: "Weed control",
  livestockHealth: "Livestock health",
  cleaning: "Cleaning",
  handling: "Handling",
  packaging: "Packaging",
  other: "Other",
};

export const ORGANIC_INPUT_APPROVAL_STATUSES = [
  "unknown",
  "approvedByCertifier",
  "omriListed",
  "wsdaListed",
  "allowedByNationalList",
  "restricted",
  "prohibited",
  "needsReview",
] as const;

export type OrganicInputApprovalStatus = (typeof ORGANIC_INPUT_APPROVAL_STATUSES)[number];

export const ORGANIC_INPUT_APPROVAL_STATUS_LABELS: Record<OrganicInputApprovalStatus, string> = {
  unknown: "Unknown",
  approvedByCertifier: "Approved by certifier",
  omriListed: "OMRI listed",
  wsdaListed: "WSDA listed",
  allowedByNationalList: "Allowed by National List",
  restricted: "Restricted",
  prohibited: "Prohibited",
  needsReview: "Needs certifier review",
};

export interface OrganicInput {
  id: string;
  farmId: FarmId;
  materialId?: TrackedItemId;
  name: string;
  inputCategory: OrganicInputCategory;
  manufacturer?: string;
  supplier?: string;
  composition?: string;
  source?: string;
  approvalStatus: OrganicInputApprovalStatus;
  approvalEvidenceAttachmentIds: string[];
  certifierApprovalDate?: string;
  approvalExpirationDate?: string;
  restrictions?: string;
  notes?: string;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}

export interface OrganicInputApplication {
  id: string;
  farmId: FarmId;
  inputId: string;
  placeId?: FarmLocationId;
  cropId?: TrackedItemId;
  date: IsoDateTimeString;
  quantity?: string;
  unit?: string;
  rate?: string;
  reason?: string;
  targetProblem?: string;
  weatherNotes?: string;
  appliedBy?: string;
  evidenceAttachmentIds: string[];
  linkedFarmNoteId?: string;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}
