import assert from "node:assert/strict";
import test from "node:test";

import type { FarmPlaceGeometry } from "../../../domain/gis/FarmMap";
import { SqliteFarmMapRepository } from "./SqliteFarmMapRepository";

type RunCall = {
  sql: string;
  values: unknown[];
};

test("farm map settings insert binds normalized variadic SQLite values", async () => {
  const calls: RunCall[] = [];
  const repository = new SqliteFarmMapRepository(fakeDatabase(calls));

  await repository.createOrUpdate({
    id: "settings-1",
    farmId: "farm-1",
    defaultCenterLatitude: 42.1,
    defaultCenterLongitude: -93.2,
    defaultZoom: 13,
    defaultPitch: 0,
    defaultBearing: 0,
    mapProvider: "fallback",
    offlineMapStatus: "notConfigured",
    createdAt: "2026-06-03T12:00:00.000Z",
    updatedAt: "2026-06-03T12:00:00.000Z",
  });

  assert.equal(calls.length, 1);
  assert.match(calls[0].sql, /INSERT INTO farm_map_settings/);
  assert.equal(calls[0].values.includes(undefined), false);
  assert.equal(calls[0].values[2], null);
  assert.equal(calls[0].values[10], null);
  assert.equal(calls[0].values[11], null);
});

test("farm center geometry insert binds nulls instead of undefined", async () => {
  const calls: RunCall[] = [];
  const repository = new SqliteFarmMapRepository(fakeDatabase(calls));
  const geometry: FarmPlaceGeometry = {
    id: "geometry-1",
    farmId: "farm-1",
    geometryType: "point",
    geometryRole: "farmCenter",
    geojson: { type: "Point", coordinates: [-93.2, 42.1] },
    source: "manualMapEdit",
    name: "Farm center",
    mapViewLatitude: 42.1005,
    mapViewLongitude: -93.2005,
    mapViewZoom: 18,
    mapViewPitch: 10,
    mapViewBearing: 25,
    createdAt: "2026-06-03T12:00:00.000Z",
    updatedAt: "2026-06-03T12:00:00.000Z",
  };

  await repository.createGeometry(geometry);

  assert.equal(calls.length, 1);
  assert.match(calls[0].sql, /INSERT INTO farm_place_geometries/);
  assert.equal(calls[0].values.includes(undefined), false);
  assert.equal(calls[0].values[2], null);
  assert.equal(calls[0].values[8], null);
  assert.equal(calls[0].values[9], 42.1005);
  assert.equal(calls[0].values[13], 25);
  assert.equal(calls[0].values[16], null);
});

function fakeDatabase(calls: RunCall[]) {
  return {
    async getFirstAsync() {
      return null;
    },
    async getAllAsync() {
      return [];
    },
    async runAsync(sql: string, ...values: unknown[]) {
      calls.push({ sql, values });
    },
  } as never;
}
