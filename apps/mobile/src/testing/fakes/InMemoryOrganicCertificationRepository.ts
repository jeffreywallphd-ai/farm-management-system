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
import type { OrganicCertificationRepository } from "../../application/ports/OrganicCertificationRepository";

export class InMemoryOrganicCertificationRepository implements OrganicCertificationRepository {
  private profiles = new Map<FarmId, OrganicOperationProfile>();
  private scopes = new Map<FarmId, OrganicCertificationScope[]>();
  private placeProfiles = new Map<FarmId, OrganicPlaceProfile[]>();
  private evidence = new Map<FarmId, OrganicBoundaryEvidence[]>();
  private organicInputs = new Map<FarmId, OrganicInput[]>();
  private inputApplications = new Map<FarmId, OrganicInputApplication[]>();
  private seedLots = new Map<FarmId, SeedLot[]>();
  private seedSearches = new Map<FarmId, CommercialAvailabilitySearch[]>();
  private plantingEvents = new Map<FarmId, OrganicPlantingEvent[]>();
  private soilPractices = new Map<FarmId, SoilFertilityPractice[]>();
  private compostBatches = new Map<FarmId, CompostBatch[]>();
  private compostLogs = new Map<FarmId, CompostTemperatureLog[]>();
  private manureApplications = new Map<FarmId, ManureApplication[]>();
  private cropRotations = new Map<FarmId, CropRotationRecord[]>();
  private pestObservations = new Map<FarmId, PestWeedDiseaseObservation[]>();
  private pestActions = new Map<FarmId, PestWeedDiseaseAction[]>();
  private plasticMulchRecords = new Map<FarmId, PlasticMulchRecord[]>();
  private organicLots = new Map<FarmId, OrganicLot[]>();
  private organicHandlingEvents = new Map<FarmId, OrganicHandlingEvent[]>();
  private organicStorageRecords = new Map<FarmId, OrganicStorageRecord[]>();
  private organicSaleRecords = new Map<FarmId, OrganicSaleRecord[]>();
  private organicSystemPlanSections = new Map<FarmId, OrganicSystemPlanSection[]>();
  private organicInspectionItems = new Map<FarmId, OrganicInspectionReadinessItem[]>();
  private organicReportPackages = new Map<FarmId, OrganicReportPackage[]>();
  private organicAdvancedScopeRecords = new Map<FarmId, OrganicAdvancedScopeRecord[]>();
  private organicEvidenceLinks = new Map<FarmId, OrganicEvidenceLink[]>();

  async saveProfile(profile: OrganicOperationProfile, scopes: OrganicCertificationScope[]): Promise<void> {
    this.profiles.set(profile.farmId, profile);
    this.scopes.set(profile.farmId, scopes);
  }

  async getProfile(farmId: FarmId): Promise<OrganicOperationProfile | null> {
    return this.profiles.get(farmId) ?? null;
  }

  async listScopes(farmId: FarmId): Promise<OrganicCertificationScope[]> {
    return this.scopes.get(farmId) ?? [];
  }

  async savePlaceProfile(profile: OrganicPlaceProfile): Promise<void> {
    const existing = this.placeProfiles.get(profile.farmId) ?? [];
    this.placeProfiles.set(profile.farmId, [
      profile,
      ...existing.filter((candidate) => candidate.placeId !== profile.placeId),
    ]);
  }

  async getPlaceProfile(farmId: FarmId, placeId: string): Promise<OrganicPlaceProfile | null> {
    return this.placeProfiles.get(farmId)?.find((profile) => profile.placeId === placeId) ?? null;
  }

  async listPlaceProfiles(farmId: FarmId): Promise<OrganicPlaceProfile[]> {
    return this.placeProfiles.get(farmId) ?? [];
  }

  async saveBoundaryEvidence(evidence: OrganicBoundaryEvidence): Promise<void> {
    this.evidence.set(evidence.farmId, [evidence, ...(this.evidence.get(evidence.farmId) ?? [])]);
  }

  async listBoundaryEvidence(farmId: FarmId, placeId?: string): Promise<OrganicBoundaryEvidence[]> {
    const records = this.evidence.get(farmId) ?? [];
    return placeId ? records.filter((record) => record.placeId === placeId) : records;
  }

