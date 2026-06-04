import { z } from "zod";

import {
  FARM_MAP_OFFLINE_STATUSES,
  FARM_MAP_PROVIDERS,
  FARM_PLACE_GEOMETRY_ROLES,
  FARM_PLACE_GEOMETRY_SOURCES,
  FARM_PLACE_GEOMETRY_TYPES,
  geometryTypeForGeoJson,
  type FarmMapSettings,
  type FarmPlaceGeometry,
  type FarmPlaceGeometryType,
  type SupportedGeoJsonGeometry,
} from "../gis/FarmMap";

const isoDateTimeString = z.string().min(1);
const longitudeSchema = z.number().min(-180).max(180);
const latitudeSchema = z.number().min(-90).max(90);
const positionSchema = z.union([
  z.tuple([longitudeSchema, latitudeSchema]),
  z.tuple([longitudeSchema, latitudeSchema, z.number()]),
]);

const pointSchema = z.object({
  type: z.literal("Point"),
  coordinates: positionSchema,
});

const lineStringSchema = z.object({
  type: z.literal("LineString"),
  coordinates: z.array(positionSchema).min(2),
});

const linearRingSchema = z.array(positionSchema).min(4).superRefine((ring, context) => {
  if (!positionsEqual(ring[0], ring[ring.length - 1])) {
    context.addIssue({
      code: "custom",
      message: "Polygon rings must start and end at the same coordinate.",
    });
  }
});

const polygonSchema = z.object({
  type: z.literal("Polygon"),
  coordinates: z.array(linearRingSchema).min(1),
});

const multiPolygonSchema = z.object({
  type: z.literal("MultiPolygon"),
  coordinates: z.array(z.array(linearRingSchema).min(1)).min(1),
});

export const supportedGeoJsonGeometrySchema = z.union([
  pointSchema,
  lineStringSchema,
  polygonSchema,
  multiPolygonSchema,
]);

export const farmMapSettingsSchema = z.object({
  id: z.string().min(1),
  farmId: z.string().min(1),
  addressText: z.string().trim().min(1).optional(),
  defaultCenterLatitude: latitudeSchema.optional(),
  defaultCenterLongitude: longitudeSchema.optional(),
  defaultZoom: z.number().min(0).max(22),
  defaultPitch: z.number().min(0).max(85),
  defaultBearing: z.number().min(0).max(360),
  mapProvider: z.enum(FARM_MAP_PROVIDERS),
  offlineMapStatus: z.enum(FARM_MAP_OFFLINE_STATUSES),
  offlinePackName: z.string().trim().min(1).optional(),
  offlineDownloadedAt: isoDateTimeString.optional(),
  createdAt: isoDateTimeString,
  updatedAt: isoDateTimeString,
}).superRefine((settings, context) => {
  const hasLatitude = settings.defaultCenterLatitude !== undefined;
  const hasLongitude = settings.defaultCenterLongitude !== undefined;

  if (hasLatitude !== hasLongitude) {
    context.addIssue({
      code: "custom",
      message: "Save both latitude and longitude, or leave both blank.",
      path: hasLatitude ? ["defaultCenterLongitude"] : ["defaultCenterLatitude"],
    });
  }
});

export const farmPlaceGeometrySchema = z.object({
  id: z.string().min(1),
  farmId: z.string().min(1),
  placeId: z.string().min(1).optional(),
  geometryType: z.enum(FARM_PLACE_GEOMETRY_TYPES),
  geometryRole: z.enum(FARM_PLACE_GEOMETRY_ROLES),
  geojson: supportedGeoJsonGeometrySchema,
  source: z.enum(FARM_PLACE_GEOMETRY_SOURCES),
  name: z.string().trim().min(1).optional(),
  notes: z.string().trim().min(1).optional(),
  mapViewLatitude: latitudeSchema.optional(),
  mapViewLongitude: longitudeSchema.optional(),
  mapViewZoom: z.number().min(0).max(22).optional(),
  mapViewPitch: z.number().min(0).max(85).optional(),
  mapViewBearing: z.number().min(0).max(360).optional(),
  createdAt: isoDateTimeString,
  updatedAt: isoDateTimeString,
  archivedAt: isoDateTimeString.optional(),
}).superRefine((geometry, context) => {
  const expectedType = geometryTypeForGeoJson(geometry.geojson as SupportedGeoJsonGeometry);

  if (geometry.geometryType !== expectedType) {
    context.addIssue({
      code: "custom",
      message: `Geometry type must match GeoJSON type ${expectedType}.`,
      path: ["geometryType"],
    });
  }

  const hasLatitude = geometry.mapViewLatitude !== undefined;
  const hasLongitude = geometry.mapViewLongitude !== undefined;

  if (hasLatitude !== hasLongitude) {
    context.addIssue({
      code: "custom",
      message: "Save both map-view latitude and longitude, or leave both blank.",
      path: hasLatitude ? ["mapViewLongitude"] : ["mapViewLatitude"],
    });
  }
});

export function parseFarmMapSettings(settings: FarmMapSettings): FarmMapSettings {
  return farmMapSettingsSchema.parse(settings);
}

export function parseFarmPlaceGeometry(geometry: FarmPlaceGeometry): FarmPlaceGeometry {
  return farmPlaceGeometrySchema.parse(geometry) as FarmPlaceGeometry;
}

export function parseGeoJsonGeometry(geojson: unknown): SupportedGeoJsonGeometry {
  return supportedGeoJsonGeometrySchema.parse(geojson) as SupportedGeoJsonGeometry;
}

export function parseGeometryTypeForGeoJson(geojson: SupportedGeoJsonGeometry): FarmPlaceGeometryType {
  return geometryTypeForGeoJson(supportedGeoJsonGeometrySchema.parse(geojson) as SupportedGeoJsonGeometry);
}

function positionsEqual(first: readonly number[], second: readonly number[]): boolean {
  return first.length >= 2 && second.length >= 2 && first[0] === second[0] && first[1] === second[1];
}
