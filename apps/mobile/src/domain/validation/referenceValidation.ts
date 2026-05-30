import { z } from "zod";

import { FARM_PLACE_KINDS } from "../farm/FarmLocation";

export const REFERENCE_NAME_MAX_LENGTH = 80;

export const trackedItemKindSchema = z.enum(["crop", "material", "countableItem"]);
export const farmPlaceKindSchema = z.enum(FARM_PLACE_KINDS, {
  message: "Choose what kind of place this is.",
});

export const referenceNameSchema = z
  .string()
  .transform((value) => value.trim())
  .pipe(
    z
      .string()
      .min(1, "Enter a name.")
      .max(REFERENCE_NAME_MAX_LENGTH, `Use ${REFERENCE_NAME_MAX_LENGTH} characters or fewer.`),
  );

export function parseReferenceName(value: string): string {
  return referenceNameSchema.parse(value);
}

export const farmPlaceInputSchema = z.object({
  name: referenceNameSchema,
  kind: farmPlaceKindSchema,
  parentId: z
    .string()
    .transform((value) => value.trim())
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
});
