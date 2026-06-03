import assert from "node:assert/strict";
import test from "node:test";

import { buildMobilePilotRecoveryCopyPayload } from "./export-mobile-pilot-data/CreateHarvestRecoveryCopy";
import { addOrganicBoundaryEvidence } from "./manage-organic-certification/AddOrganicBoundaryEvidence";
import { createOrganicProfileReport } from "./manage-organic-certification/CreateOrganicProfileReport";
import { createOrganicInputReport } from "./manage-organic-certification/CreateOrganicInputReports";
import { createOrganicAdvancedScopeReport } from "./manage-organic-certification/CreateOrganicAdvancedScopeReports";
import { createOrganicPestReport } from "./manage-organic-certification/CreateOrganicPestReports";
import { createOrganicPlacesReport } from "./manage-organic-certification/CreateOrganicPlacesReports";
import { createOrganicSeedReport } from "./manage-organic-certification/CreateOrganicSeedReports";
import { createOrganicSoilReport } from "./manage-organic-certification/CreateOrganicSoilReports";
import { createOrganicSystemPlanReport } from "./manage-organic-certification/CreateOrganicSystemPlanReports";
import { createOrganicTraceabilityReport } from "./manage-organic-certification/CreateOrganicTraceabilityReports";
import { createOrganicReportPackage } from "./manage-organic-certification/CreateOrganicReportPackage";
import { createOrganicFarmNoteEvidenceReport } from "./manage-organic-certification/CreateOrganicFarmNoteEvidenceReport";
import { ensureOrganicCertificationPlan } from "./manage-planning/CreateOrganicCertificationPlan";
import { getOrganicCertificationDashboard } from "./manage-organic-certification/GetOrganicCertificationDashboard";
import {
  listOrganicEvidenceLinksForFarmNote,
  listOrganicReviewQueue,
} from "./manage-organic-certification/ListOrganicEvidence";
import { saveOrganicAdvancedScopeRecord } from "./manage-organic-certification/ManageOrganicAdvancedScopes";
import { saveOrganicEvidenceLink } from "./manage-organic-certification/ManageOrganicEvidenceLinks";
import {
  recordCommercialAvailabilitySearch,
  recordOrganicPlantingEvent,
  saveSeedLot,
} from "./manage-organic-certification/ManageOrganicSeeds";
import {
  recordCompostTemperatureLog,
  recordCropRotationRecord,
  recordManureApplication,
  recordSoilFertilityPractice,
  saveCompostBatch,
} from "./manage-organic-certification/ManageOrganicSoil";
import {
  recordPestWeedDiseaseAction,
  recordPestWeedDiseaseObservation,
  recordPlasticMulchRecord,
} from "./manage-organic-certification/ManageOrganicPest";
import {
  createOrganicMassBalanceSnapshot,
  recordOrganicHandlingEvent,
  recordOrganicSaleRecord,
  recordOrganicStorageRecord,
  saveOrganicLot,
} from "./manage-organic-certification/ManageOrganicTraceability";
import {
  saveOrganicInspectionReadinessItem,
  saveOrganicSystemPlanSection,
} from "./manage-organic-certification/ManageOrganicSystemPlan";
import { recordOrganicInputApplication } from "./manage-organic-certification/RecordOrganicInputApplication";
import { saveOrganicInput } from "./manage-organic-certification/SaveOrganicInput";
import { saveOrganicOperationProfile } from "./manage-organic-certification/SaveOrganicOperationProfile";
import { saveOrganicPlaceProfile } from "./manage-organic-certification/SaveOrganicPlaceProfile";
import { savePlanningTask } from "./manage-planning/ManagePlanning";
import { recordFarmEvent } from "./record-farm-event/RecordFarmEvent";
import { InMemoryFarmEventRepository } from "../../testing/fakes/InMemoryFarmEventRepository";
import { InMemoryFarmReferenceRepository } from "../../testing/fakes/InMemoryFarmReferenceRepository";
import { InMemoryLocalRecordRepository } from "../../testing/fakes/InMemoryLocalRecordRepository";
import { InMemoryOrganicCertificationRepository } from "../../testing/fakes/InMemoryOrganicCertificationRepository";
import { InMemoryPlanningRepository } from "../../testing/fakes/InMemoryPlanningRepository";

const farm = {
  id: "farm-1",
  name: "Pilot Farm",
  createdAt: "2026-06-02T10:00:00.000Z",
};

function dependencies() {
  let nextId = 1;
  return {
    clock: { now: () => new Date("2026-06-02T12:00:00.000Z") },
    idGenerator: { newId: () => `organic-${nextId++}` },
    planningRepository: new InMemoryPlanningRepository(),
    repository: new InMemoryOrganicCertificationRepository(),
  };
}

test("organic certification dashboard starts disabled until a profile is saved", async () => {
  const deps = dependencies();

  const dashboard = await getOrganicCertificationDashboard({ farmId: farm.id }, deps);

  assert.equal(dashboard.profile, null);
  assert.deepEqual(dashboard.enabledScopes, []);
  assert.deepEqual(dashboard.missingSetupItems, ["Organic tracking is not set up."]);
});

