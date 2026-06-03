import type { FarmId } from "../farm/Farm";
import type { FarmLocationId } from "../farm/FarmLocation";
import type { IsoDateTimeString } from "../records/OperationalRecord";

export const ORGANIC_PLACE_STATUSES = [
  "nonOrganic",
  "transitioning",
  "eligibleOrganic",
  "certifiedOrganic",
  "buffer",
  "excluded",
] as const;

export type OrganicPlaceStatus = (typeof ORGANIC_PLACE_STATUSES)[number];

export const ORGANIC_PLACE_STATUS_LABELS: Record<OrganicPlaceStatus, string> = {
  nonOrganic: "Non-organic",
  transitioning: "Transitioning",
  eligibleOrganic: "Eligible organic",
  certifiedOrganic: "Certified organic",
  buffer: "Buffer zone",
  excluded: "Excluded",
};

export const ORGANIC_BOUNDARY_EVIDENCE_TYPES = ["photo", "map", "note", "document"] as const;

export type OrganicBoundaryEvidenceType = (typeof ORGANIC_BOUNDARY_EVIDENCE_TYPES)[number];

export const ORGANIC_BOUNDARY_EVIDENCE_TYPE_LABELS: Record<OrganicBoundaryEvidenceType, string> = {
  photo: "Photo",
  map: "Map",
  note: "Note",
  document: "Document",
};

export interface OrganicPlaceProfile {
  placeId: FarmLocationId;
  farmId: FarmId;
  organicStatus: OrganicPlaceStatus;
  transitionStartDate?: string;
  lastProhibitedSubstanceDate?: string;
  organicEligibilityDate?: string;
  certifiedOrganicSinceDate?: string;
  boundaryDescription?: string;
  bufferDescription?: string;
  adjacentLandUse?: string;
  contaminationRisks?: string;
  certifierApproved: boolean;
  certifierNotes?: string;
  evidenceAttachmentIds: string[];
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}

export interface OrganicBoundaryEvidence {
  id: string;
  farmId: FarmId;
  placeId: FarmLocationId;
  evidenceType: OrganicBoundaryEvidenceType;
  description: string;
  attachmentUri?: string;
  capturedAt: IsoDateTimeString;
  createdAt: IsoDateTimeString;
}
