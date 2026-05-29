import assert from "node:assert/strict";
import test from "node:test";

import { createHarvestRecords } from "./0002_create_harvest_records";

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
