import assert from "node:assert/strict";
import test from "node:test";

import { HARVEST_NOTE_MAX_LENGTH } from "./harvestValidation";
import { parseHarvestInput } from "./harvestValidation";

test("valid harvest input is accepted and trimmed", () => {
  const parsed = parseHarvestInput({
    cropId: " crop-1 ",
    sourceLocationId: " location-1 ",
    quantityText: " 12.5 ",
    unit: "lb",
    note: "  First picking ",
  });

  assert.equal(parsed.cropId, "crop-1");
  assert.equal(parsed.sourceLocationId, "location-1");
  assert.equal(parsed.quantityText, 12.5);
  assert.equal(parsed.unit, "lb");
  assert.equal(parsed.note, "First picking");
});

test("missing crop and location are rejected", () => {
  assert.throws(
    () =>
      parseHarvestInput({
        cropId: "",
        sourceLocationId: "",
        quantityText: "10",
        unit: "lb",
        note: "",
      }),
    /Choose a crop|Choose where this harvest came from/,
  );
});

test("zero, negative, and malformed quantities are rejected", () => {
  for (const quantityText of ["0", "-1", "not a number"]) {
    assert.throws(
      () =>
        parseHarvestInput({
          cropId: "crop-1",
          sourceLocationId: "location-1",
          quantityText,
          unit: "lb",
          note: "",
        }),
      /greater than zero|Invalid input/,
    );
  }
});

test("unsupported harvest units are rejected", () => {
  assert.throws(
    () =>
      parseHarvestInput({
        cropId: "crop-1",
        sourceLocationId: "location-1",
        quantityText: "10",
        unit: "bucket",
        note: "",
      }),
    /Choose a unit|Invalid option/,
  );
});

test("note length is limited", () => {
  assert.throws(
    () =>
      parseHarvestInput({
        cropId: "crop-1",
        sourceLocationId: "location-1",
        quantityText: "10",
        unit: "lb",
        note: "x".repeat(HARVEST_NOTE_MAX_LENGTH + 1),
      }),
    /too long/,
  );
});
