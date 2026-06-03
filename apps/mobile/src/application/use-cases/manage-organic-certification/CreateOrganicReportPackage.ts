import type { Farm } from "../../../domain/farm/Farm";
import { ORGANIC_REPORT_PACKAGE_TYPE_LABELS, type OrganicReportPackage, type OrganicReportPackageType } from "../../../domain/organic/OrganicReportPackage";
import { organicReportPackageInputSchema } from "../../../domain/validation/organicReportPackageValidation";
import type { Clock } from "../../ports/Clock";
import type { FarmEventRepository } from "../../ports/FarmEventRepository";
import type { FarmReferenceRepository } from "../../ports/FarmReferenceRepository";
import type { IdGenerator } from "../../ports/IdGenerator";
import type { OrganicCertificationRepository } from "../../ports/OrganicCertificationRepository";
import type { PlanningRepository } from "../../ports/PlanningRepository";
import { createOrganicFarmNoteEvidenceReport } from "./CreateOrganicFarmNoteEvidenceReport";
import { createOrganicAdvancedScopeReport } from "./CreateOrganicAdvancedScopeReports";
import { createOrganicInputReport } from "./CreateOrganicInputReports";
import { createOrganicPestReport } from "./CreateOrganicPestReports";
import { createOrganicPlacesReport } from "./CreateOrganicPlacesReports";
import { createOrganicProfileReport } from "./CreateOrganicProfileReport";
import { createOrganicSeedReport } from "./CreateOrganicSeedReports";
import { createOrganicSoilReport } from "./CreateOrganicSoilReports";
import { createOrganicSystemPlanReport } from "./CreateOrganicSystemPlanReports";
import { createOrganicTraceabilityReport } from "./CreateOrganicTraceabilityReports";

export async function createOrganicReportPackage(
  input: {
    farm: Farm;
    farmId: string;
    packageType: OrganicReportPackageType;
    title: string;
    notes?: string;
  },
  dependencies: {
    clock: Clock;
    farmEventRepository?: FarmEventRepository;
    farmReferenceRepository: FarmReferenceRepository;
    idGenerator: IdGenerator;
    planningRepository?: PlanningRepository;
    repository: OrganicCertificationRepository;
  },
): Promise<OrganicReportPackage> {
  const parsed = organicReportPackageInputSchema.parse(input);
  const reportEntries = await buildReports(input.farm, dependencies);
  const manifest = await buildManifest(input.farm, parsed.packageType, reportEntries.map((entry) => entry.name), {
    planningRepository: dependencies.planningRepository,
    repository: dependencies.repository,
  });
  const generatedAt = dependencies.clock.now().toISOString();
  const packageText = [
    input.title,
    `Farm: ${input.farm.name}`,
    `Package type: ${ORGANIC_REPORT_PACKAGE_TYPE_LABELS[parsed.packageType]}`,
    `Generated: ${generatedAt}`,
    "Use: This local package organizes organic readiness reports for farmer and certifier review. It is not a certifier submission, legal determination, or compliance certificate.",
    "",
    "Manifest",
    JSON.stringify(manifest, null, 2),
    "",
    ...reportEntries.flatMap((entry) => [`--- ${entry.name} ---`, entry.contents, ""]),
  ].join("\n");
  const reportPackage: OrganicReportPackage = {
    id: dependencies.idGenerator.newId(),
    farmId: parsed.farmId,
    packageType: parsed.packageType,
    title: parsed.title,
    generatedAt,
    reportNames: reportEntries.map((entry) => entry.name),
    manifestJson: JSON.stringify(manifest),
    packageText,
    notes: parsed.notes,
    createdAt: generatedAt,
  };
  await dependencies.repository.saveOrganicReportPackage(reportPackage);
  return reportPackage;
}

