import assert from "node:assert/strict";
import test from "node:test";

import { addLocation } from "./add-location/addLocation";
import { addTrackedItem } from "./add-tracked-item/addTrackedItem";
import { listLocations } from "./list-locations/listLocations";
import { listTrackedItems } from "./list-tracked-items/listTrackedItems";
import { setupFarm } from "./setup-farm/setupFarm";
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

test("a location can be added and listed for its farm", async () => {
  const deps = dependencies();
  const farm = await setupFarm({ name: "Green Hill Farm" }, deps);

  const location = await addLocation({ farmId: farm.id, name: " North Field " }, deps);
  const locations = await listLocations(farm.id, deps.repository);

  assert.equal(location.farmId, farm.id);
  assert.equal(location.name, "North Field");
  assert.deepEqual(locations, [location]);
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
