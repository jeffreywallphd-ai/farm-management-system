import { distance } from "@turf/distance";

import type { GeoJsonPosition, SupportedGeoJsonGeometry } from "../../domain/gis/FarmMap";
import type { FarmMapPreviewViewState } from "./FarmMapPreviewModel";

type Position = [longitude: number, latitude: number];
type PositionLike = readonly [longitude: number, latitude: number, ...rest: number[]];

export type FarmGeometryMapEditorMode = "point" | "polygon";

export function pointGeometryFromMapCenter(viewState: FarmMapPreviewViewState): SupportedGeoJsonGeometry {
  return {
    type: "Point",
    coordinates: [viewState.longitude, viewState.latitude],
  };
}

export function mapViewForGeometry(
  geometry: SupportedGeoJsonGeometry | undefined,
  fallback: FarmMapPreviewViewState,
): FarmMapPreviewViewState {
  if (!geometry) {
    return fallback;
  }

  const center = centerForGeometry(geometry);

  return {
    ...fallback,
    latitude: center[1],
    longitude: center[0],
  };
}

export function polygonCornersFromGeometry(geometry: SupportedGeoJsonGeometry | undefined): Position[] {
  if (geometry?.type !== "Polygon") {
    return [];
  }

  return withoutClosingCorner(geometry.coordinates[0] ?? []);
}

export function addPolygonCornerAtMapCenter(
  corners: Position[],
  viewState: FarmMapPreviewViewState,
): Position[] {
  return [...corners, [viewState.longitude, viewState.latitude]];
}

export function undoLastPolygonCorner(corners: Position[]): Position[] {
  return corners.slice(0, -1);
}

export function updatePolygonCorner(
  corners: Position[],
  index: number,
  coordinate: Position,
): Position[] {
  if (index < 0 || index >= corners.length) {
    return corners;
  }

  return corners.map((corner, cornerIndex) => cornerIndex === index ? coordinate : corner);
}

export function polygonGeometryFromCorners(corners: Position[]): SupportedGeoJsonGeometry {
  if (corners.length < 3) {
    throw new Error("A boundary needs at least three corners.");
  }

  const first = corners[0];
  const last = corners[corners.length - 1];
  const closedCorners = positionsEqual(first, last) ? corners : [...corners, first];

  return {
    type: "Polygon",
    coordinates: [closedCorners],
  };
}

export function moveGeometryToMapCenter(
  geometry: SupportedGeoJsonGeometry,
  viewState: FarmMapPreviewViewState,
): SupportedGeoJsonGeometry {
  const currentCenter = centerForGeometry(geometry);
  const deltaLongitude = viewState.longitude - currentCenter[0];
  const deltaLatitude = viewState.latitude - currentCenter[1];

  return translateGeometry(geometry, deltaLongitude, deltaLatitude);
}

export function geometryFeatureCollection(geometry: SupportedGeoJsonGeometry | undefined): {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: Record<string, string>;
    geometry: SupportedGeoJsonGeometry;
  }>;
} {
  if (!geometry) {
    return { type: "FeatureCollection", features: [] };
  }

  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { kind: "farmGeometry" },
        geometry,
      },
    ],
  };
}

export function cornerFeatureCollection(corners: Position[]): {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: { kind: "corner"; label: string };
    geometry: { type: "Point"; coordinates: Position };
  }>;
} {
  return {
    type: "FeatureCollection",
    features: corners.map((corner, index) => ({
      type: "Feature",
      properties: { kind: "corner", label: String(index + 1) },
      geometry: { type: "Point", coordinates: corner },
    })),
  };
}

export function edgeDistanceFeatureCollection(corners: Position[]): {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: { kind: "edgeDistance"; label: string };
    geometry: { type: "Point"; coordinates: Position };
  }>;
} {
  const edgePairs = polygonEdgePairs(corners);

  return {
    type: "FeatureCollection",
    features: edgePairs.map(([from, to]) => ({
      type: "Feature",
      properties: {
        kind: "edgeDistance",
        label: formatDistanceEstimate(distance(from, to, { units: "feet" })),
      },
      geometry: { type: "Point", coordinates: midpoint(from, to) },
    })),
  };
}

export function edgeDistanceAnnotations(corners: Position[]): Array<{
  id: string;
  label: string;
  coordinate: Position;
}> {
  return edgeDistanceFeatureCollection(corners).features.map((feature, index) => ({
    id: `edge-distance-${index}`,
    label: feature.properties.label,
    coordinate: feature.geometry.coordinates,
  }));
}

