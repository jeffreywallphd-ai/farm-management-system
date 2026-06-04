import assert from "node:assert/strict";
import test from "node:test";

import {
  addPolygonCornerAtMapCenter,
  canSaveGeometryFromMap,
  cornerFeatureCollection,
  edgeDistanceAnnotations,
  edgeDistanceFeatureCollection,
  geometryFeatureCollection,
  mapViewForGeometry,
  mapCoordinateFromAnnotationEvent,
  moveGeometryToMapCenter,
  pointGeometryFromMapCenter,
  polygonCornersFromGeometry,
  polygonGeometryFromCorners,
  undoLastPolygonCorner,
  updatePolygonCorner,
} from "./FarmGeometryMapEditorModel";
import type { FarmMapPreviewViewState } from "./FarmMapPreviewModel";

const mapCenter: FarmMapPreviewViewState = {
  latitude: 42.1,
  longitude: -93.2,
  zoom: 16,
  pitch: 0,
  bearing: 0,
};

test("farm geometry map editor creates point geometry from the map center", () => {
  assert.deepEqual(pointGeometryFromMapCenter(mapCenter), {
    type: "Point",
    coordinates: [-93.2, 42.1],
  });
});

test("farm geometry map editor adds, undoes, and closes polygon corners", () => {
  const first = addPolygonCornerAtMapCenter([], { ...mapCenter, longitude: -93.2, latitude: 42.1 });
  const second = addPolygonCornerAtMapCenter(first, { ...mapCenter, longitude: -93.1, latitude: 42.1 });
  const third = addPolygonCornerAtMapCenter(second, { ...mapCenter, longitude: -93.1, latitude: 42.2 });

  assert.equal(canSaveGeometryFromMap("polygon", second), false);
  assert.equal(canSaveGeometryFromMap("polygon", third), true);
  assert.deepEqual(undoLastPolygonCorner(third), second);
  assert.deepEqual(polygonGeometryFromCorners(third), {
    type: "Polygon",
    coordinates: [[
      [-93.2, 42.1],
      [-93.1, 42.1],
      [-93.1, 42.2],
      [-93.2, 42.1],
    ]],
  });
});

test("farm geometry map editor updates one selected polygon corner", () => {
  const corners: Array<[number, number]> = [
    [-93.2, 42.1],
    [-93.1, 42.1],
    [-93.1, 42.2],
  ];

  assert.deepEqual(updatePolygonCorner(corners, 1, [-93.15, 42.15]), [
    [-93.2, 42.1],
    [-93.15, 42.15],
    [-93.1, 42.2],
  ]);
  assert.deepEqual(updatePolygonCorner(corners, 10, [-93.15, 42.15]), corners);
});

test("farm geometry map editor reads dragged annotation coordinates", () => {
  assert.deepEqual(
    mapCoordinateFromAnnotationEvent({ nativeEvent: { lngLat: [-93.15, 42.15] } }),
    [-93.15, 42.15],
  );
  assert.deepEqual(
    mapCoordinateFromAnnotationEvent({ nativeEvent: { geometry: { coordinates: [-93.16, 42.16] } } }),
    [-93.16, 42.16],
  );
  assert.equal(mapCoordinateFromAnnotationEvent({ nativeEvent: { lngLat: ["bad", 42.15] } }), undefined);
});

test("farm geometry map editor strips existing polygon closing corner for editing", () => {
  assert.deepEqual(
    polygonCornersFromGeometry({
      type: "Polygon",
      coordinates: [[
        [-93.2, 42.1],
        [-93.1, 42.1],
        [-93.1, 42.2],
        [-93.2, 42.1],
      ]],
    }),
    [
      [-93.2, 42.1],
      [-93.1, 42.1],
      [-93.1, 42.2],
    ],
  );
});

test("farm geometry map editor moves whole geometry to the map center", () => {
  assert.deepEqual(
    moveGeometryToMapCenter(
      {
        type: "Polygon",
        coordinates: [[
          [0, 0],
          [2, 0],
          [2, 2],
          [0, 0],
        ]],
      },
      { ...mapCenter, longitude: 10, latitude: 10 },
    ),
    {
      type: "Polygon",
      coordinates: [[
        [8.666666666666666, 9.333333333333334],
        [10.666666666666666, 9.333333333333334],
        [10.666666666666666, 11.333333333333334],
        [8.666666666666666, 9.333333333333334],
      ]],
    },
  );
});

test("farm geometry map editor creates feature collections for map rendering", () => {
  const geometry = pointGeometryFromMapCenter(mapCenter);

  assert.equal(geometryFeatureCollection(geometry).features.length, 1);
  assert.deepEqual(cornerFeatureCollection([[-93.2, 42.1]]).features[0].geometry, {
    type: "Point",
    coordinates: [-93.2, 42.1],
  });
});

test("farm geometry map editor estimates polygon edge distances for map labels", () => {
  const featureCollection = edgeDistanceFeatureCollection([
    [-93.2, 42.1],
    [-93.199, 42.1],
    [-93.199, 42.101],
  ]);

  assert.equal(featureCollection.features.length, 3);
  assert.match(featureCollection.features[0].properties.label, /^~\d+(\.\d)? ft$/);
  assert.deepEqual(featureCollection.features[0].geometry, {
    type: "Point",
    coordinates: [-93.1995, 42.1],
  });
});

test("farm geometry map editor creates annotation-ready edge distance labels", () => {
  const labels = edgeDistanceAnnotations([
    [-93.2, 42.1],
    [-93.199, 42.1],
  ]);

  assert.equal(labels.length, 1);
  assert.equal(labels[0].id, "edge-distance-0");
  assert.match(labels[0].label, /^~\d+(\.\d)? ft$/);
  assert.deepEqual(labels[0].coordinate, [-93.1995, 42.1]);
});

test("farm geometry map editor can center the map on existing geometry", () => {
  const viewState = mapViewForGeometry(
    {
      type: "Point",
      coordinates: [-93.4, 42.3],
    },
    mapCenter,
  );

  assert.equal(viewState.longitude, -93.4);
  assert.equal(viewState.latitude, 42.3);
  assert.equal(viewState.zoom, mapCenter.zoom);
});
