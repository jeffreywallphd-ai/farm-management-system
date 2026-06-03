import type { FarmId } from "../farm/Farm";
import type { IsoDateTimeString } from "../records/OperationalRecord";

export const ORGANIC_OSP_SECTION_TYPES = [
  "practicesProcedures",
  "inputsSubstances",
  "monitoring",
  "recordkeeping",
  "comminglingPrevention",
  "additionalInformation",
] as const;
export type OrganicOspSectionType = (typeof ORGANIC_OSP_SECTION_TYPES)[number];

export const ORGANIC_OSP_SECTION_TYPE_LABELS: Record<OrganicOspSectionType, string> = {
  practicesProcedures: "Practices and procedures",
  inputsSubstances: "Inputs and substances",
  monitoring: "Monitoring practices",
  recordkeeping: "Recordkeeping system",
  comminglingPrevention: "Commingling and prohibited-substance prevention",
  additionalInformation: "Additional certifier information",
};

export const ORGANIC_READINESS_STATUSES = ["notStarted", "needsWork", "readyForReview", "notApplicable"] as const;
export type OrganicReadinessStatus = (typeof ORGANIC_READINESS_STATUSES)[number];

export const ORGANIC_READINESS_STATUS_LABELS: Record<OrganicReadinessStatus, string> = {
  notStarted: "Not started",
  needsWork: "Needs work",
  readyForReview: "Ready for review",
  notApplicable: "Not applicable",
};

export const INSPECTION_READINESS_CATEGORIES = [
  "profile",
  "land",
  "inputs",
  "seeds",
  "soil",
  "pest",
  "traceability",
  "records",
] as const;
export type InspectionReadinessCategory = (typeof INSPECTION_READINESS_CATEGORIES)[number];

export const INSPECTION_READINESS_CATEGORY_LABELS: Record<InspectionReadinessCategory, string> = {
  profile: "Profile and scope",
  land: "Land, boundaries, and buffers",
  inputs: "Inputs and materials",
  seeds: "Seeds and planting stock",
  soil: "Soil, compost, manure, and rotation",
  pest: "Pest, weed, disease, and mulch",
  traceability: "Harvest, handling, storage, and sales",
  records: "Recordkeeping and export",
};

export interface OrganicSystemPlanSection {
  id: string;
  farmId: FarmId;
  sectionType: OrganicOspSectionType;
  title: string;
  narrative: string;
  readinessStatus: OrganicReadinessStatus;
  evidenceAttachmentIds: string[];
  notes?: string;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}

export interface OrganicInspectionReadinessItem {
  id: string;
  farmId: FarmId;
  category: InspectionReadinessCategory;
  prompt: string;
  readinessStatus: OrganicReadinessStatus;
  notes?: string;
  evidenceAttachmentIds: string[];
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}
