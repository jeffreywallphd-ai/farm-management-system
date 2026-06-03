import { z } from "zod";

import { ORGANIC_INPUT_APPROVAL_STATUSES, ORGANIC_INPUT_CATEGORIES } from "../organic/OrganicInput";

const optionalTrimmedText = z.string().trim().optional().transform((value) => value || undefined);
const requiredTrimmedText = z.string().trim().min(1, "Add a name.");
const optionalDate = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined)
  .refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), "Use dates as YYYY-MM-DD.");

export const organicInputInputSchema = z.object({
  farmId: z.string().min(1),
  id: z.string().optional(),
  materialId: optionalTrimmedText,
  name: requiredTrimmedText,
  inputCategory: z.enum(ORGANIC_INPUT_CATEGORIES),
  manufacturer: optionalTrimmedText,
  supplier: optionalTrimmedText,
  composition: optionalTrimmedText,
  source: optionalTrimmedText,
  approvalStatus: z.enum(ORGANIC_INPUT_APPROVAL_STATUSES),
  approvalEvidenceAttachmentIdsText: optionalTrimmedText,
  certifierApprovalDate: optionalDate,
  approvalExpirationDate: optionalDate,
  restrictions: optionalTrimmedText,
  notes: optionalTrimmedText,
});

export const organicInputApplicationInputSchema = z.object({
  farmId: z.string().min(1),
  inputId: z.string().min(1, "Choose an organic input."),
  placeId: optionalTrimmedText,
  cropId: optionalTrimmedText,
  date: optionalDate,
  quantity: optionalTrimmedText,
  unit: optionalTrimmedText,
  rate: optionalTrimmedText,
  reason: optionalTrimmedText,
  targetProblem: optionalTrimmedText,
  weatherNotes: optionalTrimmedText,
  appliedBy: optionalTrimmedText,
  evidenceAttachmentIdsText: optionalTrimmedText,
  linkedFarmNoteId: optionalTrimmedText,
});

export function parseAttachmentIdsText(value?: string): string[] {
  return (value ?? "")
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}
