import { z } from "zod";

import { MANUAL_RECORD_NOTE_MAX_LENGTH, pilotUnitSchema } from "./manualRecordValidation";

export const HARVEST_NOTE_MAX_LENGTH = MANUAL_RECORD_NOTE_MAX_LENGTH;

const requiredId = (message: string) =>
  z
    .string()
    .transform((value) => value.trim())
    .pipe(z.string().min(1, message));

export const harvestUnitSchema = pilotUnitSchema;

export const harvestNoteSchema = z
  .string()
  .transform((value) => value.trim())
  .pipe(z.string().max(HARVEST_NOTE_MAX_LENGTH, "Your note is too long."))
  .transform((value) => (value.length > 0 ? value : undefined));

export const harvestInputSchema = z.object({
  cropId: requiredId("Choose a crop."),
  sourceLocationId: requiredId("Choose where this harvest came from."),
  quantityText: z
    .string()
    .transform((value) => Number(value.trim()))
    .pipe(z.number({ message: "Enter an amount greater than zero." }).positive("Enter an amount greater than zero.")),
  unit: harvestUnitSchema,
  note: harvestNoteSchema.optional().default(""),
});

export interface HarvestInput {
  cropId: string;
  sourceLocationId: string;
  quantityText: string;
  unit: string;
  note?: string;
}

export type ParsedHarvestInput = z.output<typeof harvestInputSchema>;

export function parseHarvestInput(input: HarvestInput): ParsedHarvestInput {
  return harvestInputSchema.parse(input);
}
