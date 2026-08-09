import assert from "node:assert/strict";
import test from "node:test";

import { recordMaterialUse } from "./record-material-use/RecordMaterialUse";
import {
  listInventoryCatalog,
  saveInventoryEquipment,
  saveInventoryMaterial,
} from "./manage-inventory/ManageInventory";
import { InMemoryFarmReferenceRepository } from "../../testing/fakes/InMemoryFarmReferenceRepository";
import { InMemoryInventoryRepository } from "../../testing/fakes/InMemoryInventoryRepository";
import { InMemoryLocalRecordRepository } from "../../testing/fakes/InMemoryLocalRecordRepository";

function dependencies() {
  let nextId = 1;
  const farm = { id: "farm-1", name: "Green Hill Farm", createdAt: "2026-06-04T09:00:00.000Z" };
  const location = { id: "place-1", farmId: farm.id, name: "Barn", kind: "barnShed" as const, createdAt: farm.createdAt };
  const farmReferenceRepository = new InMemoryFarmReferenceRepository();
  const inventoryRepository = new InMemoryInventoryRepository();
  const localRecordRepository = new InMemoryLocalRecordRepository({ locations: [location], trackedItems: [] });
  const deps = {
    clock: { now: () => new Date("2026-06-04T10:00:00.000Z") },
    farmReferenceRepository,
    idGenerator: { newId: () => `local-${nextId++}` },
    inventoryRepository,
    localRecordRepository,
  };

  return { ...deps, farm, location };
}

test("saving a farm input creates a tracked material and inventory profile", async () => {
  const deps = dependencies();
  await deps.farmReferenceRepository.createFarm(deps.farm);
  await deps.farmReferenceRepository.addLocation(deps.location);

  const item = await saveInventoryMaterial(
    {
      farmId: deps.farm.id,
      category: "soilFertility",
      commonItemKey: "compost",
      acquisitionSource: "selfProduced",
      currentAmount: "12",
      defaultUnit: "bag",
      currentUnit: "bag",
      storageLocationId: deps.location.id,
      supplier: "Local compost yard",
      organicRelevance: "soilAmendment",
      organicApprovalStatus: "needsReview",
      organicRegulationNotes: "Confirm under 7 CFR 205.203 before organic use.",
      organicEvidenceNotes: "Label photo should be saved with farm notes.",
      purchaseNoteFarmEventId: "farm-event-1",
    },
    deps,
  );

  const materials = await deps.farmReferenceRepository.listTrackedItems(deps.farm.id, "material");
  assert.equal(materials.length, 1);
  assert.equal(materials[0].name, "Compost");
  assert.equal(item.trackedItemId, materials[0].id);
  assert.equal(item.category, "soilFertility");
  assert.equal(item.commonItemKey, "compost");
  assert.equal(item.acquisitionSource, "selfProduced");
  assert.equal(item.currentAmount, 12);
  assert.equal(item.currentUnit, "bag");
  assert.equal(item.organicApprovalStatus, "needsReview");
  assert.equal(item.purchaseNoteFarmEventId, "farm-event-1");
});

test("other farm input choices require and preserve a custom catalog name", async () => {
  const deps = dependencies();
  await deps.farmReferenceRepository.createFarm(deps.farm);

  const item = await saveInventoryMaterial(
    {
      farmId: deps.farm.id,
      category: "mulchCovers",
      commonItemKey: "other",
      name: "Reused cardboard sheets",
      acquisitionSource: "donation",
      currentAmount: "30",
      currentUnit: "each",
    },
    deps,
  );

  const materials = await deps.farmReferenceRepository.listTrackedItems(deps.farm.id, "material");
  assert.equal(materials[0].name, "Reused cardboard sheets");
  assert.equal(item.name, "Reused cardboard sheets");
  assert.equal(item.acquisitionSource, "donation");
});

test("inventory catalog includes material usage totals without converting units", async () => {
  const deps = dependencies();
  await deps.farmReferenceRepository.createFarm(deps.farm);
  await deps.farmReferenceRepository.addLocation(deps.location);
  const item = await saveInventoryMaterial(
    { farmId: deps.farm.id, category: "soilFertility", commonItemKey: "fishEmulsion", defaultUnit: "gal" },
    deps,
  );
  const material = (await deps.farmReferenceRepository.listTrackedItems(deps.farm.id, "material"))[0];
  deps.localRecordRepository = new InMemoryLocalRecordRepository({ locations: [deps.location], trackedItems: [material] });

  await recordMaterialUse(
    { farmId: deps.farm.id, materialId: item.trackedItemId ?? "", quantityText: "1.5", unit: "gal", useLocationId: deps.location.id },
    deps,
  );
  await recordMaterialUse(
    { farmId: deps.farm.id, materialId: item.trackedItemId ?? "", quantityText: "2", unit: "gal", useLocationId: deps.location.id },
    deps,
  );

  const catalog = await listInventoryCatalog({ farmId: deps.farm.id }, deps);

  assert.equal(catalog.items[0].name, "Fish emulsion");
  assert.equal(catalog.materialUsage[0].totalUsed, 3.5);
  assert.equal(catalog.materialUsage[0].unit, "gal");
  assert.equal(catalog.materialUsage[0].useCount, 2);
});

test("saving equipment records organic contact and cleaning details without creating a new record type", async () => {
  const deps = dependencies();
  await deps.farmReferenceRepository.createFarm(deps.farm);

  const item = await saveInventoryEquipment(
    {
      farmId: deps.farm.id,
      category: "harvestWashPack",
      commonItemKey: "washTable",
      acquisitionSource: "alreadyOwned",
      currentAmount: "1",
      currentUnit: "each",
      organicRelevance: "sharedEquipment",
      organicApprovalStatus: "needsReview",
      equipmentContactRisk: "Shared with nonorganic bins.",
      cleaningRequired: true,
      purchaseNoteFarmEventId: "farm-event-equipment-1",
    },
    deps,
  );

  assert.equal(item.kind, "equipment");
  assert.equal(item.name, "Wash table");
  assert.equal(item.category, "harvestWashPack");
  assert.equal(item.commonItemKey, "washTable");
  assert.equal(item.acquisitionSource, "alreadyOwned");
  assert.equal(item.currentAmount, 1);
  assert.equal(item.currentUnit, "each");
  assert.equal(item.cleaningRequired, true);
  assert.equal(item.trackedItemId, undefined);
  assert.equal(item.purchaseNoteFarmEventId, "farm-event-equipment-1");
});
