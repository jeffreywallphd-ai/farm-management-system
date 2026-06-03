import type { FarmId } from "../farm/Farm";
import type { FarmLocationId } from "../farm/FarmLocation";
import type { TrackedItemId } from "../farm/TrackedItem";
import type { IsoDateTimeString } from "../records/OperationalRecord";

export const PEST_WEED_DISEASE_TYPES = ["pest", "weed", "disease"] as const;
export type PestWeedDiseaseType = (typeof PEST_WEED_DISEASE_TYPES)[number];

export const PEST_WEED_DISEASE_TYPE_LABELS: Record<PestWeedDiseaseType, string> = {
  pest: "Pest",
  weed: "Weed",
  disease: "Disease",
};

export const PEST_WEED_DISEASE_ACTION_TYPES = [
  "prevention",
  "sanitation",
  "cultural",
  "mechanical",
  "physical",
  "biological",
  "botanical",
  "allowedSynthetic",
  "other",
] as const;
export type PestWeedDiseaseActionType = (typeof PEST_WEED_DISEASE_ACTION_TYPES)[number];

export const PEST_WEED_DISEASE_ACTION_TYPE_LABELS: Record<PestWeedDiseaseActionType, string> = {
  prevention: "Prevention",
  sanitation: "Sanitation",
  cultural: "Cultural",
  mechanical: "Mechanical",
  physical: "Physical",
  biological: "Biological",
  botanical: "Botanical",
  allowedSynthetic: "Allowed synthetic",
  other: "Other",
};

export interface PestWeedDiseaseObservation {
  id: string;
  farmId: FarmId;
  type: PestWeedDiseaseType;
  placeId?: FarmLocationId;
  cropId?: TrackedItemId;
  observedAt: IsoDateTimeString;
  severity?: string;
  description: string;
  photoAttachmentIds: string[];
  linkedFarmNoteId?: string;
  createdAt: IsoDateTimeString;
}

export interface PestWeedDiseaseAction {
  id: string;
  farmId: FarmId;
  observationId: string;
  actionType: PestWeedDiseaseActionType;
  actionDate: IsoDateTimeString;
  description: string;
  inputApplicationId?: string;
  whyNeeded?: string;
  effectivenessNotes?: string;
  evidenceAttachmentIds: string[];
  createdAt: IsoDateTimeString;
}

export interface PlasticMulchRecord {
  id: string;
  farmId: FarmId;
  placeId?: FarmLocationId;
  cropId?: TrackedItemId;
  installedDate?: string;
  removedDate?: string;
  material?: string;
  notes?: string;
  evidenceAttachmentIds: string[];
  createdAt: IsoDateTimeString;
}
