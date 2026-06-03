import { z } from "zod";

import { COMMERCIAL_AVAILABILITY_RESULTS, SEED_LOT_ORGANIC_STATUSES } from "../organic/OrganicSeed";

const optionalTrimmedText = z.string().trim().optional().transform((value) => value || undefined);
const requiredTrimmedText = z.string().trim().min(1, "Add a value.");
const optionalDate = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined)
  .refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), "Use dates as YYYY-MM-DD.");

export const seedLotInputSchema = z.object({
  farmId: z.string().min(1),
  id: z.string().optional(),
  cropId: optionalTrimmedText,
  variety: requiredTrimmedText,
  supplier: optionalTrimmedText,
  lotNumber: optionalTrimmedText,
  purchaseDate: optionalDate,
  quantity: optionalTrimmedText,
  organicStatus: z.enum(SEED_LOT_ORGANIC_STATUSES),
  seedTreatment: optionalTrimmedText,
  invoiceAttachmentId: optionalTrimmedText,
  labelAttachmentId: optionalTrimmedText,
  notes: optionalTrimmedText,
});

export const commercialAvailabilitySearchInputSchema = z.object({
  farmId: z.string().min(1),
  seedLotId: z.string().min(1, "Choose a seed lot."),
  crop: optionalTrimmedText,
  variety: optionalTrimmedText,
  searchedOn: optionalDate,
  supplierName: requiredTrimmedText,
  result: z.enum(COMMERCIAL_AVAILABILITY_RESULTS),
  evidenceAttachmentId: optionalTrimmedText,
  notes: optionalTrimmedText,
});

export const organicPlantingEventInputSchema = z.object({
  farmId: z.string().min(1),
  seedLotId: z.string().min(1, "Choose a seed lot."),
  cropId: optionalTrimmedText,
  placeId: optionalTrimmedText,
  date: optionalDate,
  quantityPlanted: optionalTrimmedText,
  transplantOrDirectSeed: z.enum(["transplant", "directSeed"]).optional(),
  linkedFarmNoteId: optionalTrimmedText,
});