test("organic operation profile can be saved and edited with enabled scopes", async () => {
  const deps = dependencies();

  const created = await saveOrganicOperationProfile(
    {
      farmId: farm.id,
      organicStatus: "certified",
      certifierName: "Good Certifier",
      certifierContact: "certifier@example.test",
      certificateNumber: "NOP-123",
      certificateEffectiveDate: "2026-01-15",
      annualUpdateDueDate: "2027-01-15",
      inspectionDueWindow: "June-July",
      recordRetentionYears: 5,
      notes: "Annual update handled through certifier portal.",
      enabledScopes: ["crops", "handling"],
    },
    deps,
  );

  assert.equal(created.profile.id, "organic-1");
  assert.equal(created.profile.organicStatus, "certified");
  assert.deepEqual(
    created.scopes.filter((scope) => scope.enabled).map((scope) => scope.scopeType).sort(),
    ["crops", "handling"],
  );

  const edited = await saveOrganicOperationProfile(
    {
      farmId: farm.id,
      organicStatus: "splitOperation",
      certifierName: "Good Certifier",
      certifierContact: "",
      certificateNumber: "NOP-123",
      certificateEffectiveDate: "2026-01-15",
      annualUpdateDueDate: "2027-01-15",
      inspectionDueWindow: "June-July",
      recordRetentionYears: "5",
      notes: "Split greenhouse remains nonorganic.",
      enabledScopes: ["crops"],
    },
    deps,
  );

  assert.equal(edited.profile.id, created.profile.id);
  assert.equal(edited.profile.organicStatus, "splitOperation");
  assert.deepEqual(
    (await deps.repository.listScopes(farm.id)).filter((scope) => scope.enabled).map((scope) => scope.scopeType),
    ["crops"],
  );
});

test("organic dashboard reports missing Phase 1 setup items without making compliance determinations", async () => {
  const deps = dependencies();
  await saveOrganicOperationProfile(
    {
      farmId: farm.id,
      organicStatus: "certified",
      recordRetentionYears: 5,
      enabledScopes: [],
    },
    deps,
  );

  const dashboard = await getOrganicCertificationDashboard({ farmId: farm.id }, deps);

  assert.deepEqual(dashboard.missingSetupItems, [
    "Choose at least one organic scope that applies to this farm.",
    "Add certifier information for certified or split-operation tracking.",
    "Add the annual update due date when you know it.",
  ]);
});

test("Organic Profile Report includes certifier context and non-replacement language", async () => {
  const deps = dependencies();
  await saveOrganicOperationProfile(
    {
      farmId: farm.id,
      organicStatus: "transitioning",
      certifierName: "Good Certifier",
      annualUpdateDueDate: "2027-01-15",
      recordRetentionYears: 5,
      enabledScopes: ["crops"],
    },
    deps,
  );

  const report = await createOrganicProfileReport({ farm }, deps);

  assert.match(report, /Organic Profile Report/);
  assert.match(report, /Farm: Pilot Farm/);
  assert.match(report, /Organic status: Transitioning/);
  assert.match(report, /Enabled scopes: Crops/);
  assert.match(report, /does not certify the operation/);
});

test("recovery copy includes organic profile and scopes when present", async () => {
  const organicDeps = dependencies();
  await organicDeps.repository.saveProfile(
    {
      id: "organic-profile-1",
      farmId: farm.id,
      organicStatus: "exempt",
      recordRetentionYears: 3,
      createdAt: "2026-06-02T12:00:00.000Z",
      updatedAt: "2026-06-02T12:00:00.000Z",
    },
    [
      {
        profileId: "organic-profile-1",
        farmId: farm.id,
        scopeType: "crops",
        enabled: true,
        status: "active",
        createdAt: "2026-06-02T12:00:00.000Z",
        updatedAt: "2026-06-02T12:00:00.000Z",
      },
    ],
  );

  const farmReferenceRepository = new InMemoryFarmReferenceRepository();
  await farmReferenceRepository.createFarm(farm);

  const payload = await buildMobilePilotRecoveryCopyPayload(
    { farmId: farm.id },
    {
      clock: organicDeps.clock,
      farmReferenceRepository,
      localRecordRepository: new InMemoryLocalRecordRepository({ locations: [], trackedItems: [] }),
      organicCertificationRepository: organicDeps.repository,
    },
  );

  assert.equal(payload.organicOperationProfile?.organicStatus, "exempt");
  assert.equal(payload.organicOperationProfile?.recordRetentionYears, 3);
  assert.equal(payload.organicCertificationScopes[0].scopeType, "crops");
});

test("organic place profile calculates transition eligibility and preserves place hierarchy through lookup", async () => {
  const deps = dependencies();
  const farmReferenceRepository = new InMemoryFarmReferenceRepository();
  await farmReferenceRepository.createFarm(farm);
  await farmReferenceRepository.addLocation({
    id: "field-1",
    farmId: farm.id,
    name: "North Field",
    kind: "field",
    createdAt: "2026-06-02T10:00:00.000Z",
  });
  await farmReferenceRepository.addLocation({
    id: "bed-1",
    farmId: farm.id,
    name: "Bed 1",
    kind: "bed",
    parentId: "field-1",
    createdAt: "2026-06-02T10:05:00.000Z",
  });

  const profile = await saveOrganicPlaceProfile(
    {
      farmId: farm.id,
      placeId: "bed-1",
      organicStatus: "transitioning",
      transitionStartDate: "2026-01-01",
      lastProhibitedSubstanceDate: "2025-05-20",
      boundaryDescription: "Fence and hedgerow on north side.",
      bufferDescription: "Twenty-foot grass strip by neighbor field.",
      certifierApproved: false,
    },
    { ...deps, farmReferenceRepository },
  );

  assert.equal(profile.organicEligibilityDate, "2028-05-20");

  await farmReferenceRepository.updateLocation({
    id: "field-1",
    farmId: farm.id,
    name: "Renamed North Field",
    kind: "field",
    createdAt: "2026-06-02T10:00:00.000Z",
  });

  const report = await createOrganicPlacesReport(
    { farm, reportType: "landEligibility" },
    { clock: deps.clock, farmReferenceRepository, repository: deps.repository },
  );

  assert.match(report, /Organic Land Eligibility Report/);
  assert.match(report, /Place: Renamed North Field > Bed 1/);
  assert.match(report, /Planning eligibility date: 2028-05-20/);
  assert.match(report, /does not certify land/);
});

