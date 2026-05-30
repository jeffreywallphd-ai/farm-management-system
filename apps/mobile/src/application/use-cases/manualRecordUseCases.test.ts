import assert from "node:assert/strict";
import test from "node:test";

import { createMobilePilotRecoveryCopy } from "./export-mobile-pilot-data/CreateHarvestRecoveryCopy";
import { listLocalActivityHistory } from "./view-local-history/ListLocalActivityHistory";
import { getLocalActivityDetail } from "./view-local-history/GetLocalActivityDetail";
import { recordHarvest } from "./record-harvest/RecordHarvest";
import { recordInventoryCount } from "./record-inventory-count/RecordInventoryCount";
import { recordMaterialUse } from "./record-material-use/RecordMaterialUse";
import type { ExportRepository, MobilePilotExportFile } from "../ports/ExportRepository";
import { serializeRecoveryCopy } from "../../infrastructure/export/JsonRecoveryCopyExporter";
import { InMemoryFarmReferenceRepository } from "../../testing/fakes/InMemoryFarmReferenceRepository";
import { InMemoryLocalRecordRepository } from "../../testing/fakes/InMemoryLocalRecordRepository";

async function seededManualPilot() {
  let nextId = 1;
  let nextHour = 10;
  const farm = { id: "farm-1", name: "Green Hill Farm", createdAt: "2026-05-29T09:00:00.000Z" };
  const location = { id: "location-1", farmId: farm.id, name: "North Field", kind: "field" as const, createdAt: farm.createdAt };
  const crop = { id: "crop-1", farmId: farm.id, kind: "crop" as const, name: "Kale", createdAt: farm.createdAt };
  const material = { id: "material-1", farmId: farm.id, kind: "material" as const, name: "Compost", createdAt: farm.createdAt };
  const countableItem = { id: "countable-1", farmId: farm.id, kind: "countableItem" as const, name: "Seedling trays", createdAt: farm.createdAt };
  const farmReferenceRepository = new InMemoryFarmReferenceRepository();
  await farmReferenceRepository.createFarm(farm);
  await farmReferenceRepository.addLocation(location);
  await farmReferenceRepository.addTrackedItem(crop);
  await farmReferenceRepository.addTrackedItem(material);
  await farmReferenceRepository.addTrackedItem(countableItem);
  const localRecordRepository = new InMemoryLocalRecordRepository({
    locations: [location],
    trackedItems: [crop, material, countableItem],
  });
  const dependencies = {
    clock: {
      now: () => new Date(`2026-05-29T${String(nextHour++).padStart(2, "0")}:00:00.000Z`),
    },
    farmReferenceRepository,
    idGenerator: { newId: () => `local-${nextId++}` },
    localRecordRepository,
  };

  return { ...dependencies, farm, location, crop, material, countableItem };
}

test("material use creates a private confirmed local record", async () => {
  const deps = await seededManualPilot();
  const record = await recordMaterialUse(
    {
      farmId: deps.farm.id,
      materialId: deps.material.id,
      quantityText: "2",
      unit: "bag",
      useLocationId: deps.location.id,
      note: " Side dressing ",
    },
    deps,
  );

  assert.equal(record.id, "local-1");
  assert.equal(record.kind, "MaterialUseRecorded");
  assert.deepEqual(record.quantity, { amount: 2, unit: "bag" });
  assert.equal(record.privacy, "privateToFarm");
  assert.equal(record.note, "Side dressing");
});

test("inventory count creates material and countable item observations and rejects crops", async () => {
  const deps = await seededManualPilot();
  const materialCount = await recordInventoryCount(
    {
      farmId: deps.farm.id,
      trackedItemId: deps.material.id,
      quantityText: "0",
      unit: "bag",
      locationId: deps.location.id,
      note: "",
    },
    deps,
  );
  const trayCount = await recordInventoryCount(
    {
      farmId: deps.farm.id,
      trackedItemId: deps.countableItem.id,
      quantityText: "18",
      unit: "tray",
      locationId: "",
      note: "",
    },
    deps,
  );

  assert.equal(materialCount.observedQuantity.amount, 0);
  assert.equal(trayCount.observedQuantity.unit, "tray");
  await assert.rejects(
    () =>
      recordInventoryCount(
        {
          farmId: deps.farm.id,
          trackedItemId: deps.crop.id,
          quantityText: "1",
          unit: "each",
          note: "",
        },
        deps,
      ),
    /Choose a material or countable item/,
  );
});

