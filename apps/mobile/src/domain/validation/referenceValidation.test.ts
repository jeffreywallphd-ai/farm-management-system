import assert from "node:assert/strict";
import test from "node:test";

import {
  REFERENCE_NAME_MAX_LENGTH,
  parseReferenceName,
  referenceNameSchema,
  trackedItemKindSchema,
} from "./referenceValidation";

test("reference names are trimmed and accepted", () => {
  assert.equal(parseReferenceName("  North Field  "), "North Field");
});

test("blank reference names are rejected", () => {
  assert.equal(referenceNameSchema.safeParse("   ").success, false);
});

test("reference names enforce the shared maximum length", () => {
  assert.equal(referenceNameSchema.safeParse("a".repeat(REFERENCE_NAME_MAX_LENGTH)).success, true);
  assert.equal(referenceNameSchema.safeParse("a".repeat(REFERENCE_NAME_MAX_LENGTH + 1)).success, false);
});

test("tracked item kinds are constrained to Mobile Pilot 1 reference kinds", () => {
  assert.equal(trackedItemKindSchema.safeParse("crop").success, true);
  assert.equal(trackedItemKindSchema.safeParse("material").success, true);
  assert.equal(trackedItemKindSchema.safeParse("countableItem").success, true);
  assert.equal(trackedItemKindSchema.safeParse("equipment").success, false);
});