async function buildReports(
  farm: Farm,
  dependencies: { clock: Clock; farmEventRepository?: FarmEventRepository; farmReferenceRepository: FarmReferenceRepository; planningRepository?: PlanningRepository; repository: OrganicCertificationRepository },
): Promise<Array<{ name: string; contents: string }>> {
  const withRepository = { clock: dependencies.clock, planningRepository: dependencies.planningRepository, repository: dependencies.repository };
  const withFarmReferences = { ...withRepository, farmReferenceRepository: dependencies.farmReferenceRepository };
  const reports = [
    { name: "Organic Profile Report", contents: await createOrganicProfileReport({ farm }, withRepository) },
    { name: "Organic Land Eligibility Report", contents: await createOrganicPlacesReport({ farm, reportType: "landEligibility" }, withFarmReferences) },
    { name: "Organic Transition Status Report", contents: await createOrganicPlacesReport({ farm, reportType: "transitionStatus" }, withFarmReferences) },
    { name: "Organic Boundary and Buffer Report", contents: await createOrganicPlacesReport({ farm, reportType: "boundaryBuffer" }, withFarmReferences) },
    { name: "Organic Contamination and Drift Risk Report", contents: await createOrganicPlacesReport({ farm, reportType: "contaminationDrift" }, withFarmReferences) },
    { name: "Organic Input List for OSP", contents: await createOrganicInputReport({ farm, reportType: "inputList" }, withRepository) },
    { name: "Organic Input Application Log", contents: await createOrganicInputReport({ farm, reportType: "applicationLog" }, withRepository) },
    { name: "Organic Input Approval Evidence Packet", contents: await createOrganicInputReport({ farm, reportType: "approvalEvidence" }, withRepository) },
    { name: "Organic Restricted and Needs-Review Inputs Report", contents: await createOrganicInputReport({ farm, reportType: "needsReview" }, withRepository) },
    { name: "Organic Seed and Planting Stock Report", contents: await createOrganicSeedReport({ farm, reportType: "seedLots" }, withRepository) },
    { name: "Organic Commercial Availability Search Report", contents: await createOrganicSeedReport({ farm, reportType: "commercialAvailability" }, withRepository) },
    { name: "Organic Planting Event Report", contents: await createOrganicSeedReport({ farm, reportType: "plantingEvents" }, withRepository) },
    { name: "Organic Seed-to-Crop Traceability Report", contents: await createOrganicSeedReport({ farm, reportType: "traceability" }, withRepository) },
    { name: "Organic Soil Fertility Report", contents: await createOrganicSoilReport({ farm, reportType: "soilFertility" }, withRepository) },
    { name: "Organic Compost Production Log", contents: await createOrganicSoilReport({ farm, reportType: "compost" }, withRepository) },
    { name: "Organic Manure Application and Harvest Interval Report", contents: await createOrganicSoilReport({ farm, reportType: "manure" }, withRepository) },
    { name: "Organic Crop Rotation Report", contents: await createOrganicSoilReport({ farm, reportType: "rotation" }, withRepository) },
    { name: "Organic Erosion Control Report", contents: await createOrganicSoilReport({ farm, reportType: "erosion" }, withRepository) },
    { name: "Organic Pest Observation and Action Report", contents: await createOrganicPestReport({ farm, reportType: "pest" }, withRepository) },
    { name: "Organic Weed Management Report", contents: await createOrganicPestReport({ farm, reportType: "weed" }, withRepository) },
    { name: "Organic Disease Management Report", contents: await createOrganicPestReport({ farm, reportType: "disease" }, withRepository) },
    { name: "Organic Input Escalation Justification Report", contents: await createOrganicPestReport({ farm, reportType: "inputEscalation" }, withRepository) },
    { name: "Organic Plastic Mulch Removal Report", contents: await createOrganicPestReport({ farm, reportType: "plasticMulch" }, withRepository) },
    { name: "Organic Lot Traceability Report", contents: await createOrganicTraceabilityReport({ farm, reportType: "lots" }, withFarmReferences) },
    { name: "Organic Handling and Commingling Prevention Report", contents: await createOrganicTraceabilityReport({ farm, reportType: "handling" }, withFarmReferences) },
    { name: "Organic Storage Report", contents: await createOrganicTraceabilityReport({ farm, reportType: "storage" }, withFarmReferences) },
    { name: "Organic Sale Traceability Report", contents: await createOrganicTraceabilityReport({ farm, reportType: "sales" }, withFarmReferences) },
    { name: "Organic Mass Balance Report", contents: await createOrganicTraceabilityReport({ farm, reportType: "massBalance" }, withFarmReferences) },
    { name: "Organic System Plan Draft Summary", contents: await createOrganicSystemPlanReport({ farm, reportType: "ospDraft" }, withRepository) },
    { name: "Organic Inspection Preparation Tasks", contents: await createOrganicSystemPlanReport({ farm, reportType: "inspectionReadiness" }, withRepository) },
    { name: "Organic Advanced Scope Readiness Report", contents: await createOrganicAdvancedScopeReport({ farm }, withRepository) },
  ];
  if (dependencies.farmEventRepository) {
    reports.push({
      name: "Organic Farm Note Evidence Report",
      contents: await createOrganicFarmNoteEvidenceReport(
        { farm },
        { clock: dependencies.clock, farmEventRepository: dependencies.farmEventRepository, repository: dependencies.repository },
      ),
    });
  }
  return reports;
}

