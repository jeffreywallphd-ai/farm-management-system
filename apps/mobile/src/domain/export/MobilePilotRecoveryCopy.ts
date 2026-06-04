import type { Farm } from "../farm/Farm";
import type { FarmLocation } from "../farm/FarmLocation";
import type { Farmhand, FarmhandRecurringSchedule, FarmhandScheduleSettings, FarmhandWeeklyScheduleBlock } from "../farmhand/Farmhand";
import type { FarmMapSettings, FarmPlaceGeometry } from "../gis/FarmMap";
import type { TrackedItem } from "../farm/TrackedItem";
import type { IsoDateTimeString } from "../records/OperationalRecord";
import type { HarvestRecorded } from "../records/HarvestRecorded";
import type { InventoryCountRecorded } from "../records/InventoryCountRecorded";
import type { MaterialUseRecorded } from "../records/MaterialUseRecorded";
import type {
  OrganicCertificationScope,
  OrganicOperationProfile,
} from "../organic/OrganicCertification";
import type { OrganicBoundaryEvidence, OrganicPlaceProfile } from "../organic/OrganicPlace";
import type { OrganicInput, OrganicInputApplication } from "../organic/OrganicInput";
import type { CommercialAvailabilitySearch, OrganicPlantingEvent, SeedLot } from "../organic/OrganicSeed";
import type {
  CompostBatch,
  CompostTemperatureLog,
  CropRotationRecord,
  ManureApplication,
  SoilFertilityPractice,
} from "../organic/OrganicSoil";
import type { PestWeedDiseaseAction, PestWeedDiseaseObservation, PlasticMulchRecord } from "../organic/OrganicPest";
import type { OrganicHandlingEvent, OrganicLot, OrganicSaleRecord, OrganicStorageRecord } from "../organic/OrganicTraceability";
import type { OrganicInspectionReadinessItem, OrganicSystemPlanSection } from "../organic/OrganicSystemPlan";
import type { OrganicReportPackage } from "../organic/OrganicReportPackage";
import type { OrganicAdvancedScopeRecord } from "../organic/OrganicAdvancedScope";
import type { OrganicEvidenceLink } from "../organic/OrganicEvidenceLink";
import type { PlanningBoard, PlanningGoal, PlanningLink, PlanningTask } from "../planning/Planning";

export const MOBILE_PILOT_RECOVERY_COPY_EXPORT_VERSION = 18;
export const MOBILE_PILOT_APP_DATA_SCHEMA_VERSION = 22;

export interface MobilePilotRecoveryCopy {
  exportVersion: typeof MOBILE_PILOT_RECOVERY_COPY_EXPORT_VERSION;
  createdAt: IsoDateTimeString;
  appDataSchemaVersion: typeof MOBILE_PILOT_APP_DATA_SCHEMA_VERSION;
  farm: Farm;
  locations: FarmLocation[];
  farmMapSettings?: FarmMapSettings;
  farmPlaceGeometries: FarmPlaceGeometry[];
  farmhands: Farmhand[];
  farmhandScheduleSettings?: FarmhandScheduleSettings;
  farmhandRecurringSchedules: FarmhandRecurringSchedule[];
  farmhandWeeklyScheduleBlocks: FarmhandWeeklyScheduleBlock[];
  trackedItems: TrackedItem[];
  harvestRecords: HarvestRecorded[];
  materialUseRecords: MaterialUseRecorded[];
  inventoryCountRecords: InventoryCountRecorded[];
  organicOperationProfile?: OrganicOperationProfile;
  organicCertificationScopes: OrganicCertificationScope[];
  organicPlaceProfiles: OrganicPlaceProfile[];
  organicBoundaryEvidence: OrganicBoundaryEvidence[];
  organicInputs: OrganicInput[];
  organicInputApplications: OrganicInputApplication[];
  seedLots: SeedLot[];
  commercialAvailabilitySearches: CommercialAvailabilitySearch[];
  organicPlantingEvents: OrganicPlantingEvent[];
  soilFertilityPractices: SoilFertilityPractice[];
  compostBatches: CompostBatch[];
  compostTemperatureLogs: CompostTemperatureLog[];
  manureApplications: ManureApplication[];
  cropRotationRecords: CropRotationRecord[];
  pestWeedDiseaseObservations: PestWeedDiseaseObservation[];
  pestWeedDiseaseActions: PestWeedDiseaseAction[];
  plasticMulchRecords: PlasticMulchRecord[];
  organicLots: OrganicLot[];
  organicHandlingEvents: OrganicHandlingEvent[];
  organicStorageRecords: OrganicStorageRecord[];
  organicSaleRecords: OrganicSaleRecord[];
  organicSystemPlanSections: OrganicSystemPlanSection[];
  organicInspectionReadinessItems: OrganicInspectionReadinessItem[];
  organicReportPackages: OrganicReportPackage[];
  organicAdvancedScopeRecords: OrganicAdvancedScopeRecord[];
  organicEvidenceLinks: OrganicEvidenceLink[];
  planningGoals: PlanningGoal[];
  planningBoards: PlanningBoard[];
  planningTasks: PlanningTask[];
  planningLinks: PlanningLink[];
}
