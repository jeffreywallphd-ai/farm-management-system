import { z } from "zod";

import {
  ORGANIC_CERTIFICATION_SCOPE_STATUSES,
  ORGANIC_CERTIFICATION_SCOPE_TYPES,
  ORGANIC_OPERATION_STATUSES,
} from "../organic/OrganicCertification";

export const organicOperationStatusSchema = z.enum(ORGANIC_OPERATION_STATUSES);
export const organicCertificationScopeTypeSchema = z.enum(ORGANIC_CERTIFICATION_SCOPE_TYPES);
export const organicCertificationScopeStatusSchema = z.enum(ORGANIC_CERTIFICATION_SCOPE_STATUSES);

const optionalTextSchema = z
  .string()
  .transform((value) => value.trim())
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined));

const optionalDateTextSchema = optionalTextSchema.pipe(
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD.")
    .optional(),
);

export const organicOperationProfileInputSchema = z.object({
  organicStatus: organicOperationStatusSchema,
  certifierName: optionalTextSchema,
  certifierContact: optionalTextSchema,
  certificateNumber: optionalTextSchema,
  certificateEffectiveDate: optionalDateTextSchema,
  annualUpdateDueDate: optionalDateTextSchema,
  inspectionDueWindow: optionalTextSchema,
  recordRetentionYears: z.coerce
    .number()
    .int("Use a whole number of years.")
    .min(1, "Use at least 1 year.")
    .max(20, "Use 20 years or fewer."),
  notes: optionalTextSchema,
  enabledScopes: z.array(organicCertificationScopeTypeSchema).default([]),
});

export function defaultRecordRetentionYearsForStatus(status: string): number {
  return status === "exempt" ? 3 : 5;
}
