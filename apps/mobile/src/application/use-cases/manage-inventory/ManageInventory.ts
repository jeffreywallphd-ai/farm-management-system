import { z } from "zod";

import type { FarmId } from "../../../domain/farm/Farm";
import type { TrackedItem } from "../../../domain/farm/TrackedItem";
import type { InventoryItem, InventoryMaterialUsageSummary } from "../../../domain/inventory/Inventory";
import {
  commonOptionLabelFor,
  equipmentCatalogCategories,
  materialCatalogCategories,
  OTHER_INVENTORY_OPTION_VALUE,
} from "../../../domain/inventory/InventoryCatalogOptions";
import {
  saveInventoryEquipmentInputSchema,
  saveInventoryMaterialInputSchema,
  type SaveInventoryEquipmentInput,
  type SaveInventoryMaterialInput,
} from "../../../domain/validation/inventoryValidation";
import type { Clock } from "../../ports/Clock";
import type { FarmReferenceRepository } from "../../ports/FarmReferenceRepository";
import type { IdGenerator } from "../../ports/IdGenerator";
import type { InventoryRepository } from "../../ports/InventoryRepository";
import type { LocalRecordRepository } from "../../ports/LocalRecordRepository";

export interface InventoryCatalog {
  items: InventoryItem[];
  materialUsage: InventoryMaterialUsageSummary[];
}

export async function listInventoryCatalog(
  input: { farmId: FarmId },
  dependencies: {
    farmReferenceRepository: FarmReferenceRepository;
    inventoryRepository: InventoryRepository;
    localRecordRepository: LocalRecordRepository;
  },
): Promise<InventoryCatalog> {
  const [profiles, trackedMaterials, materialUseRecords] = await Promise.all([
    dependencies.inventoryRepository.listInventoryItems(input.farmId),
    dependencies.farmReferenceRepository.listTrackedItems(input.farmId, "material"),
    dependencies.localRecordRepository.listMaterialUseRecordsForExport(input.farmId),
  ]);
  const profileByTrackedMaterial = new Map(
    profiles.filter((profile) => profile.kind === "material" && profile.trackedItemId).map((profile) => [profile.trackedItemId, profile]),
  );
  const catalogMaterials = trackedMaterials.map((material) => {
    const profile = profileByTrackedMaterial.get(material.id);
    return profile
      ? { ...profile, name: material.name, defaultUnit: profile.defaultUnit ?? material.defaultUnit }
      : inventoryItemFromTrackedMaterial(material);
  });
  const equipment = profiles.filter((profile) => profile.kind === "equipment");

  return {
    items: [...catalogMaterials, ...equipment].sort((left, right) => left.name.localeCompare(right.name)),
    materialUsage: summarizeMaterialUse(materialUseRecords, trackedMaterials),
  };
}

export async function saveInventoryMaterial(
  input: SaveInventoryMaterialInput & { farmId: FarmId },
  dependencies: {
    clock: Clock;
    farmReferenceRepository: FarmReferenceRepository;
    idGenerator: IdGenerator;
    inventoryRepository: InventoryRepository;
  },
): Promise<InventoryItem> {
  const parsed = saveInventoryMaterialInputSchema.parse(input);
  const trackedMaterials = await dependencies.farmReferenceRepository.listTrackedItems(input.farmId, "material");
  let trackedMaterial = parsed.trackedItemId
    ? trackedMaterials.find((material) => material.id === parsed.trackedItemId)
    : undefined;

  if (parsed.trackedItemId && !trackedMaterial) {
    throw new z.ZodError([
      { code: "custom", message: "Choose a saved material or add a new one.", path: ["trackedItemId"], input: parsed.trackedItemId },
    ]);
  }

  const resolvedMaterialName = resolveCatalogItemName({
    categories: materialCatalogCategories,
    category: parsed.category,
    commonItemKey: parsed.commonItemKey,
    customName: parsed.name,
  });

  if (!trackedMaterial) {
    if (!resolvedMaterialName) {
      throw new z.ZodError([{ code: "custom", message: "Enter a material name.", path: ["name"], input: parsed.name }]);
    }
    const now = dependencies.clock.now().toISOString();
    trackedMaterial = {
      id: dependencies.idGenerator.newId(),
      farmId: input.farmId,
      kind: "material",
      name: resolvedMaterialName,
      createdAt: now,
      defaultUnit: parsed.defaultUnit ?? parsed.currentUnit,
    };
    await dependencies.farmReferenceRepository.addTrackedItem(trackedMaterial);
  }

  const now = dependencies.clock.now().toISOString();
  const existingProfile = await dependencies.inventoryRepository.getInventoryItemByTrackedItemId(input.farmId, trackedMaterial.id);
  const item: InventoryItem = {
    id: existingProfile?.id ?? dependencies.idGenerator.newId(),
    farmId: input.farmId,
    kind: "material",
    trackedItemId: trackedMaterial.id,
    name: trackedMaterial.name,
    category: parsed.category ?? existingProfile?.category,
    commonItemKey: parsed.commonItemKey ?? existingProfile?.commonItemKey,
    acquisitionSource: parsed.acquisitionSource,
    status: "active",
    storageLocationId: parsed.storageLocationId,
    defaultUnit: parsed.defaultUnit ?? parsed.currentUnit ?? trackedMaterial.defaultUnit,
    currentAmount: parsed.currentAmount,
    currentUnit: parsed.currentUnit ?? parsed.defaultUnit ?? trackedMaterial.defaultUnit,
    supplier: parsed.supplier,
    reorderPoint: parsed.reorderPoint,
    notes: parsed.notes,
    purchaseNoteFarmEventId: parsed.purchaseNoteFarmEventId ?? existingProfile?.purchaseNoteFarmEventId,
    organicRelevance: parsed.organicRelevance,
    organicApprovalStatus: organicApprovalStatusFor(parsed.organicRelevance, parsed.organicApprovalStatus),
    organicRegulationNotes: parsed.organicRegulationNotes,
    organicEvidenceNotes: parsed.organicEvidenceNotes,
    cleaningRequired: false,
    createdAt: existingProfile?.createdAt ?? now,
    updatedAt: now,
  };

  await dependencies.inventoryRepository.saveInventoryItem(item);
  return item;
}

