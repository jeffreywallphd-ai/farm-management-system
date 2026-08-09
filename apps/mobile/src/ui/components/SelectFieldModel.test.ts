import assert from "node:assert/strict";
import test from "node:test";

import { formatGridOptionLabel, getSelectDropdownHint, getSelectOptionLayout } from "./SelectFieldModel";

test("select dropdown hints distinguish single and multi-select controls", () => {
  assert.equal(getSelectDropdownHint(false, "single"), "Change option");
  assert.equal(getSelectDropdownHint(false, "multiple"), "Change options");
  assert.equal(getSelectDropdownHint(true, "single"), "Hide options");
  assert.equal(getSelectDropdownHint(true, "multiple"), "Hide options");
});

test("select option layout grids static sets and lists farm-created sets", () => {
  assert.equal(getSelectOptionLayout("Status"), "grid");
  assert.equal(getSelectOptionLayout("Unit"), "grid");
  assert.equal(getSelectOptionLayout("Task status"), "grid");
  assert.equal(getSelectOptionLayout("Assigned farmhand"), "list");
  assert.equal(getSelectOptionLayout("Farm place"), "list");
  assert.equal(getSelectOptionLayout("Goal"), "list");
  assert.equal(getSelectOptionLayout("Parent goal"), "list");
  assert.equal(getSelectOptionLayout("Show tasks from"), "list");
  assert.equal(getSelectOptionLayout("Harvest place"), "list");
});

test("select option layout lists predefined options with long names", () => {
  assert.equal(getSelectOptionLayout("Method", [{ label: "Windrow" }, { label: "Static aerated pile" }]), "list");
  assert.equal(getSelectOptionLayout("Input category", [{ label: "Compost" }, { label: "Soil, fertility, and amendments" }]), "list");
  assert.equal(getSelectOptionLayout("How added to inventory", [{ label: "Purchased" }, { label: "Already owned" }], "grid"), "grid");
  assert.equal(getSelectOptionLayout("Common input", [{ label: "Compost" }, { label: "Greenhouse bench liner" }], "grid"), "list");
});

test("grid option labels wrap between words for longer static labels", () => {
  assert.equal(formatGridOptionLabel("Field observation"), "Field\nobservation");
  assert.equal(formatGridOptionLabel("Direct seed"), "Direct seed");
  assert.equal(formatGridOptionLabel("Self-produced"), "Self-\nproduced");
  assert.equal(formatGridOptionLabel("No, 90-day interval"), "No,\n90-day\ninterval");
});
