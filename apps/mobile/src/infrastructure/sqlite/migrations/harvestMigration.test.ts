import assert from "node:assert/strict";
import test from "node:test";

import { createHarvestRecords } from "./0002_create_harvest_records";
import { createMaterialUseAndInventoryCountRecords } from "./0003_create_material_use_and_inventory_count_records";
import { expandManualRecordUnits } from "./0004_expand_manual_record_units";
import { addFarmPlaceHierarchy } from "./0005_add_farm_place_hierarchy";
import { createFarmEvents } from "./0006_create_farm_events";
import { createFarmNoteTranscripts } from "./0007_create_farm_note_transcripts";
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

test("organic certification migration creates local profile and scope storage only", () => {
  const sql = createOrganicCertificationProfile.statements.join("\n");

  assert.equal(createOrganicCertificationProfile.version, 9);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS organic_operation_profiles/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS organic_certification_scopes/);
  assert.match(sql, /organic_status TEXT NOT NULL/);
  assert.match(sql, /record_retention_years INTEGER NOT NULL/);
  assert.match(sql, /scope_type TEXT NOT NULL/);
  assert.match(sql, /UNIQUE/);
  assert.doesNotMatch(sql, /server/i);
  assert.doesNotMatch(sql, /sync/i);
  assert.doesNotMatch(sql, /submission/i);
  assert.doesNotMatch(sql, /account/i);
});

test("organic place migration creates local place profile and boundary evidence storage only", () => {
  const sql = createOrganicPlaceProfiles.statements.join("\n");

  assert.equal(createOrganicPlaceProfiles.version, 10);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS organic_place_profiles/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS organic_boundary_evidence/);
  assert.match(sql, /last_prohibited_substance_date TEXT/);
  assert.match(sql, /organic_eligibility_date TEXT/);
  assert.match(sql, /boundary_description TEXT/);
  assert.match(sql, /buffer_description TEXT/);
  assert.match(sql, /evidence_type TEXT NOT NULL/);
  assert.doesNotMatch(sql, /server/i);
  assert.doesNotMatch(sql, /sync/i);
  assert.doesNotMatch(sql, /submission/i);
  assert.doesNotMatch(sql, /account/i);
});

test("organic input migration creates local input and application storage only", () => {
  const sql = createOrganicInputs.statements.join("\n");

  assert.equal(createOrganicInputs.version, 11);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS organic_inputs/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS organic_input_applications/);
  assert.match(sql, /approval_status TEXT NOT NULL/);
  assert.match(sql, /composition TEXT/);
  assert.match(sql, /source TEXT/);
  assert.match(sql, /target_problem TEXT/);
  assert.doesNotMatch(sql, /server/i);
  assert.doesNotMatch(sql, /sync/i);
  assert.doesNotMatch(sql, /submission/i);
  assert.doesNotMatch(sql, /account/i);
});

test("organic seed migration creates local seed, commercial availability, and planting storage only", () => {
  const sql = createOrganicSeeds.statements.join("\n");

  assert.equal(createOrganicSeeds.version, 12);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS seed_lots/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS commercial_availability_searches/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS organic_planting_events/);
  assert.match(sql, /organic_status TEXT NOT NULL/);
  assert.match(sql, /supplier_name TEXT NOT NULL/);
  assert.match(sql, /transplant_or_direct_seed TEXT/);
  assert.doesNotMatch(sql, /server/i);
  assert.doesNotMatch(sql, /sync/i);
  assert.doesNotMatch(sql, /submission/i);
  assert.doesNotMatch(sql, /account/i);
});

test("organic soil migration creates local soil, compost, manure, and rotation storage only", () => {
  const sql = createOrganicSoil.statements.join("\n");

  assert.equal(createOrganicSoil.version, 13);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS soil_fertility_practices/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS compost_batches/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS compost_temperature_logs/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS manure_applications/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS crop_rotation_records/);
  assert.match(sql, /required_days_before_harvest INTEGER NOT NULL/);
  assert.doesNotMatch(sql, /server/i);
  assert.doesNotMatch(sql, /sync/i);
  assert.doesNotMatch(sql, /submission/i);
  assert.doesNotMatch(sql, /account/i);
});

test("organic pest migration creates local observation, action, and mulch storage only", () => {
  const sql = createOrganicPest.statements.join("\n");

  assert.equal(createOrganicPest.version, 14);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS pest_weed_disease_observations/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS pest_weed_disease_actions/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS plastic_mulch_records/);
  assert.match(sql, /action_type TEXT NOT NULL/);
  assert.match(sql, /removed_date TEXT/);
  assert.doesNotMatch(sql, /server/i);
  assert.doesNotMatch(sql, /sync/i);
  assert.doesNotMatch(sql, /submission/i);
  assert.doesNotMatch(sql, /account/i);
});

test("organic traceability migration creates local lot, handling, storage, and sale storage only", () => {
  const sql = createOrganicTraceability.statements.join("\n");

  assert.equal(createOrganicTraceability.version, 15);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS organic_lots/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS organic_handling_events/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS organic_storage_records/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS organic_sale_records/);
  assert.match(sql, /lot_code TEXT NOT NULL/);
  assert.match(sql, /created_from_harvest_record_id TEXT/);
  assert.match(sql, /evidence_attachment_ids_json TEXT NOT NULL DEFAULT '\[\]'/);
  assert.doesNotMatch(sql, /server/i);
  assert.doesNotMatch(sql, /sync/i);
  assert.doesNotMatch(sql, /submission/i);
  assert.doesNotMatch(sql, /account/i);
});

