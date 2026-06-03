import { z } from "zod";

import {
  ORGANIC_EVIDENCE_CATEGORIES,
  ORGANIC_EVIDENCE_RECORD_TYPES,
  ORGANIC_EVIDENCE_ROLES,
} from "../organic/OrganicEvidenceLink";

const optionalTrimmedText = z.string().trim().optional().transform((value) => value || undefined);

export const organicEvidenceLinkInputSchema = z
  .object({
    farmId: z.string().min(1),
    farmEventId: z.string().min(1, "Choose a farm note."),
    category: z.enum(ORGANIC_EVIDENCE_CATEGORIES),
    linkedRecordType: z.enum(ORGANIC_EVIDENCE_RECORD_TYPES).optional(),
    linkedRecordId: optionalTrimmedText,
    evidenceRole: z.enum(ORGANIC_EVIDENCE_ROLES),
    notes: optionalTrimmedText,
  })
  .refine((value) => !value.linkedRecordId || value.linkedRecordType, {
    message: "Choose what kind of organic record this note supports.",
    path: ["linkedRecordType"],
  });

export type OrganicEvidenceLinkInput = z.input<typeof organicEvidenceLinkInputSchema>;
export type ParsedOrganicEvidenceLinkInput = z.output<typeof organicEvidenceLinkInputSchema>;
