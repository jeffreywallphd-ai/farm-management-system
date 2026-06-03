import type { Migration } from "./migrationRunner";

const categoryCheck =
  "('land', 'inputs', 'seeds', 'soil', 'pest', 'traceability', 'osp', 'inspection', 'advancedScope', 'general')";

const recordTypeCheck =
  "('organicPlaceProfile', 'organicBoundaryEvidence', 'organicInput', 'organicInputApplication', 'seedLot', 'commercialAvailabilitySearch', 'organicPlantingEvent', 'soilFertilityPractice', 'compostBatch', 'compostTemperatureLog', 'manureApplication', 'cropRotationRecord', 'pestWeedDiseaseObservation', 'pestWeedDiseaseAction', 'plasticMulchRecord', 'organicLot', 'organicHandlingEvent', 'organicStorageRecord', 'organicSaleRecord', 'organicSystemPlanSection', 'organicInspectionReadinessItem', 'organicAdvancedScopeRecord', 'organicReportPackage')";

const roleCheck =
  "('fieldHistory', 'photoEvidence', 'voiceNote', 'labelOrReceipt', 'monitoring', 'inspectionQuestion', 'supportingNote', 'other')";

export const createOrganicEvidenceLinks: Migration = {
  version: 19,
  name: "create_organic_evidence_links",
  statements: [
    "ALTER TABLE farm_events ADD COLUMN needs_organic_review INTEGER NOT NULL DEFAULT 0 CHECK (needs_organic_review IN (0, 1));",
    `CREATE TABLE IF NOT EXISTS organic_evidence_links (
      id TEXT PRIMARY KEY NOT NULL,
      farm_id TEXT NOT NULL,
      farm_event_id TEXT NOT NULL,
      category TEXT NOT NULL CHECK (category IN ${categoryCheck}),
      linked_record_type TEXT CHECK (linked_record_type IS NULL OR linked_record_type IN ${recordTypeCheck}),
      linked_record_id TEXT,
      evidence_role TEXT NOT NULL CHECK (evidence_role IN ${roleCheck}),
      notes TEXT,
      privacy TEXT NOT NULL CHECK (privacy = 'privateToFarm'),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (farm_id) REFERENCES farms(id),
      FOREIGN KEY (farm_event_id) REFERENCES farm_events(id) ON DELETE CASCADE
    );`,
    "CREATE INDEX IF NOT EXISTS idx_organic_evidence_links_farm ON organic_evidence_links(farm_id, updated_at DESC);",
    "CREATE INDEX IF NOT EXISTS idx_organic_evidence_links_event ON organic_evidence_links(farm_event_id);",
    "CREATE INDEX IF NOT EXISTS idx_organic_evidence_links_category ON organic_evidence_links(farm_id, category);",
    "CREATE INDEX IF NOT EXISTS idx_organic_evidence_links_record ON organic_evidence_links(farm_id, linked_record_type, linked_record_id);",
  ],
};