async function buildManifest(
  farm: Farm,
  packageType: string,
  reportNames: string[],
  dependencies: { planningRepository?: PlanningRepository; repository: OrganicCertificationRepository },
): Promise<Record<string, unknown>> {
  const [
    placeProfiles,
    inputs,
    inputApplications,
    seedLots,
    commercialAvailabilitySearches,
    organicPlantingEvents,
    soilPractices,
    compostBatches,
    compostTemperatureLogs,
    manureApplications,
    cropRotationRecords,
    pestWeedDiseaseObservations,
    pestWeedDiseaseActions,
    plasticMulchRecords,
    lots,
    handlingEvents,
    storageRecords,
    sales,
    ospSections,
    inspectionItems,
    advancedScopeRecords,
    organicEvidenceLinks,
    organicCertificationPlanningGoals,
    organicCertificationTemplateTasks,
    organicCertificationFarmerTasks,
  ] = await Promise.all([
    dependencies.repository.listPlaceProfiles(farm.id),
    dependencies.repository.listOrganicInputs(farm.id),
    dependencies.repository.listOrganicInputApplications(farm.id),
    dependencies.repository.listSeedLots(farm.id),
    dependencies.repository.listCommercialAvailabilitySearches(farm.id),
    dependencies.repository.listOrganicPlantingEvents(farm.id),
    dependencies.repository.listSoilFertilityPractices(farm.id),
    dependencies.repository.listCompostBatches(farm.id),
    dependencies.repository.listCompostTemperatureLogs(farm.id),
    dependencies.repository.listManureApplications(farm.id),
    dependencies.repository.listCropRotationRecords(farm.id),
    dependencies.repository.listPestWeedDiseaseObservations(farm.id),
    dependencies.repository.listPestWeedDiseaseActions(farm.id),
    dependencies.repository.listPlasticMulchRecords(farm.id),
    dependencies.repository.listOrganicLots(farm.id),
    dependencies.repository.listOrganicHandlingEvents(farm.id),
    dependencies.repository.listOrganicStorageRecords(farm.id),
    dependencies.repository.listOrganicSaleRecords(farm.id),
    dependencies.repository.listOrganicSystemPlanSections(farm.id),
    dependencies.repository.listOrganicInspectionReadinessItems(farm.id),
    dependencies.repository.listOrganicAdvancedScopeRecords(farm.id),
    dependencies.repository.listOrganicEvidenceLinks(farm.id),
    dependencies.planningRepository?.listGoals(farm.id, { category: "organicCertification" }) ?? Promise.resolve([]),
    dependencies.planningRepository?.listTasks(farm.id, { source: "organicCertificationTemplate" }) ?? Promise.resolve([]),
    dependencies.planningRepository?.listTasks(farm.id, { source: "organicCertification" }) ?? Promise.resolve([]),
  ]);
  const organicCertificationPlanningTasks = uniqueById([
    ...organicCertificationTemplateTasks,
    ...organicCertificationFarmerTasks,
  ]);
  return {
    farmId: farm.id,
    packageType,
    reportNames,
    recordCounts: {
      organicPlaceProfiles: placeProfiles.length,
      organicInputs: inputs.length,
      organicInputApplications: inputApplications.length,
      seedLots: seedLots.length,
      commercialAvailabilitySearches: commercialAvailabilitySearches.length,
      organicPlantingEvents: organicPlantingEvents.length,
      soilFertilityPractices: soilPractices.length,
      compostBatches: compostBatches.length,
      compostTemperatureLogs: compostTemperatureLogs.length,
      manureApplications: manureApplications.length,
      cropRotationRecords: cropRotationRecords.length,
      pestWeedDiseaseObservations: pestWeedDiseaseObservations.length,
      pestWeedDiseaseActions: pestWeedDiseaseActions.length,
      plasticMulchRecords: plasticMulchRecords.length,
      organicLots: lots.length,
      organicHandlingEvents: handlingEvents.length,
      organicStorageRecords: storageRecords.length,
      organicSaleRecords: sales.length,
      organicSystemPlanSections: ospSections.length,
      organicInspectionReadinessItems: inspectionItems.length,
      organicAdvancedScopeRecords: advancedScopeRecords.length,
      organicEvidenceLinks: organicEvidenceLinks.length,
      organicCertificationPlanningGoals: organicCertificationPlanningGoals.length,
      organicCertificationPlanningTasks: organicCertificationPlanningTasks.length,
    },
  };
}

function uniqueById<T extends { id: string }>(records: T[]): T[] {
  return [...new Map(records.map((record) => [record.id, record])).values()];
}