test("organic boundary evidence can be attached and appears in boundary reports and recovery copies", async () => {
  const deps = dependencies();
  const farmReferenceRepository = new InMemoryFarmReferenceRepository();
  await farmReferenceRepository.createFarm(farm);
  await farmReferenceRepository.addLocation({
    id: "field-1",
    farmId: farm.id,
    name: "North Field",
    kind: "field",
    createdAt: "2026-06-02T10:00:00.000Z",
  });
  await saveOrganicPlaceProfile(
    {
      farmId: farm.id,
      placeId: "field-1",
      organicStatus: "certifiedOrganic",
      boundaryDescription: "Road and hedgerow define the west edge.",
      bufferDescription: "Mowed buffer next to road.",
      contaminationRisks: "Neighbor sprays across the road in May.",
      certifierApproved: true,
    },
    { ...deps, farmReferenceRepository },
  );

  const evidence = await addOrganicBoundaryEvidence(
    {
      farmId: farm.id,
      placeId: "field-1",
      evidenceType: "photo",
      description: "West road buffer photo.",
      attachmentUri: "file:///documents/photos/buffer.jpg",
    },
    { ...deps, farmReferenceRepository },
  );

  assert.equal(evidence.id, "organic-1");
  assert.equal(evidence.evidenceType, "photo");

  const report = await createOrganicPlacesReport(
    { farm, reportType: "boundaryBuffer" },
    { clock: deps.clock, farmReferenceRepository, repository: deps.repository },
  );

  assert.match(report, /Organic Boundary and Buffer Report/);
  assert.match(report, /Evidence records: 1/);
  assert.match(report, /West road buffer photo/);

  const payload = await buildMobilePilotRecoveryCopyPayload(
    { farmId: farm.id },
    {
      clock: deps.clock,
      farmReferenceRepository,
      localRecordRepository: new InMemoryLocalRecordRepository({ locations: [], trackedItems: [] }),
      organicCertificationRepository: deps.repository,
    },
  );

  assert.equal(payload.organicPlaceProfiles[0].placeId, "field-1");
  assert.equal(payload.organicBoundaryEvidence[0].attachmentUri, "file:///documents/photos/buffer.jpg");
});

test("organic inputs can be saved, edited, reported, and included in recovery copies", async () => {
  const deps = dependencies();
  const farmReferenceRepository = new InMemoryFarmReferenceRepository();
  await farmReferenceRepository.createFarm(farm);
  await farmReferenceRepository.addTrackedItem({
    id: "material-1",
    farmId: farm.id,
    kind: "material",
    name: "Compost",
    createdAt: "2026-06-02T10:00:00.000Z",
  });

  const input = await saveOrganicInput(
    {
      farmId: farm.id,
      materialId: "material-1",
      name: "Compost",
      inputCategory: "compost",
      manufacturer: "Local Compost Co",
      supplier: "Local supplier",
      composition: "Plant and animal materials",
      source: "Purchased",
      approvalStatus: "needsReview",
      approvalEvidenceAttachmentIdsText: "label-photo-1\nreceipt-1",
      restrictions: "Confirm with certifier before use.",
      notes: "For vegetable beds.",
    },
    { ...deps, farmReferenceRepository },
  );

  const edited = await saveOrganicInput(
    {
      farmId: farm.id,
      id: input.id,
      materialId: "material-1",
      name: "Compost blend",
      inputCategory: "compost",
      approvalStatus: "approvedByCertifier",
      certifierApprovalDate: "2026-05-01",
      approvalEvidenceAttachmentIdsText: "certifier-email-1",
    },
    { ...deps, farmReferenceRepository },
  );

  assert.equal(edited.id, input.id);
  assert.equal(edited.name, "Compost blend");
  assert.equal(edited.approvalStatus, "approvedByCertifier");

  const report = await createOrganicInputReport(
    { farm, reportType: "inputList" },
    { clock: deps.clock, repository: deps.repository },
  );

  assert.match(report, /Organic Input List for OSP/);
  assert.match(report, /Input: Compost blend/);
  assert.match(report, /Approval status: Approved by certifier/);
  assert.match(report, /does not verify allowed\/prohibited status/);

  const payload = await buildMobilePilotRecoveryCopyPayload(
    { farmId: farm.id },
    {
      clock: deps.clock,
      farmReferenceRepository,
      localRecordRepository: new InMemoryLocalRecordRepository({ locations: [], trackedItems: [] }),
      organicCertificationRepository: deps.repository,
    },
  );

  assert.equal(payload.organicInputs[0].name, "Compost blend");
  assert.equal(payload.organicInputs[0].approvalEvidenceAttachmentIds[0], "certifier-email-1");
});

