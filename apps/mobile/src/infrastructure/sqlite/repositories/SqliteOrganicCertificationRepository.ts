import type { SQLiteDatabase } from "expo-sqlite";

import type { FarmId } from "../../../domain/farm/Farm";
import type {
  OrganicCertificationScope,
  OrganicCertificationScopeStatus,
  OrganicCertificationScopeType,
  OrganicOperationProfile,
  OrganicOperationStatus,
} from "../../../domain/organic/OrganicCertification";
import type {
  OrganicBoundaryEvidence,
  OrganicBoundaryEvidenceType,
  OrganicPlaceProfile,
  OrganicPlaceStatus,
} from "../../../domain/organic/OrganicPlace";
import type {
  OrganicInput,
  OrganicInputApplication,
  OrganicInputApprovalStatus,
  OrganicInputCategory,
} from "../../../domain/organic/OrganicInput";
import type {
  CommercialAvailabilityResult,
  CommercialAvailabilitySearch,
  OrganicPlantingEvent,
  SeedLot,
  SeedLotOrganicStatus,
} from "../../../domain/organic/OrganicSeed";
import type {
  CompostBatch,
  CompostTemperatureLog,
  CropRotationRecord,
  ManureApplication,
  SoilFertilityPractice,
  SoilFertilityPracticeType,
} from "../../../domain/organic/OrganicSoil";
import type {
  PestWeedDiseaseAction,
  PestWeedDiseaseActionType,
  PestWeedDiseaseObservation,
  PestWeedDiseaseType,
  PlasticMulchRecord,
} from "../../../domain/organic/OrganicPest";
import type {
  OrganicHandlingEvent,
  OrganicHandlingEventType,
  OrganicLot,
  OrganicLotStatus,
  OrganicSaleRecord,
  OrganicStorageRecord,
} from "../../../domain/organic/OrganicTraceability";
import type {
  InspectionReadinessCategory,
  OrganicInspectionReadinessItem,
  OrganicOspSectionType,
  OrganicReadinessStatus,
  OrganicSystemPlanSection,
} from "../../../domain/organic/OrganicSystemPlan";
import type { OrganicReportPackage, OrganicReportPackageType } from "../../../domain/organic/OrganicReportPackage";
import type { OrganicAdvancedScopeRecord, OrganicAdvancedScopeType } from "../../../domain/organic/OrganicAdvancedScope";
import type {
  OrganicEvidenceCategory,
  OrganicEvidenceLink,
  OrganicEvidenceRecordType,
  OrganicEvidenceRole,
} from "../../../domain/organic/OrganicEvidenceLink";
import type { OrganicCertificationRepository } from "../../../application/ports/OrganicCertificationRepository";

