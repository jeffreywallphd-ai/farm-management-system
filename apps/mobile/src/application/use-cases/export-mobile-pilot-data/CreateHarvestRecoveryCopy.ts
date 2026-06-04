import type { MobilePilotRecoveryCopy } from "../../../domain/export/MobilePilotRecoveryCopy";
import {
  MOBILE_PILOT_APP_DATA_SCHEMA_VERSION,
  MOBILE_PILOT_RECOVERY_COPY_EXPORT_VERSION,
} from "../../../domain/export/MobilePilotRecoveryCopy";
import type { FarmId } from "../../../domain/farm/Farm";
import type { Clock } from "../../ports/Clock";
import type { ExportRepository, MobilePilotExportFile } from "../../ports/ExportRepository";
import type { FarmhandRepository } from "../../ports/FarmhandRepository";
import type { FarmMapRepository } from "../../ports/FarmMapRepository";
import type { FarmReferenceRepository } from "../../ports/FarmReferenceRepository";
import type { LocalRecordRepository } from "../../ports/LocalRecordRepository";
import type { OrganicCertificationRepository } from "../../ports/OrganicCertificationRepository";
import type { PlanningRepository } from "../../ports/PlanningRepository";
import { serializeRecoveryCopy } from "../../../infrastructure/export/JsonRecoveryCopyExporter";

