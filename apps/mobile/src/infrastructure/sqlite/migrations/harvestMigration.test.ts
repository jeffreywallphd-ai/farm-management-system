import assert from "node:assert/strict";
import test from "node:test";

import { createHarvestRecords } from "./0002_create_harvest_records";
import { createMaterialUseAndInventoryCountRecords } from "./0003_create_material_use_and_inventory_count_records";
import { expandManualRecordUnits } from "./0004_expand_manual_record_units";
import { addFarmPlaceHierarchy } from "./0005_add_farm_place_hierarchy";
import { createFarmEvents } from "./0006_create_farm_events";
import { createFarmNoteTranscripts } from "./0007_create_farm_note_transcripts";

test("harvest migration creates only harvest record storage", () => {
  const sql = createHarvestRecords.statements.join("\n");

  assert.equal(createHarvestRecords.version, 2);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS harvest_records/);
  assert.match(sql, /crop_id TEXT NOT NULL/);
  assert.match(sql, /source_location_id TEXT NOT NULL/);
  assert.match(sql, /privacy TEXT NOT NULL CHECK \(privacy = 'privateToFarm'\)/);
  assert.doesNotMatch(sql, /sync/i);
  assert.doesNotMatch(sql, /publication/i);
  assert.doesNotMatch(sql, /material_use_records/i);
  assert.doesNotMatch(sql, /inventory_count_records/i);
});

test("farm place hierarchy migration preserves old locations with defaults", () => {
  const sql = addFarmPlaceHierarchy.statements.join("\n");

  assert.equal(addFarmPlaceHierarchy.version, 5);
  assert.match(sql, /ADD COLUMN kind TEXT NOT NULL DEFAULT 'other'/);
  assert.match(sql, /ADD COLUMN parent_id TEXT/);
  assert.match(sql, /idx_farm_locations_parent_id/);
  assert.doesNotMatch(sql, /sync/i);
  assert.doesNotMatch(sql, /publication/i);
});

test("phase 3 migrations add material use, inventory counts, and expanded pilot units", () => {
  const sql = [...createMaterialUseAndInventoryCountRecords.statements, ...expandManualRecordUnits.statements].join("\n");

  assert.equal(createMaterialUseAndInventoryCountRecords.version, 3);
  assert.equal(expandManualRecordUnits.version, 4);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS material_use_records/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS inventory_count_records/);
  assert.match(sql, /'bag'/);
  assert.match(sql, /'gal'/);
  assert.match(sql, /'flat'/);
  assert.match(sql, /'tray'/);
  assert.doesNotMatch(sql, /sync/i);
  assert.doesNotMatch(sql, /publication/i);
});

test("farm event migration creates local event metadata and attachment references only", () => {
  const sql = createFarmEvents.statements.join("\n");

  assert.equal(createFarmEvents.version, 6);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS farm_events/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS farm_event_attachments/);
  assert.match(sql, /event_type TEXT NOT NULL/);
  assert.match(sql, /local_uri TEXT NOT NULL/);
  assert.match(sql, /'voiceMemo'/);
  assert.match(sql, /'photo'/);
  assert.match(sql, /privacy TEXT NOT NULL CHECK \(privacy = 'privateToFarm'\)/);
  assert.doesNotMatch(sql, /transcript/i);
  assert.doesNotMatch(sql, /sync/i);
  assert.doesNotMatch(sql, /publication/i);
  assert.doesNotMatch(sql, /account/i);
});

test("farm note transcript migration creates local draft transcript storage only", () => {
  const sql = createFarmNoteTranscripts.statements.join("\n");

  assert.equal(createFarmNoteTranscripts.version, 7);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS farm_note_transcripts/);
  assert.match(sql, /farm_event_id TEXT NOT NULL/);
  assert.match(sql, /source_attachment_id TEXT NOT NULL/);
  assert.match(sql, /status TEXT NOT NULL CHECK \(status IN \('completed', 'failed'\)\)/);
  assert.match(sql, /generated_locally INTEGER NOT NULL CHECK \(generated_locally = 1\)/);
  assert.match(sql, /privacy TEXT NOT NULL CHECK \(privacy = 'privateToFarm'\)/);
  assert.match(sql, /UNIQUE\s*\(farm_id, farm_event_id\)/);
  assert.doesNotMatch(sql, /server/i);
  assert.doesNotMatch(sql, /sync/i);
  assert.doesNotMatch(sql, /publication/i);
  assert.doesNotMatch(sql, /account/i);
});
