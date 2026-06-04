import assert from "node:assert/strict";
import test from "node:test";

import { getSelectDropdownHint } from "./SelectFieldModel";

test("select dropdown hints distinguish single and multi-select controls", () => {
  assert.equal(getSelectDropdownHint(false, "single"), "Change option");
  assert.equal(getSelectDropdownHint(false, "multiple"), "Change options");
  assert.equal(getSelectDropdownHint(true, "single"), "Hide options");
  assert.equal(getSelectDropdownHint(true, "multiple"), "Hide options");
});