test("organic system plan migration creates local OSP and inspection readiness storage only", () => {
  const sql = createOrganicSystemPlan.statements.join("\n");

  assert.equal(createOrganicSystemPlan.version, 16);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS organic_system_plan_sections/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS organic_inspection_readiness_items/);
  assert.match(sql, /section_type TEXT NOT NULL/);
  assert.match(sql, /readiness_status TEXT NOT NULL/);
  assert.match(sql, /evidence_attachment_ids_json TEXT NOT NULL DEFAULT '\[\]'/);
  assert.doesNotMatch(sql, /server/i);
  assert.doesNotMatch(sql, /sync/i);
  assert.doesNotMatch(sql, /submission/i);
  assert.doesNotMatch(sql, /account/i);
});

test("organic report package migration creates local package manifest storage only", () => {
  const sql = createOrganicReportPackages.statements.join("\n");

  assert.equal(createOrganicReportPackages.version, 17);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS organic_report_packages/);
  assert.match(sql, /manifest_json TEXT NOT NULL/);
  assert.match(sql, /package_text TEXT NOT NULL/);
  assert.match(sql, /report_names_json TEXT NOT NULL DEFAULT '\[\]'/);
  assert.doesNotMatch(sql, /server/i);
  assert.doesNotMatch(sql, /sync/i);
  assert.doesNotMatch(sql, /submission/i);
  assert.doesNotMatch(sql, /account/i);
});

test("organic advanced scope migration creates local specialty-scope readiness storage only", () => {
  const sql = createOrganicAdvancedScopes.statements.join("\n");

  assert.equal(createOrganicAdvancedScopes.version, 18);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS organic_advanced_scope_records/);
  assert.match(sql, /scope_type TEXT NOT NULL/);
  assert.match(sql, /'livestock'/);
  assert.match(sql, /'wildCrops'/);
  assert.match(sql, /'imports'/);
  assert.match(sql, /'labeling'/);
  assert.doesNotMatch(sql, /server/i);
  assert.doesNotMatch(sql, /sync/i);
  assert.doesNotMatch(sql, /submission/i);
  assert.doesNotMatch(sql, /account/i);
});

test("organic evidence link migration connects farm notes to organic records locally only", () => {
  const sql = createOrganicEvidenceLinks.statements.join("\n");

  assert.equal(createOrganicEvidenceLinks.version, 19);
  assert.match(sql, /ALTER TABLE farm_events ADD COLUMN needs_organic_review/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS organic_evidence_links/);
  assert.match(sql, /farm_event_id TEXT NOT NULL/);
  assert.match(sql, /privacy TEXT NOT NULL CHECK \(privacy = 'privateToFarm'\)/);
  assert.doesNotMatch(sql, /server/i);
  assert.doesNotMatch(sql, /sync/i);
  assert.doesNotMatch(sql, /submission/i);
  assert.doesNotMatch(sql, /account/i);
});

test("planning migration creates local goals periods tasks and links only", () => {
  const sql = createPlanning.statements.join("\n");

  assert.equal(createPlanning.version, 20);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS planning_goals/);
  assert.match(sql, /parent_goal_id TEXT/);
  assert.match(sql, /place_id TEXT/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS planning_periods/);
  assert.match(sql, /period_type TEXT NOT NULL/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS planning_tasks/);
  assert.match(sql, /responsible_person TEXT/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS planning_links/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS planning_boards/);
  assert.match(sql, /linked_record_type TEXT NOT NULL/);
  assert.doesNotMatch(sql, /server/i);
  assert.doesNotMatch(sql, /sync/i);
  assert.doesNotMatch(sql, /notification/i);
  assert.doesNotMatch(sql, /auth/i);
});

test("planning board migration creates local kanban views without workflow services", () => {
  const sql = createPlanningBoards.statements.join("\n");

  assert.equal(createPlanningBoards.version, 23);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS planning_boards/);
  assert.match(sql, /scope_type TEXT NOT NULL/);
  assert.match(sql, /goal_id TEXT/);
  assert.match(sql, /wip_limit INTEGER/);
  assert.doesNotMatch(sql, /server/i);
  assert.doesNotMatch(sql, /sync/i);
  assert.doesNotMatch(sql, /notification/i);
  assert.doesNotMatch(sql, /auth/i);
});

test("planning place-reference migration adds local place columns only", () => {
  const sql = addPlanningPlaceReferences.statements.join("\n");

  assert.equal(addPlanningPlaceReferences.version, 21);
  assert.match(sql, /ALTER TABLE planning_goals ADD COLUMN place_id TEXT/);
  assert.match(sql, /ALTER TABLE planning_tasks ADD COLUMN place_id TEXT/);
  assert.match(sql, /idx_planning_goals_place/);
  assert.match(sql, /idx_planning_tasks_place/);
  assert.doesNotMatch(sql, /server/i);
  assert.doesNotMatch(sql, /sync/i);
  assert.doesNotMatch(sql, /notification/i);
  assert.doesNotMatch(sql, /auth/i);
});

test("countable item cleanup migration removes retired countable setup records", () => {
  const sql = removeCountableItems.statements.join("\n");

  assert.equal(removeCountableItems.version, 22);
  assert.match(sql, /DELETE FROM inventory_count_records/);
  assert.match(sql, /kind = 'countableItem'/);
  assert.match(sql, /DELETE FROM tracked_items/);
  assert.doesNotMatch(sql, /server/i);
  assert.doesNotMatch(sql, /sync/i);
  assert.doesNotMatch(sql, /notification/i);
  assert.doesNotMatch(sql, /auth/i);
});
