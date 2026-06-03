import type { SQLiteDatabase } from "expo-sqlite";

import { createReferenceTables } from "./0001_create_reference_tables";
import { createHarvestRecords } from "./0002_create_harvest_records";
import { createMaterialUseAndInventoryCountRecords } from "./0003_create_material_use_and_inventory_count_records";
import { expandManualRecordUnits } from "./0004_expand_manual_record_units";
import { addFarmPlaceHierarchy } from "./0005_add_farm_place_hierarchy";
import { createFarmEvents } from "./0006_create_farm_events";
import { createFarmNoteTranscripts } from "./0007_create_farm_note_transcripts";
import { addCorePlacesSetupState } from "./0008_add_core_places_setup_state";
import { createOrganicCertificationProfile } from "./0009_create_organic_certification_profile";
import { createOrganicPlaceProfiles } from "./0010_create_organic_place_profiles";
import { createOrganicInputs } from "./0011_create_organic_inputs";
import { createOrganicSeeds } from "./0012_create_organic_seeds";
import { createOrganicSoil } from "./0013_create_organic_soil";
import { createOrganicPest } from "./0014_create_organic_pest";
import { createOrganicTraceability } from "./0015_create_organic_traceability";
import { createOrganicSystemPlan } from "./0016_create_organic_system_plan";
import { createOrganicReportPackages } from "./0017_create_organic_report_packages";
import { createOrganicAdvancedScopes } from "./0018_create_organic_advanced_scopes";
import { createOrganicEvidenceLinks } from "./0019_create_organic_evidence_links";
import { createPlanning } from "./0020_create_planning";
import { addPlanningPlaceReferences } from "./0021_add_planning_place_references";
import { removeCountableItems } from "./0022_remove_countable_items";
import { createPlanningBoards } from "./0023_create_planning_boards";

export interface Migration {
  version: number;
  name: string;
  statements: string[];
}

const migrations: Migration[] = [
  createReferenceTables,
  createHarvestRecords,
  createMaterialUseAndInventoryCountRecords,
  expandManualRecordUnits,
  addFarmPlaceHierarchy,
  createFarmEvents,
  createFarmNoteTranscripts,
  addCorePlacesSetupState,
  createOrganicCertificationProfile,
  createOrganicPlaceProfiles,
  createOrganicInputs,
  createOrganicSeeds,
  createOrganicSoil,
  createOrganicPest,
  createOrganicTraceability,
  createOrganicSystemPlan,
  createOrganicReportPackages,
  createOrganicAdvancedScopes,
  createOrganicEvidenceLinks,
  createPlanning,
  addPlanningPlaceReferences,
  removeCountableItems,
  createPlanningBoards,
];

export async function runMigrations(database: SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  const appliedRows = await database.getAllAsync<{ version: number }>(
    "SELECT version FROM schema_migrations;",
  );
  const appliedVersions = new Set(appliedRows.map((row) => row.version));

  for (const migration of migrations) {
    if (appliedVersions.has(migration.version)) {
      continue;
    }

    for (const statement of migration.statements) {
      await database.execAsync(statement);
    }

    await database.runAsync(
      "INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?);",
      [migration.version, migration.name, new Date().toISOString()],
    );
  }
}