interface ProfileRow {
  id: string;
  farm_id: string;
  organic_status: OrganicOperationStatus;
  certifier_name: string | null;
  certifier_contact: string | null;
  certificate_number: string | null;
  certificate_effective_date: string | null;
  annual_update_due_date: string | null;
  inspection_due_window: string | null;
  record_retention_years: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface ScopeRow {
  profile_id: string;
  farm_id: string;
  scope_type: OrganicCertificationScopeType;
  enabled: number;
  status: OrganicCertificationScopeStatus;
  certifier_notes: string | null;
  created_at: string;
  updated_at: string;
}

interface PlaceProfileRow {
  farm_id: string;
  place_id: string;
  organic_status: OrganicPlaceStatus;
  transition_start_date: string | null;
  last_prohibited_substance_date: string | null;
  organic_eligibility_date: string | null;
  certified_organic_since_date: string | null;
  boundary_description: string | null;
  buffer_description: string | null;
  adjacent_land_use: string | null;
  contamination_risks: string | null;
  certifier_approved: number;
  certifier_notes: string | null;
  evidence_attachment_ids_json: string;
  created_at: string;
  updated_at: string;
}

interface BoundaryEvidenceRow {
  id: string;
  farm_id: string;
  place_id: string;
  evidence_type: OrganicBoundaryEvidenceType;
  description: string;
  attachment_uri: string | null;
  captured_at: string;
  created_at: string;
}

interface OrganicInputRow {
  id: string;
  farm_id: string;
  material_id: string | null;
  name: string;
  input_category: OrganicInputCategory;
  manufacturer: string | null;
  supplier: string | null;
  composition: string | null;
  source: string | null;
  approval_status: OrganicInputApprovalStatus;
  approval_evidence_attachment_ids_json: string;
  certifier_approval_date: string | null;
  approval_expiration_date: string | null;
  restrictions: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface OrganicInputApplicationRow {
  id: string;
  farm_id: string;
  input_id: string;
  place_id: string | null;
  crop_id: string | null;
  date: string;
  quantity: string | null;
  unit: string | null;
  rate: string | null;
  reason: string | null;
  target_problem: string | null;
  weather_notes: string | null;
  applied_by: string | null;
  evidence_attachment_ids_json: string;
  linked_farm_note_id: string | null;
  created_at: string;
  updated_at: string;
}

interface SeedLotRow {
  id: string;
  farm_id: string;
  crop_id: string | null;
  variety: string;
  supplier: string | null;
  lot_number: string | null;
  purchase_date: string | null;
  quantity: string | null;
  organic_status: SeedLotOrganicStatus;
  seed_treatment: string | null;
  invoice_attachment_id: string | null;
  label_attachment_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface CommercialAvailabilitySearchRow {
  id: string;
  farm_id: string;
  seed_lot_id: string;
  crop: string | null;
  variety: string | null;
  searched_on: string;
  supplier_name: string;
  result: CommercialAvailabilityResult;
  evidence_attachment_id: string | null;
  notes: string | null;
  created_at: string;
}

interface OrganicPlantingEventRow {
  id: string;
  farm_id: string;
  seed_lot_id: string;
  crop_id: string | null;
  place_id: string | null;
  date: string;
  quantity_planted: string | null;
  transplant_or_direct_seed: "transplant" | "directSeed" | null;
  linked_farm_note_id: string | null;
  created_at: string;
}

interface SoilFertilityPracticeRow {
  id: string; farm_id: string; place_id: string | null; practice_type: SoilFertilityPracticeType; crop_id: string | null;
  date: string; description: string; evidence_attachment_ids_json: string; linked_farm_note_id: string | null; created_at: string;
}

interface CompostBatchRow {
  id: string; farm_id: string; name: string; ingredients: string | null; start_date: string | null;
  composting_method: "windrow" | "staticAeratedPile" | "inVessel" | "other" | null; initial_cn_ratio: string | null;
  status: string | null; notes: string | null; created_at: string; updated_at: string;
}

interface CompostTemperatureLogRow {
  id: string; farm_id: string; compost_batch_id: string; date: string; temperature_f: number; turned: number; notes: string | null; created_at: string;
}

interface ManureApplicationRow {
  id: string; farm_id: string; place_id: string | null; crop_id: string | null; application_date: string; manure_type: string | null;
  incorporated: number; edible_portion_contact_soil: number; required_days_before_harvest: 90 | 120; earliest_harvest_date: string;
  quantity: string | null; notes: string | null; created_at: string;
}

interface CropRotationRecordRow {
  id: string; farm_id: string; place_id: string | null; crop_id: string | null; season: string | null; year: number;
  previous_crop_id: string | null; rotation_purpose: "soilOrganicMatter" | "pestManagement" | "nutrientManagement" | "erosionControl" | null;
  cover_crop_used: number; notes: string | null; created_at: string;
}

interface PestWeedDiseaseObservationRow {
  id: string; farm_id: string; type: PestWeedDiseaseType; place_id: string | null; crop_id: string | null;
  observed_at: string; severity: string | null; description: string; photo_attachment_ids_json: string;
  linked_farm_note_id: string | null; created_at: string;
}

interface PestWeedDiseaseActionRow {
  id: string; farm_id: string; observation_id: string; action_type: PestWeedDiseaseActionType; action_date: string;
  description: string; input_application_id: string | null; why_needed: string | null; effectiveness_notes: string | null;
  evidence_attachment_ids_json: string; created_at: string;
}

interface PlasticMulchRecordRow {
  id: string; farm_id: string; place_id: string | null; crop_id: string | null; installed_date: string | null;
  removed_date: string | null; material: string | null; notes: string | null; evidence_attachment_ids_json: string; created_at: string;
}

interface OrganicLotRow {
  id: string; farm_id: string; lot_code: string; crop_id: string; place_id: string; harvest_date: string;
  organic_status: OrganicLotStatus; quantity_harvested: number; unit: string; created_from_harvest_record_id: string | null;
  notes: string | null; created_at: string; updated_at: string;
}

interface OrganicHandlingEventRow {
  id: string; farm_id: string; lot_id: string; event_type: OrganicHandlingEventType; event_date: string;
  input_lot_ids_json: string; output_lot_ids_json: string; quantity_in: number | null; quantity_out: number | null;
  unit: string | null; facility_place_id: string | null; equipment_used: string | null; cleaning_record_id: string | null;
  notes: string | null; created_at: string;
}

interface OrganicStorageRecordRow {
  id: string; farm_id: string; lot_id: string; storage_place_id: string; date_in: string; date_out: string | null;
  quantity_in: number; quantity_out: number | null; unit: string; container_id: string | null; notes: string | null; created_at: string;
}

interface OrganicSaleRecordRow {
  id: string; farm_id: string; lot_id: string; buyer: string; sale_date: string; quantity: number; unit: string;
  invoice_number: string | null; organic_claim: string | null; evidence_attachment_ids_json: string; created_at: string;
}

interface OrganicSystemPlanSectionRow {
  id: string; farm_id: string; section_type: OrganicOspSectionType; title: string; narrative: string;
  readiness_status: OrganicReadinessStatus; evidence_attachment_ids_json: string; notes: string | null; created_at: string; updated_at: string;
}

interface OrganicInspectionReadinessItemRow {
  id: string; farm_id: string; category: InspectionReadinessCategory; prompt: string; readiness_status: OrganicReadinessStatus;
  notes: string | null; evidence_attachment_ids_json: string; created_at: string; updated_at: string;
}

interface OrganicReportPackageRow {
  id: string; farm_id: string; package_type: OrganicReportPackageType; title: string; generated_at: string;
  report_names_json: string; manifest_json: string; package_text: string; notes: string | null; created_at: string;
}

interface OrganicAdvancedScopeRecordRow {
  id: string; farm_id: string; scope_type: OrganicAdvancedScopeType; topic: string; description: string;
  readiness_status: OrganicReadinessStatus; evidence_attachment_ids_json: string; notes: string | null; created_at: string; updated_at: string;
}

interface OrganicEvidenceLinkRow {
  id: string; farm_id: string; farm_event_id: string; category: OrganicEvidenceCategory;
  linked_record_type: OrganicEvidenceRecordType | null; linked_record_id: string | null;
  evidence_role: OrganicEvidenceRole; notes: string | null; privacy: "privateToFarm"; created_at: string; updated_at: string;
}

export class SqliteOrganicCertificationRepository implements OrganicCertificationRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  async saveProfile(profile: OrganicOperationProfile, scopes: OrganicCertificationScope[]): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO organic_operation_profiles (
        id, farm_id, organic_status, certifier_name, certifier_contact, certificate_number,
        certificate_effective_date, annual_update_due_date, inspection_due_window,
        record_retention_years, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(farm_id) DO UPDATE SET
        organic_status = excluded.organic_status,
        certifier_name = excluded.certifier_name,
        certifier_contact = excluded.certifier_contact,
        certificate_number = excluded.certificate_number,
        certificate_effective_date = excluded.certificate_effective_date,
        annual_update_due_date = excluded.annual_update_due_date,
        inspection_due_window = excluded.inspection_due_window,
        record_retention_years = excluded.record_retention_years,
        notes = excluded.notes,
        updated_at = excluded.updated_at;`,
      [
        profile.id,
        profile.farmId,
        profile.organicStatus,
        profile.certifierName ?? null,
        profile.certifierContact ?? null,
        profile.certificateNumber ?? null,
        profile.certificateEffectiveDate ?? null,
        profile.annualUpdateDueDate ?? null,
        profile.inspectionDueWindow ?? null,
        profile.recordRetentionYears,
        profile.notes ?? null,
        profile.createdAt,
        profile.updatedAt,
      ],
    );

    for (const scope of scopes) {
      await this.database.runAsync(
        `INSERT INTO organic_certification_scopes (
          profile_id, farm_id, scope_type, enabled, status, certifier_notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(farm_id, scope_type) DO UPDATE SET
          profile_id = excluded.profile_id,
          enabled = excluded.enabled,
          status = excluded.status,
          certifier_notes = excluded.certifier_notes,
          updated_at = excluded.updated_at;`,
        [
          scope.profileId,
          scope.farmId,
          scope.scopeType,
          scope.enabled ? 1 : 0,
          scope.status,
          scope.certifierNotes ?? null,
          scope.createdAt,
          scope.updatedAt,
        ],
      );
    }
  }

  async getProfile(farmId: FarmId): Promise<OrganicOperationProfile | null> {
    const row = await this.database.getFirstAsync<ProfileRow>(
      `SELECT id, farm_id, organic_status, certifier_name, certifier_contact, certificate_number,
        certificate_effective_date, annual_update_due_date, inspection_due_window, record_retention_years,
        notes, created_at, updated_at
       FROM organic_operation_profiles
       WHERE farm_id = ?
       LIMIT 1;`,
      [farmId],
    );

    return row ? mapProfile(row) : null;
  }

  async listScopes(farmId: FarmId): Promise<OrganicCertificationScope[]> {
    const rows = await this.database.getAllAsync<ScopeRow>(
      `SELECT profile_id, farm_id, scope_type, enabled, status, certifier_notes, created_at, updated_at
       FROM organic_certification_scopes
       WHERE farm_id = ?
       ORDER BY scope_type ASC;`,
      [farmId],
    );

    return rows.map(mapScope);
  }

  async savePlaceProfile(profile: OrganicPlaceProfile): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO organic_place_profiles (
        farm_id, place_id, organic_status, transition_start_date, last_prohibited_substance_date,
        organic_eligibility_date, certified_organic_since_date, boundary_description, buffer_description,
        adjacent_land_use, contamination_risks, certifier_approved, certifier_notes,
        evidence_attachment_ids_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(farm_id, place_id) DO UPDATE SET
        organic_status = excluded.organic_status,
        transition_start_date = excluded.transition_start_date,
        last_prohibited_substance_date = excluded.last_prohibited_substance_date,
        organic_eligibility_date = excluded.organic_eligibility_date,
        certified_organic_since_date = excluded.certified_organic_since_date,
        boundary_description = excluded.boundary_description,
        buffer_description = excluded.buffer_description,
        adjacent_land_use = excluded.adjacent_land_use,
        contamination_risks = excluded.contamination_risks,
        certifier_approved = excluded.certifier_approved,
        certifier_notes = excluded.certifier_notes,
        evidence_attachment_ids_json = excluded.evidence_attachment_ids_json,
        updated_at = excluded.updated_at;`,
      [
        profile.farmId,
        profile.placeId,
        profile.organicStatus,
        profile.transitionStartDate ?? null,
        profile.lastProhibitedSubstanceDate ?? null,
        profile.organicEligibilityDate ?? null,
        profile.certifiedOrganicSinceDate ?? null,
        profile.boundaryDescription ?? null,
        profile.bufferDescription ?? null,
        profile.adjacentLandUse ?? null,
        profile.contaminationRisks ?? null,
        profile.certifierApproved ? 1 : 0,
        profile.certifierNotes ?? null,
        JSON.stringify(profile.evidenceAttachmentIds),
        profile.createdAt,
        profile.updatedAt,
      ],
    );
  }

  async getPlaceProfile(farmId: FarmId, placeId: string): Promise<OrganicPlaceProfile | null> {
    const row = await this.database.getFirstAsync<PlaceProfileRow>(
      `SELECT farm_id, place_id, organic_status, transition_start_date, last_prohibited_substance_date,
        organic_eligibility_date, certified_organic_since_date, boundary_description, buffer_description,
        adjacent_land_use, contamination_risks, certifier_approved, certifier_notes,
        evidence_attachment_ids_json, created_at, updated_at
       FROM organic_place_profiles
       WHERE farm_id = ? AND place_id = ?
       LIMIT 1;`,
      [farmId, placeId],
    );

    return row ? mapPlaceProfile(row) : null;
  }

  async listPlaceProfiles(farmId: FarmId): Promise<OrganicPlaceProfile[]> {
    const rows = await this.database.getAllAsync<PlaceProfileRow>(
      `SELECT farm_id, place_id, organic_status, transition_start_date, last_prohibited_substance_date,
        organic_eligibility_date, certified_organic_since_date, boundary_description, buffer_description,
        adjacent_land_use, contamination_risks, certifier_approved, certifier_notes,
        evidence_attachment_ids_json, created_at, updated_at
       FROM organic_place_profiles
       WHERE farm_id = ?
       ORDER BY updated_at DESC;`,
      [farmId],
    );

    return rows.map(mapPlaceProfile);
  }

