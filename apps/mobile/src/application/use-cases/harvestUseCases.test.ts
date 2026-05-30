import assert from "node:assert/strict";
import test from "node:test";

import type { ExportRepository, MobilePilotExportFile } from "../ports/ExportRepository";
import type { HarvestRecordView, LocalActivityRecordView, LocalRecordRepository } from "../ports/LocalRecordRepository";
import { createHarvestRecoveryCopy, formatRecoveryCopyFileName } from "./export-mobile-pilot-data/CreateHarvestRecoveryCopy";
import { getHarvestDetail } from "./get-harvest-detail/GetHarvestDetail";
import { listHarvestHistory } from "./list-harvest-history/ListHarvestHistory";
import { recordHarvest } from "./record-harvest/RecordHarvest";
import { InMemoryFarmReferenceRepository } from "../../testing/fakes/InMemoryFarmReferenceRepository";
import { InMemoryLocalRecordRepository } from "../../testing/fakes/InMemoryLocalRecordRepository";

function testDependencies() {
  let nextId = 1;
  const farmReferenceRepository = new InMemoryFarmReferenceRepository();
  const clock = {
    now: () => new Date(nextId === 1 ? "2026-05-29T10:00:00.000Z" : "2026-05-29T11:00:00.000Z"),
  };
  const idGenerator = { newId: () => `local-${nextId++}` };

  return { clock, farmReferenceRepository, idGenerator };
}

async function seededReferences() {
  const deps = testDependencies();
  const farm = { id: "farm-1", name: "Green Hill Farm", createdAt: "2026-05-29T09:00:00.000Z" };
  const location = { id: "location-1", farmId: farm.id, name: "North Field", kind: "field" as const, createdAt: farm.createdAt };
  const crop = { id: "crop-1", farmId: farm.id, kind: "crop" as const, name: "Kale", createdAt: farm.createdAt };
  await deps.farmReferenceRepository.createFarm(farm);
  await deps.farmReferenceRepository.addLocation(location);
  await deps.farmReferenceRepository.addTrackedItem(crop);
  const localRecordRepository = new InMemoryLocalRecordRepository({
    locations: [location],
    trackedItems: [crop],
  });

  return { ...deps, farm, location, crop, localRecordRepository };
}

test("recording a harvest creates a confirmed private local record", async () => {
  const deps = await seededReferences();

  const record = await recordHarvest(
    {
      farmId: deps.farm.id,
      cropId: deps.crop.id,
      sourceLocationId: deps.location.id,
      quantityText: "24",
      unit: "lb",
      note: " First harvest ",
    },
    deps,
  );

  assert.equal(record.id, "local-1");
  assert.equal(record.kind, "HarvestRecorded");
  assert.equal(record.farmId, deps.farm.id);
  assert.equal(record.cropId, deps.crop.id);
  assert.equal(record.sourceLocationId, deps.location.id);
  assert.deepEqual(record.quantity, { amount: 24, unit: "lb" });
  assert.equal(record.createdAt, "2026-05-29T10:00:00.000Z");
  assert.equal(record.effectiveAt, "2026-05-29T10:00:00.000Z");
  assert.equal(record.privacy, "privateToFarm");
  assert.equal(record.note, "First harvest");
});

test("invalid crop or location references prevent record creation", async () => {
  const deps = await seededReferences();

  await assert.rejects(
    () =>
      recordHarvest(
        {
          farmId: deps.farm.id,
          cropId: "missing-crop",
          sourceLocationId: deps.location.id,
          quantityText: "24",
          unit: "lb",
          note: "",
        },
        deps,
      ),
    /Choose a crop/,
  );
});

test("harvest history lists records newest first and detail resolves display names", async () => {
  const deps = await seededReferences();
  const first = await recordHarvest(
    {
      farmId: deps.farm.id,
      cropId: deps.crop.id,
      sourceLocationId: deps.location.id,
      quantityText: "10",
      unit: "lb",
      note: "",
    },
    deps,
  );
  const second = await recordHarvest(
    {
      farmId: deps.farm.id,
      cropId: deps.crop.id,
      sourceLocationId: deps.location.id,
      quantityText: "12",
      unit: "lb",
      note: "",
    },
    deps,
  );

  const history = await listHarvestHistory(deps.farm.id, deps.localRecordRepository);
  assert.deepEqual(
    history.map((item) => item.record.id),
    [second.id, first.id],
  );

  const detail = await getHarvestDetail({ farmId: deps.farm.id, id: first.id }, deps.localRecordRepository);
  assert.equal(detail?.crop.name, "Kale");
  assert.equal(detail?.sourceLocation.name, "North Field");
});

