import assert from "node:assert/strict";
import test from "node:test";

import { addLocation } from "./add-location/addLocation";
import { addTrackedItem } from "./add-tracked-item/addTrackedItem";
import { completeCorePlacesSetup } from "./complete-core-places-setup/completeCorePlacesSetup";
import { listLocations } from "./list-locations/listLocations";
import { listTrackedItems } from "./list-tracked-items/listTrackedItems";
import { setupFarm } from "./setup-farm/setupFarm";
import { updateLocation } from "./update-location/updateLocation";
import { updateTrackedItem } from "./update-tracked-item/updateTrackedItem";
import { InMemoryFarmReferenceRepository } from "../../testing/fakes/InMemoryFarmReferenceRepository";

function dependencies() {
  let nextId = 1;

  return {
    clock: { now: () => new Date("2026-05-29T12:00:00.000Z") },
    idGenerator: { newId: () => `local-${nextId++}` },
    repository: new InMemoryFarmReferenceRepository(),
  };
}

test("a farm can be created with stable identity and timestamp", async () => {
  const deps = dependencies();

  const farm = await setupFarm({ name: "  Green Hill Farm " }, deps);

  assert.equal(farm.id, "local-1");
  assert.equal(farm.name, "Green Hill Farm");
  assert.equal(farm.createdAt, "2026-05-29T12:00:00.000Z");
  assert.deepEqual(await deps.repository.getFarm(), farm);
});

test("core farm places setup can be completed after the farm name step", async () => {
  const deps = dependencies();
  const farm = await setupFarm({ name: "Green Hill Farm" }, deps);

  assert.equal(farm.corePlacesSetupCompletedAt, undefined);

  const updatedFarm = await completeCorePlacesSetup(farm.id, deps);

  assert.equal(updatedFarm?.corePlacesSetupCompletedAt, "2026-05-29T12:00:00.000Z");
  assert.equal((await deps.repository.getFarm())?.corePlacesSetupCompletedAt, "2026-05-29T12:00:00.000Z");
});

test("a location can be added and listed for its farm", async () => {
  const deps = dependencies();
  const farm = await setupFarm({ name: "Green Hill Farm" }, deps);

  const location = await addLocation({ farmId: farm.id, name: " North Field ", kind: "field" }, deps);
  const locations = await listLocations(farm.id, deps.repository);

  assert.equal(location.farmId, farm.id);
  assert.equal(location.name, "North Field");
  assert.equal(location.kind, "field");
  assert.deepEqual(locations, [location]);
});

test("farm places can be nested under saved parent places", async () => {
  const deps = dependencies();
  const farm = await setupFarm({ name: "Green Hill Farm" }, deps);

  const field = await addLocation({ farmId: farm.id, name: "Field 1", kind: "field" }, deps);
  const bed = await addLocation({ farmId: farm.id, name: "Bed 1", kind: "bed", parentId: field.id }, deps);
  const row = await addLocation({ farmId: farm.id, name: "Row 1", kind: "row", parentId: bed.id }, deps);
  const greenhouse = await addLocation({ farmId: farm.id, name: "Greenhouse 1", kind: "greenhouse" }, deps);
  const bench = await addLocation({ farmId: farm.id, name: "Bench 1", kind: "bench", parentId: greenhouse.id }, deps);

  assert.equal(row.parentId, bed.id);
  assert.equal(bench.parentId, greenhouse.id);
  assert.deepEqual(await listLocations(farm.id, deps.repository), [field, bed, row, greenhouse, bench]);
});

test("farm place parent must already exist in the same farm", async () => {
  const deps = dependencies();
  const farm = await setupFarm({ name: "Green Hill Farm" }, deps);

  await assert.rejects(
    () => addLocation({ farmId: farm.id, name: "Bed 1", kind: "bed", parentId: "missing" }, deps),
    /Choose a saved parent place/,
  );
});

test("farm place cannot be its own parent", async () => {
  const deps = dependencies();
  const farm = await setupFarm({ name: "Green Hill Farm" }, deps);

  await assert.rejects(
    () =>
      addLocation(
        { farmId: farm.id, name: "Bed 1", kind: "bed", parentId: "local-2" },
        { ...deps, idGenerator: { newId: () => "local-2" } },
      ),
    /inside itself/,
  );
});

test("farm places can be edited without breaking derived child paths", async () => {
  const deps = dependencies();
  const farm = await setupFarm({ name: "Green Hill Farm" }, deps);

  const field = await addLocation({ farmId: farm.id, name: "Field 1", kind: "field" }, deps);
  const bed = await addLocation({ farmId: farm.id, name: "Bed 1", kind: "bed", parentId: field.id }, deps);

  const updatedField = await updateLocation(
    { farmId: farm.id, id: field.id, name: "North Field", kind: "field" },
    deps,
  );

  assert.equal(updatedField.name, "North Field");
  assert.deepEqual(await listLocations(farm.id, deps.repository), [
    updatedField,
    { ...bed, parentId: updatedField.id },
  ]);
});

test("farm places cannot be edited inside one of their children", async () => {
  const deps = dependencies();
  const farm = await setupFarm({ name: "Green Hill Farm" }, deps);

  const field = await addLocation({ farmId: farm.id, name: "Field 1", kind: "field" }, deps);
  const bed = await addLocation({ farmId: farm.id, name: "Bed 1", kind: "bed", parentId: field.id }, deps);

  await assert.rejects(
    () => updateLocation({ farmId: farm.id, id: field.id, name: "Field 1", kind: "field", parentId: bed.id }, deps),
    /inside one of its child places/,
  );
});

test("tracked item lists return only matching farm and kind", async () => {
  const deps = dependencies();
  const farm = await setupFarm({ name: "Green Hill Farm" }, deps);
  await deps.repository.createFarm({ id: "other-farm", name: "Other", createdAt: farm.createdAt });

  const crop = await addTrackedItem({ farmId: farm.id, kind: "crop", name: "Kale" }, deps);
  await addTrackedItem({ farmId: farm.id, kind: "material", name: "Compost" }, deps);
  await addTrackedItem({ farmId: "other-farm", kind: "crop", name: "Carrots" }, deps);

  assert.deepEqual(await listTrackedItems(farm.id, "crop", deps.repository), [crop]);
});

test("tracked setup items can be edited after creation", async () => {
  const deps = dependencies();
  const farm = await setupFarm({ name: "Green Hill Farm" }, deps);
  const crop = await addTrackedItem({ farmId: farm.id, kind: "crop", name: "Kale" }, deps);

  const updatedCrop = await updateTrackedItem({ farmId: farm.id, id: crop.id, kind: "crop", name: "Lacinato kale" }, deps);

  assert.equal(updatedCrop.name, "Lacinato kale");
  assert.deepEqual(await listTrackedItems(farm.id, "crop", deps.repository), [updatedCrop]);
});
