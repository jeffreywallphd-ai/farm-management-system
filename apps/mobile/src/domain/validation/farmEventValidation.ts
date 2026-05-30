import { z } from "zod";

import { FARM_EVENT_ATTACHMENT_KINDS, FARM_EVENT_TYPES } from "../events/FarmEvent";

export const MAX_FARM_EVENT_NOTE_LENGTH = 1000;

export const farmEventTypeSchema = z.enum(FARM_EVENT_TYPES, {
  message: "Choose what kind of note this is.",
});

export const farmEventAttachmentKindSchema = z.enum(FARM_EVENT_ATTACHMENT_KINDS, {
  message: "Choose a supported attachment type.",
});

const optionalTrimmedText = z
  .string()
  .transform((value) => value.trim())
  .optional()
  .transform((value) => (value ? value : undefined));

export const farmEventAttachmentInputSchema = z.object({
  kind: farmEventAttachmentKindSchema,
  localUri: z
    .string()
    .transform((value) => value.trim())
    .pipe(
      z
        .string()
        .min(1, "Attachment file is missing.")
        .refine((value) => !/^https?:\/\//i.test(value), "Use a saved local file."),
    ),
  mimeType: optionalTrimmedText,
  durationMs: z.number().int().nonnegative().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  fileSizeBytes: z.number().int().nonnegative().optional(),
});

export const farmEventInputSchema = z
  .object({
    eventType: farmEventTypeSchema.default("general"),
    placeId: optionalTrimmedText,
    note: z
      .string()
      .transform((value) => value.trim())
      .pipe(z.string().max(MAX_FARM_EVENT_NOTE_LENGTH, "Your note is too long."))
      .optional()
      .transform((value) => (value ? value : undefined)),
    attachments: z.array(farmEventAttachmentInputSchema).min(1, "Add a voice memo before saving."),
  })
  .refine((value) => value.attachments.some((attachment) => attachment.kind === "voiceMemo"), {
    message: "Add a voice memo before saving.",
    path: ["attachments"],
  });

export type FarmEventInput = z.input<typeof farmEventInputSchema>;
export type ParsedFarmEventInput = z.output<typeof farmEventInputSchema>;

export function parseFarmEventInput(input: FarmEventInput): ParsedFarmEventInput {
  return farmEventInputSchema.parse(input);
}

