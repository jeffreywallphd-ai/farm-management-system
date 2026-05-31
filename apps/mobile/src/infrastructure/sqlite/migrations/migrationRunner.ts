import type { SQLiteDatabase } from "expo-sqlite";

import { createReferenceTables } from "./0001_create_reference_tables";
import { createHarvestRecords } from "./0002_create_harvest_records";
import { createMaterialUseAndInventoryCountRecords } from "./0003_create_material_use_and_inventory_count_records";
import { expandManualRecordUnits } from "./0004_expand_manual_record_units";
import { addFarmPlaceHierarchy } from "./0005_add_farm_place_hierarchy";
import { createFarmEvents } from "./0006_create_farm_events";
import { createFarmNoteTranscripts } from "./0007_create_farm_note_transcripts";
import { addCorePlacesSetupState } from "./0008_add_core_places_setup_state";

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