test("unified activity history and detail cover all three implemented records", async () => {
  const deps = await seededManualPilot();
  const harvest = await recordHarvest(
    { farmId: deps.farm.id, cropId: deps.crop.id, sourceLocationId: deps.location.id, quantityText: "12", unit: "lb", note: "" },
    deps,
  );
  const materialUse = await recordMaterialUse(
    { farmId: deps.farm.id, materialId: deps.material.id, quantityText: "2", unit: "bag", useLocationId: deps.location.id, note: "" },
    deps,
  );
  const count = await recordInventoryCount(
    { farmId: deps.farm.id, trackedItemId: deps.countableItem.id, quantityText: "18", unit: "tray", note: "" },
    deps,
  );

  const history = await listLocalActivityHistory(deps.farm.id, deps.localRecordRepository);
  assert.deepEqual(
    history.map((view) => view.record.id),
    [count.id, materialUse.id, harvest.id],
  );

  const materialDetail = await getLocalActivityDetail(
    { farmId: deps.farm.id, kind: "MaterialUseRecorded", id: materialUse.id },
    deps.localRecordRepository,
  );
  assert.equal(materialDetail?.record.kind, "MaterialUseRecorded");
});

test("expanded recovery copy includes all implemented manual records", async () => {
  const deps = await seededManualPilot();
  await recordHarvest(
    { farmId: deps.farm.id, cropId: deps.crop.id, sourceLocationId: deps.location.id, quantityText: "12", unit: "lb", note: "" },
    deps,
  );
  await recordMaterialUse(
    { farmId: deps.farm.id, materialId: deps.material.id, quantityText: "2", unit: "bag", note: "" },
    deps,
  );
  await recordInventoryCount(
    { farmId: deps.farm.id, trackedItemId: deps.countableItem.id, quantityText: "18", unit: "tray", note: "" },
    deps,
  );
  const exportRepository = new CapturingExportRepository();

  await createMobilePilotRecoveryCopy({ farmId: deps.farm.id }, { ...deps, exportRepository });
  const payload = JSON.parse(exportRepository.contents);

  assert.equal(payload.exportVersion, 3);
  assert.equal(payload.appDataSchemaVersion, 4);
  assert.equal(payload.harvestRecords.length, 1);
  assert.equal(payload.materialUseRecords.length, 1);
  assert.equal(payload.inventoryCountRecords.length, 1);
  assert.equal(payload.locations[0].kind, "field");
  assert.equal(payload.syncState, undefined);
  assert.equal(payload.aiDrafts, undefined);
  assert.equal(payload.authentication, undefined);
});

test("expanded recovery copy rejects malformed manual record payloads", async () => {
  const deps = await seededManualPilot();
  const createdAt = "2026-05-29T10:00:00.000Z";

  assert.throws(() =>
    serializeRecoveryCopy({
      exportVersion: 3,
      createdAt,
      appDataSchemaVersion: 4,
      farm: deps.farm,
      locations: [deps.location],
      trackedItems: [deps.crop, deps.material, deps.countableItem],
      harvestRecords: [],
      materialUseRecords: [
        {
          id: "material-use-1",
          kind: "MaterialUseRecorded",
          farmId: deps.farm.id,
          materialId: deps.material.id,
          quantity: { amount: 0, unit: "bag" },
          createdAt,
          effectiveAt: createdAt,
          privacy: "privateToFarm",
        },
      ],
      inventoryCountRecords: [
        {
          id: "count-1",
          kind: "InventoryCountRecorded",
          farmId: deps.farm.id,
          trackedItemId: deps.countableItem.id,
          observedQuantity: { amount: -1, unit: "tray" },
          createdAt,
          effectiveAt: createdAt,
          privacy: "privateToFarm",
        },
      ],
    }),
  );
});

test("share failure does not alter locally saved manual records", async () => {
  const deps = await seededManualPilot();
  const harvest = await recordHarvest(
    { farmId: deps.farm.id, cropId: deps.crop.id, sourceLocationId: deps.location.id, quantityText: "12", unit: "lb", note: "" },
    deps,
  );
  const materialUse = await recordMaterialUse(
    { farmId: deps.farm.id, materialId: deps.material.id, quantityText: "2", unit: "bag", note: "" },
    deps,
  );
  const count = await recordInventoryCount(
    { farmId: deps.farm.id, trackedItemId: deps.countableItem.id, quantityText: "18", unit: "tray", note: "" },
    deps,
  );

  await assert.rejects(
    () =>
      createMobilePilotRecoveryCopy(
        { farmId: deps.farm.id },
        { ...deps, exportRepository: new FailingShareExportRepository() },
      ),
    /Share sheet unavailable/,
  );

  const history = await listLocalActivityHistory(deps.farm.id, deps.localRecordRepository);
  assert.deepEqual(
    history.map((view) => view.record.id),
    [count.id, materialUse.id, harvest.id],
  );
});

class CapturingExportRepository implements ExportRepository {
  contents = "";
  async writeRecoveryCopy(input: { fileName: string; contents: string }): Promise<MobilePilotExportFile> {
    this.contents = input.contents;
    return { uri: `memory://${input.fileName}`, fileName: input.fileName, mimeType: "application/json" };
  }
  async shareRecoveryCopy(): Promise<void> {}
}

class FailingShareExportRepository extends CapturingExportRepository {
  override async shareRecoveryCopy(): Promise<void> {
    throw new Error("Share sheet unavailable");
  }
}
