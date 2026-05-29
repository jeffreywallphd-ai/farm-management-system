import assert from "node:assert/strict";
import test from "node:test";

import { parseInventoryCountInput, parseMaterialUseInput } from "./manualRecordValidation";

test("material use accepts practical pilot units and rejects invalid quantities", () => {
  const parsed = parseMaterialUseInput({
    materialId: "material-1",
    quantityText: "2",
    unit: "bag",
    useLocationId: "",
    note: " Used in tunnel ",
  });

  assert.equal(parsed.quantityText, 2);
  assert.equal(parsed.unit, "bag");
  assert.equal(parsed.note, "Used in tunnel");

  for (const quantityText of ["", "   ", "0", "-1", "abc"]) {
    assert.throws(
      () =>
        parseMaterialUseInput({
          materialId: "material-1",
          quantityText,
          unit: "bag",
          note: "",
        }),
      /greater than zero|Invalid input/,
    );
  }
});

test("inventory count rejects blank and invalid counts but accepts intentional zero", () => {
  for (const quantityText of ["", "   ", "abc", "-1"]) {
    assert.throws(
      () =>
        parseInventoryCountInput({
          trackedItemId: "item-1",
          quantityText,
          unit: "tray",
          note: "",
        }),
      /zero or more|Invalid input/,
    );
  }

  assert.equal(
    parseInventoryCountInput({
      trackedItemId: "item-1",
      quantityText: "0",
      unit: "tray",
      note: "",
    }).quantityText,
    0,
  );
  assert.equal(
    parseInventoryCountInput({
      trackedItemId: "item-1",
      quantityText: "18",
      unit: "flat",
      note: "",
    }).quantityText,
    18,
  );
});

test("inventory count rejects unsupported units", () => {
  assert.throws(
    () =>
      parseInventoryCountInput({
        trackedItemId: "item-1",
        quantityText: "18",
        unit: "bucket",
        note: "",
      }),
    /Choose a unit|Invalid option/,
  );
});
