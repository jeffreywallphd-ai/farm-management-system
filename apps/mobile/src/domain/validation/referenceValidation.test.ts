import assert from "node:assert/strict";
import test from "node:test";

import {
  REFERENCE_NAME_MAX_LENGTH,
  parseReferenceName,
  farmPlaceKindSchema,
  farmPlaceInputSchema,
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

test("farm place kinds are constrained to the local pilot vocabulary", () => {
  assert.equal(farmPlaceKindSchema.safeParse("field").success, true);
  assert.equal(farmPlaceKindSchema.safeParse("greenhouse").success, true);
  assert.equal(farmPlaceKindSchema.safeParse("washPack").success, true);
  assert.equal(farmPlaceKindSchema.safeParse("gpsBoundary").success, false);
});

test("farm place input trims names and supports optional parents", () => {
  assert.deepEqual(farmPlaceInputSchema.parse({ name: " Field 1 ", kind: "field", parentId: "" }), {
    name: "Field 1",
    kind: "field",
    parentId: undefined,
  });
  assert.deepEqual(farmPlaceInputSchema.parse({ name: " Bed 1 ", kind: "bed", parentId: "field-1" }), {
    name: "Bed 1",
    kind: "bed",
    parentId: "field-1",
  });
  assert.equal(farmPlaceInputSchema.safeParse({ name: " ", kind: "field", parentId: "" }).success, false);
});
