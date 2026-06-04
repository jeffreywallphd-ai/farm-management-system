import type { FarmId } from "../farm/Farm";
import type { FarmLocationId } from "../farm/FarmLocation";
import type { IsoDateTimeString } from "../records/OperationalRecord";

export type FarmMapSettingsId = string;
export type FarmPlaceGeometryId = string;

export const FARM_MAP_PROVIDERS = ["fallback", "mapLibre"] as const;
export type FarmMapProvider = (typeof FARM_MAP_PROVIDERS)[number];

export const FARM_MAP_OFFLINE_STATUSES = [
  "notConfigured",
  "notDownloaded",
  "downloadQueued",
  "downloading",
  "downloaded",
  "failed",
  "unavailable",
] as const;
export type FarmMapOfflineStatus = (typeof FARM_MAP_OFFLINE_STATUSES)[number];

export interface FarmMapSettings {
  id: FarmMapSettingsId;
  farmId: FarmId;
  addressText?: string;
  defaultCenterLatitude?: number;
  defaultCenterLongitude?: number;
  defaultZoom: number;
  defaultPitch: number;
  defaultBearing: number;
  mapProvider: FarmMapProvider;
  offlineMapStatus: FarmMapOfflineStatus;
  offlinePackName?: string;
  offlineDownloadedAt?: IsoDateTimeString;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}

export const FARM_PLACE_GEOMETRY_TYPES = ["point", "line", "polygon", "multiPolygon"] as const;
export type FarmPlaceGeometryType = (typeof FARM_PLACE_GEOMETRY_TYPES)[number];

export const FARM_PLACE_GEOMETRY_ROLES = [
  "farmCenter",
  "fieldBoundary",
  "bedBoundary",
  "rowLine",
  "greenhouseBoundary",
  "buildingFootprint",
  "storageArea",
  "washPackArea",
  "bufferZone",
  "waterSource",
  "accessRoad",
  "adjacentLandRiskArea",
  "driftIncidentArea",
  "contaminationConcernPoint",
  "other",
] as const;
export type FarmPlaceGeometryRole = (typeof FARM_PLACE_GEOMETRY_ROLES)[number];

export const FARM_PLACE_GEOMETRY_SOURCES = [
  "manualMapEdit",
  "gps",
  "addressGeocode",
  "imported",
  "derived",
] as const;
export type FarmPlaceGeometrySource = (typeof FARM_PLACE_GEOMETRY_SOURCES)[number];

export type GeoJsonPosition = [longitude: number, latitude: number] | [longitude: number, latitude: number, elevation: number];

export interface GeoJsonPoint {
  type: "Point";
  coordinates: GeoJsonPosition;
}

export interface GeoJsonLineString {
  type: "LineString";
  coordinates: GeoJsonPosition[];
}

export interface GeoJsonPolygon {
  type: "Polygon";
  coordinates: GeoJsonPosition[][];
}

export interface GeoJsonMultiPolygon {
  type: "MultiPolygon";
  coordinates: GeoJsonPosition[][][];
}

export type SupportedGeoJsonGeometry =
  | GeoJsonPoint
  | GeoJsonLineString
  | GeoJsonPolygon
  | GeoJsonMultiPolygon;

export interface FarmPlaceGeometry {
  id: FarmPlaceGeometryId;
  farmId: FarmId;
  placeId?: FarmLocationId;
  geometryType: FarmPlaceGeometryType;
  geometryRole: FarmPlaceGeometryRole;
  geojson: SupportedGeoJsonGeometry;
  source: FarmPlaceGeometrySource;
  name?: string;
  notes?: string;
  mapViewLatitude?: number;
  mapViewLongitude?: number;
  mapViewZoom?: number;
  mapViewPitch?: number;
  mapViewBearing?: number;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
  archivedAt?: IsoDateTimeString;
}

export function geometryTypeForGeoJson(geojson: SupportedGeoJsonGeometry): FarmPlaceGeometryType {
  switch (geojson.type) {
    case "Point":
      return "point";
    case "LineString":
      return "line";
    case "Polygon":
      return "polygon";
    case "MultiPolygon":
      return "multiPolygon";
  }
}

export function farmCenterPointGeoJson(input: {
  latitude: number;
  longitude: number;
}): GeoJsonPoint {
  return {
    type: "Point",
    coordinates: [input.longitude, input.latitude],
  };
}