test("organic input applications link input, place, crop, reason, and evidence", async () => {
  const deps = dependencies();
  const farmReferenceRepository = new InMemoryFarmReferenceRepository();
  await farmReferenceRepository.createFarm(farm);
  await farmReferenceRepository.addLocation({
    id: "field-1",
    farmId: farm.id,
    name: "North Field",
    kind: "field",
    createdAt: "2026-06-02T10:00:00.000Z",
  });
  await farmReferenceRepository.addTrackedItem({
    id: "crop-1",
    farmId: farm.id,
    kind: "crop",
    name: "Kale",
    createdAt: "2026-06-02T10:00:00.000Z",
  });
  const organicInput = await saveOrganicInput(
    {
      farmId: farm.id,
      name: "Copper spray",
      inputCategory: "diseaseControl",
      approvalStatus: "restricted",
      restrictions: "Use only as approved by certifier.",
    },
    { ...deps, farmReferenceRepository },
  );

  const application = await recordOrganicInputApplication(
    {
      farmId: farm.id,
      inputId: organicInput.id,
      placeId: "field-1",
      cropId: "crop-1",
      date: "2026-06-01",
      quantity: "2",
      unit: "gal",
      rate: "2 gal per acre",
      reason: "Disease pressure after rain.",
      targetProblem: "Leaf spot",
      weatherNotes: "Cool and humid",
      appliedBy: "Sam",
      evidenceAttachmentIdsText: "application-photo-1",
    },
    { ...deps, farmReferenceRepository },
  );

  assert.equal(application.date, "2026-06-01T00:00:00.000Z");
  assert.equal(application.reason, "Disease pressure after rain.");

  const report = await createOrganicInputReport(
    { farm, reportType: "applicationLog" },
    { clock: deps.clock, repository: deps.repository },
  );

  assert.match(report, /Organic Input Application Log/);
  assert.match(report, /Input: Copper spray/);
  assert.match(report, /Target problem: Leaf spot/);

  const payload = await buildMobilePilotRecoveryCopyPayload(
    { farmId: farm.id },
    {
      clock: deps.clock,
      farmReferenceRepository,
      localRecordRepository: new InMemoryLocalRecordRepository({ locations: [], trackedItems: [] }),
      organicCertificationRepository: deps.repository,
    },
  );

  assert.equal(payload.organicInputApplications[0].inputId, organicInput.id);
  assert.equal(payload.organicInputApplications[0].evidenceAttachmentIds[0], "application-photo-1");
});

test("organic seed lots, commercial availability searches, and planting events are reportable and exported", async () => {
  const deps = dependencies();
  const farmReferenceRepository = new InMemoryFarmReferenceRepository();
  await farmReferenceRepository.createFarm(farm);
  await farmReferenceRepository.addLocation({
    id: "field-1",
    farmId: farm.id,
    name: "North Field",
    kind: "field",
    createdAt: "2026-06-02T10:00:00.000Z",
  });
  await farmReferenceRepository.addTrackedItem({
    id: "crop-1",
    farmId: farm.id,
    kind: "crop",
    name: "Kale",
    createdAt: "2026-06-02T10:00:00.000Z",
  });

  const seedLot = await saveSeedLot(
    {
      farmId: farm.id,
      cropId: "crop-1",
      variety: "Red Russian",
      supplier: "Seed Supplier",
      lotNumber: "LOT-7",
      purchaseDate: "2026-01-20",
      quantity: "1 packet",
      organicStatus: "untreatedNonOrganic",
      seedTreatment: "Untreated",
      invoiceAttachmentId: "invoice-1",
      labelAttachmentId: "label-1",
      notes: "Organic equivalent not found locally.",
    },
    { ...deps, farmReferenceRepository },
  );
  await recordCommercialAvailabilitySearch(
    {
      farmId: farm.id,
      seedLotId: seedLot.id,
      crop: "Kale",
      variety: "Red Russian",
      searchedOn: "2026-01-18",
      supplierName: "Organic Seed Supplier",
      result: "unavailable",
      evidenceAttachmentId: "search-screenshot-1",
      notes: "No equivalent organic variety available in time.",
    },
    deps,
  );
  await recordOrganicPlantingEvent(
    {
      farmId: farm.id,
      seedLotId: seedLot.id,
      cropId: "crop-1",
      placeId: "field-1",
      date: "2026-04-10",
      quantityPlanted: "1 packet",
      transplantOrDirectSeed: "directSeed",
    },
    { ...deps, farmReferenceRepository },
  );

  const seedReport = await createOrganicSeedReport(
    { farm, reportType: "seedLots" },
    { clock: deps.clock, repository: deps.repository },
  );
  assert.match(seedReport, /Organic Seed and Planting Stock Report/);
  assert.match(seedReport, /Organic status: Untreated nonorganic/);
  assert.match(seedReport, /Commercial availability searches: 1/);

  const plantingReport = await createOrganicSeedReport(
    { farm, reportType: "traceability" },
    { clock: deps.clock, repository: deps.repository },
  );
  assert.match(plantingReport, /Organic Seed-to-Crop Traceability Report/);
  assert.match(plantingReport, /Seed lot: Red Russian/);

  const payload = await buildMobilePilotRecoveryCopyPayload(
    { farmId: farm.id },
    {
      clock: deps.clock,
      farmReferenceRepository,
      localRecordRepository: new InMemoryLocalRecordRepository({ locations: [], trackedItems: [] }),
      organicCertificationRepository: deps.repository,
    },
  );

  assert.equal(payload.seedLots[0].variety, "Red Russian");
  assert.equal(payload.commercialAvailabilitySearches[0].evidenceAttachmentId, "search-screenshot-1");
  assert.equal(payload.organicPlantingEvents[0].placeId, "field-1");
});

