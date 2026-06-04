import assert from "node:assert/strict";
import test from "node:test";

import { farmMapSettingsSchema, farmPlaceGeometrySchema } from "./gisValidation";

test("farm map settings require latitude and longitude together", () => {
  assert.throws(
    () =>
      farmMapSettingsSchema.parse({
        id: "settings-1",
        farmId: "farm-1",
        defaultCenterLatitude: 41,
        defaultZoom: 13,
        defaultPitch: 0,
        defaultBearing: 0,
        mapProvider: "fallback",
        offlineMapStatus: "notConfigured",
        createdAt: "2026-06-03T12:00:00.000Z",
        updatedAt: "2026-06-03T12:00:00.000Z",
      }),
    /Save both latitude and longitude/,
  );
});

test("point geometry validates coordinate ranges and matching type", () => {
  const geometry = farmPlaceGeometrySchema.parse({
    id: "geometry-1",
    farmId: "farm-1",
    geometryType: "point",
    geometryRole: "farmCenter",
    geojson: { type: "Point", coordinates: [-93.2, 42.1] },
    source: "manualMapEdit",
    name: "Farm center",
    createdAt: "2026-06-03T12:00:00.000Z",
    updatedAt: "2026-06-03T12:00:00.000Z",
  });

  assert.equal(geometry.geometryRole, "farmCenter");
});

test("polygon geometry must use closed rings", () => {
  assert.throws(
    () =>
      farmPlaceGeometrySchema.parse({
        id: "geometry-1",
        farmId: "farm-1",
        geometryType: "polygon",
        geometryRole: "fieldBoundary",
        geojson: {
          type: "Polygon",
          coordinates: [[[-93.2, 42.1], [-93.1, 42.1], [-93.1, 42.2], [-93.2, 42.2]]],
        },
        source: "manualMapEdit",
        createdAt: "2026-06-03T12:00:00.000Z",
        updatedAt: "2026-06-03T12:00:00.000Z",
      }),
    /Polygon rings must start and end/,
  );
});

test("geometry type must match GeoJSON type", () => {
  assert.throws(
    () =>
      farmPlaceGeometrySchema.parse({
        id: "geometry-1",
        farmId: "farm-1",
        geometryType: "line",
        geometryRole: "farmCenter",
        geojson: { type: "Point", coordinates: [-93.2, 42.1] },
        source: "manualMapEdit",
        createdAt: "2026-06-03T12:00:00.000Z",
        updatedAt: "2026-06-03T12:00:00.000Z",
      }),
    /Geometry type must match GeoJSON type point/,
  );
});
