import assert from "node:assert/strict";
import test from "node:test";

import { buildFarmPlaceDisplays, buildFarmPlaceOptions, hasGrowingPlace } from "./farmPlaceDisplay";

const createdAt = "2026-05-29T12:00:00.000Z";

test("farm place display paths represent nested places", () => {
  const places = [
    { id: "field-1", farmId: "farm-1", name: "Field 1", kind: "field" as const, createdAt },
    { id: "bed-1", farmId: "farm-1", name: "Bed 1", kind: "bed" as const, parentId: "field-1", createdAt },
    { id: "row-1", farmId: "farm-1", name: "Row 1", kind: "row" as const, parentId: "bed-1", createdAt },
    { id: "greenhouse-1", farmId: "farm-1", name: "Greenhouse 1", kind: "greenhouse" as const, createdAt },
    { id: "bench-1", farmId: "farm-1", name: "Bench 1", kind: "bench" as const, parentId: "greenhouse-1", createdAt },
  ];

  assert.deepEqual(
    buildFarmPlaceDisplays(places).map((display) => display.path),
    [
      "Field 1",
      "Field 1 > Bed 1",
      "Field 1 > Bed 1 > Row 1",
      "Greenhouse 1",
      "Greenhouse 1 > Bench 1",
    ],
  );
  assert.deepEqual(buildFarmPlaceOptions(places)[2], {
    label: "Field 1 > Bed 1 > Row 1",
    value: "row-1",
  });
  assert.equal(hasGrowingPlace(places), true);
});
