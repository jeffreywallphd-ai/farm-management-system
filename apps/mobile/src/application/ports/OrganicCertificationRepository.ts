import type { FarmId } from "../../domain/farm/Farm";
import type {
  OrganicCertificationScope,
  OrganicOperationProfile,
} from "../../domain/organic/OrganicCertification";
import type { OrganicBoundaryEvidence, OrganicPlaceProfile } from "../../domain/organic/OrganicPlace";
import type { OrganicInput, OrganicInputApplication } from "../../domain/organic/OrganicInput";
import type { CommercialAvailabilitySearch, OrganicPlantingEvent, SeedLot } from "../../domain/organic/OrganicSeed";
import type {
  CompostBatch,
  CompostTemperatureLog,
  CropRotationRecord,
  ManureApplication,
  SoilFertilityPractice,
} from "../../domain/organic/OrganicSoil";
import type { PestWeedDiseaseAction, PestWeedDiseaseObservation, PlasticMulchRecord } from "../../domain/organic/OrganicPest";
import type { OrganicHandlingEvent, OrganicLot, OrganicSaleRecord, OrganicStorageRecord } from "../../domain/organic/OrganicTraceability";
import type { OrganicInspectionReadinessItem, OrganicSystemPlanSection } from "../../domain/organic/OrganicSystemPlan";
import type { OrganicReportPackage } from "../../domain/organic/OrganicReportPackage";
import type { OrganicAdvancedScopeRecord } from "../../domain/organic/OrganicAdvancedScope";
import type { OrganicEvidenceCategory, OrganicEvidenceLink, OrganicEvidenceRecordType } from "../../domain/organic/OrganicEvidenceLink";