test("organic soil records calculate manure intervals, report compost and rotation, and export locally", async () => {
  const deps = dependencies();
  const farmReferenceRepository = new InMemoryFarmReferenceRepository();
  await farmReferenceRepository.createFarm(farm);
  await farmReferenceRepository.addLocation({
    id: "field-1",
    farmId: farm.id,
    name: "North Field",
    kind: "field",
    createdAt: "2026-06-02T10:00:00.000Z",
  });
  await farmReferenceRepository.addTrackedItem({
    id: "crop-1",
    farmId: farm.id,
    kind: "crop",
    name: "Lettuce",
    createdAt: "2026-06-02T10:00:00.000Z",
  });

  await recordSoilFertilityPractice(
    {
      farmId: farm.id,
      placeId: "field-1",
      cropId: "crop-1",
      practiceType: "coverCrop",
      date: "2026-03-01",
      description: "Winter rye cover crop terminated before lettuce.",
      evidenceAttachmentIdsText: "photo-cover-1",
    },
    { ...deps, farmReferenceRepository },
  );
  const batch = await saveCompostBatch(
    { farmId: farm.id, name: "Spring compost", ingredients: "Leaves and manure", compostingMethod: "windrow" },
    deps,
  );
  await recordCompostTemperatureLog(
    { farmId: farm.id, compostBatchId: batch.id, date: "2026-04-01", temperatureF: 145, turned: true },
    deps,
  );
  const manure = await recordManureApplication(
    {
      farmId: farm.id,
      placeId: "field-1",
      cropId: "crop-1",
      applicationDate: "2026-01-01",
      manureType: "Raw poultry manure",
      ediblePortionContactSoil: true,
    },
    { ...deps, farmReferenceRepository },
  );
  await recordCropRotationRecord(
    { farmId: farm.id, placeId: "field-1", cropId: "crop-1", year: 2026, season: "Spring", coverCropUsed: true },
    { ...deps, farmReferenceRepository },
  );

  assert.equal(manure.requiredDaysBeforeHarvest, 120);
  assert.equal(manure.earliestHarvestDate, "2026-05-01");

  const report = await createOrganicSoilReport(
    { farm, reportType: "manure" },
    { clock: deps.clock, repository: deps.repository },
  );
  assert.match(report, /Organic Manure Application and Harvest Interval Report/);
  assert.match(report, /Required interval: 120 days/);
  assert.match(report, /Earliest harvest date: 2026-05-01/);

  const payload = await buildMobilePilotRecoveryCopyPayload(
    { farmId: farm.id },
    {
      clock: deps.clock,
      farmReferenceRepository,
      localRecordRepository: new InMemoryLocalRecordRepository({ locations: [], trackedItems: [] }),
      organicCertificationRepository: deps.repository,
    },
  );
  assert.equal(payload.soilFertilityPractices[0].practiceType, "coverCrop");
  assert.equal(payload.compostBatches[0].name, "Spring compost");
  assert.equal(payload.compostTemperatureLogs[0].temperatureF, 145);
  assert.equal(payload.manureApplications[0].earliestHarvestDate, "2026-05-01");
  assert.equal(payload.cropRotationRecords[0].coverCropUsed, true);
});

test("organic pest observations, actions, and plastic mulch records are reportable and exported", async () => {
  const deps = dependencies();
  const farmReferenceRepository = new InMemoryFarmReferenceRepository();
  await farmReferenceRepository.createFarm(farm);
  await farmReferenceRepository.addLocation({
    id: "field-1",
    farmId: farm.id,
    name: "North Field",
    kind: "field",
    createdAt: "2026-06-02T10:00:00.000Z",
  });
  await farmReferenceRepository.addTrackedItem({
    id: "crop-1",
    farmId: farm.id,
    kind: "crop",
    name: "Tomato",
    createdAt: "2026-06-02T10:00:00.000Z",
  });
  const observation = await recordPestWeedDiseaseObservation(
    {
      farmId: farm.id,
      type: "pest",
      placeId: "field-1",
      cropId: "crop-1",
      observedAt: "2026-06-01",
      severity: "Moderate",
      description: "Aphids on tomato leaves.",
      photoAttachmentIdsText: "aphid-photo-1",
    },
    { ...deps, farmReferenceRepository },
  );
  await recordPestWeedDiseaseAction(
    {
      farmId: farm.id,
      observationId: observation.id,
      actionType: "biological",
      actionDate: "2026-06-02",
      description: "Released beneficial insects.",
      whyNeeded: "Sanitation and scouting were not enough.",
      evidenceAttachmentIdsText: "action-photo-1",
    },
    deps,
  );
  await recordPlasticMulchRecord(
    {
      farmId: farm.id,
      placeId: "field-1",
      cropId: "crop-1",
      installedDate: "2026-05-01",
      removedDate: "2026-09-15",
      material: "Black plastic mulch",
      evidenceAttachmentIdsText: "mulch-removal-photo-1",
    },
    { ...deps, farmReferenceRepository },
  );

  const report = await createOrganicPestReport(
    { farm, reportType: "pest" },
    { clock: deps.clock, repository: deps.repository },
  );
  assert.match(report, /Organic Pest Observation and Action Report/);
  assert.match(report, /Aphids on tomato leaves/);
  assert.match(report, /Actions: 1/);

  const payload = await buildMobilePilotRecoveryCopyPayload(
    { farmId: farm.id },
    {
      clock: deps.clock,
      farmReferenceRepository,
      localRecordRepository: new InMemoryLocalRecordRepository({ locations: [], trackedItems: [] }),
      organicCertificationRepository: deps.repository,
    },
  );
  assert.equal(payload.pestWeedDiseaseObservations[0].description, "Aphids on tomato leaves.");
  assert.equal(payload.pestWeedDiseaseActions[0].actionType, "biological");
  assert.equal(payload.plasticMulchRecords[0].removedDate, "2026-09-15");
});