  async saveBoundaryEvidence(evidence: OrganicBoundaryEvidence): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO organic_boundary_evidence (
        id, farm_id, place_id, evidence_type, description, attachment_uri, captured_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        evidence.id,
        evidence.farmId,
        evidence.placeId,
        evidence.evidenceType,
        evidence.description,
        evidence.attachmentUri ?? null,
        evidence.capturedAt,
        evidence.createdAt,
      ],
    );
  }

  async listBoundaryEvidence(farmId: FarmId, placeId?: string): Promise<OrganicBoundaryEvidence[]> {
    const rows = placeId
      ? await this.database.getAllAsync<BoundaryEvidenceRow>(
          `SELECT id, farm_id, place_id, evidence_type, description, attachment_uri, captured_at, created_at
           FROM organic_boundary_evidence
           WHERE farm_id = ? AND place_id = ?
           ORDER BY captured_at DESC;`,
          [farmId, placeId],
        )
      : await this.database.getAllAsync<BoundaryEvidenceRow>(
          `SELECT id, farm_id, place_id, evidence_type, description, attachment_uri, captured_at, created_at
           FROM organic_boundary_evidence
           WHERE farm_id = ?
           ORDER BY captured_at DESC;`,
          [farmId],
        );

    return rows.map(mapBoundaryEvidence);
  }

