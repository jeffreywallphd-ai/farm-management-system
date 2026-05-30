import { z } from "zod";

import {
  FARM_EVENT_RECOVERY_PACKAGE_SCHEMA_VERSION,
  FARM_EVENT_RECOVERY_PACKAGE_VERSION,
} from "../../domain/export/FarmEventRecoveryPackage";
import { FARM_EVENT_ATTACHMENT_KINDS, FARM_EVENT_TYPES } from "../../domain/events/FarmEvent";
import { mobilePilotRecoveryCopySchema } from "./recoveryCopySchemas";

const isoDateTimeString = z.string().min(1);

const farmEventAttachmentSchema = z.object({
  id: z.string().min(1),
  farmId: z.string().min(1),
  eventId: z.string().min(1),
  kind: z.enum(FARM_EVENT_ATTACHMENT_KINDS),
  localUri: z.string().min(1),
  packagePath: z.string().min(1),
  mimeType: z.string().optional(),
  durationMs: z.number().int().nonnegative().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  fileSizeBytes: z.number().int().nonnegative().optional(),
  createdAt: isoDateTimeString,
});

const farmEventSchema = z.object({
  id: z.string().min(1),
  kind: z.literal("FarmEvent"),
  farmId: z.string().min(1),
  eventType: z.enum(FARM_EVENT_TYPES),
  placeId: z.string().optional(),
  note: z.string().optional(),
  capturedAt: isoDateTimeString,
  createdAt: isoDateTimeString,
  privacy: z.literal("privateToFarm"),
  schemaVersion: z.literal(1),
});

const packageLocationSchema = z.object({
  id: z.string().min(1),
  farmId: z.string().min(1),
  name: z.string().min(1),
  kind: z.string().min(1),
  parentId: z.string().optional(),
  createdAt: isoDateTimeString,
});

export const farmEventRecoveryPackageManifestSchema = z.object({
  packageVersion: z.literal(FARM_EVENT_RECOVERY_PACKAGE_VERSION),
  createdAt: isoDateTimeString,
  packageSchemaVersion: z.literal(FARM_EVENT_RECOVERY_PACKAGE_SCHEMA_VERSION),
  manualRecoveryCopy: mobilePilotRecoveryCopySchema,
  farmEvents: z.array(
    z.object({
      event: farmEventSchema,
      place: packageLocationSchema.optional(),
      attachments: z.array(farmEventAttachmentSchema),
    }),
  ),
  packageNotes: z.object({
    privateData: z.literal(true),
    userControlledExport: z.literal(true),
    importRestoreIncluded: z.literal(false),
    serverUploadIncluded: z.literal(false),
    aiInterpretationIncluded: z.literal(false),
  }),
});