export async function createMobilePilotRecoveryCopy(
  input: { farmId: FarmId },
  dependencies: {
    clock: Clock;
    exportRepository: ExportRepository;
    farmReferenceRepository: FarmReferenceRepository;
    farmMapRepository?: FarmMapRepository;
    farmhandRepository?: FarmhandRepository;
    localRecordRepository: LocalRecordRepository;
    organicCertificationRepository?: OrganicCertificationRepository;
    planningRepository?: PlanningRepository;
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
    farmMapRepository?: FarmMapRepository;
    farmhandRepository?: FarmhandRepository;
    localRecordRepository: LocalRecordRepository;
    organicCertificationRepository?: OrganicCertificationRepository;
    planningRepository?: PlanningRepository;
  },
): Promise<MobilePilotRecoveryCopy> {
  const farm = await dependencies.farmReferenceRepository.getFarm();

  if (!farm || farm.id !== input.farmId) {
    throw new Error("Farm setup could not be found for this recovery copy.");
  }

  const [
    locations,
    farmMapSettings,
    farmPlaceGeometries,
    farmhands,
    farmhandScheduleSettings,
    farmhandRecurringSchedules,
    farmhandWeeklyScheduleBlocks,
    trackedItems,
    harvestRecords,
    materialUseRecords,
    inventoryCountRecords,
    organicOperationProfile,
    organicCertificationScopes,
    organicPlaceProfiles,
    organicBoundaryEvidence,
    organicInputs,
    organicInputApplications,
    seedLots,
    commercialAvailabilitySearches,
    organicPlantingEvents,
    soilFertilityPractices,
    compostBatches,
    compostTemperatureLogs,
    manureApplications,
    cropRotationRecords,
    pestWeedDiseaseObservations,
    pestWeedDiseaseActions,
    plasticMulchRecords,
    organicLots,
    organicHandlingEvents,
    organicStorageRecords,
    organicSaleRecords,
    organicSystemPlanSections,
    organicInspectionReadinessItems,
    organicReportPackages,
    organicAdvancedScopeRecords,
    organicEvidenceLinks,
    planningGoals,
    planningBoards,
    planningTasks,
    planningLinks,
    farmWorkPackStates,
    farmWorkPackItemStates,
  ] = await Promise.all([
    dependencies.farmReferenceRepository.listLocations(input.farmId),
    dependencies.farmMapRepository?.getByFarmId(input.farmId) ?? Promise.resolve(undefined),
    dependencies.farmMapRepository?.getGeometriesByFarmId(input.farmId, { includeArchived: true }) ?? Promise.resolve([]),
    dependencies.farmhandRepository?.listFarmhands(input.farmId) ?? Promise.resolve([]),
    dependencies.farmhandRepository?.getScheduleSettings(input.farmId) ?? Promise.resolve(undefined),
    dependencies.farmhandRepository?.listRecurringSchedules(input.farmId) ?? Promise.resolve([]),
    dependencies.farmhandRepository?.listWeeklyScheduleBlocks(input.farmId) ?? Promise.resolve([]),
    dependencies.farmReferenceRepository.listTrackedItems(input.farmId),
    dependencies.localRecordRepository.listHarvestRecordsForExport(input.farmId),
    dependencies.localRecordRepository.listMaterialUseRecordsForExport(input.farmId),
    dependencies.localRecordRepository.listInventoryCountRecordsForExport(input.farmId),
    dependencies.organicCertificationRepository?.getProfile(input.farmId) ?? Promise.resolve(undefined),
    dependencies.organicCertificationRepository?.listScopes(input.farmId) ?? Promise.resolve([]),
    dependencies.organicCertificationRepository?.listPlaceProfiles(input.farmId) ?? Promise.resolve([]),
    dependencies.organicCertificationRepository?.listBoundaryEvidence(input.farmId) ?? Promise.resolve([]),
    dependencies.organicCertificationRepository?.listOrganicInputs(input.farmId) ?? Promise.resolve([]),
    dependencies.organicCertificationRepository?.listOrganicInputApplications(input.farmId) ?? Promise.resolve([]),
    dependencies.organicCertificationRepository?.listSeedLots(input.farmId) ?? Promise.resolve([]),
    dependencies.organicCertificationRepository?.listCommercialAvailabilitySearches(input.farmId) ?? Promise.resolve([]),
    dependencies.organicCertificationRepository?.listOrganicPlantingEvents(input.farmId) ?? Promise.resolve([]),
    dependencies.organicCertificationRepository?.listSoilFertilityPractices(input.farmId) ?? Promise.resolve([]),
    dependencies.organicCertificationRepository?.listCompostBatches(input.farmId) ?? Promise.resolve([]),
    dependencies.organicCertificationRepository?.listCompostTemperatureLogs(input.farmId) ?? Promise.resolve([]),
    dependencies.organicCertificationRepository?.listManureApplications(input.farmId) ?? Promise.resolve([]),
    dependencies.organicCertificationRepository?.listCropRotationRecords(input.farmId) ?? Promise.resolve([]),
    dependencies.organicCertificationRepository?.listPestWeedDiseaseObservations(input.farmId) ?? Promise.resolve([]),
    dependencies.organicCertificationRepository?.listPestWeedDiseaseActions(input.farmId) ?? Promise.resolve([]),
    dependencies.organicCertificationRepository?.listPlasticMulchRecords(input.farmId) ?? Promise.resolve([]),
    dependencies.organicCertificationRepository?.listOrganicLots(input.farmId) ?? Promise.resolve([]),
    dependencies.organicCertificationRepository?.listOrganicHandlingEvents(input.farmId) ?? Promise.resolve([]),
    dependencies.organicCertificationRepository?.listOrganicStorageRecords(input.farmId) ?? Promise.resolve([]),
    dependencies.organicCertificationRepository?.listOrganicSaleRecords(input.farmId) ?? Promise.resolve([]),
    dependencies.organicCertificationRepository?.listOrganicSystemPlanSections(input.farmId) ?? Promise.resolve([]),
    dependencies.organicCertificationRepository?.listOrganicInspectionReadinessItems(input.farmId) ?? Promise.resolve([]),
    dependencies.organicCertificationRepository?.listOrganicReportPackages(input.farmId) ?? Promise.resolve([]),
    dependencies.organicCertificationRepository?.listOrganicAdvancedScopeRecords(input.farmId) ?? Promise.resolve([]),
    dependencies.organicCertificationRepository?.listOrganicEvidenceLinks(input.farmId) ?? Promise.resolve([]),
    dependencies.planningRepository?.listGoals(input.farmId) ?? Promise.resolve([]),
    dependencies.planningRepository?.listBoards(input.farmId) ?? Promise.resolve([]),
    dependencies.planningRepository?.listTasks(input.farmId) ?? Promise.resolve([]),
    dependencies.planningRepository?.listLinks(input.farmId) ?? Promise.resolve([]),
    dependencies.planningRepository?.listFarmWorkPackStates(input.farmId) ?? Promise.resolve([]),
    dependencies.planningRepository?.listFarmWorkPackItemStates(input.farmId) ?? Promise.resolve([]),
  ]);

  const createdAt = dependencies.clock.now().toISOString();
  return {
    exportVersion: MOBILE_PILOT_RECOVERY_COPY_EXPORT_VERSION,
    createdAt,
    appDataSchemaVersion: MOBILE_PILOT_APP_DATA_SCHEMA_VERSION,
    farm,
    locations,
    farmMapSettings: farmMapSettings ?? undefined,
    farmPlaceGeometries,
    farmhands,
    farmhandScheduleSettings: farmhandScheduleSettings ?? undefined,
    farmhandRecurringSchedules,
    farmhandWeeklyScheduleBlocks,
    trackedItems,
    harvestRecords,
    materialUseRecords,
    inventoryCountRecords,
    organicOperationProfile: organicOperationProfile ?? undefined,
    organicCertificationScopes,
    organicPlaceProfiles,
    organicBoundaryEvidence,
    organicInputs,
    organicInputApplications,
    seedLots,
    commercialAvailabilitySearches,
    organicPlantingEvents,
    soilFertilityPractices,
    compostBatches,
    compostTemperatureLogs,
    manureApplications,
    cropRotationRecords,
    pestWeedDiseaseObservations,
    pestWeedDiseaseActions,
    plasticMulchRecords,
    organicLots,
    organicHandlingEvents,
    organicStorageRecords,
    organicSaleRecords,
    organicSystemPlanSections,
    organicInspectionReadinessItems,
    organicReportPackages,
    organicAdvancedScopeRecords,
    organicEvidenceLinks,
    planningGoals,
    planningBoards,
    planningTasks,
    planningLinks,
    farmWorkPackStates,
    farmWorkPackItemStates,
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