  async saveOrganicInput(input: OrganicInput): Promise<void> {
    const existing = this.organicInputs.get(input.farmId) ?? [];
    this.organicInputs.set(input.farmId, [
      input,
      ...existing.filter((candidate) => candidate.id !== input.id),
    ]);
  }

  async getOrganicInput(farmId: FarmId, id: string): Promise<OrganicInput | null> {
    return this.organicInputs.get(farmId)?.find((input) => input.id === id) ?? null;
  }

  async listOrganicInputs(farmId: FarmId): Promise<OrganicInput[]> {
    return this.organicInputs.get(farmId) ?? [];
  }

  async saveOrganicInputApplication(application: OrganicInputApplication): Promise<void> {
    this.inputApplications.set(application.farmId, [
      application,
      ...(this.inputApplications.get(application.farmId) ?? []),
    ]);
  }

  async listOrganicInputApplications(farmId: FarmId, inputId?: string): Promise<OrganicInputApplication[]> {
    const records = this.inputApplications.get(farmId) ?? [];
    return inputId ? records.filter((record) => record.inputId === inputId) : records;
  }

  async saveSeedLot(seedLot: SeedLot): Promise<void> {
    this.seedLots.set(seedLot.farmId, [
      seedLot,
      ...(this.seedLots.get(seedLot.farmId) ?? []).filter((candidate) => candidate.id !== seedLot.id),
    ]);
  }

  async getSeedLot(farmId: FarmId, id: string): Promise<SeedLot | null> {
    return this.seedLots.get(farmId)?.find((seedLot) => seedLot.id === id) ?? null;
  }

  async listSeedLots(farmId: FarmId): Promise<SeedLot[]> {
    return this.seedLots.get(farmId) ?? [];
  }

  async saveCommercialAvailabilitySearch(search: CommercialAvailabilitySearch): Promise<void> {
    this.seedSearches.set(search.farmId, [search, ...(this.seedSearches.get(search.farmId) ?? [])]);
  }

  async listCommercialAvailabilitySearches(farmId: FarmId, seedLotId?: string): Promise<CommercialAvailabilitySearch[]> {
    const records = this.seedSearches.get(farmId) ?? [];
    return seedLotId ? records.filter((record) => record.seedLotId === seedLotId) : records;
  }

  async saveOrganicPlantingEvent(event: OrganicPlantingEvent): Promise<void> {
    this.plantingEvents.set(event.farmId, [event, ...(this.plantingEvents.get(event.farmId) ?? [])]);
  }

  async listOrganicPlantingEvents(farmId: FarmId, seedLotId?: string): Promise<OrganicPlantingEvent[]> {
    const records = this.plantingEvents.get(farmId) ?? [];
    return seedLotId ? records.filter((record) => record.seedLotId === seedLotId) : records;
  }

  async saveSoilFertilityPractice(practice: SoilFertilityPractice): Promise<void> {
    this.soilPractices.set(practice.farmId, [practice, ...(this.soilPractices.get(practice.farmId) ?? [])]);
  }

  async listSoilFertilityPractices(farmId: FarmId): Promise<SoilFertilityPractice[]> {
    return this.soilPractices.get(farmId) ?? [];
  }

  async saveCompostBatch(batch: CompostBatch): Promise<void> {
    this.compostBatches.set(batch.farmId, [
      batch,
      ...(this.compostBatches.get(batch.farmId) ?? []).filter((candidate) => candidate.id !== batch.id),
    ]);
  }

  async getCompostBatch(farmId: FarmId, id: string): Promise<CompostBatch | null> {
    return this.compostBatches.get(farmId)?.find((batch) => batch.id === id) ?? null;
  }

  async listCompostBatches(farmId: FarmId): Promise<CompostBatch[]> {
    return this.compostBatches.get(farmId) ?? [];
  }

  async saveCompostTemperatureLog(log: CompostTemperatureLog): Promise<void> {
    this.compostLogs.set(log.farmId, [log, ...(this.compostLogs.get(log.farmId) ?? [])]);
  }

  async listCompostTemperatureLogs(farmId: FarmId, compostBatchId?: string): Promise<CompostTemperatureLog[]> {
    const records = this.compostLogs.get(farmId) ?? [];
    return compostBatchId ? records.filter((record) => record.compostBatchId === compostBatchId) : records;
  }

