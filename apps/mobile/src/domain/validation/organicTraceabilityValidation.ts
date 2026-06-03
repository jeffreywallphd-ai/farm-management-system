import { z } from "zod";

import { ORGANIC_HANDLING_EVENT_TYPES, ORGANIC_LOT_STATUSES } from "../organic/OrganicTraceability";
import { parseAttachmentIdsText } from "./organicInputValidation";

const optionalTrimmedText = z.string().trim().optional().transform((value) => value || undefined);
const requiredTrimmedText = z.string().trim().min(1);
const optionalDate = z.string().trim().optional().transform((value) => value || undefined).refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), "Use dates as YYYY-MM-DD.");
const requiredDate = z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Use dates as YYYY-MM-DD.");
const optionalPositiveNumber = z.union([z.string(), z.number()]).optional().transform((value) => value === undefined || value === "" ? undefined : Number(value)).refine((value) => value === undefined || Number.isFinite(value), "Enter a number.").refine((value) => value === undefined || value >= 0, "Enter zero or more.");
const positiveNumber = z.union([z.string(), z.number()]).transform((value) => Number(value)).refine((value) => Number.isFinite(value) && value > 0, "Enter a quantity greater than zero.");

function parseIdList(value?: string): string[] {
  return (value ?? "")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export const organicLotInputSchema = z.object({
  farmId: z.string().min(1),
  id: optionalTrimmedText,
  lotCode: requiredTrimmedText.min(1, "Add a lot code."),
  cropId: z.string().min(1, "Choose a crop."),
  placeId: z.string().min(1, "Choose a harvest place."),
  harvestDate: requiredDate,
  organicStatus: z.enum(ORGANIC_LOT_STATUSES),
  quantityHarvested: positiveNumber,
  unit: requiredTrimmedText.min(1, "Add a unit."),
  createdFromHarvestRecordId: optionalTrimmedText,
  notes: optionalTrimmedText,
});

export const organicHandlingEventInputSchema = z.object({
  farmId: z.string().min(1),
  lotId: z.string().min(1, "Choose a lot."),
  eventType: z.enum(ORGANIC_HANDLING_EVENT_TYPES),
  eventDate: optionalDate,
  inputLotIdsText: optionalTrimmedText,
  outputLotIdsText: optionalTrimmedText,
  quantityIn: optionalPositiveNumber,
  quantityOut: optionalPositiveNumber,
  unit: optionalTrimmedText,
  facilityPlaceId: optionalTrimmedText,
  equipmentUsed: optionalTrimmedText,
  cleaningRecordId: optionalTrimmedText,
  notes: optionalTrimmedText,
}).transform((value) => ({
  ...value,
  inputLotIds: parseIdList(value.inputLotIdsText),
  outputLotIds: parseIdList(value.outputLotIdsText),
}));

export const organicStorageRecordInputSchema = z.object({
  farmId: z.string().min(1),
  lotId: z.string().min(1, "Choose a lot."),
  storagePlaceId: z.string().min(1, "Choose a storage place."),
  dateIn: requiredDate,
  dateOut: optionalDate,
  quantityIn: positiveNumber,
  quantityOut: optionalPositiveNumber,
  unit: requiredTrimmedText.min(1, "Add a unit."),
  containerId: optionalTrimmedText,
  notes: optionalTrimmedText,
});

export const organicSaleRecordInputSchema = z.object({
  farmId: z.string().min(1),
  lotId: z.string().min(1, "Choose a lot."),
  buyer: requiredTrimmedText.min(1, "Add a buyer."),
  saleDate: requiredDate,
  quantity: positiveNumber,
  unit: requiredTrimmedText.min(1, "Add a unit."),
  invoiceNumber: optionalTrimmedText,
  organicClaim: optionalTrimmedText,
  evidenceAttachmentIdsText: optionalTrimmedText,
});

export { parseAttachmentIdsText };
