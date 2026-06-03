import { z } from "zod";

import { ORGANIC_ADVANCED_SCOPE_TYPES } from "../organic/OrganicAdvancedScope";
import { ORGANIC_READINESS_STATUSES } from "../organic/OrganicSystemPlan";
import { parseAttachmentIdsText } from "./organicInputValidation";

const optionalTrimmedText = z.string().trim().optional().transform((value) => value || undefined);

export const organicAdvancedScopeRecordInputSchema = z.object({
  farmId: z.string().min(1),
  id: optionalTrimmedText,
  scopeType: z.enum(ORGANIC_ADVANCED_SCOPE_TYPES),
  topic: z.string().trim().min(1, "Add a topic."),
  description: z.string().trim().min(1, "Add a description."),
  readinessStatus: z.enum(ORGANIC_READINESS_STATUSES),
  evidenceAttachmentIdsText: optionalTrimmedText,
  notes: optionalTrimmedText,
});

export { parseAttachmentIdsText };