test("organic lots link harvest context, can be edited, traced through sale, mass-balanced, and exported", async () => {
  const deps = dependencies();
  const farmReferenceRepository = new InMemoryFarmReferenceRepository();
  await farmReferenceRepository.createFarm(farm);
  await farmReferenceRepository.addLocation({
    id: "field-1",
    farmId: farm.id,
    name: "North Field",
    kind: "field",
    createdAt: "2026-06-02T10:00:00.000Z",
  });
  await farmReferenceRepository.addLocation({
    id: "cooler-1",
    farmId: farm.id,
    name: "Cooler",
    kind: "cooler",
    createdAt: "2026-06-02T10:00:00.000Z",
  });
  await farmReferenceRepository.addTrackedItem({
    id: "crop-1",
    farmId: farm.id,
    kind: "crop",
    name: "Kale",
    createdAt: "2026-06-02T10:00:00.000Z",
  });

  const lot = await saveOrganicLot(
    {
      farmId: farm.id,
      lotCode: "KALE-2026-001",
      cropId: "crop-1",
      placeId: "field-1",
      harvestDate: "2026-06-01",
      organicStatus: "organic",
      quantityHarvested: "100",
      unit: "lb",
      createdFromHarvestRecordId: "harvest-1",
    },
    { ...deps, farmReferenceRepository },
  );
  const editedLot = await saveOrganicLot(
    {
      farmId: farm.id,
      id: lot.id,
      lotCode: "KALE-2026-001A",
      cropId: "crop-1",
      placeId: "field-1",
      harvestDate: "2026-06-01",
      organicStatus: "organic",
      quantityHarvested: 100,
      unit: "lb",
      createdFromHarvestRecordId: "harvest-1",
      notes: "Edited after tote labels were checked.",
    },
    { ...deps, farmReferenceRepository },
  );
  await recordOrganicHandlingEvent(
    {
      farmId: farm.id,
      lotId: lot.id,
      eventType: "wash",
      eventDate: "2026-06-01",
      quantityIn: "100",
      quantityOut: "95",
      unit: "lb",
      facilityPlaceId: "cooler-1",
      equipmentUsed: "Wash table",
    },
    { ...deps, farmReferenceRepository },
  );
  await recordOrganicStorageRecord(
    {
      farmId: farm.id,
      lotId: lot.id,
      storagePlaceId: "cooler-1",
      dateIn: "2026-06-01",
      quantityIn: "95",
      quantityOut: "30",
      unit: "lb",
      containerId: "bin-7",
    },
    { ...deps, farmReferenceRepository },
  );
  await recordOrganicSaleRecord(
    {
      farmId: farm.id,
      lotId: lot.id,
      buyer: "Saturday Market",
      saleDate: "2026-06-02",
      quantity: "30",
      unit: "lb",
      invoiceNumber: "INV-7",
      organicClaim: "Certified organic kale",
      evidenceAttachmentIdsText: "invoice-photo-1",
    },
    deps,
  );

  assert.equal(editedLot.id, lot.id);
  assert.equal(editedLot.lotCode, "KALE-2026-001A");

  const traceabilityReport = await createOrganicTraceabilityReport(
    { farm, reportType: "lots", lotId: lot.id },
    { clock: deps.clock, farmReferenceRepository, repository: deps.repository },
  );
  assert.match(traceabilityReport, /Organic Lot Traceability Report/);
  assert.match(traceabilityReport, /Lot: KALE-2026-001A/);
  assert.match(traceabilityReport, /Crop: Kale \(crop-1\)/);
  assert.match(traceabilityReport, /Harvest place: North Field \(field-1\)/);
  assert.match(traceabilityReport, /Source harvest record ID: harvest-1/);

  const saleReport = await createOrganicTraceabilityReport(
    { farm, reportType: "sales", lotId: lot.id },
    { clock: deps.clock, farmReferenceRepository, repository: deps.repository },
  );
  assert.match(saleReport, /Saturday Market/);
  assert.match(saleReport, /Sale lot: KALE-2026-001A \(organic-1\)/);
  assert.match(saleReport, /Harvest place: North Field \(field-1\)/);
  assert.match(saleReport, /Certified organic kale/);

  const snapshot = await createOrganicMassBalanceSnapshot({ farmId: farm.id, lotId: lot.id }, { repository: deps.repository });
  assert.equal(snapshot.quantityHarvested, 100);
  assert.equal(snapshot.quantitySold, 30);
  assert.equal(snapshot.quantityLost, 5);
  assert.equal(snapshot.expectedRemaining, 65);
  assert.equal(snapshot.actualRemaining, 65);
  assert.equal(snapshot.discrepancy, 0);

  const payload = await buildMobilePilotRecoveryCopyPayload(
    { farmId: farm.id },
    {
      clock: deps.clock,
      farmReferenceRepository,
      localRecordRepository: new InMemoryLocalRecordRepository({ locations: [], trackedItems: [] }),
      organicCertificationRepository: deps.repository,
    },
  );
  assert.equal(payload.organicLots[0].lotCode, "KALE-2026-001A");
  assert.equal(payload.organicHandlingEvents[0].eventType, "wash");
  assert.equal(payload.organicStorageRecords[0].containerId, "bin-7");
  assert.equal(payload.organicSaleRecords[0].invoiceNumber, "INV-7");
});