  async saveOrganicInput(input: OrganicInput): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO organic_inputs (
        id, farm_id, material_id, name, input_category, manufacturer, supplier, composition, source,
        approval_status, approval_evidence_attachment_ids_json, certifier_approval_date, approval_expiration_date,
        restrictions, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        material_id = excluded.material_id,
        name = excluded.name,
        input_category = excluded.input_category,
        manufacturer = excluded.manufacturer,
        supplier = excluded.supplier,
        composition = excluded.composition,
        source = excluded.source,
        approval_status = excluded.approval_status,
        approval_evidence_attachment_ids_json = excluded.approval_evidence_attachment_ids_json,
        certifier_approval_date = excluded.certifier_approval_date,
        approval_expiration_date = excluded.approval_expiration_date,
        restrictions = excluded.restrictions,
        notes = excluded.notes,
        updated_at = excluded.updated_at;`,
      [
        input.id,
        input.farmId,
        input.materialId ?? null,
        input.name,
        input.inputCategory,
        input.manufacturer ?? null,
        input.supplier ?? null,
        input.composition ?? null,
        input.source ?? null,
        input.approvalStatus,
        JSON.stringify(input.approvalEvidenceAttachmentIds),
        input.certifierApprovalDate ?? null,
        input.approvalExpirationDate ?? null,
        input.restrictions ?? null,
        input.notes ?? null,
        input.createdAt,
        input.updatedAt,
      ],
    );
  }

  async getOrganicInput(farmId: FarmId, id: string): Promise<OrganicInput | null> {
    const row = await this.database.getFirstAsync<OrganicInputRow>(
      `SELECT id, farm_id, material_id, name, input_category, manufacturer, supplier, composition, source,
        approval_status, approval_evidence_attachment_ids_json, certifier_approval_date, approval_expiration_date,
        restrictions, notes, created_at, updated_at
       FROM organic_inputs
       WHERE farm_id = ? AND id = ?
       LIMIT 1;`,
      [farmId, id],
    );

    return row ? mapOrganicInput(row) : null;
  }

  async listOrganicInputs(farmId: FarmId): Promise<OrganicInput[]> {
    const rows = await this.database.getAllAsync<OrganicInputRow>(
      `SELECT id, farm_id, material_id, name, input_category, manufacturer, supplier, composition, source,
        approval_status, approval_evidence_attachment_ids_json, certifier_approval_date, approval_expiration_date,
        restrictions, notes, created_at, updated_at
       FROM organic_inputs
       WHERE farm_id = ?
       ORDER BY name ASC;`,
      [farmId],
    );

    return rows.map(mapOrganicInput);
  }

  async saveOrganicInputApplication(application: OrganicInputApplication): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO organic_input_applications (
        id, farm_id, input_id, place_id, crop_id, date, quantity, unit, rate, reason, target_problem,
        weather_notes, applied_by, evidence_attachment_ids_json, linked_farm_note_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        application.id,
        application.farmId,
        application.inputId,
        application.placeId ?? null,
        application.cropId ?? null,
        application.date,
        application.quantity ?? null,
        application.unit ?? null,
        application.rate ?? null,
        application.reason ?? null,
        application.targetProblem ?? null,
        application.weatherNotes ?? null,
        application.appliedBy ?? null,
        JSON.stringify(application.evidenceAttachmentIds),
        application.linkedFarmNoteId ?? null,
        application.createdAt,
        application.updatedAt,
      ],
    );
  }

  async listOrganicInputApplications(farmId: FarmId, inputId?: string): Promise<OrganicInputApplication[]> {
    const rows = inputId
      ? await this.database.getAllAsync<OrganicInputApplicationRow>(
          `SELECT id, farm_id, input_id, place_id, crop_id, date, quantity, unit, rate, reason, target_problem,
            weather_notes, applied_by, evidence_attachment_ids_json, linked_farm_note_id, created_at, updated_at
           FROM organic_input_applications
           WHERE farm_id = ? AND input_id = ?
           ORDER BY date DESC;`,
          [farmId, inputId],
        )
      : await this.database.getAllAsync<OrganicInputApplicationRow>(
          `SELECT id, farm_id, input_id, place_id, crop_id, date, quantity, unit, rate, reason, target_problem,
            weather_notes, applied_by, evidence_attachment_ids_json, linked_farm_note_id, created_at, updated_at
           FROM organic_input_applications
           WHERE farm_id = ?
           ORDER BY date DESC;`,
          [farmId],
        );

    return rows.map(mapOrganicInputApplication);
  }

  async saveSeedLot(seedLot: SeedLot): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO seed_lots (
        id, farm_id, crop_id, variety, supplier, lot_number, purchase_date, quantity, organic_status,
        seed_treatment, invoice_attachment_id, label_attachment_id, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        crop_id = excluded.crop_id,
        variety = excluded.variety,
        supplier = excluded.supplier,
        lot_number = excluded.lot_number,
        purchase_date = excluded.purchase_date,
        quantity = excluded.quantity,
        organic_status = excluded.organic_status,
        seed_treatment = excluded.seed_treatment,
        invoice_attachment_id = excluded.invoice_attachment_id,
        label_attachment_id = excluded.label_attachment_id,
        notes = excluded.notes,
        updated_at = excluded.updated_at;`,
      [
        seedLot.id,
        seedLot.farmId,
        seedLot.cropId ?? null,
        seedLot.variety,
        seedLot.supplier ?? null,
        seedLot.lotNumber ?? null,
        seedLot.purchaseDate ?? null,
        seedLot.quantity ?? null,
        seedLot.organicStatus,
        seedLot.seedTreatment ?? null,
        seedLot.invoiceAttachmentId ?? null,
        seedLot.labelAttachmentId ?? null,
        seedLot.notes ?? null,
        seedLot.createdAt,
        seedLot.updatedAt,
      ],
    );
  }

  async getSeedLot(farmId: FarmId, id: string): Promise<SeedLot | null> {
    const row = await this.database.getFirstAsync<SeedLotRow>(
      `SELECT id, farm_id, crop_id, variety, supplier, lot_number, purchase_date, quantity, organic_status,
        seed_treatment, invoice_attachment_id, label_attachment_id, notes, created_at, updated_at
       FROM seed_lots WHERE farm_id = ? AND id = ? LIMIT 1;`,
      [farmId, id],
    );
    return row ? mapSeedLot(row) : null;
  }

  async listSeedLots(farmId: FarmId): Promise<SeedLot[]> {
    const rows = await this.database.getAllAsync<SeedLotRow>(
      `SELECT id, farm_id, crop_id, variety, supplier, lot_number, purchase_date, quantity, organic_status,
        seed_treatment, invoice_attachment_id, label_attachment_id, notes, created_at, updated_at
       FROM seed_lots WHERE farm_id = ? ORDER BY updated_at DESC;`,
      [farmId],
    );
    return rows.map(mapSeedLot);
  }

  async saveCommercialAvailabilitySearch(search: CommercialAvailabilitySearch): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO commercial_availability_searches (
        id, farm_id, seed_lot_id, crop, variety, searched_on, supplier_name, result,
        evidence_attachment_id, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        search.id,
        search.farmId,
        search.seedLotId,
        search.crop ?? null,
        search.variety ?? null,
        search.searchedOn,
        search.supplierName,
        search.result,
        search.evidenceAttachmentId ?? null,
        search.notes ?? null,
        search.createdAt,
      ],
    );
  }

  async listCommercialAvailabilitySearches(farmId: FarmId, seedLotId?: string): Promise<CommercialAvailabilitySearch[]> {
    const rows = seedLotId
      ? await this.database.getAllAsync<CommercialAvailabilitySearchRow>(
          `SELECT id, farm_id, seed_lot_id, crop, variety, searched_on, supplier_name, result,
            evidence_attachment_id, notes, created_at
           FROM commercial_availability_searches WHERE farm_id = ? AND seed_lot_id = ? ORDER BY searched_on DESC;`,
          [farmId, seedLotId],
        )
      : await this.database.getAllAsync<CommercialAvailabilitySearchRow>(
          `SELECT id, farm_id, seed_lot_id, crop, variety, searched_on, supplier_name, result,
            evidence_attachment_id, notes, created_at
           FROM commercial_availability_searches WHERE farm_id = ? ORDER BY searched_on DESC;`,
          [farmId],
        );
    return rows.map(mapCommercialAvailabilitySearch);
  }

  async saveOrganicPlantingEvent(event: OrganicPlantingEvent): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO organic_planting_events (
        id, farm_id, seed_lot_id, crop_id, place_id, date, quantity_planted,
        transplant_or_direct_seed, linked_farm_note_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        event.id,
        event.farmId,
        event.seedLotId,
        event.cropId ?? null,
        event.placeId ?? null,
        event.date,
        event.quantityPlanted ?? null,
        event.transplantOrDirectSeed ?? null,
        event.linkedFarmNoteId ?? null,
        event.createdAt,
      ],
    );
  }

  async listOrganicPlantingEvents(farmId: FarmId, seedLotId?: string): Promise<OrganicPlantingEvent[]> {
    const rows = seedLotId
      ? await this.database.getAllAsync<OrganicPlantingEventRow>(
          `SELECT id, farm_id, seed_lot_id, crop_id, place_id, date, quantity_planted,
            transplant_or_direct_seed, linked_farm_note_id, created_at
           FROM organic_planting_events WHERE farm_id = ? AND seed_lot_id = ? ORDER BY date DESC;`,
          [farmId, seedLotId],
        )
      : await this.database.getAllAsync<OrganicPlantingEventRow>(
          `SELECT id, farm_id, seed_lot_id, crop_id, place_id, date, quantity_planted,
            transplant_or_direct_seed, linked_farm_note_id, created_at
           FROM organic_planting_events WHERE farm_id = ? ORDER BY date DESC;`,
          [farmId],
        );
    return rows.map(mapOrganicPlantingEvent);
  }

  async saveSoilFertilityPractice(practice: SoilFertilityPractice): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO soil_fertility_practices (
        id, farm_id, place_id, practice_type, crop_id, date, description,
        evidence_attachment_ids_json, linked_farm_note_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        practice.id,
        practice.farmId,
        practice.placeId ?? null,
        practice.practiceType,
        practice.cropId ?? null,
        practice.date,
        practice.description,
        JSON.stringify(practice.evidenceAttachmentIds),
        practice.linkedFarmNoteId ?? null,
        practice.createdAt,
      ],
    );
  }

  async listSoilFertilityPractices(farmId: FarmId): Promise<SoilFertilityPractice[]> {
    const rows = await this.database.getAllAsync<SoilFertilityPracticeRow>(
      `SELECT id, farm_id, place_id, practice_type, crop_id, date, description,
        evidence_attachment_ids_json, linked_farm_note_id, created_at
       FROM soil_fertility_practices WHERE farm_id = ? ORDER BY date DESC;`,
      [farmId],
    );
    return rows.map(mapSoilFertilityPractice);
  }

  async saveCompostBatch(batch: CompostBatch): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO compost_batches (
        id, farm_id, name, ingredients, start_date, composting_method, initial_cn_ratio,
        status, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        ingredients = excluded.ingredients,
        start_date = excluded.start_date,
        composting_method = excluded.composting_method,
        initial_cn_ratio = excluded.initial_cn_ratio,
        status = excluded.status,
        notes = excluded.notes,
        updated_at = excluded.updated_at;`,
      [
        batch.id,
        batch.farmId,
        batch.name,
        batch.ingredients ?? null,
        batch.startDate ?? null,
        batch.compostingMethod ?? null,
        batch.initialCNRatio ?? null,
        batch.status ?? null,
        batch.notes ?? null,
        batch.createdAt,
        batch.updatedAt,
      ],
    );
  }

  async getCompostBatch(farmId: FarmId, id: string): Promise<CompostBatch | null> {
    const row = await this.database.getFirstAsync<CompostBatchRow>(
      `SELECT id, farm_id, name, ingredients, start_date, composting_method, initial_cn_ratio,
        status, notes, created_at, updated_at FROM compost_batches WHERE farm_id = ? AND id = ? LIMIT 1;`,
      [farmId, id],
    );
    return row ? mapCompostBatch(row) : null;
  }

  async listCompostBatches(farmId: FarmId): Promise<CompostBatch[]> {
    const rows = await this.database.getAllAsync<CompostBatchRow>(
      `SELECT id, farm_id, name, ingredients, start_date, composting_method, initial_cn_ratio,
        status, notes, created_at, updated_at FROM compost_batches WHERE farm_id = ? ORDER BY updated_at DESC;`,
      [farmId],
    );
    return rows.map(mapCompostBatch);
  }

  async saveCompostTemperatureLog(log: CompostTemperatureLog): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO compost_temperature_logs (
        id, farm_id, compost_batch_id, date, temperature_f, turned, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [log.id, log.farmId, log.compostBatchId, log.date, log.temperatureF, log.turned ? 1 : 0, log.notes ?? null, log.createdAt],
    );
  }

  async listCompostTemperatureLogs(farmId: FarmId, compostBatchId?: string): Promise<CompostTemperatureLog[]> {
    const rows = compostBatchId
      ? await this.database.getAllAsync<CompostTemperatureLogRow>(
          `SELECT id, farm_id, compost_batch_id, date, temperature_f, turned, notes, created_at
           FROM compost_temperature_logs WHERE farm_id = ? AND compost_batch_id = ? ORDER BY date DESC;`,
          [farmId, compostBatchId],
        )
      : await this.database.getAllAsync<CompostTemperatureLogRow>(
          `SELECT id, farm_id, compost_batch_id, date, temperature_f, turned, notes, created_at
           FROM compost_temperature_logs WHERE farm_id = ? ORDER BY date DESC;`,
          [farmId],
        );
    return rows.map(mapCompostTemperatureLog);
  }

  async saveManureApplication(application: ManureApplication): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO manure_applications (
        id, farm_id, place_id, crop_id, application_date, manure_type, incorporated,
        edible_portion_contact_soil, required_days_before_harvest, earliest_harvest_date,
        quantity, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        application.id,
        application.farmId,
        application.placeId ?? null,
        application.cropId ?? null,
        application.applicationDate,
        application.manureType ?? null,
        application.incorporated ? 1 : 0,
        application.ediblePortionContactSoil ? 1 : 0,
        application.requiredDaysBeforeHarvest,
        application.earliestHarvestDate,
        application.quantity ?? null,
        application.notes ?? null,
        application.createdAt,
      ],
    );
  }

  async listManureApplications(farmId: FarmId): Promise<ManureApplication[]> {
    const rows = await this.database.getAllAsync<ManureApplicationRow>(
      `SELECT id, farm_id, place_id, crop_id, application_date, manure_type, incorporated,
        edible_portion_contact_soil, required_days_before_harvest, earliest_harvest_date,
        quantity, notes, created_at FROM manure_applications WHERE farm_id = ? ORDER BY application_date DESC;`,
      [farmId],
    );
    return rows.map(mapManureApplication);
  }

  async saveCropRotationRecord(record: CropRotationRecord): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO crop_rotation_records (
        id, farm_id, place_id, crop_id, season, year, previous_crop_id,
        rotation_purpose, cover_crop_used, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        record.id,
        record.farmId,
        record.placeId ?? null,
        record.cropId ?? null,
        record.season ?? null,
        record.year,
        record.previousCropId ?? null,
        record.rotationPurpose ?? null,
        record.coverCropUsed ? 1 : 0,
        record.notes ?? null,
        record.createdAt,
      ],
    );
  }

  async listCropRotationRecords(farmId: FarmId): Promise<CropRotationRecord[]> {
    const rows = await this.database.getAllAsync<CropRotationRecordRow>(
      `SELECT id, farm_id, place_id, crop_id, season, year, previous_crop_id,
        rotation_purpose, cover_crop_used, notes, created_at FROM crop_rotation_records WHERE farm_id = ? ORDER BY year DESC;`,
      [farmId],
    );
    return rows.map(mapCropRotationRecord);
  }

  async savePestWeedDiseaseObservation(observation: PestWeedDiseaseObservation): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO pest_weed_disease_observations (
        id, farm_id, type, place_id, crop_id, observed_at, severity, description,
        photo_attachment_ids_json, linked_farm_note_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        observation.id, observation.farmId, observation.type, observation.placeId ?? null, observation.cropId ?? null,
        observation.observedAt, observation.severity ?? null, observation.description,
        JSON.stringify(observation.photoAttachmentIds), observation.linkedFarmNoteId ?? null, observation.createdAt,
      ],
    );
  }

  async getPestWeedDiseaseObservation(farmId: FarmId, id: string): Promise<PestWeedDiseaseObservation | null> {
    const row = await this.database.getFirstAsync<PestWeedDiseaseObservationRow>(
      `SELECT id, farm_id, type, place_id, crop_id, observed_at, severity, description,
        photo_attachment_ids_json, linked_farm_note_id, created_at
       FROM pest_weed_disease_observations WHERE farm_id = ? AND id = ? LIMIT 1;`,
      [farmId, id],
    );
    return row ? mapPestWeedDiseaseObservation(row) : null;
  }

  async listPestWeedDiseaseObservations(farmId: FarmId): Promise<PestWeedDiseaseObservation[]> {
    const rows = await this.database.getAllAsync<PestWeedDiseaseObservationRow>(
      `SELECT id, farm_id, type, place_id, crop_id, observed_at, severity, description,
        photo_attachment_ids_json, linked_farm_note_id, created_at
       FROM pest_weed_disease_observations WHERE farm_id = ? ORDER BY observed_at DESC;`,
      [farmId],
    );
    return rows.map(mapPestWeedDiseaseObservation);
  }

  async savePestWeedDiseaseAction(action: PestWeedDiseaseAction): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO pest_weed_disease_actions (
        id, farm_id, observation_id, action_type, action_date, description, input_application_id,
        why_needed, effectiveness_notes, evidence_attachment_ids_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        action.id, action.farmId, action.observationId, action.actionType, action.actionDate, action.description,
        action.inputApplicationId ?? null, action.whyNeeded ?? null, action.effectivenessNotes ?? null,
        JSON.stringify(action.evidenceAttachmentIds), action.createdAt,
      ],
    );
  }

  async listPestWeedDiseaseActions(farmId: FarmId, observationId?: string): Promise<PestWeedDiseaseAction[]> {
    const rows = observationId
      ? await this.database.getAllAsync<PestWeedDiseaseActionRow>(
          `SELECT id, farm_id, observation_id, action_type, action_date, description, input_application_id,
            why_needed, effectiveness_notes, evidence_attachment_ids_json, created_at
           FROM pest_weed_disease_actions WHERE farm_id = ? AND observation_id = ? ORDER BY action_date DESC;`,
          [farmId, observationId],
        )
      : await this.database.getAllAsync<PestWeedDiseaseActionRow>(
          `SELECT id, farm_id, observation_id, action_type, action_date, description, input_application_id,
            why_needed, effectiveness_notes, evidence_attachment_ids_json, created_at
           FROM pest_weed_disease_actions WHERE farm_id = ? ORDER BY action_date DESC;`,
          [farmId],
        );
    return rows.map(mapPestWeedDiseaseAction);
  }

  async savePlasticMulchRecord(record: PlasticMulchRecord): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO plastic_mulch_records (
        id, farm_id, place_id, crop_id, installed_date, removed_date, material, notes,
        evidence_attachment_ids_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        record.id, record.farmId, record.placeId ?? null, record.cropId ?? null, record.installedDate ?? null,
        record.removedDate ?? null, record.material ?? null, record.notes ?? null,
        JSON.stringify(record.evidenceAttachmentIds), record.createdAt,
      ],
    );
  }

  async listPlasticMulchRecords(farmId: FarmId): Promise<PlasticMulchRecord[]> {
    const rows = await this.database.getAllAsync<PlasticMulchRecordRow>(
      `SELECT id, farm_id, place_id, crop_id, installed_date, removed_date, material, notes,
        evidence_attachment_ids_json, created_at FROM plastic_mulch_records WHERE farm_id = ? ORDER BY created_at DESC;`,
      [farmId],
    );
    return rows.map(mapPlasticMulchRecord);
  }

  async saveOrganicLot(lot: OrganicLot): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO organic_lots (
        id, farm_id, lot_code, crop_id, place_id, harvest_date, organic_status, quantity_harvested,
        unit, created_from_harvest_record_id, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        lot_code = excluded.lot_code,
        crop_id = excluded.crop_id,
        place_id = excluded.place_id,
        harvest_date = excluded.harvest_date,
        organic_status = excluded.organic_status,
        quantity_harvested = excluded.quantity_harvested,
        unit = excluded.unit,
        created_from_harvest_record_id = excluded.created_from_harvest_record_id,
        notes = excluded.notes,
        updated_at = excluded.updated_at;`,
      [
        lot.id, lot.farmId, lot.lotCode, lot.cropId, lot.placeId, lot.harvestDate, lot.organicStatus,
        lot.quantityHarvested, lot.unit, lot.createdFromHarvestRecordId ?? null, lot.notes ?? null, lot.createdAt, lot.updatedAt,
      ],
    );
  }

  async getOrganicLot(farmId: FarmId, id: string): Promise<OrganicLot | null> {
    const row = await this.database.getFirstAsync<OrganicLotRow>(
      `SELECT id, farm_id, lot_code, crop_id, place_id, harvest_date, organic_status, quantity_harvested,
        unit, created_from_harvest_record_id, notes, created_at, updated_at
       FROM organic_lots WHERE farm_id = ? AND id = ? LIMIT 1;`,
      [farmId, id],
    );
    return row ? mapOrganicLot(row) : null;
  }

  async listOrganicLots(farmId: FarmId): Promise<OrganicLot[]> {
    const rows = await this.database.getAllAsync<OrganicLotRow>(
      `SELECT id, farm_id, lot_code, crop_id, place_id, harvest_date, organic_status, quantity_harvested,
        unit, created_from_harvest_record_id, notes, created_at, updated_at
       FROM organic_lots WHERE farm_id = ? ORDER BY harvest_date DESC;`,
      [farmId],
    );
    return rows.map(mapOrganicLot);
  }

  async saveOrganicHandlingEvent(event: OrganicHandlingEvent): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO organic_handling_events (
        id, farm_id, lot_id, event_type, event_date, input_lot_ids_json, output_lot_ids_json,
        quantity_in, quantity_out, unit, facility_place_id, equipment_used, cleaning_record_id, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        event.id, event.farmId, event.lotId, event.eventType, event.eventDate, JSON.stringify(event.inputLotIds),
        JSON.stringify(event.outputLotIds), event.quantityIn ?? null, event.quantityOut ?? null, event.unit ?? null,
        event.facilityPlaceId ?? null, event.equipmentUsed ?? null, event.cleaningRecordId ?? null, event.notes ?? null, event.createdAt,
      ],
    );
  }

  async listOrganicHandlingEvents(farmId: FarmId, lotId?: string): Promise<OrganicHandlingEvent[]> {
    const rows = await this.database.getAllAsync<OrganicHandlingEventRow>(
      `SELECT id, farm_id, lot_id, event_type, event_date, input_lot_ids_json, output_lot_ids_json,
        quantity_in, quantity_out, unit, facility_place_id, equipment_used, cleaning_record_id, notes, created_at
       FROM organic_handling_events WHERE farm_id = ? ORDER BY event_date DESC;`,
      [farmId],
    );
    const mapped = rows.map(mapOrganicHandlingEvent);
    return lotId ? mapped.filter((event) => event.lotId === lotId || event.inputLotIds.includes(lotId) || event.outputLotIds.includes(lotId)) : mapped;
  }

  async saveOrganicStorageRecord(record: OrganicStorageRecord): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO organic_storage_records (
        id, farm_id, lot_id, storage_place_id, date_in, date_out, quantity_in, quantity_out, unit, container_id, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        record.id, record.farmId, record.lotId, record.storagePlaceId, record.dateIn, record.dateOut ?? null,
        record.quantityIn, record.quantityOut ?? null, record.unit, record.containerId ?? null, record.notes ?? null, record.createdAt,
      ],
    );
  }

  async listOrganicStorageRecords(farmId: FarmId, lotId?: string): Promise<OrganicStorageRecord[]> {
    const rows = lotId
      ? await this.database.getAllAsync<OrganicStorageRecordRow>(
          `SELECT id, farm_id, lot_id, storage_place_id, date_in, date_out, quantity_in, quantity_out, unit, container_id, notes, created_at
           FROM organic_storage_records WHERE farm_id = ? AND lot_id = ? ORDER BY date_in DESC;`,
          [farmId, lotId],
        )
      : await this.database.getAllAsync<OrganicStorageRecordRow>(
          `SELECT id, farm_id, lot_id, storage_place_id, date_in, date_out, quantity_in, quantity_out, unit, container_id, notes, created_at
           FROM organic_storage_records WHERE farm_id = ? ORDER BY date_in DESC;`,
          [farmId],
        );
    return rows.map(mapOrganicStorageRecord);
  }

  async saveOrganicSaleRecord(record: OrganicSaleRecord): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO organic_sale_records (
        id, farm_id, lot_id, buyer, sale_date, quantity, unit, invoice_number, organic_claim, evidence_attachment_ids_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        record.id, record.farmId, record.lotId, record.buyer, record.saleDate, record.quantity, record.unit,
        record.invoiceNumber ?? null, record.organicClaim ?? null, JSON.stringify(record.evidenceAttachmentIds), record.createdAt,
      ],
    );
  }

  async listOrganicSaleRecords(farmId: FarmId, lotId?: string): Promise<OrganicSaleRecord[]> {
    const rows = lotId
      ? await this.database.getAllAsync<OrganicSaleRecordRow>(
          `SELECT id, farm_id, lot_id, buyer, sale_date, quantity, unit, invoice_number, organic_claim, evidence_attachment_ids_json, created_at
           FROM organic_sale_records WHERE farm_id = ? AND lot_id = ? ORDER BY sale_date DESC;`,
          [farmId, lotId],
        )
      : await this.database.getAllAsync<OrganicSaleRecordRow>(
          `SELECT id, farm_id, lot_id, buyer, sale_date, quantity, unit, invoice_number, organic_claim, evidence_attachment_ids_json, created_at
           FROM organic_sale_records WHERE farm_id = ? ORDER BY sale_date DESC;`,
          [farmId],
        );
    return rows.map(mapOrganicSaleRecord);
  }

  async saveOrganicSystemPlanSection(section: OrganicSystemPlanSection): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO organic_system_plan_sections (
        id, farm_id, section_type, title, narrative, readiness_status, evidence_attachment_ids_json, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        section_type = excluded.section_type,
        title = excluded.title,
        narrative = excluded.narrative,
        readiness_status = excluded.readiness_status,
        evidence_attachment_ids_json = excluded.evidence_attachment_ids_json,
        notes = excluded.notes,
        updated_at = excluded.updated_at;`,
      [
        section.id, section.farmId, section.sectionType, section.title, section.narrative, section.readinessStatus,
        JSON.stringify(section.evidenceAttachmentIds), section.notes ?? null, section.createdAt, section.updatedAt,
      ],
    );
  }

  async getOrganicSystemPlanSection(farmId: FarmId, id: string): Promise<OrganicSystemPlanSection | null> {
    const row = await this.database.getFirstAsync<OrganicSystemPlanSectionRow>(
      `SELECT id, farm_id, section_type, title, narrative, readiness_status, evidence_attachment_ids_json, notes, created_at, updated_at
       FROM organic_system_plan_sections WHERE farm_id = ? AND id = ? LIMIT 1;`,
      [farmId, id],
    );
    return row ? mapOrganicSystemPlanSection(row) : null;
  }

  async listOrganicSystemPlanSections(farmId: FarmId): Promise<OrganicSystemPlanSection[]> {
    const rows = await this.database.getAllAsync<OrganicSystemPlanSectionRow>(
      `SELECT id, farm_id, section_type, title, narrative, readiness_status, evidence_attachment_ids_json, notes, created_at, updated_at
       FROM organic_system_plan_sections WHERE farm_id = ? ORDER BY section_type ASC;`,
      [farmId],
    );
    return rows.map(mapOrganicSystemPlanSection);
  }

  async saveOrganicInspectionReadinessItem(item: OrganicInspectionReadinessItem): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO organic_inspection_readiness_items (
        id, farm_id, category, prompt, readiness_status, notes, evidence_attachment_ids_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        category = excluded.category,
        prompt = excluded.prompt,
        readiness_status = excluded.readiness_status,
        notes = excluded.notes,
        evidence_attachment_ids_json = excluded.evidence_attachment_ids_json,
        updated_at = excluded.updated_at;`,
      [
        item.id, item.farmId, item.category, item.prompt, item.readinessStatus, item.notes ?? null,
        JSON.stringify(item.evidenceAttachmentIds), item.createdAt, item.updatedAt,
      ],
    );
  }

  async getOrganicInspectionReadinessItem(farmId: FarmId, id: string): Promise<OrganicInspectionReadinessItem | null> {
    const row = await this.database.getFirstAsync<OrganicInspectionReadinessItemRow>(
      `SELECT id, farm_id, category, prompt, readiness_status, notes, evidence_attachment_ids_json, created_at, updated_at
       FROM organic_inspection_readiness_items WHERE farm_id = ? AND id = ? LIMIT 1;`,
      [farmId, id],
    );
    return row ? mapOrganicInspectionReadinessItem(row) : null;
  }

  async listOrganicInspectionReadinessItems(farmId: FarmId): Promise<OrganicInspectionReadinessItem[]> {
    const rows = await this.database.getAllAsync<OrganicInspectionReadinessItemRow>(
      `SELECT id, farm_id, category, prompt, readiness_status, notes, evidence_attachment_ids_json, created_at, updated_at
       FROM organic_inspection_readiness_items WHERE farm_id = ? ORDER BY category ASC;`,
      [farmId],
    );
    return rows.map(mapOrganicInspectionReadinessItem);
  }

  async saveOrganicReportPackage(reportPackage: OrganicReportPackage): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO organic_report_packages (
        id, farm_id, package_type, title, generated_at, report_names_json, manifest_json, package_text, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        reportPackage.id, reportPackage.farmId, reportPackage.packageType, reportPackage.title, reportPackage.generatedAt,
        JSON.stringify(reportPackage.reportNames), reportPackage.manifestJson, reportPackage.packageText, reportPackage.notes ?? null,
        reportPackage.createdAt,
      ],
    );
  }

  async listOrganicReportPackages(farmId: FarmId): Promise<OrganicReportPackage[]> {
    const rows = await this.database.getAllAsync<OrganicReportPackageRow>(
      `SELECT id, farm_id, package_type, title, generated_at, report_names_json, manifest_json, package_text, notes, created_at
       FROM organic_report_packages WHERE farm_id = ? ORDER BY generated_at DESC;`,
      [farmId],
    );
    return rows.map(mapOrganicReportPackage);
  }

  async saveOrganicAdvancedScopeRecord(record: OrganicAdvancedScopeRecord): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO organic_advanced_scope_records (
        id, farm_id, scope_type, topic, description, readiness_status, evidence_attachment_ids_json, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        scope_type = excluded.scope_type,
        topic = excluded.topic,
        description = excluded.description,
        readiness_status = excluded.readiness_status,
        evidence_attachment_ids_json = excluded.evidence_attachment_ids_json,
        notes = excluded.notes,
        updated_at = excluded.updated_at;`,
      [
        record.id, record.farmId, record.scopeType, record.topic, record.description, record.readinessStatus,
        JSON.stringify(record.evidenceAttachmentIds), record.notes ?? null, record.createdAt, record.updatedAt,
      ],
    );
  }

  async getOrganicAdvancedScopeRecord(farmId: FarmId, id: string): Promise<OrganicAdvancedScopeRecord | null> {
    const row = await this.database.getFirstAsync<OrganicAdvancedScopeRecordRow>(
      `SELECT id, farm_id, scope_type, topic, description, readiness_status, evidence_attachment_ids_json, notes, created_at, updated_at
       FROM organic_advanced_scope_records WHERE farm_id = ? AND id = ? LIMIT 1;`,
      [farmId, id],
    );
    return row ? mapOrganicAdvancedScopeRecord(row) : null;
  }

  async listOrganicAdvancedScopeRecords(farmId: FarmId): Promise<OrganicAdvancedScopeRecord[]> {
    const rows = await this.database.getAllAsync<OrganicAdvancedScopeRecordRow>(
      `SELECT id, farm_id, scope_type, topic, description, readiness_status, evidence_attachment_ids_json, notes, created_at, updated_at
       FROM organic_advanced_scope_records WHERE farm_id = ? ORDER BY scope_type ASC, updated_at DESC;`,
      [farmId],
    );
    return rows.map(mapOrganicAdvancedScopeRecord);
  }

  async saveOrganicEvidenceLink(link: OrganicEvidenceLink): Promise<void> {
    const event = await this.database.getFirstAsync<{ id: string }>(
      "SELECT id FROM farm_events WHERE id = ? AND farm_id = ? LIMIT 1;",
      [link.farmEventId, link.farmId],
    );
    if (!event) {
      throw new Error("Organic evidence link must point to a saved farm note.");
    }

    await this.database.runAsync(
      `INSERT INTO organic_evidence_links (
        id, farm_id, farm_event_id, category, linked_record_type, linked_record_id,
        evidence_role, notes, privacy, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        farm_event_id = excluded.farm_event_id,
        category = excluded.category,
        linked_record_type = excluded.linked_record_type,
        linked_record_id = excluded.linked_record_id,
        evidence_role = excluded.evidence_role,
        notes = excluded.notes,
        privacy = excluded.privacy,
        updated_at = excluded.updated_at;`,
      [
        link.id, link.farmId, link.farmEventId, link.category, link.linkedRecordType ?? null,
        link.linkedRecordId ?? null, link.evidenceRole, link.notes ?? null, link.privacy,
        link.createdAt, link.updatedAt,
      ],
    );
  }

  async deleteOrganicEvidenceLink(farmId: FarmId, id: string): Promise<void> {
    await this.database.runAsync("DELETE FROM organic_evidence_links WHERE farm_id = ? AND id = ?;", [farmId, id]);
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
    const rows = await this.database.getAllAsync<OrganicEvidenceLinkRow>(
      `SELECT id, farm_id, farm_event_id, category, linked_record_type, linked_record_id,
        evidence_role, notes, privacy, created_at, updated_at
       FROM organic_evidence_links
       WHERE farm_id = ?
        AND (? IS NULL OR farm_event_id = ?)
        AND (? IS NULL OR category = ?)
        AND (? IS NULL OR linked_record_type = ?)
        AND (? IS NULL OR linked_record_id = ?)
       ORDER BY updated_at DESC, created_at DESC;`,
      [
        farmId,
        filters.farmEventId ?? null, filters.farmEventId ?? null,
        filters.category ?? null, filters.category ?? null,
        filters.linkedRecordType ?? null, filters.linkedRecordType ?? null,
        filters.linkedRecordId ?? null, filters.linkedRecordId ?? null,
      ],
    );
    return rows.map(mapOrganicEvidenceLink);
  }
}

function mapProfile(row: ProfileRow): OrganicOperationProfile {
  return {
    id: row.id,
    farmId: row.farm_id,
    organicStatus: row.organic_status,
    certifierName: row.certifier_name ?? undefined,
    certifierContact: row.certifier_contact ?? undefined,
    certificateNumber: row.certificate_number ?? undefined,
    certificateEffectiveDate: row.certificate_effective_date ?? undefined,
    annualUpdateDueDate: row.annual_update_due_date ?? undefined,
    inspectionDueWindow: row.inspection_due_window ?? undefined,
    recordRetentionYears: row.record_retention_years,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapScope(row: ScopeRow): OrganicCertificationScope {
  return {
    profileId: row.profile_id,
    farmId: row.farm_id,
    scopeType: row.scope_type,
    enabled: row.enabled === 1,
    status: row.status,
    certifierNotes: row.certifier_notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPlaceProfile(row: PlaceProfileRow): OrganicPlaceProfile {
  return {
    farmId: row.farm_id,
    placeId: row.place_id,
    organicStatus: row.organic_status,
    transitionStartDate: row.transition_start_date ?? undefined,
    lastProhibitedSubstanceDate: row.last_prohibited_substance_date ?? undefined,
    organicEligibilityDate: row.organic_eligibility_date ?? undefined,
    certifiedOrganicSinceDate: row.certified_organic_since_date ?? undefined,
    boundaryDescription: row.boundary_description ?? undefined,
    bufferDescription: row.buffer_description ?? undefined,
    adjacentLandUse: row.adjacent_land_use ?? undefined,
    contaminationRisks: row.contamination_risks ?? undefined,
    certifierApproved: row.certifier_approved === 1,
    certifierNotes: row.certifier_notes ?? undefined,
    evidenceAttachmentIds: parseEvidenceAttachmentIds(row.evidence_attachment_ids_json),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapBoundaryEvidence(row: BoundaryEvidenceRow): OrganicBoundaryEvidence {
  return {
    id: row.id,
    farmId: row.farm_id,
    placeId: row.place_id,
    evidenceType: row.evidence_type,
    description: row.description,
    attachmentUri: row.attachment_uri ?? undefined,
    capturedAt: row.captured_at,
    createdAt: row.created_at,
  };
}

function parseEvidenceAttachmentIds(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function mapOrganicInput(row: OrganicInputRow): OrganicInput {
  return {
    id: row.id,
    farmId: row.farm_id,
    materialId: row.material_id ?? undefined,
    name: row.name,
    inputCategory: row.input_category,
    manufacturer: row.manufacturer ?? undefined,
    supplier: row.supplier ?? undefined,
    composition: row.composition ?? undefined,
    source: row.source ?? undefined,
    approvalStatus: row.approval_status,
    approvalEvidenceAttachmentIds: parseEvidenceAttachmentIds(row.approval_evidence_attachment_ids_json),
    certifierApprovalDate: row.certifier_approval_date ?? undefined,
    approvalExpirationDate: row.approval_expiration_date ?? undefined,
    restrictions: row.restrictions ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapOrganicInputApplication(row: OrganicInputApplicationRow): OrganicInputApplication {
  return {
    id: row.id,
    farmId: row.farm_id,
    inputId: row.input_id,
    placeId: row.place_id ?? undefined,
    cropId: row.crop_id ?? undefined,
    date: row.date,
    quantity: row.quantity ?? undefined,
    unit: row.unit ?? undefined,
    rate: row.rate ?? undefined,
    reason: row.reason ?? undefined,
    targetProblem: row.target_problem ?? undefined,
    weatherNotes: row.weather_notes ?? undefined,
    appliedBy: row.applied_by ?? undefined,
    evidenceAttachmentIds: parseEvidenceAttachmentIds(row.evidence_attachment_ids_json),
    linkedFarmNoteId: row.linked_farm_note_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSeedLot(row: SeedLotRow): SeedLot {
  return {
    id: row.id,
    farmId: row.farm_id,
    cropId: row.crop_id ?? undefined,
    variety: row.variety,
    supplier: row.supplier ?? undefined,
    lotNumber: row.lot_number ?? undefined,
    purchaseDate: row.purchase_date ?? undefined,
    quantity: row.quantity ?? undefined,
    organicStatus: row.organic_status,
    seedTreatment: row.seed_treatment ?? undefined,
    invoiceAttachmentId: row.invoice_attachment_id ?? undefined,
    labelAttachmentId: row.label_attachment_id ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCommercialAvailabilitySearch(row: CommercialAvailabilitySearchRow): CommercialAvailabilitySearch {
  return {
    id: row.id,
    farmId: row.farm_id,
    seedLotId: row.seed_lot_id,
    crop: row.crop ?? undefined,
    variety: row.variety ?? undefined,
    searchedOn: row.searched_on,
    supplierName: row.supplier_name,
    result: row.result,
    evidenceAttachmentId: row.evidence_attachment_id ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}

function mapOrganicPlantingEvent(row: OrganicPlantingEventRow): OrganicPlantingEvent {
  return {
    id: row.id,
    farmId: row.farm_id,
    seedLotId: row.seed_lot_id,
    cropId: row.crop_id ?? undefined,
    placeId: row.place_id ?? undefined,
    date: row.date,
    quantityPlanted: row.quantity_planted ?? undefined,
    transplantOrDirectSeed: row.transplant_or_direct_seed ?? undefined,
    linkedFarmNoteId: row.linked_farm_note_id ?? undefined,
    createdAt: row.created_at,
  };
}

function mapSoilFertilityPractice(row: SoilFertilityPracticeRow): SoilFertilityPractice {
  return {
    id: row.id,
    farmId: row.farm_id,
    placeId: row.place_id ?? undefined,
    practiceType: row.practice_type,
    cropId: row.crop_id ?? undefined,
    date: row.date,
    description: row.description,
    evidenceAttachmentIds: parseEvidenceAttachmentIds(row.evidence_attachment_ids_json),
    linkedFarmNoteId: row.linked_farm_note_id ?? undefined,
    createdAt: row.created_at,
  };
}

function mapCompostBatch(row: CompostBatchRow): CompostBatch {
  return {
    id: row.id,
    farmId: row.farm_id,
    name: row.name,
    ingredients: row.ingredients ?? undefined,
    startDate: row.start_date ?? undefined,
    compostingMethod: row.composting_method ?? undefined,
    initialCNRatio: row.initial_cn_ratio ?? undefined,
    status: row.status ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCompostTemperatureLog(row: CompostTemperatureLogRow): CompostTemperatureLog {
  return {
    id: row.id,
    farmId: row.farm_id,
    compostBatchId: row.compost_batch_id,
    date: row.date,
    temperatureF: row.temperature_f,
    turned: row.turned === 1,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}

function mapManureApplication(row: ManureApplicationRow): ManureApplication {
  return {
    id: row.id,
    farmId: row.farm_id,
    placeId: row.place_id ?? undefined,
    cropId: row.crop_id ?? undefined,
    applicationDate: row.application_date,
    manureType: row.manure_type ?? undefined,
    incorporated: row.incorporated === 1,
    ediblePortionContactSoil: row.edible_portion_contact_soil === 1,
    requiredDaysBeforeHarvest: row.required_days_before_harvest,
    earliestHarvestDate: row.earliest_harvest_date,
    quantity: row.quantity ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}

function mapCropRotationRecord(row: CropRotationRecordRow): CropRotationRecord {
  return {
    id: row.id,
    farmId: row.farm_id,
    placeId: row.place_id ?? undefined,
    cropId: row.crop_id ?? undefined,
    season: row.season ?? undefined,
    year: row.year,
    previousCropId: row.previous_crop_id ?? undefined,
    rotationPurpose: row.rotation_purpose ?? undefined,
    coverCropUsed: row.cover_crop_used === 1,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}

function mapPestWeedDiseaseObservation(row: PestWeedDiseaseObservationRow): PestWeedDiseaseObservation {
  return {
    id: row.id,
    farmId: row.farm_id,
    type: row.type,
    placeId: row.place_id ?? undefined,
    cropId: row.crop_id ?? undefined,
    observedAt: row.observed_at,
    severity: row.severity ?? undefined,
    description: row.description,
    photoAttachmentIds: parseEvidenceAttachmentIds(row.photo_attachment_ids_json),
    linkedFarmNoteId: row.linked_farm_note_id ?? undefined,
    createdAt: row.created_at,
  };
}

function mapPestWeedDiseaseAction(row: PestWeedDiseaseActionRow): PestWeedDiseaseAction {
  return {
    id: row.id,
    farmId: row.farm_id,
    observationId: row.observation_id,
    actionType: row.action_type,
    actionDate: row.action_date,
    description: row.description,
    inputApplicationId: row.input_application_id ?? undefined,
    whyNeeded: row.why_needed ?? undefined,
    effectivenessNotes: row.effectiveness_notes ?? undefined,
    evidenceAttachmentIds: parseEvidenceAttachmentIds(row.evidence_attachment_ids_json),
    createdAt: row.created_at,
  };
}

function mapPlasticMulchRecord(row: PlasticMulchRecordRow): PlasticMulchRecord {
  return {
    id: row.id,
    farmId: row.farm_id,
    placeId: row.place_id ?? undefined,
    cropId: row.crop_id ?? undefined,
    installedDate: row.installed_date ?? undefined,
    removedDate: row.removed_date ?? undefined,
    material: row.material ?? undefined,
    notes: row.notes ?? undefined,
    evidenceAttachmentIds: parseEvidenceAttachmentIds(row.evidence_attachment_ids_json),
    createdAt: row.created_at,
  };
}

function mapOrganicLot(row: OrganicLotRow): OrganicLot {
  return {
    id: row.id,
    farmId: row.farm_id,
    lotCode: row.lot_code,
    cropId: row.crop_id,
    placeId: row.place_id,
    harvestDate: row.harvest_date,
    organicStatus: row.organic_status,
    quantityHarvested: row.quantity_harvested,
    unit: row.unit,
    createdFromHarvestRecordId: row.created_from_harvest_record_id ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapOrganicHandlingEvent(row: OrganicHandlingEventRow): OrganicHandlingEvent {
  return {
    id: row.id,
    farmId: row.farm_id,
    lotId: row.lot_id,
    eventType: row.event_type,
    eventDate: row.event_date,
    inputLotIds: parseEvidenceAttachmentIds(row.input_lot_ids_json),
    outputLotIds: parseEvidenceAttachmentIds(row.output_lot_ids_json),
    quantityIn: row.quantity_in ?? undefined,
    quantityOut: row.quantity_out ?? undefined,
    unit: row.unit ?? undefined,
    facilityPlaceId: row.facility_place_id ?? undefined,
    equipmentUsed: row.equipment_used ?? undefined,
    cleaningRecordId: row.cleaning_record_id ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}

function mapOrganicStorageRecord(row: OrganicStorageRecordRow): OrganicStorageRecord {
  return {
    id: row.id,
    farmId: row.farm_id,
    lotId: row.lot_id,
    storagePlaceId: row.storage_place_id,
    dateIn: row.date_in,
    dateOut: row.date_out ?? undefined,
    quantityIn: row.quantity_in,
    quantityOut: row.quantity_out ?? undefined,
    unit: row.unit,
    containerId: row.container_id ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}

function mapOrganicSaleRecord(row: OrganicSaleRecordRow): OrganicSaleRecord {
  return {
    id: row.id,
    farmId: row.farm_id,
    lotId: row.lot_id,
    buyer: row.buyer,
    saleDate: row.sale_date,
    quantity: row.quantity,
    unit: row.unit,
    invoiceNumber: row.invoice_number ?? undefined,
    organicClaim: row.organic_claim ?? undefined,
    evidenceAttachmentIds: parseEvidenceAttachmentIds(row.evidence_attachment_ids_json),
    createdAt: row.created_at,
  };
}

function mapOrganicSystemPlanSection(row: OrganicSystemPlanSectionRow): OrganicSystemPlanSection {
  return {
    id: row.id,
    farmId: row.farm_id,
    sectionType: row.section_type,
    title: row.title,
    narrative: row.narrative,
    readinessStatus: row.readiness_status,
    evidenceAttachmentIds: parseEvidenceAttachmentIds(row.evidence_attachment_ids_json),
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapOrganicInspectionReadinessItem(row: OrganicInspectionReadinessItemRow): OrganicInspectionReadinessItem {
  return {
    id: row.id,
    farmId: row.farm_id,
    category: row.category,
    prompt: row.prompt,
    readinessStatus: row.readiness_status,
    notes: row.notes ?? undefined,
    evidenceAttachmentIds: parseEvidenceAttachmentIds(row.evidence_attachment_ids_json),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapOrganicReportPackage(row: OrganicReportPackageRow): OrganicReportPackage {
  return {
    id: row.id,
    farmId: row.farm_id,
    packageType: row.package_type,
    title: row.title,
    generatedAt: row.generated_at,
    reportNames: parseEvidenceAttachmentIds(row.report_names_json),
    manifestJson: row.manifest_json,
    packageText: row.package_text,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}

function mapOrganicAdvancedScopeRecord(row: OrganicAdvancedScopeRecordRow): OrganicAdvancedScopeRecord {
  return {
    id: row.id,
    farmId: row.farm_id,
    scopeType: row.scope_type,
    topic: row.topic,
    description: row.description,
    readinessStatus: row.readiness_status,
    evidenceAttachmentIds: parseEvidenceAttachmentIds(row.evidence_attachment_ids_json),
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapOrganicEvidenceLink(row: OrganicEvidenceLinkRow): OrganicEvidenceLink {
  return {
    id: row.id,
    farmId: row.farm_id,
    farmEventId: row.farm_event_id,
    category: row.category,
    linkedRecordType: row.linked_record_type ?? undefined,
    linkedRecordId: row.linked_record_id ?? undefined,
    evidenceRole: row.evidence_role,
    notes: row.notes ?? undefined,
    privacy: row.privacy,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
