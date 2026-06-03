import { z } from "zod";

import { SOIL_FERTILITY_PRACTICE_TYPES } from "../organic/OrganicSoil";
import { parseAttachmentIdsText } from "./organicInputValidation";

const optionalTrimmedText = z.string().trim().optional().transform((value) => value || undefined);
const requiredTrimmedText = z.string().trim().min(1, "Add a description.");
const optionalDate = z.string().trim().optional().transform((value) => value || undefined).refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), "Use dates as YYYY-MM-DD.");

export const soilFertilityPracticeInputSchema = z.object({
  farmId: z.string().min(1),
  placeId: optionalTrimmedText,
  practiceType: z.enum(SOIL_FERTILITY_PRACTICE_TYPES),
  cropId: optionalTrimmedText,
  date: optionalDate,
  description: requiredTrimmedText,
  evidenceAttachmentIdsText: optionalTrimmedText,
  linkedFarmNoteId: optionalTrimmedText,
});

export const compostBatchInputSchema = z.object({
  farmId: z.string().min(1),
  id: z.string().optional(),
  name: z.string().trim().min(1, "Add a compost batch name."),
  ingredients: optionalTrimmedText,
  startDate: optionalDate,
  compostingMethod: z.enum(["windrow", "staticAeratedPile", "inVessel", "other"]).optional(),
  initialCNRatio: optionalTrimmedText,
  status: optionalTrimmedText,
  notes: optionalTrimmedText,
});

export const compostTemperatureLogInputSchema = z.object({
  farmId: z.string().min(1),
  compostBatchId: z.string().min(1, "Choose a compost batch."),
  date: optionalDate,
  temperatureF: z.coerce.number().min(-40).max(220),
  turned: z.boolean().default(false),
  notes: optionalTrimmedText,
});

export const manureApplicationInputSchema = z.object({
  farmId: z.string().min(1),
  placeId: optionalTrimmedText,
  cropId: optionalTrimmedText,
  applicationDate: optionalDate,
  manureType: optionalTrimmedText,
  incorporated: z.boolean().default(false),
  ediblePortionContactSoil: z.boolean().default(false),
  quantity: optionalTrimmedText,
  notes: optionalTrimmedText,
});

export const cropRotationRecordInputSchema = z.object({
  farmId: z.string().min(1),
  placeId: optionalTrimmedText,
  cropId: optionalTrimmedText,
  season: optionalTrimmedText,
  year: z.coerce.number().int().min(1900).max(2200),
  previousCropId: optionalTrimmedText,
  rotationPurpose: z.enum(["soilOrganicMatter", "pestManagement", "nutrientManagement", "erosionControl"]).optional(),
  coverCropUsed: z.boolean().default(false),
  notes: optionalTrimmedText,
});

export { parseAttachmentIdsText };

export function calculateManureInterval(ediblePortionContactSoil: boolean): 90 | 120 {
  return ediblePortionContactSoil ? 120 : 90;
}

export function calculateEarliestHarvestDate(applicationDate: string, requiredDays: 90 | 120): string {
  const date = new Date(`${applicationDate}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + requiredDays);
  return date.toISOString().slice(0, 10);
}
