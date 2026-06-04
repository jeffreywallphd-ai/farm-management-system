import assert from "node:assert/strict";
import test from "node:test";

import { buildMobilePilotRecoveryCopyPayload } from "./export-mobile-pilot-data/CreateHarvestRecoveryCopy";
import {
  archiveFarmPlaceGeometry,
  createFarmPlaceGeometry,
  saveFarmCenterLocation,
  saveFarmMapAddressText,
  saveFarmMapViewport,
  updateFarmPlaceGeometry,
} from "./manage-farm-map/ManageFarmMap";
import { setupFarm } from "./setup-farm/setupFarm";
import { InMemoryFarmMapRepository } from "../../testing/fakes/InMemoryFarmMapRepository";
import { InMemoryFarmReferenceRepository } from "../../testing/fakes/InMemoryFarmReferenceRepository";
import { InMemoryLocalRecordRepository } from "../../testing/fakes/InMemoryLocalRecordRepository";

function dependencies() {
  let nextId = 1;

  return {
    clock: { now: () => new Date("2026-06-03T12:00:00.000Z") },
    idGenerator: { newId: () => `local-${nextId++}` },
    farmMapRepository: new InMemoryFarmMapRepository(),
    farmReferenceRepository: new InMemoryFarmReferenceRepository(),
    localRecordRepository: new InMemoryLocalRecordRepository({ locations: [], trackedItems: [] }),
  };
}

test("farm map address text can be saved without coordinates", async () => {
  const deps = dependencies();
  const farm = await setupFarm({ name: "Green Hill Farm" }, {
    clock: deps.clock,
    idGenerator: deps.idGenerator,
    repository: deps.farmReferenceRepository,
  });

  const settings = await saveFarmMapAddressText(
    { farmId: farm.id, addressText: "  123 Farm Lane, Ames IA " },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.farmMapRepository },
  );

  assert.equal(settings.addressText, "123 Farm Lane, Ames IA");
  assert.equal(settings.defaultCenterLatitude, undefined);
  assert.equal(settings.defaultCenterLongitude, undefined);
});

test("farm map viewport persists center and zoom locally", async () => {
  const deps = dependencies();
  const farm = await setupFarm({ name: "Green Hill Farm" }, {
    clock: deps.clock,
    idGenerator: deps.idGenerator,
    repository: deps.farmReferenceRepository,
  });

  const settings = await saveFarmMapViewport(
    {
      farmId: farm.id,
      defaultCenterLatitude: 42.1,
      defaultCenterLongitude: -93.2,
      defaultZoom: 15,
      defaultPitch: 0,
      defaultBearing: 10,
    },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.farmMapRepository },
  );

  assert.equal(settings.defaultCenterLatitude, 42.1);
  assert.equal(settings.defaultCenterLongitude, -93.2);
  assert.equal(settings.defaultZoom, 15);
});

test("farm center saves as map settings and farm place geometry", async () => {
  const deps = dependencies();
  const farm = await setupFarm({ name: "Green Hill Farm" }, {
    clock: deps.clock,
    idGenerator: deps.idGenerator,
    repository: deps.farmReferenceRepository,
  });

  const { settings, farmCenter } = await saveFarmCenterLocation(
    { farmId: farm.id, latitude: 42.1, longitude: -93.2, addressText: "123 Farm Lane" },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.farmMapRepository },
  );

  assert.equal(settings.defaultCenterLatitude, 42.1);
  assert.equal(farmCenter.geometryRole, "farmCenter");
  assert.deepEqual(farmCenter.geojson, { type: "Point", coordinates: [-93.2, 42.1] });
});

test("farm geometry can be archived without destructive loss", async () => {
  const deps = dependencies();
  const farm = await setupFarm({ name: "Green Hill Farm" }, {
    clock: deps.clock,
    idGenerator: deps.idGenerator,
    repository: deps.farmReferenceRepository,
  });
  const boundary = await createFarmPlaceGeometry(
    {
      farmId: farm.id,
      geometryRole: "fieldBoundary",
      geojson: {
        type: "Polygon",
        coordinates: [[[-93.2, 42.1], [-93.1, 42.1], [-93.1, 42.2], [-93.2, 42.1]]],
      },
    },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.farmMapRepository },
  );

  await archiveFarmPlaceGeometry(
    { farmId: farm.id, geometryId: boundary.id },
    { clock: deps.clock, repository: deps.farmMapRepository },
  );

  assert.deepEqual(await deps.farmMapRepository.getGeometriesByFarmId(farm.id), []);
  assert.equal((await deps.farmMapRepository.getGeometriesByFarmId(farm.id, { includeArchived: true })).length, 1);
});

test("place geometry can remember its own saved map view", async () => {
  const deps = dependencies();
  const farm = await setupFarm({ name: "Green Hill Farm" }, {
    clock: deps.clock,
    idGenerator: deps.idGenerator,
    repository: deps.farmReferenceRepository,
  });
  await deps.farmReferenceRepository.addLocation({
    id: "place-1",
    farmId: farm.id,
    name: "North Field",
    kind: "field",
    createdAt: "2026-06-03T12:00:00.000Z",
  });

  const geometry = await createFarmPlaceGeometry(
    {
      farmId: farm.id,
      placeId: "place-1",
      geometryRole: "fieldBoundary",
      geojson: { type: "Point", coordinates: [-93.2, 42.1] },
      mapViewLatitude: 42.1005,
      mapViewLongitude: -93.2005,
      mapViewZoom: 18,
      mapViewPitch: 20,
      mapViewBearing: 35,
    },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.farmMapRepository },
  );

  assert.equal(geometry.placeId, "place-1");
  assert.equal(geometry.mapViewZoom, 18);

  const updated = await updateFarmPlaceGeometry(
    {
      farmId: farm.id,
      geometryId: geometry.id,
      placeId: "place-1",
      geometryRole: "fieldBoundary",
      geojson: { type: "Point", coordinates: [-93.21, 42.11] },
      name: "North Field point",
    },
    { clock: deps.clock, repository: deps.farmMapRepository },
  );

  assert.equal(updated.mapViewLatitude, 42.1005);
  assert.equal(updated.mapViewZoom, 18);
});

test("recovery copy includes map settings and archived geometry", async () => {
  const deps = dependencies();
  const farm = await setupFarm({ name: "Green Hill Farm" }, {
    clock: deps.clock,
    idGenerator: deps.idGenerator,
    repository: deps.farmReferenceRepository,
  });
  const { farmCenter } = await saveFarmCenterLocation(
    { farmId: farm.id, latitude: 42.1, longitude: -93.2 },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.farmMapRepository },
  );
  await archiveFarmPlaceGeometry(
    { farmId: farm.id, geometryId: farmCenter.id },
    { clock: deps.clock, repository: deps.farmMapRepository },
  );

  const recovery = await buildMobilePilotRecoveryCopyPayload(
    { farmId: farm.id },
    {
      clock: deps.clock,
      farmMapRepository: deps.farmMapRepository,
      farmReferenceRepository: deps.farmReferenceRepository,
      localRecordRepository: deps.localRecordRepository,
    },
  );

  assert.equal(recovery.farmMapSettings?.defaultCenterLatitude, 42.1);
  assert.equal(recovery.farmPlaceGeometries.length, 1);
  assert.equal(recovery.farmPlaceGeometries[0].archivedAt, "2026-06-03T12:00:00.000Z");
});
