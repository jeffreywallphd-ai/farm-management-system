import assert from "node:assert/strict";
import test from "node:test";

import { getStartupStep } from "./setupFlow";
import type { Farm } from "../domain/farm/Farm";

const farm: Farm = {
  id: "farm-1",
  name: "Green Hill Farm",
  createdAt: "2026-05-29T12:00:00.000Z",
};

test("first startup with no farm shows the farm-name setup step", () => {
  assert.equal(getStartupStep(null), "farmName");
});

test("saving a farm name moves startup to core farm places setup", () => {
  assert.equal(getStartupStep(farm), "coreFarmPlaces");
});

test("completed setup opens the post-setup home experience", () => {
  assert.equal(
    getStartupStep({ ...farm, corePlacesSetupCompletedAt: "2026-05-29T12:05:00.000Z" }),
    "home",
  );
});
