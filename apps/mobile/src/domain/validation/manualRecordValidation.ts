import { z } from "zod";

import { PILOT_UNITS } from "../quantities/PilotUnit";

export const MANUAL_RECORD_NOTE_MAX_LENGTH = 500;

const requiredId = (message: string) =>
  z
    .string()
    .transform((value) => value.trim())
    .pipe(z.string().min(1, message));

const optionalId = z
  .string()
  .transform((value) => value.trim())
  .transform((value) => (value.length > 0 ? value : undefined));

const noteSchema = z
  .string()
  .transform((value) => value.trim())
  .pipe(z.string().max(MANUAL_RECORD_NOTE_MAX_LENGTH, "Your note is too long."))
  .transform((value) => (value.length > 0 ? value : undefined));

function numericText(message: string) {
  return z
    .string()
    .transform((value) => value.trim())
    .pipe(z.string().min(1, message))
    .transform((value) => Number(value))
    .pipe(z.number({ message }).refine((value) => Number.isFinite(value), message));
}

const positiveQuantity = numericText("Enter an amount greater than zero.").pipe(
  z.number().positive("Enter an amount greater than zero."),
);

const zeroOrMoreQuantity = numericText("Enter a count of zero or more.").pipe(
  z.number().min(0, "Enter a count of zero or more."),
);

export const pilotUnitSchema = z.enum(PILOT_UNITS, { message: "Choose a unit." });

export const materialUseInputSchema = z.object({
  materialId: requiredId("Choose a material."),
  quantityText: positiveQuantity,
  unit: pilotUnitSchema,
  useLocationId: optionalId.optional().default(""),
  note: noteSchema.optional().default(""),
});

export const inventoryCountInputSchema = z.object({
  trackedItemId: requiredId("Choose an item to count."),
  quantityText: zeroOrMoreQuantity,
  unit: pilotUnitSchema,
  locationId: optionalId.optional().default(""),
  note: noteSchema.optional().default(""),
});
export interface MaterialUseInput {
  materialId: string;
  quantityText: string;
  unit: string;
  useLocationId?: string;
  note?: string;
}

export interface InventoryCountInput {
  trackedItemId: string;
  quantityText: string;
  unit: string;
  locationId?: string;
  note?: string;
}

export type ParsedMaterialUseInput = z.output<typeof materialUseInputSchema>;
export type ParsedInventoryCountInput = z.output<typeof inventoryCountInputSchema>;

export function parseMaterialUseInput(input: MaterialUseInput): ParsedMaterialUseInput {
  return materialUseInputSchema.parse(input);
}

export function parseInventoryCountInput(input: InventoryCountInput): ParsedInventoryCountInput {
  return inventoryCountInputSchema.parse(input);
}