export function mapCoordinateFromAnnotationEvent(event: unknown): Position | undefined {
  if (!event || typeof event !== "object") {
    return undefined;
  }

  const eventRecord = event as Record<string, unknown>;
  const nativeEvent = eventRecord.nativeEvent && typeof eventRecord.nativeEvent === "object"
    ? eventRecord.nativeEvent as Record<string, unknown>
    : undefined;

  return toOptionalPosition(nativeEvent?.lngLat)
    ?? toOptionalPosition(eventRecord.lngLat)
    ?? coordinateFromGeometry(nativeEvent?.geometry)
    ?? coordinateFromGeometry(eventRecord.geometry);
}

export function canSaveGeometryFromMap(
  mode: FarmGeometryMapEditorMode,
  corners: Position[],
): boolean {
  return mode === "point" || corners.length >= 3;
}

function centerForGeometry(geometry: SupportedGeoJsonGeometry): Position {
  if (geometry.type === "Point") {
    return [geometry.coordinates[0], geometry.coordinates[1]];
  }

  if (geometry.type === "LineString") {
    return averagePosition(geometry.coordinates);
  }

  if (geometry.type === "Polygon") {
    return averagePosition(withoutClosingCorner(geometry.coordinates[0] ?? []));
  }

  return averagePosition(geometry.coordinates.flatMap((polygon) => withoutClosingCorner(polygon[0] ?? [])));
}

function averagePosition(positions: readonly PositionLike[]): Position {
  if (positions.length === 0) {
    return [0, 0];
  }

  const sums = positions.reduce(
    (current, position) => ({
      longitude: current.longitude + position[0],
      latitude: current.latitude + position[1],
    }),
    { longitude: 0, latitude: 0 },
  );

  return [sums.longitude / positions.length, sums.latitude / positions.length];
}

function translateGeometry(
  geometry: SupportedGeoJsonGeometry,
  deltaLongitude: number,
  deltaLatitude: number,
): SupportedGeoJsonGeometry {
  if (geometry.type === "Point") {
    return {
      type: "Point",
      coordinates: translatePosition(geometry.coordinates, deltaLongitude, deltaLatitude),
    };
  }

  if (geometry.type === "LineString") {
    return {
      type: "LineString",
      coordinates: geometry.coordinates.map((position) => translatePosition(position, deltaLongitude, deltaLatitude)),
    };
  }

  if (geometry.type === "Polygon") {
    return {
      type: "Polygon",
      coordinates: geometry.coordinates.map((ring) => ring.map((position) => translatePosition(position, deltaLongitude, deltaLatitude))),
    };
  }

  return {
    type: "MultiPolygon",
    coordinates: geometry.coordinates.map((polygon) => polygon.map((ring) => ring.map((position) => translatePosition(position, deltaLongitude, deltaLatitude)))),
  };
}

function translatePosition(
  position: readonly number[],
  deltaLongitude: number,
  deltaLatitude: number,
): GeoJsonPosition {
  const translated: Position = [position[0] + deltaLongitude, position[1] + deltaLatitude];

  return position.length >= 3 ? [translated[0], translated[1], position[2]] : translated;
}

function polygonEdgePairs(corners: Position[]): Array<[Position, Position]> {
  if (corners.length < 2) {
    return [];
  }

  const pairs: Array<[Position, Position]> = [];

  for (let index = 0; index < corners.length - 1; index += 1) {
    pairs.push([corners[index], corners[index + 1]]);
  }

  if (corners.length >= 3) {
    pairs.push([corners[corners.length - 1], corners[0]]);
  }

  return pairs;
}

function midpoint(first: Position, second: Position): Position {
  return [
    (first[0] + second[0]) / 2,
    (first[1] + second[1]) / 2,
  ];
}

function formatDistanceEstimate(distanceInFeet: number): string {
  if (distanceInFeet >= 5280) {
    return `~${(distanceInFeet / 5280).toFixed(2)} mi`;
  }

  if (distanceInFeet >= 100) {
    return `~${Math.round(distanceInFeet)} ft`;
  }

  return `~${distanceInFeet.toFixed(1)} ft`;
}

function coordinateFromGeometry(value: unknown): Position | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  return toOptionalPosition((value as { coordinates?: unknown }).coordinates);
}

function toOptionalPosition(value: unknown): Position | undefined {
  if (!Array.isArray(value) || value.length < 2) {
    return undefined;
  }

  const [longitude, latitude] = value;

  if (typeof longitude !== "number" || typeof latitude !== "number") {
    return undefined;
  }

  return [longitude, latitude];
}

function withoutClosingCorner(positions: readonly PositionLike[]): Position[] {
  if (positions.length < 2) {
    return positions.map(toPosition);
  }

  const first = positions[0];
  const last = positions[positions.length - 1];

  return (positionsEqual(first, last) ? positions.slice(0, -1) : positions).map(toPosition);
}

function positionsEqual(first: readonly number[], second: readonly number[]): boolean {
  return first[0] === second[0] && first[1] === second[1];
}

function toPosition(position: PositionLike): Position {
  return [position[0], position[1]];
}
