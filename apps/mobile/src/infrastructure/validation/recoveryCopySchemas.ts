import { z } from "zod";

import {
  MOBILE_PILOT_APP_DATA_SCHEMA_VERSION,
  MOBILE_PILOT_RECOVERY_COPY_EXPORT_VERSION,
} from "../../domain/export/MobilePilotRecoveryCopy";
import { harvestUnitSchema } from "../../domain/validation/harvestValidation";

const isoDateTimeString = z.string().min(1);

const farmSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  createdAt: isoDateTimeString,
});

const locationSchema = z.object({
  id: z.string().min(1),
  farmId: z.string().min(1),
  name: z.string().min(1),
  createdAt: isoDateTimeString,
});

const trackedItemSchema = z.object({
  id: z.string().min(1),
  farmId: z.string().min(1),
  kind: z.enum(["crop", "material", "countableItem"]),
  name: z.string().min(1),
  createdAt: isoDateTimeString,
  defaultUnit: z.string().optional(),
});

const harvestRecordSchema = z.object({
  id: z.string().min(1),
  kind: z.literal("HarvestRecorded"),
  farmId: z.string().min(1),
  cropId: z.string().min(1),
  sourceLocationId: z.string().min(1),
  quantity: z.object({
    amount: z.number().positive(),
    unit: harvestUnitSchema,
  }),
  createdAt: isoDateTimeString,
  effectiveAt: isoDateTimeString,
  privacy: z.literal("privateToFarm"),
  note: z.string().optional(),
});

const materialUseRecordSchema = z.object({
  id: z.string().min(1),
  kind: z.literal("MaterialUseRecorded"),
  farmId: z.string().min(1),
  materialId: z.string().min(1),
  quantity: z.object({
    amount: z.number().positive(),
    unit: harvestUnitSchema,
  }),
  useLocationId: z.string().optional(),
  createdAt: isoDateTimeString,
  effectiveAt: isoDateTimeString,
  privacy: z.literal("privateToFarm"),
  note: z.string().optional(),
});

const inventoryCountRecordSchema = z.object({
  id: z.string().min(1),
  kind: z.literal("InventoryCountRecorded"),
  farmId: z.string().min(1),
  trackedItemId: z.string().min(1),
  observedQuantity: z.object({
    amount: z.number().min(0),
    unit: harvestUnitSchema,
  }),
  locationId: z.string().optional(),
  createdAt: isoDateTimeString,
  effectiveAt: isoDateTimeString,
  privacy: z.literal("privateToFarm"),
  note: z.string().optional(),
});

export const mobilePilotRecoveryCopySchema = z.object({
  exportVersion: z.literal(MOBILE_PILOT_RECOVERY_COPY_EXPORT_VERSION),
  createdAt: isoDateTimeString,
  appDataSchemaVersion: z.literal(MOBILE_PILOT_APP_DATA_SCHEMA_VERSION),
  farm: farmSchema,
  locations: z.array(locationSchema),
  trackedItems: z.array(trackedItemSchema),
  harvestRecords: z.array(harvestRecordSchema),
  materialUseRecords: z.array(materialUseRecordSchema),
  inventoryCountRecords: z.array(inventoryCountRecordSchema),
});
