import { z } from "zod";

import { ORGANIC_BOUNDARY_EVIDENCE_TYPES, ORGANIC_PLACE_STATUSES } from "../organic/OrganicPlace";

const optionalTrimmedText = z.string().trim().optional().transform((value) => value || undefined);
const requiredTrimmedText = z.string().trim().min(1, "Add a short description.");
const optionalDate = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined)
  .refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), "Use dates as YYYY-MM-DD.");

export const organicPlaceProfileInputSchema = z.object({
  farmId: z.string().min(1),
  placeId: z.string().min(1, "Choose a farm place."),
  organicStatus: z.enum(ORGANIC_PLACE_STATUSES),
  transitionStartDate: optionalDate,
  lastProhibitedSubstanceDate: optionalDate,
  organicEligibilityDate: optionalDate,
  certifiedOrganicSinceDate: optionalDate,
  boundaryDescription: optionalTrimmedText,
  bufferDescription: optionalTrimmedText,
  adjacentLandUse: optionalTrimmedText,
  contaminationRisks: optionalTrimmedText,
  certifierApproved: z.boolean().default(false),
  certifierNotes: optionalTrimmedText,
});

export const organicBoundaryEvidenceInputSchema = z.object({
  farmId: z.string().min(1),
  placeId: z.string().min(1, "Choose a farm place."),
  evidenceType: z.enum(ORGANIC_BOUNDARY_EVIDENCE_TYPES),
  description: requiredTrimmedText,
  attachmentUri: optionalTrimmedText,
  capturedAt: optionalDate,
});

export function calculateOrganicEligibilityDate(lastProhibitedSubstanceDate?: string): string | undefined {
  if (!lastProhibitedSubstanceDate) {
    return undefined;
  }

  const parsed = new Date(`${lastProhibitedSubstanceDate}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  parsed.setUTCFullYear(parsed.getUTCFullYear() + 3);
  return parsed.toISOString().slice(0, 10);
}
