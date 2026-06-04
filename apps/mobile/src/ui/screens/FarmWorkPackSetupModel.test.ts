import assert from "node:assert/strict";
import test from "node:test";

import {
  isStarterPackHierarchyChecked,
  selectedStarterPackTaskCount,
  starterPackTaskCountLabel,
  toggleStarterPackTaskKeys,
} from "./FarmWorkPackSetupModel";

test("starter pack task selection includes ancestors visually without selecting sibling tasks", () => {
  const packId = "marketGardenPlanning";
  const taskKeys = ["task-1", "task-2", "task-3"];

  const selected = toggleStarterPackTaskKeys({}, packId, ["task-2"]);
  const selectedSet = new Set(selected[packId]);

  assert.deepEqual(selected[packId], ["task-2"]);
  assert.equal(isStarterPackHierarchyChecked(taskKeys, selectedSet), true);
  assert.equal(selectedStarterPackTaskCount(taskKeys, selectedSet), 1);
  assert.equal(starterPackTaskCountLabel(taskKeys.length, 1, false), "1/3 tasks");
});

test("clicking a starter pack goal or subgoal toggles the full task set", () => {
  const packId = "compostWork";
  const taskKeys = ["check-moisture", "check-temperature", "turn-pile"];

  const selected = toggleStarterPackTaskKeys({}, packId, taskKeys);
  assert.deepEqual(selected[packId], taskKeys);

  const cleared = toggleStarterPackTaskKeys(selected, packId, taskKeys);
  assert.equal(cleared[packId], undefined);
});

test("clicking a partially selected starter pack branch selects remaining tasks", () => {
  const packId = "greenhouseSeedlingWork";
  const taskKeys = ["fill-trays", "sow-trays", "label-trays"];

  const partial = toggleStarterPackTaskKeys({}, packId, ["sow-trays"]);
  const completed = toggleStarterPackTaskKeys(partial, packId, taskKeys);

  assert.deepEqual(completed[packId], taskKeys);
  assert.equal(starterPackTaskCountLabel(taskKeys.length, taskKeys.length, false), "3/3 tasks");
});
