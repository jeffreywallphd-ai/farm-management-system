import type { MobilePilotRecoveryCopy } from "../../../domain/export/MobilePilotRecoveryCopy";
import {
  MOBILE_PILOT_APP_DATA_SCHEMA_VERSION,
  MOBILE_PILOT_RECOVERY_COPY_EXPORT_VERSION,
} from "../../../domain/export/MobilePilotRecoveryCopy";
import type { FarmId } from "../../../domain/farm/Farm";
import type { Clock } from "../../ports/Clock";
import type { ExportRepository, MobilePilotExportFile } from "../../ports/ExportRepository";
import type { FarmReferenceRepository } from "../../ports/FarmReferenceRepository";
import type { LocalRecordRepository } from "../../ports/LocalRecordRepository";
import { serializeRecoveryCopy } from "../../../infrastructure/export/JsonRecoveryCopyExporter";

export async function createMobilePilotRecoveryCopy(
  input: { farmId: FarmId },
  dependencies: {
    clock: Clock;
    exportRepository: ExportRepository;
    farmReferenceRepository: FarmReferenceRepository;
    localRecordRepository: LocalRecordRepository;
  },
): Promise<MobilePilotExportFile> {
  const farm = await dependencies.farmReferenceRepository.getFarm();

  if (!farm || farm.id !== input.farmId) {
    throw new Error("Farm setup could not be found for this recovery copy.");
  }

  const payload = await buildMobilePilotRecoveryCopyPayload(input, dependencies);
  const contents = serializeRecoveryCopy(payload);
  const fileName = formatRecoveryCopyFileName(dependencies.clock.now());
  const file = await dependencies.exportRepository.writeRecoveryCopy({ fileName, contents });
  await dependencies.exportRepository.shareRecoveryCopy(file);
  return file;
}

export async function buildMobilePilotRecoveryCopyPayload(
  input: { farmId: FarmId },
  dependencies: {
    clock: Clock;
    farmReferenceRepository: FarmReferenceRepository;
    localRecordRepository: LocalRecordRepository;
  },
): Promise<MobilePilotRecoveryCopy> {
  const farm = await dependencies.farmReferenceRepository.getFarm();

  if (!farm || farm.id !== input.farmId) {
    throw new Error("Farm setup could not be found for this recovery copy.");
  }

  const [locations, trackedItems, harvestRecords, materialUseRecords, inventoryCountRecords] = await Promise.all([
    dependencies.farmReferenceRepository.listLocations(input.farmId),
    dependencies.farmReferenceRepository.listTrackedItems(input.farmId),
    dependencies.localRecordRepository.listHarvestRecordsForExport(input.farmId),
    dependencies.localRecordRepository.listMaterialUseRecordsForExport(input.farmId),
    dependencies.localRecordRepository.listInventoryCountRecordsForExport(input.farmId),
  ]);

  const createdAt = dependencies.clock.now().toISOString();
  return {
    exportVersion: MOBILE_PILOT_RECOVERY_COPY_EXPORT_VERSION,
    createdAt,
    appDataSchemaVersion: MOBILE_PILOT_APP_DATA_SCHEMA_VERSION,
    farm,
    locations,
    trackedItems,
    harvestRecords,
    materialUseRecords,
    inventoryCountRecords,
  };
}

export const createHarvestRecoveryCopy = createMobilePilotRecoveryCopy;

export function formatRecoveryCopyFileName(date: Date): string {
  const timestamp = date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "");

  return `farm-pilot-recovery-copy-${timestamp}.json`;
}
