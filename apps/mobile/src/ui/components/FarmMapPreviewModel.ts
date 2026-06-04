export interface FarmMapPreviewViewState {
  latitude: number;
  longitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

export type FarmMapPreviewExportStatus = {
  hasCameraComponent: boolean;
  mapComponentExportName?: "Map" | "MapView";
};

export type FarmMapPreviewSeason = "mixedLeafOff" | "leafOn";

export const minimumFarmMapPreviewZoom = 15;
export const farmMapPreviewAspectRatio = 0.72;
export const defaultFarmMapPreviewSeason: FarmMapPreviewSeason = "mixedLeafOff";

export const farmMapPreviewSeasonLabels: Record<FarmMapPreviewSeason, string> = {
  mixedLeafOff: "Mixed / leaf-off where available",
  leafOn: "Leaf-on",
};

export const onlineFarmMapStyles: Record<FarmMapPreviewSeason, {
  version: 8;
  sources: Record<string, {
    type: "raster";
    tiles: string[];
    tileSize: 256;
    maxzoom?: number;
    attribution: string;
  }>;
  layers: Array<{
    id: string;
    type: "raster";
    source: string;
  }>;
}> = {
  mixedLeafOff: {
    version: 8,
    sources: {
      "farm-mixed-season-imagery": {
        type: "raster",
        tiles: [
          "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
        attribution: "Sources: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
      },
    },
    layers: [
      {
        id: "farm-mixed-season-imagery",
        type: "raster",
        source: "farm-mixed-season-imagery",
      },
    ],
  },
  leafOn: {
    version: 8,
    sources: {
      "farm-leaf-on-imagery": {
        type: "raster",
        tiles: [
          "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}",
        ],
        maxzoom: 16,
        tileSize: 256,
        attribution: "USGS The National Map imagery; USDA NAIP where available",
      },
    },
    layers: [
      {
        id: "farm-leaf-on-imagery",
        type: "raster",
        source: "farm-leaf-on-imagery",
      },
    ],
  },
};

export const onlineFarmMapStyle = onlineFarmMapStyles[defaultFarmMapPreviewSeason];

export function getFarmMapPreviewOnlineStyle(season: FarmMapPreviewSeason) {
  return onlineFarmMapStyles[season];
}

export function getNextFarmMapPreviewSeason(season: FarmMapPreviewSeason): FarmMapPreviewSeason {
  return season === "mixedLeafOff" ? "leafOn" : "mixedLeafOff";
}

export function getFarmMapPreviewSeasonButtonLabel(season: FarmMapPreviewSeason): string {
  return `Season: ${farmMapPreviewSeasonLabels[season]}`;
}

export function getFarmMapPreviewSeasonShortButtonLabel(season: FarmMapPreviewSeason): string {
  return season === "leafOn" ? "Imagery: Leaf-on" : "Imagery: Mixed";
}

export function getFarmMapPreviewSeasonCaption(season: FarmMapPreviewSeason): string {
  if (season === "leafOn") {
    return "Leaf-on aerial imagery is showing. Pan or zoom, then save the map view or farm location.";
  }

  return "Mixed-season satellite imagery is showing. Leaf-off visibility depends on available imagery. Pan or zoom, then save the map view or farm location.";
}

export function getFarmMapPreviewSeasonShortCaption(season: FarmMapPreviewSeason): string {
  if (season === "leafOn") {
    return "Leaf-on imagery. Move map, then save.";
  }

  return "Mixed imagery; leaf-off varies. Move map, then save.";
}

export function getFarmMapPreviewTileSourceIds(season: FarmMapPreviewSeason): string[] {
  return Object.keys(onlineFarmMapStyles[season].sources);
}

export const localBlankMapStyle = {
  version: 8,
  sources: {},
  layers: [
    {
      id: "farm-map-background",
      type: "background",
      paint: {
        "background-color": "#E6E2D5",
      },
    },
  ],
};

export function getFarmMapPreviewCamera(input: FarmMapPreviewViewState): {
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
} {
  return {
    center: [input.longitude, input.latitude],
    zoom: Math.max(input.zoom, minimumFarmMapPreviewZoom),
    pitch: input.pitch,
    bearing: input.bearing,
  };
}

export function shouldAttemptNativeFarmMapPreview(environment: {
  platformOS?: string | null;
}): boolean {
  return environment.platformOS !== "web";
}

export function getFarmMapPreviewExportStatus(moduleValue: unknown): FarmMapPreviewExportStatus {
  const moduleRecord = isRecord(moduleValue) ? moduleValue : {};
  const defaultRecord = isRecord(moduleRecord.default) ? moduleRecord.default : {};
  const hasCameraComponent = Boolean(moduleRecord.Camera ?? defaultRecord.Camera);

  if (moduleRecord.Map ?? defaultRecord.Map) {
    return { hasCameraComponent, mapComponentExportName: "Map" };
  }

  if (moduleRecord.MapView ?? defaultRecord.MapView) {
    return { hasCameraComponent, mapComponentExportName: "MapView" };
  }

  return { hasCameraComponent };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function extractFarmMapPreviewViewState(event: unknown): FarmMapPreviewViewState | null {
  const eventRecord = event as {
    nativeEvent?: {
      center?: unknown;
      zoom?: number;
      pitch?: number;
      bearing?: number;
      properties?: {
        center?: unknown;
        zoom?: number;
        pitch?: number;
        bearing?: number;
      };
    };
  };
  const nativeEvent = eventRecord.nativeEvent;
  const properties = nativeEvent?.properties;
  const center = extractCenter(properties?.center ?? nativeEvent?.center);

  if (!center) {
    return null;
  }

  return {
    longitude: center[0],
    latitude: center[1],
    zoom: properties?.zoom ?? nativeEvent?.zoom ?? 13,
    pitch: properties?.pitch ?? nativeEvent?.pitch ?? 0,
    bearing: properties?.bearing ?? nativeEvent?.bearing ?? 0,
  };
}

function extractCenter(center: unknown): [number, number] | null {
  if (Array.isArray(center) && center.length >= 2) {
    const longitude = Number(center[0]);
    const latitude = Number(center[1]);

    return Number.isFinite(longitude) && Number.isFinite(latitude) ? [longitude, latitude] : null;
  }

  if (isRecord(center)) {
    const longitude = Number(center.longitude ?? center.lng ?? center.lon);
    const latitude = Number(center.latitude ?? center.lat);

    return Number.isFinite(longitude) && Number.isFinite(latitude) ? [longitude, latitude] : null;
  }

  return null;
}