  async saveManureApplication(application: ManureApplication): Promise<void> {
    this.manureApplications.set(application.farmId, [application, ...(this.manureApplications.get(application.farmId) ?? [])]);
  }

  async listManureApplications(farmId: FarmId): Promise<ManureApplication[]> {
    return this.manureApplications.get(farmId) ?? [];
  }

  async saveCropRotationRecord(record: CropRotationRecord): Promise<void> {
    this.cropRotations.set(record.farmId, [record, ...(this.cropRotations.get(record.farmId) ?? [])]);
  }

  async listCropRotationRecords(farmId: FarmId): Promise<CropRotationRecord[]> {
    return this.cropRotations.get(farmId) ?? [];
  }

  async savePestWeedDiseaseObservation(observation: PestWeedDiseaseObservation): Promise<void> {
    this.pestObservations.set(observation.farmId, [observation, ...(this.pestObservations.get(observation.farmId) ?? [])]);
  }

  async getPestWeedDiseaseObservation(farmId: FarmId, id: string): Promise<PestWeedDiseaseObservation | null> {
    return this.pestObservations.get(farmId)?.find((observation) => observation.id === id) ?? null;
  }

  async listPestWeedDiseaseObservations(farmId: FarmId): Promise<PestWeedDiseaseObservation[]> {
    return this.pestObservations.get(farmId) ?? [];
  }

  async savePestWeedDiseaseAction(action: PestWeedDiseaseAction): Promise<void> {
    this.pestActions.set(action.farmId, [action, ...(this.pestActions.get(action.farmId) ?? [])]);
  }

  async listPestWeedDiseaseActions(farmId: FarmId, observationId?: string): Promise<PestWeedDiseaseAction[]> {
    const records = this.pestActions.get(farmId) ?? [];
    return observationId ? records.filter((record) => record.observationId === observationId) : records;
  }

  async savePlasticMulchRecord(record: PlasticMulchRecord): Promise<void> {
    this.plasticMulchRecords.set(record.farmId, [record, ...(this.plasticMulchRecords.get(record.farmId) ?? [])]);
  }

  async listPlasticMulchRecords(farmId: FarmId): Promise<PlasticMulchRecord[]> {
    return this.plasticMulchRecords.get(farmId) ?? [];
  }

  async saveOrganicLot(lot: OrganicLot): Promise<void> {
    this.organicLots.set(lot.farmId, [lot, ...(this.organicLots.get(lot.farmId) ?? []).filter((candidate) => candidate.id !== lot.id)]);
  }

  async getOrganicLot(farmId: FarmId, id: string): Promise<OrganicLot | null> {
    return this.organicLots.get(farmId)?.find((lot) => lot.id === id) ?? null;
  }

  async listOrganicLots(farmId: FarmId): Promise<OrganicLot[]> {
    return this.organicLots.get(farmId) ?? [];
  }

  async saveOrganicHandlingEvent(event: OrganicHandlingEvent): Promise<void> {
    this.organicHandlingEvents.set(event.farmId, [event, ...(this.organicHandlingEvents.get(event.farmId) ?? [])]);
  }

  async listOrganicHandlingEvents(farmId: FarmId, lotId?: string): Promise<OrganicHandlingEvent[]> {
    const records = this.organicHandlingEvents.get(farmId) ?? [];
    return lotId ? records.filter((record) => record.lotId === lotId || record.inputLotIds.includes(lotId) || record.outputLotIds.includes(lotId)) : records;
  }

  async saveOrganicStorageRecord(record: OrganicStorageRecord): Promise<void> {
    this.organicStorageRecords.set(record.farmId, [record, ...(this.organicStorageRecords.get(record.farmId) ?? [])]);
  }

  async listOrganicStorageRecords(farmId: FarmId, lotId?: string): Promise<OrganicStorageRecord[]> {
    const records = this.organicStorageRecords.get(farmId) ?? [];
    return lotId ? records.filter((record) => record.lotId === lotId) : records;
  }

  async saveOrganicSaleRecord(record: OrganicSaleRecord): Promise<void> {
    this.organicSaleRecords.set(record.farmId, [record, ...(this.organicSaleRecords.get(record.farmId) ?? [])]);
  }

