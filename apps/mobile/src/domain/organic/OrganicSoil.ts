import type { FarmId } from "../farm/Farm";
import type { FarmLocationId } from "../farm/FarmLocation";
import type { TrackedItemId } from "../farm/TrackedItem";
import type { IsoDateTimeString } from "../records/OperationalRecord";

export const SOIL_FERTILITY_PRACTICE_TYPES = [
  "coverCrop",
  "greenManure",
  "compost",
  "manure",
  "mulch",
  "tillage",
  "noTill",
  "soilTest",
  "erosionControl",
  "other",
] as const;
export type SoilFertilityPracticeType = (typeof SOIL_FERTILITY_PRACTICE_TYPES)[number];

export const SOIL_FERTILITY_PRACTICE_TYPE_LABELS: Record<SoilFertilityPracticeType, string> = {
  coverCrop: "Cover crop",
  greenManure: "Green manure",
  compost: "Compost",
  manure: "Manure",
  mulch: "Mulch",
  tillage: "Tillage",
  noTill: "No-till",
  soilTest: "Soil test",
  erosionControl: "Erosion control",
  other: "Other",
};

export interface SoilFertilityPractice {
  id: string;
  farmId: FarmId;
  placeId?: FarmLocationId;
  practiceType: SoilFertilityPracticeType;
  cropId?: TrackedItemId;
  date: IsoDateTimeString;
  description: string;
  evidenceAttachmentIds: string[];
  linkedFarmNoteId?: string;
  createdAt: IsoDateTimeString;
}

export interface CompostBatch {
  id: string;
  farmId: FarmId;
  name: string;
  ingredients?: string;
  startDate?: string;
  compostingMethod?: "windrow" | "staticAeratedPile" | "inVessel" | "other";
  initialCNRatio?: string;
  status?: string;
  notes?: string;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}

export interface CompostTemperatureLog {
  id: string;
  farmId: FarmId;
  compostBatchId: string;
  date: IsoDateTimeString;
  temperatureF: number;
  turned: boolean;
  notes?: string;
  createdAt: IsoDateTimeString;
}

export interface ManureApplication {
  id: string;
  farmId: FarmId;
  placeId?: FarmLocationId;
  cropId?: TrackedItemId;
  applicationDate: IsoDateTimeString;
  manureType?: string;
  incorporated: boolean;
  ediblePortionContactSoil: boolean;
  requiredDaysBeforeHarvest: 90 | 120;
  earliestHarvestDate: string;
  quantity?: string;
  notes?: string;
  createdAt: IsoDateTimeString;
}

export interface CropRotationRecord {
  id: string;
  farmId: FarmId;
  placeId?: FarmLocationId;
  cropId?: TrackedItemId;
  season?: string;
  year: number;
  previousCropId?: TrackedItemId;
  rotationPurpose?: "soilOrganicMatter" | "pestManagement" | "nutrientManagement" | "erosionControl";
  coverCropUsed: boolean;
  notes?: string;
  createdAt: IsoDateTimeString;
}
