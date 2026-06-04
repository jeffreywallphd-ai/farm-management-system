import assert from "node:assert/strict";
import test from "node:test";

import {
  defaultFarmMapPreviewSeason,
  extractFarmMapPreviewViewState,
  farmMapPreviewAspectRatio,
  getFarmMapPreviewOnlineStyle,
  getFarmMapPreviewCamera,
  getFarmMapPreviewExportStatus,
  getFarmMapPreviewSeasonButtonLabel,
  getFarmMapPreviewSeasonCaption,
  getFarmMapPreviewSeasonShortButtonLabel,
  getFarmMapPreviewSeasonShortCaption,
  getFarmMapPreviewTileSourceIds,
  getNextFarmMapPreviewSeason,
  localBlankMapStyle,
  minimumFarmMapPreviewZoom,
  onlineFarmMapStyle,
  shouldAttemptNativeFarmMapPreview,
} from "./FarmMapPreviewModel";

test("farm map preview extracts view state from MapLibre properties events", () => {
  const viewState = extractFarmMapPreviewViewState({
    nativeEvent: {
      properties: {
        center: [-93.6319, 42.0308],
        zoom: 14,
        pitch: 10,
        bearing: 25,
      },
    },
  });

  assert.deepEqual(viewState, {
    latitude: 42.0308,
    longitude: -93.6319,
    zoom: 14,
    pitch: 10,
    bearing: 25,
  });
});

test("farm map preview extracts view state from direct native events", () => {
  const viewState = extractFarmMapPreviewViewState({
    nativeEvent: {
      center: [-93.2, 42.1],
    },
  });

  assert.deepEqual(viewState, {
    latitude: 42.1,
    longitude: -93.2,
    zoom: 13,
    pitch: 0,
    bearing: 0,
  });
});

test("farm map preview extracts view state from object centers", () => {
  const viewState = extractFarmMapPreviewViewState({
    nativeEvent: {
      center: {
        latitude: 42.1,
        longitude: -93.2,
      },
      zoom: 16,
    },
  });

  assert.deepEqual(viewState, {
    latitude: 42.1,
    longitude: -93.2,
    zoom: 16,
    pitch: 0,
    bearing: 0,
  });
});

test("farm map preview uses a local blank style without remote tile sources", () => {
  assert.deepEqual(localBlankMapStyle.sources, {});
  assert.equal(localBlankMapStyle.layers[0].type, "background");
});

test("farm map preview can intentionally load an online MapLibre style", () => {
  assert.equal(defaultFarmMapPreviewSeason, "mixedLeafOff");
  assert.equal(onlineFarmMapStyle.sources["farm-mixed-season-imagery"].type, "raster");
  assert.match(onlineFarmMapStyle.sources["farm-mixed-season-imagery"].tiles[0], /^https:\/\/services\.arcgisonline\.com\/ArcGIS\/rest\/services\/World_Imagery\/MapServer\/tile\/\{z\}\/\{y\}\/\{x\}$/);
  assert.equal(onlineFarmMapStyle.layers[0].type, "raster");
  assert.equal(onlineFarmMapStyle.layers[0].source, "farm-mixed-season-imagery");
});

test("farm map preview season controls switch between available imagery styles", () => {
  assert.equal(getNextFarmMapPreviewSeason("mixedLeafOff"), "leafOn");
  assert.equal(getNextFarmMapPreviewSeason("leafOn"), "mixedLeafOff");
  assert.match(getFarmMapPreviewSeasonButtonLabel("mixedLeafOff"), /Season:/);
  assert.equal(getFarmMapPreviewSeasonShortButtonLabel("mixedLeafOff"), "Imagery: Mixed");
  assert.equal(getFarmMapPreviewSeasonShortButtonLabel("leafOn"), "Imagery: Leaf-on");
  assert.match(getFarmMapPreviewSeasonCaption("mixedLeafOff"), /Leaf-off visibility depends/);
  assert.equal(getFarmMapPreviewSeasonShortCaption("mixedLeafOff"), "Mixed imagery; leaf-off varies. Move map, then save.");
  assert.equal(getFarmMapPreviewSeasonShortCaption("leafOn"), "Leaf-on imagery. Move map, then save.");
  assert.ok(getFarmMapPreviewSeasonShortCaption("mixedLeafOff").length < getFarmMapPreviewSeasonCaption("mixedLeafOff").length);
  assert.deepEqual(getFarmMapPreviewTileSourceIds("mixedLeafOff"), ["farm-mixed-season-imagery"]);
  assert.deepEqual(getFarmMapPreviewTileSourceIds("leafOn"), ["farm-leaf-on-imagery"]);
  assert.match(getFarmMapPreviewOnlineStyle("leafOn").sources["farm-leaf-on-imagery"].tiles[0], /^https:\/\/basemap\.nationalmap\.gov\/arcgis\/rest\/services\/USGSImageryOnly\/MapServer\/tile\/\{z\}\/\{y\}\/\{x\}$/);
});

test("farm map preview uses a portrait map frame for mobile farm setup", () => {
  assert.ok(farmMapPreviewAspectRatio > 0);
  assert.ok(farmMapPreviewAspectRatio < 1);
});

test("farm map preview camera centers on saved longitude latitude and uses farm-level zoom", () => {
  assert.deepEqual(
    getFarmMapPreviewCamera({
      latitude: 42.0308,
      longitude: -93.6319,
      zoom: 0,
      pitch: 0,
      bearing: 0,
    }),
    {
      center: [-93.6319, 42.0308],
      zoom: minimumFarmMapPreviewZoom,
      pitch: 0,
      bearing: 0,
    },
  );
  assert.equal(
    getFarmMapPreviewCamera({
      latitude: 42.0308,
      longitude: -93.6319,
      zoom: 17,
      pitch: 0,
      bearing: 0,
    }).zoom,
    17,
  );
});

test("farm map preview resolves the installed MapLibre export shape", () => {
  assert.deepEqual(getFarmMapPreviewExportStatus({ Camera: {}, Map: {} }), {
    hasCameraComponent: true,
    mapComponentExportName: "Map",
  });
  assert.deepEqual(getFarmMapPreviewExportStatus({ Camera: {}, MapView: {} }), {
    hasCameraComponent: true,
    mapComponentExportName: "MapView",
  });
  assert.deepEqual(getFarmMapPreviewExportStatus({ default: { Camera: {}, Map: {} } }), {
    hasCameraComponent: true,
    mapComponentExportName: "Map",
  });
});

test("farm map preview reports missing MapLibre component exports", () => {
  assert.deepEqual(getFarmMapPreviewExportStatus({ Camera: {} }), {
    hasCameraComponent: true,
  });
  assert.deepEqual(getFarmMapPreviewExportStatus({ Map: {} }), {
    hasCameraComponent: false,
    mapComponentExportName: "Map",
  });
});

test("farm map preview attempts native MapLibre in native runtimes", () => {
  assert.equal(shouldAttemptNativeFarmMapPreview({ platformOS: "android" }), true);
  assert.equal(shouldAttemptNativeFarmMapPreview({ platformOS: "ios" }), true);
  assert.equal(shouldAttemptNativeFarmMapPreview({ platformOS: "web" }), false);
});