export async function saveInventoryEquipment(
  input: SaveInventoryEquipmentInput & { farmId: FarmId },
  dependencies: {
    clock: Clock;
    idGenerator: IdGenerator;
    inventoryRepository: InventoryRepository;
  },
): Promise<InventoryItem> {
  const parsed = saveInventoryEquipmentInputSchema.parse(input);
  const now = dependencies.clock.now().toISOString();
  const resolvedName = resolveCatalogItemName({
    categories: equipmentCatalogCategories,
    category: parsed.category,
    commonItemKey: parsed.commonItemKey,
    customName: parsed.name,
  });

  if (!resolvedName) {
    throw new z.ZodError([{ code: "custom", message: "Enter an equipment name.", path: ["name"], input: parsed.name }]);
  }

  const item: InventoryItem = {
    id: dependencies.idGenerator.newId(),
    farmId: input.farmId,
    kind: "equipment",
    name: resolvedName,
    category: parsed.category,
    commonItemKey: parsed.commonItemKey,
    acquisitionSource: parsed.acquisitionSource,
    status: "active",
    storageLocationId: parsed.storageLocationId,
    currentAmount: parsed.currentAmount,
    currentUnit: parsed.currentUnit,
    supplier: parsed.supplier,
    notes: parsed.notes,
    purchaseNoteFarmEventId: parsed.purchaseNoteFarmEventId,
    organicRelevance: parsed.organicRelevance,
    organicApprovalStatus: organicApprovalStatusFor(parsed.organicRelevance, parsed.organicApprovalStatus),
    organicRegulationNotes: parsed.organicRegulationNotes,
    organicEvidenceNotes: parsed.organicEvidenceNotes,
    equipmentContactRisk: parsed.equipmentContactRisk,
    cleaningRequired: parsed.cleaningRequired,
    createdAt: now,
    updatedAt: now,
  };

  await dependencies.inventoryRepository.saveInventoryItem(item);
  return item;
}

function inventoryItemFromTrackedMaterial(material: TrackedItem): InventoryItem {
  return {
    id: material.id,
    farmId: material.farmId,
    kind: "material",
    trackedItemId: material.id,
    name: material.name,
    status: "active",
    defaultUnit: material.defaultUnit,
    acquisitionSource: "alreadyOwned",
    organicRelevance: "none",
    organicApprovalStatus: "notNeeded",
    cleaningRequired: false,
    purchaseNoteFarmEventId: undefined,
    createdAt: material.createdAt,
    updatedAt: material.createdAt,
  };
}

function resolveCatalogItemName({
  categories,
  category,
  commonItemKey,
  customName,
}: {
  categories: typeof materialCatalogCategories;
  category?: string;
  commonItemKey?: string;
  customName?: string;
}): string | undefined {
  if (customName) {
    return customName;
  }

  if (!commonItemKey || commonItemKey === OTHER_INVENTORY_OPTION_VALUE) {
    return undefined;
  }

  return commonOptionLabelFor(categories, category, commonItemKey);
}

function organicApprovalStatusFor(
  relevance: InventoryItem["organicRelevance"],
  status: InventoryItem["organicApprovalStatus"],
): InventoryItem["organicApprovalStatus"] {
  return relevance === "none" ? "notNeeded" : status === "notNeeded" ? "unknown" : status;
}

function summarizeMaterialUse(records: Awaited<ReturnType<LocalRecordRepository["listMaterialUseRecordsForExport"]>>, materials: TrackedItem[]): InventoryMaterialUsageSummary[] {
  const materialNameById = new Map(materials.map((material) => [material.id, material.name]));
  const summaries = new Map<string, InventoryMaterialUsageSummary>();

  for (const record of records) {
    const key = `${record.materialId}:${record.quantity.unit}`;
    const current = summaries.get(key);
    const totalUsed = (current?.totalUsed ?? 0) + record.quantity.amount;
    summaries.set(key, {
      materialId: record.materialId,
      materialName: materialNameById.get(record.materialId) ?? "Material",
      unit: record.quantity.unit,
      totalUsed,
      useCount: (current?.useCount ?? 0) + 1,
      lastUsedAt:
        !current?.lastUsedAt || record.effectiveAt > current.lastUsedAt ? record.effectiveAt : current.lastUsedAt,
    });
  }

  return Array.from(summaries.values()).sort((left, right) => left.materialName.localeCompare(right.materialName));
}
