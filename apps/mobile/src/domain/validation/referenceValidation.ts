import { z } from "zod";

export const REFERENCE_NAME_MAX_LENGTH = 80;

export const trackedItemKindSchema = z.enum(["crop", "material", "countableItem"]);

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
