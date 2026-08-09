import { z } from "zod";

import { pilotUnitSchema } from "./manualRecordValidation";

export const inventoryItemKindSchema = z.enum(["material", "equipment"]);
export const inventoryAcquisitionSourceSchema = z.enum(["purchase", "donation", "selfProduced", "alreadyOwned"]);
export const organicInventoryRelevanceSchema = z.enum([
  "none",
  "cropProductionInput",
  "soilAmendment",
  "pestControlInput",
  "seedOrPlantingStock",
  "cleaningOrSanitation",
  "packagingOrHandling",
  "sharedEquipment",
]);
export const organicInventoryApprovalStatusSchema = z.enum([
  "notNeeded",
  "unknown",
  "needsReview",
  "approvedByCertifier",
  "omriListed",
  "wsdaListed",
  "allowedByNationalList",
  "restricted",
  "prohibited",
]);

const optionalTrimmedTextSchema = z
  .string()
  .transform((value) => value.trim())
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined));

const inventoryNameSchema = z
  .string()
  .transform((value) => value.trim())
  .pipe(z.string().min(1, "Enter a name.").max(80, "Use 80 characters or fewer."));

const optionalInventoryKeySchema = z
  .string()
  .transform((value) => value.trim())
  .pipe(z.string().max(80, "Use 80 characters or fewer."))
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined));

const optionalCurrentAmountSchema = z
  .string()
  .transform((value) => value.trim())
  .optional()
  .transform((value) => (value && value.length > 0 ? Number(value) : undefined))
  .pipe(z.number({ message: "Enter a valid amount." }).min(0, "Enter zero or more.").optional());

const sharedInventoryInputFields = {
  category: optionalInventoryKeySchema,
  commonItemKey: optionalInventoryKeySchema,
  acquisitionSource: inventoryAcquisitionSourceSchema.default("alreadyOwned"),
  storageLocationId: optionalTrimmedTextSchema,
  currentAmount: optionalCurrentAmountSchema,
  currentUnit: pilotUnitSchema.optional(),
  supplier: optionalTrimmedTextSchema,
  notes: optionalTrimmedTextSchema,
  purchaseNoteFarmEventId: optionalTrimmedTextSchema,
  organicRelevance: organicInventoryRelevanceSchema.default("none"),
  organicApprovalStatus: organicInventoryApprovalStatusSchema.default("notNeeded"),
  organicRegulationNotes: optionalTrimmedTextSchema,
  organicEvidenceNotes: optionalTrimmedTextSchema,
};

export const saveInventoryMaterialInputSchema = z
  .object({
    ...sharedInventoryInputFields,
    trackedItemId: optionalTrimmedTextSchema,
    name: inventoryNameSchema.optional(),
    defaultUnit: pilotUnitSchema.optional(),
    reorderPoint: optionalTrimmedTextSchema,
  })
  .superRefine(requireUnitForCurrentAmount);

export const saveInventoryEquipmentInputSchema = z
  .object({
    ...sharedInventoryInputFields,
    name: inventoryNameSchema.optional(),
    equipmentContactRisk: optionalTrimmedTextSchema,
    cleaningRequired: z.boolean().default(false),
  })
  .superRefine(requireUnitForCurrentAmount);

function requireUnitForCurrentAmount(
  input: { currentAmount?: number; currentUnit?: string },
  context: z.RefinementCtx,
) {
  if (input.currentAmount !== undefined && !input.currentUnit) {
    context.addIssue({
      code: "custom",
      message: "Choose a unit for the amount.",
      path: ["currentUnit"],
    });
  }
}

export type SaveInventoryMaterialInput = z.input<typeof saveInventoryMaterialInputSchema>;
export type SaveInventoryEquipmentInput = z.input<typeof saveInventoryEquipmentInputSchema>;
