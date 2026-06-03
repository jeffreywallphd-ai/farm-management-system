import { z } from "zod";

import {
  INSPECTION_READINESS_CATEGORIES,
  ORGANIC_OSP_SECTION_TYPES,
  ORGANIC_READINESS_STATUSES,
} from "../organic/OrganicSystemPlan";
import { parseAttachmentIdsText } from "./organicInputValidation";

const optionalTrimmedText = z.string().trim().optional().transform((value) => value || undefined);

export const organicSystemPlanSectionInputSchema = z.object({
  farmId: z.string().min(1),
  id: optionalTrimmedText,
  sectionType: z.enum(ORGANIC_OSP_SECTION_TYPES),
  title: z.string().trim().min(1, "Add a section title."),
  narrative: z.string().trim().min(1, "Add OSP notes for this section."),
  readinessStatus: z.enum(ORGANIC_READINESS_STATUSES),
  evidenceAttachmentIdsText: optionalTrimmedText,
  notes: optionalTrimmedText,
});

export const organicInspectionReadinessItemInputSchema = z.object({
  farmId: z.string().min(1),
  id: optionalTrimmedText,
  category: z.enum(INSPECTION_READINESS_CATEGORIES),
  prompt: z.string().trim().min(1, "Add an inspection prompt."),
  readinessStatus: z.enum(ORGANIC_READINESS_STATUSES),
  notes: optionalTrimmedText,
  evidenceAttachmentIdsText: optionalTrimmedText,
});

export { parseAttachmentIdsText };