export interface OrganicCertificationRepository {
  saveProfile(profile: OrganicOperationProfile, scopes: OrganicCertificationScope[]): Promise<void>;
  getProfile(farmId: FarmId): Promise<OrganicOperationProfile | null>;
  listScopes(farmId: FarmId): Promise<OrganicCertificationScope[]>;
  savePlaceProfile(profile: OrganicPlaceProfile): Promise<void>;
  getPlaceProfile(farmId: FarmId, placeId: string): Promise<OrganicPlaceProfile | null>;
  listPlaceProfiles(farmId: FarmId): Promise<OrganicPlaceProfile[]>;
  saveBoundaryEvidence(evidence: OrganicBoundaryEvidence): Promise<void>;
  listBoundaryEvidence(farmId: FarmId, placeId?: string): Promise<OrganicBoundaryEvidence[]>;
  saveOrganicInput(input: OrganicInput): Promise<void>;
  getOrganicInput(farmId: FarmId, id: string): Promise<OrganicInput | null>;
  listOrganicInputs(farmId: FarmId): Promise<OrganicInput[]>;
  saveOrganicInputApplication(application: OrganicInputApplication): Promise<void>;
  listOrganicInputApplications(farmId: FarmId, inputId?: string): Promise<OrganicInputApplication[]>;
  saveSeedLot(seedLot: SeedLot): Promise<void>;
  getSeedLot(farmId: FarmId, id: string): Promise<SeedLot | null>;
  listSeedLots(farmId: FarmId): Promise<SeedLot[]>;
  saveCommercialAvailabilitySearch(search: CommercialAvailabilitySearch): Promise<void>;
  listCommercialAvailabilitySearches(farmId: FarmId, seedLotId?: string): Promise<CommercialAvailabilitySearch[]>;
  saveOrganicPlantingEvent(event: OrganicPlantingEvent): Promise<void>;
  listOrganicPlantingEvents(farmId: FarmId, seedLotId?: string): Promise<OrganicPlantingEvent[]>;
  saveSoilFertilityPractice(practice: SoilFertilityPractice): Promise<void>;
  listSoilFertilityPractices(farmId: FarmId): Promise<SoilFertilityPractice[]>;
  saveCompostBatch(batch: CompostBatch): Promise<void>;
  getCompostBatch(farmId: FarmId, id: string): Promise<CompostBatch | null>;
  listCompostBatches(farmId: FarmId): Promise<CompostBatch[]>;
  saveCompostTemperatureLog(log: CompostTemperatureLog): Promise<void>;
  listCompostTemperatureLogs(farmId: FarmId, compostBatchId?: string): Promise<CompostTemperatureLog[]>;
  saveManureApplication(application: ManureApplication): Promise<void>;
  listManureApplications(farmId: FarmId): Promise<ManureApplication[]>;
  saveCropRotationRecord(record: CropRotationRecord): Promise<void>;
  listCropRotationRecords(farmId: FarmId): Promise<CropRotationRecord[]>;
  savePestWeedDiseaseObservation(observation: PestWeedDiseaseObservation): Promise<void>;
  getPestWeedDiseaseObservation(farmId: FarmId, id: string): Promise<PestWeedDiseaseObservation | null>;
  listPestWeedDiseaseObservations(farmId: FarmId): Promise<PestWeedDiseaseObservation[]>;
  savePestWeedDiseaseAction(action: PestWeedDiseaseAction): Promise<void>;
  listPestWeedDiseaseActions(farmId: FarmId, observationId?: string): Promise<PestWeedDiseaseAction[]>;
  savePlasticMulchRecord(record: PlasticMulchRecord): Promise<void>;
  listPlasticMulchRecords(farmId: FarmId): Promise<PlasticMulchRecord[]>;
  saveOrganicLot(lot: OrganicLot): Promise<void>;
  getOrganicLot(farmId: FarmId, id: string): Promise<OrganicLot | null>;
  listOrganicLots(farmId: FarmId): Promise<OrganicLot[]>;
  saveOrganicHandlingEvent(event: OrganicHandlingEvent): Promise<void>;
  listOrganicHandlingEvents(farmId: FarmId, lotId?: string): Promise<OrganicHandlingEvent[]>;
  saveOrganicStorageRecord(record: OrganicStorageRecord): Promise<void>;
  listOrganicStorageRecords(farmId: FarmId, lotId?: string): Promise<OrganicStorageRecord[]>;
  saveOrganicSaleRecord(record: OrganicSaleRecord): Promise<void>;
  listOrganicSaleRecords(farmId: FarmId, lotId?: string): Promise<OrganicSaleRecord[]>;
  saveOrganicSystemPlanSection(section: OrganicSystemPlanSection): Promise<void>;
  getOrganicSystemPlanSection(farmId: FarmId, id: string): Promise<OrganicSystemPlanSection | null>;
  listOrganicSystemPlanSections(farmId: FarmId): Promise<OrganicSystemPlanSection[]>;
  saveOrganicInspectionReadinessItem(item: OrganicInspectionReadinessItem): Promise<void>;
  getOrganicInspectionReadinessItem(farmId: FarmId, id: string): Promise<OrganicInspectionReadinessItem | null>;
  listOrganicInspectionReadinessItems(farmId: FarmId): Promise<OrganicInspectionReadinessItem[]>;
  saveOrganicReportPackage(reportPackage: OrganicReportPackage): Promise<void>;
  listOrganicReportPackages(farmId: FarmId): Promise<OrganicReportPackage[]>;
  saveOrganicAdvancedScopeRecord(record: OrganicAdvancedScopeRecord): Promise<void>;
  getOrganicAdvancedScopeRecord(farmId: FarmId, id: string): Promise<OrganicAdvancedScopeRecord | null>;
  listOrganicAdvancedScopeRecords(farmId: FarmId): Promise<OrganicAdvancedScopeRecord[]>;
  saveOrganicEvidenceLink(link: OrganicEvidenceLink): Promise<void>;
  deleteOrganicEvidenceLink(farmId: FarmId, id: string): Promise<void>;
  listOrganicEvidenceLinks(farmId: FarmId, filters?: { farmEventId?: string; category?: OrganicEvidenceCategory; linkedRecordType?: OrganicEvidenceRecordType; linkedRecordId?: string }): Promise<OrganicEvidenceLink[]>;
}
