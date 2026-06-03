import { z } from "zod";

import { PEST_WEED_DISEASE_ACTION_TYPES, PEST_WEED_DISEASE_TYPES } from "../organic/OrganicPest";
import { parseAttachmentIdsText } from "./organicInputValidation";

const optionalTrimmedText = z.string().trim().optional().transform((value) => value || undefined);
const requiredTrimmedText = z.string().trim().min(1, "Add a description.");
const optionalDate = z.string().trim().optional().transform((value) => value || undefined).refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), "Use dates as YYYY-MM-DD.");

export const pestObservationInputSchema = z.object({
  farmId: z.string().min(1),
  type: z.enum(PEST_WEED_DISEASE_TYPES),
  placeId: optionalTrimmedText,
  cropId: optionalTrimmedText,
  observedAt: optionalDate,
  severity: optionalTrimmedText,
  description: requiredTrimmedText,
  photoAttachmentIdsText: optionalTrimmedText,
  linkedFarmNoteId: optionalTrimmedText,
});

export const pestActionInputSchema = z.object({
  farmId: z.string().min(1),
  observationId: z.string().min(1, "Choose an observation."),
  actionType: z.enum(PEST_WEED_DISEASE_ACTION_TYPES),
  actionDate: optionalDate,
  description: requiredTrimmedText,
  inputApplicationId: optionalTrimmedText,
  whyNeeded: optionalTrimmedText,
  effectivenessNotes: optionalTrimmedText,
  evidenceAttachmentIdsText: optionalTrimmedText,
});

export const plasticMulchRecordInputSchema = z.object({
  farmId: z.string().min(1),
  placeId: optionalTrimmedText,
  cropId: optionalTrimmedText,
  installedDate: optionalDate,
  removedDate: optionalDate,
  material: optionalTrimmedText,
  notes: optionalTrimmedText,
  evidenceAttachmentIdsText: optionalTrimmedText,
});

export { parseAttachmentIdsText };