test("organic system plan sections and planning-backed inspection preparation can be edited, reported, and exported", async () => {
  const deps = dependencies();
  const section = await saveOrganicSystemPlanSection(
    {
      farmId: farm.id,
      sectionType: "recordkeeping",
      title: "Recordkeeping system",
      narrative: "Records are kept locally and exported before inspection review.",
      readinessStatus: "needsWork",
      evidenceAttachmentIdsText: "recovery-copy-1",
    },
    deps,
  );
  const editedSection = await saveOrganicSystemPlanSection(
    {
      farmId: farm.id,
      id: section.id,
      sectionType: "recordkeeping",
      title: "Recordkeeping and recovery copy",
      narrative: "Records are kept locally, reviewed monthly, and exported before inspection review.",
      readinessStatus: "readyForReview",
      evidenceAttachmentIdsText: "recovery-copy-1\nexport-report-1",
    },
    deps,
  );
  await saveOrganicInspectionReadinessItem(
    {
      farmId: farm.id,
      category: "traceability",
      prompt: "Lot-to-sale records are ready for inspector review.",
      readinessStatus: "readyForReview",
      notes: "Kale lot packet reviewed.",
      evidenceAttachmentIdsText: "mass-balance-1",
    },
    deps,
  );
  const certificationPlan = await ensureOrganicCertificationPlan(
    { farmId: farm.id, targetDate: "2026-09-01" },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
  );
  await savePlanningTask(
    {
      farmId: farm.id,
      goalId: certificationPlan.subgoals.find((goal) => goal.title.includes("inspection"))?.id,
      title: "Gather inspector map notes",
      notes: "Use linked farm notes and OSP section references.",
      status: "inProgress",
      priority: "high",
      dueDate: "2026-08-20",
      source: "organicCertification",
    },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
  );

  assert.equal(editedSection.id, section.id);
  assert.equal(editedSection.readinessStatus, "readyForReview");

  const ospReport = await createOrganicSystemPlanReport(
    { farm, reportType: "ospDraft" },
    { clock: deps.clock, repository: deps.repository },
  );
  assert.match(ospReport, /Organic System Plan Draft Summary/);
  assert.match(ospReport, /Recordkeeping and recovery copy/);
  assert.match(ospReport, /not a certifier submission/);

  const checklist = await createOrganicSystemPlanReport(
    { farm, reportType: "inspectionReadiness" },
    { clock: deps.clock, planningRepository: deps.planningRepository, repository: deps.repository },
  );
  assert.match(checklist, /Organic Inspection Preparation Tasks/);
  assert.match(checklist, /Connect farm events to certification requirements/);
  assert.match(checklist, /Gather inspector map notes/);
  assert.match(checklist, /Lot-to-sale records are ready/);

  const farmReferenceRepository = new InMemoryFarmReferenceRepository();
  await farmReferenceRepository.createFarm(farm);
  const payload = await buildMobilePilotRecoveryCopyPayload(
    { farmId: farm.id },
    {
      clock: deps.clock,
      farmReferenceRepository,
      localRecordRepository: new InMemoryLocalRecordRepository({ locations: [], trackedItems: [] }),
      organicCertificationRepository: deps.repository,
      planningRepository: deps.planningRepository,
    },
  );
  assert.equal(payload.organicSystemPlanSections[0].title, "Recordkeeping and recovery copy");
  assert.equal(payload.organicInspectionReadinessItems[0].category, "traceability");
  assert.equal(payload.planningTasks.some((task) => task.title === "Gather inspector map notes"), true);
});

test("organic report packages combine implemented reports, store a manifest, and export locally", async () => {
  const deps = dependencies();
  const farmReferenceRepository = new InMemoryFarmReferenceRepository();
  await farmReferenceRepository.createFarm(farm);
  await saveOrganicOperationProfile(
    { farmId: farm.id, organicStatus: "certified", certifierName: "Good Certifier", recordRetentionYears: 5, enabledScopes: ["crops"] },
    deps,
  );
  const reportPackage = await createOrganicReportPackage(
    { farm, farmId: farm.id, packageType: "inspectionPrep", title: "Inspection package", notes: "Before annual inspection." },
    { ...deps, farmReferenceRepository },
  );

  assert.equal(reportPackage.packageType, "inspectionPrep");
  assert.match(reportPackage.packageText, /Organic Profile Report/);
  assert.match(reportPackage.packageText, /Organic Input Application Log/);
  assert.match(reportPackage.packageText, /Organic Commercial Availability Search Report/);
  assert.match(reportPackage.packageText, /Organic Manure Application and Harvest Interval Report/);
  assert.match(reportPackage.packageText, /Organic Sale Traceability Report/);
  assert.match(reportPackage.packageText, /Organic Inspection Preparation Tasks/);
  assert.match(reportPackage.packageText, /not a certifier submission/);
  assert.equal(reportPackage.reportNames.length, 31);
  const manifest = JSON.parse(reportPackage.manifestJson);
  assert.equal(manifest.recordCounts.organicLots, 0);
  assert.equal(manifest.recordCounts.organicHandlingEvents, 0);
  assert.equal(manifest.recordCounts.pestWeedDiseaseActions, 0);
  assert.equal(manifest.recordCounts.organicCertificationPlanningTasks, 0);

  const payload = await buildMobilePilotRecoveryCopyPayload(
    { farmId: farm.id },
    {
      clock: deps.clock,
      farmReferenceRepository,
      localRecordRepository: new InMemoryLocalRecordRepository({ locations: [], trackedItems: [] }),
      organicCertificationRepository: deps.repository,
    },
  );
  assert.equal(payload.organicReportPackages[0].title, "Inspection package");
  assert.match(payload.organicReportPackages[0].packageText, /Manifest/);
});

