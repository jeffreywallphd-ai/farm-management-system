import { z } from "zod";

import { HARVEST_UNITS } from "../quantities/HarvestUnit";

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

const positiveQuantity = z
  .string()
  .transform((value) => Number(value.trim()))
  .pipe(z.number({ message: "Enter an amount greater than zero." }).positive("Enter an amount greater than zero."));

const zeroOrMoreQuantity = z
  .string()
  .transform((value) => Number(value.trim()))
  .pipe(z.number({ message: "Enter a count of zero or more." }).min(0, "Enter a count of zero or more."));

export const pilotUnitSchema = z.enum(HARVEST_UNITS, { message: "Choose a unit." });

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