test("failed persistence does not report a saved harvest", async () => {
  const deps = await seededReferences();
  const failingRepository = new FailingLocalRecordRepository(deps.localRecordRepository);

  await assert.rejects(
    () =>
      recordHarvest(
        {
          farmId: deps.farm.id,
          cropId: deps.crop.id,
          sourceLocationId: deps.location.id,
          quantityText: "24",
          unit: "lb",
          note: "",
        },
        { ...deps, localRecordRepository: failingRepository },
      ),
    /storage failed/,
  );
});

test("recovery copy export contains farm references and harvest records", async () => {
  const deps = await seededReferences();
  await recordHarvest(
    {
      farmId: deps.farm.id,
      cropId: deps.crop.id,
      sourceLocationId: deps.location.id,
      quantityText: "24",
      unit: "lb",
      note: "",
    },
    deps,
  );
  const exportRepository = new CapturingExportRepository();

  const file = await createHarvestRecoveryCopy(
    { farmId: deps.farm.id },
    { ...deps, exportRepository },
  );

  assert.equal(file.fileName, "farm-pilot-recovery-copy-20260529T110000.json");
  assert.equal(exportRepository.sharedFile?.fileName, file.fileName);
  const payload = JSON.parse(exportRepository.contents);
  assert.equal(payload.exportVersion, 3);
  assert.equal(payload.appDataSchemaVersion, 4);
  assert.equal(payload.farm.name, "Green Hill Farm");
  assert.equal(payload.locations[0].name, "North Field");
  assert.equal(payload.locations[0].kind, "field");
  assert.equal(payload.trackedItems[0].name, "Kale");
  assert.equal(payload.harvestRecords[0].kind, "HarvestRecorded");
  assert.deepEqual(payload.materialUseRecords, []);
  assert.deepEqual(payload.inventoryCountRecords, []);
});

test("recovery copy filename avoids farm names", () => {
  assert.equal(
    formatRecoveryCopyFileName(new Date("2026-05-29T11:00:00.000Z")),
    "farm-pilot-recovery-copy-20260529T110000.json",
  );
});

class CapturingExportRepository implements ExportRepository {
  contents = "";
  sharedFile: MobilePilotExportFile | null = null;

  async writeRecoveryCopy(input: { fileName: string; contents: string }): Promise<MobilePilotExportFile> {
    this.contents = input.contents;
    return {
      uri: `memory://${input.fileName}`,
      fileName: input.fileName,
      mimeType: "application/json",
    };
  }

  async writeRecoveryPackage(input: {
    fileName: string;
    metadataContents: string;
    mediaFiles: { sourceUri: string; packagePath: string }[];
  }): Promise<MobilePilotExportFile> {
    this.contents = input.metadataContents;
    return {
      uri: `memory://${input.fileName}`,
      fileName: input.fileName,
      mimeType: "application/zip",
    };
  }

  async shareRecoveryCopy(file: MobilePilotExportFile): Promise<void> {
    this.sharedFile = file;
  }
}

class FailingLocalRecordRepository implements LocalRecordRepository {
  constructor(private readonly delegate: LocalRecordRepository) {}

  async saveHarvest(): Promise<void> {
    throw new Error("storage failed");
  }

  async saveMaterialUse() {
    return this.delegate.saveMaterialUse(arguments[0]);
  }

  async saveInventoryCount() {
    return this.delegate.saveInventoryCount(arguments[0]);
  }

  async listLocalActivityHistory(farmId: string): Promise<LocalActivityRecordView[]> {
    return this.delegate.listLocalActivityHistory(farmId);
  }

  async getLocalActivityDetail(farmId: string, kind: Parameters<LocalRecordRepository["getLocalActivityDetail"]>[1], id: string) {
    return this.delegate.getLocalActivityDetail(farmId, kind, id);
  }

  async listHarvestHistory(farmId: string): Promise<HarvestRecordView[]> {
    return this.delegate.listHarvestHistory(farmId);
  }

  async getHarvestDetail(farmId: string, id: string): Promise<HarvestRecordView | null> {
    return this.delegate.getHarvestDetail(farmId, id);
  }

  async listHarvestRecordsForExport(farmId: string) {
    return this.delegate.listHarvestRecordsForExport(farmId);
  }

  async listMaterialUseRecordsForExport(farmId: string) {
    return this.delegate.listMaterialUseRecordsForExport(farmId);
  }

  async listInventoryCountRecordsForExport(farmId: string) {
    return this.delegate.listInventoryCountRecordsForExport(farmId);
  }
}