test("farm notes can be linked as organic evidence without duplicating source capture", async () => {
  const deps = dependencies();
  const farmReferenceRepository = new InMemoryFarmReferenceRepository();
  await farmReferenceRepository.createFarm(farm);
  await saveOrganicOperationProfile(
    { farmId: farm.id, organicStatus: "certified", certifierName: "Good Certifier", recordRetentionYears: 5, enabledScopes: ["crops"] },
    deps,
  );
  const farmEventRepository = new InMemoryFarmEventRepository({ locations: [] });
  const recorded = await recordFarmEvent(
    {
      farmId: farm.id,
      eventType: "fieldObservation",
      note: "Photo of buffer strip after neighbor sprayed.",
      needsOrganicReview: true,
      attachments: [
        { kind: "voiceMemo", localUri: "file:///local/buffer.m4a" },
        { kind: "photo", localUri: "file:///local/buffer.jpg", mimeType: "image/jpeg" },
      ],
    },
    {
      clock: deps.clock,
      farmEventRepository,
      farmReferenceRepository,
      idGenerator: deps.idGenerator,
    },
  );

  const queueBeforeLink = await listOrganicReviewQueue(
    { farmId: farm.id },
    { farmEventRepository, repository: deps.repository },
  );
  assert.equal(queueBeforeLink[0].reason, "markedForReview");

  const link = await saveOrganicEvidenceLink(
    {
      farmId: farm.id,
      farmEventId: recorded.event.id,
      category: "land",
      linkedRecordType: "organicPlaceProfile",
      linkedRecordId: "field-1",
      evidenceRole: "photoEvidence",
      notes: "Shows buffer condition for certifier review.",
    },
    {
      clock: deps.clock,
      farmEventRepository,
      idGenerator: deps.idGenerator,
      repository: deps.repository,
    },
  );

  assert.equal(link.privacy, "privateToFarm");
  assert.equal(link.farmEventId, recorded.event.id);
  assert.equal((await farmEventRepository.getFarmEventDetail(farm.id, recorded.event.id))?.event.needsOrganicReview, false);
  assert.equal((await listOrganicEvidenceLinksForFarmNote({ farmId: farm.id, farmEventId: recorded.event.id }, { repository: deps.repository })).length, 1);

  const report = await createOrganicFarmNoteEvidenceReport(
    { farm },
    { clock: deps.clock, farmEventRepository, repository: deps.repository },
  );
  assert.match(report, /Organic Farm Note Evidence Report/);
  assert.match(report, /Photo evidence/);
  assert.match(report, /voiceMemo, photo/);

  const reportPackage = await createOrganicReportPackage(
    { farm, farmId: farm.id, packageType: "inspectionPrep", title: "Inspection package" },
    { ...deps, farmEventRepository, farmReferenceRepository },
  );
  assert.match(reportPackage.packageText, /Organic Farm Note Evidence Report/);
  assert.equal(JSON.parse(reportPackage.manifestJson).recordCounts.organicEvidenceLinks, 1);

  const payload = await buildMobilePilotRecoveryCopyPayload(
    { farmId: farm.id },
    {
      clock: deps.clock,
      farmReferenceRepository,
      localRecordRepository: new InMemoryLocalRecordRepository({ locations: [], trackedItems: [] }),
      organicCertificationRepository: deps.repository,
    },
  );
  assert.equal(payload.organicEvidenceLinks[0].farmEventId, recorded.event.id);
});

test("organic advanced scope records can be edited, reported, and exported", async () => {
  const deps = dependencies();
  const record = await saveOrganicAdvancedScopeRecord(
    {
      farmId: farm.id,
      scopeType: "wildCrops",
      topic: "Maple sap wild harvest area",
      description: "Document no prohibited substances and sustainable harvest notes.",
      readinessStatus: "needsWork",
      evidenceAttachmentIdsText: "wild-map-1",
    },
    deps,
  );
  const edited = await saveOrganicAdvancedScopeRecord(
    {
      farmId: farm.id,
      id: record.id,
      scopeType: "wildCrops",
      topic: "Maple sap wild harvest area",
      description: "Map and land-use statement reviewed with certifier.",
      readinessStatus: "readyForReview",
      evidenceAttachmentIdsText: "wild-map-1\ncertifier-note-1",
    },
    deps,
  );

  assert.equal(edited.id, record.id);
  assert.equal(edited.readinessStatus, "readyForReview");

  const report = await createOrganicAdvancedScopeReport({ farm }, { clock: deps.clock, repository: deps.repository });
  assert.match(report, /Organic Advanced Scope Readiness Report/);
  assert.match(report, /Wild crops: Maple sap wild harvest area/);
  assert.match(report, /does not implement full specialty-scope compliance/);

  const farmReferenceRepository = new InMemoryFarmReferenceRepository();
  await farmReferenceRepository.createFarm(farm);
  const payload = await buildMobilePilotRecoveryCopyPayload(
    { farmId: farm.id },
    {
      clock: deps.clock,
      farmReferenceRepository,
      localRecordRepository: new InMemoryLocalRecordRepository({ locations: [], trackedItems: [] }),
      organicCertificationRepository: deps.repository,
    },
  );
  assert.equal(payload.organicAdvancedScopeRecords[0].scopeType, "wildCrops");
});
