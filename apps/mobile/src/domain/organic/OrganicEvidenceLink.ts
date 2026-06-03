import type { FarmEventId } from "../events/FarmEvent";
import type { FarmId } from "../farm/Farm";
import type { PrivacyClassification } from "../privacy/PrivacyClassification";
import type { IsoDateTimeString } from "../records/OperationalRecord";

export const ORGANIC_EVIDENCE_CATEGORIES = [
  "land",
  "inputs",
  "seeds",
  "soil",
  "pest",
  "traceability",
  "osp",
  "inspection",
  "advancedScope",
  "general",
] as const;

export type OrganicEvidenceCategory = (typeof ORGANIC_EVIDENCE_CATEGORIES)[number];

export const ORGANIC_EVIDENCE_CATEGORY_LABELS: Record<OrganicEvidenceCategory, string> = {
  land: "Land and places",
  inputs: "Inputs and materials",
  seeds: "Seeds and planting",
  soil: "Soil, compost, and manure",
  pest: "Pest, weed, and disease",
  traceability: "Traceability and sales",
  osp: "Organic system plan",
  inspection: "Inspection readiness",
  advancedScope: "Advanced scope",
  general: "General organic evidence",
};

export const ORGANIC_EVIDENCE_RECORD_TYPES = [
  "organicPlaceProfile",
  "organicBoundaryEvidence",
  "organicInput",
  "organicInputApplication",
  "seedLot",
  "commercialAvailabilitySearch",
  "organicPlantingEvent",
  "soilFertilityPractice",
  "compostBatch",
  "compostTemperatureLog",
  "manureApplication",
  "cropRotationRecord",
  "pestWeedDiseaseObservation",
  "pestWeedDiseaseAction",
  "plasticMulchRecord",
  "organicLot",
  "organicHandlingEvent",
  "organicStorageRecord",
  "organicSaleRecord",
  "organicSystemPlanSection",
  "organicInspectionReadinessItem",
  "organicAdvancedScopeRecord",
  "organicReportPackage",
] as const;

export type OrganicEvidenceRecordType = (typeof ORGANIC_EVIDENCE_RECORD_TYPES)[number];

export const ORGANIC_EVIDENCE_RECORD_TYPE_LABELS: Record<OrganicEvidenceRecordType, string> = {
  organicPlaceProfile: "Organic place profile",
  organicBoundaryEvidence: "Boundary or buffer evidence",
  organicInput: "Organic input",
  organicInputApplication: "Input application",
  seedLot: "Seed lot",
  commercialAvailabilitySearch: "Commercial availability search",
  organicPlantingEvent: "Planting event",
  soilFertilityPractice: "Soil fertility practice",
  compostBatch: "Compost batch",
  compostTemperatureLog: "Compost temperature log",
  manureApplication: "Manure application",
  cropRotationRecord: "Crop rotation record",
  pestWeedDiseaseObservation: "Pest, weed, or disease observation",
  pestWeedDiseaseAction: "Pest, weed, or disease action",
  plasticMulchRecord: "Plastic mulch record",
  organicLot: "Organic lot",
  organicHandlingEvent: "Handling event",
  organicStorageRecord: "Storage record",
  organicSaleRecord: "Sale record",
  organicSystemPlanSection: "OSP section",
  organicInspectionReadinessItem: "Inspection readiness item",
  organicAdvancedScopeRecord: "Advanced scope record",
  organicReportPackage: "Report package",
};

export const ORGANIC_EVIDENCE_ROLES = [
  "fieldHistory",
  "photoEvidence",
  "voiceNote",
  "labelOrReceipt",
  "monitoring",
  "inspectionQuestion",
  "supportingNote",
  "other",
] as const;

export type OrganicEvidenceRole = (typeof ORGANIC_EVIDENCE_ROLES)[number];

export const ORGANIC_EVIDENCE_ROLE_LABELS: Record<OrganicEvidenceRole, string> = {
  fieldHistory: "Field history",
  photoEvidence: "Photo evidence",
  voiceNote: "Voice note",
  labelOrReceipt: "Label or receipt",
  monitoring: "Monitoring record",
  inspectionQuestion: "Question for certifier",
  supportingNote: "Supporting note",
  other: "Other",
};

export interface OrganicEvidenceLink {
  id: string;
  farmId: FarmId;
  farmEventId: FarmEventId;
  category: OrganicEvidenceCategory;
  linkedRecordType?: OrganicEvidenceRecordType;
  linkedRecordId?: string;
  evidenceRole: OrganicEvidenceRole;
  notes?: string;
  privacy: PrivacyClassification;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}