  async listOrganicSaleRecords(farmId: FarmId, lotId?: string): Promise<OrganicSaleRecord[]> {
    const records = this.organicSaleRecords.get(farmId) ?? [];
    return lotId ? records.filter((record) => record.lotId === lotId) : records;
  }

  async saveOrganicSystemPlanSection(section: OrganicSystemPlanSection): Promise<void> {
    this.organicSystemPlanSections.set(section.farmId, [section, ...(this.organicSystemPlanSections.get(section.farmId) ?? []).filter((candidate) => candidate.id !== section.id)]);
  }

  async getOrganicSystemPlanSection(farmId: FarmId, id: string): Promise<OrganicSystemPlanSection | null> {
    return this.organicSystemPlanSections.get(farmId)?.find((section) => section.id === id) ?? null;
  }

  async listOrganicSystemPlanSections(farmId: FarmId): Promise<OrganicSystemPlanSection[]> {
    return this.organicSystemPlanSections.get(farmId) ?? [];
  }

  async saveOrganicInspectionReadinessItem(item: OrganicInspectionReadinessItem): Promise<void> {
    this.organicInspectionItems.set(item.farmId, [item, ...(this.organicInspectionItems.get(item.farmId) ?? []).filter((candidate) => candidate.id !== item.id)]);
  }

  async getOrganicInspectionReadinessItem(farmId: FarmId, id: string): Promise<OrganicInspectionReadinessItem | null> {
    return this.organicInspectionItems.get(farmId)?.find((item) => item.id === id) ?? null;
  }

  async listOrganicInspectionReadinessItems(farmId: FarmId): Promise<OrganicInspectionReadinessItem[]> {
    return this.organicInspectionItems.get(farmId) ?? [];
  }

  async saveOrganicReportPackage(reportPackage: OrganicReportPackage): Promise<void> {
    this.organicReportPackages.set(reportPackage.farmId, [reportPackage, ...(this.organicReportPackages.get(reportPackage.farmId) ?? [])]);
  }

  async listOrganicReportPackages(farmId: FarmId): Promise<OrganicReportPackage[]> {
    return this.organicReportPackages.get(farmId) ?? [];
  }

  async saveOrganicAdvancedScopeRecord(record: OrganicAdvancedScopeRecord): Promise<void> {
    this.organicAdvancedScopeRecords.set(record.farmId, [record, ...(this.organicAdvancedScopeRecords.get(record.farmId) ?? []).filter((candidate) => candidate.id !== record.id)]);
  }

  async getOrganicAdvancedScopeRecord(farmId: FarmId, id: string): Promise<OrganicAdvancedScopeRecord | null> {
    return this.organicAdvancedScopeRecords.get(farmId)?.find((record) => record.id === id) ?? null;
  }

  async listOrganicAdvancedScopeRecords(farmId: FarmId): Promise<OrganicAdvancedScopeRecord[]> {
    return this.organicAdvancedScopeRecords.get(farmId) ?? [];
  }

  async saveOrganicEvidenceLink(link: OrganicEvidenceLink): Promise<void> {
    const existing = this.organicEvidenceLinks.get(link.farmId) ?? [];
    this.organicEvidenceLinks.set(link.farmId, [
      link,
      ...existing.filter((candidate) => candidate.id !== link.id),
    ]);
  }

  async deleteOrganicEvidenceLink(farmId: FarmId, id: string): Promise<void> {
    this.organicEvidenceLinks.set(
      farmId,
      (this.organicEvidenceLinks.get(farmId) ?? []).filter((link) => link.id !== id),
    );
  }

  async listOrganicEvidenceLinks(
    farmId: FarmId,
    filters: {
      farmEventId?: string;
      category?: OrganicEvidenceCategory;
      linkedRecordType?: OrganicEvidenceRecordType;
      linkedRecordId?: string;
    } = {},
  ): Promise<OrganicEvidenceLink[]> {
    return (this.organicEvidenceLinks.get(farmId) ?? []).filter((link) => {
      if (filters.farmEventId && link.farmEventId !== filters.farmEventId) return false;
      if (filters.category && link.category !== filters.category) return false;
      if (filters.linkedRecordType && link.linkedRecordType !== filters.linkedRecordType) return false;
      if (filters.linkedRecordId && link.linkedRecordId !== filters.linkedRecordId) return false;
      return true;
    });
  }
}
