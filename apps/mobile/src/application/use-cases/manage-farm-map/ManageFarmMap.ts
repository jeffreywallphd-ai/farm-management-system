import type { FarmId } from "../../../domain/farm/Farm";
import type { FarmLocationId } from "../../../domain/farm/FarmLocation";
import {
  farmCenterPointGeoJson,
  geometryTypeForGeoJson,
  type FarmMapOfflineStatus,
  type FarmMapProvider,
  type FarmMapSettings,
  type FarmPlaceGeometry,
  type FarmPlaceGeometryId,
  type FarmPlaceGeometryRole,
  type FarmPlaceGeometrySource,
  type SupportedGeoJsonGeometry,
} from "../../../domain/gis/FarmMap";
import { parseFarmMapSettings, parseFarmPlaceGeometry } from "../../../domain/validation/gisValidation";
import type { Clock } from "../../ports/Clock";
import type { FarmMapRepository } from "../../ports/FarmMapRepository";
import type { IdGenerator } from "../../ports/IdGenerator";

const DEFAULT_ZOOM = 13;
const DEFAULT_PITCH = 0;
const DEFAULT_BEARING = 0;
const DEFAULT_PROVIDER: FarmMapProvider = "fallback";
const DEFAULT_OFFLINE_STATUS: FarmMapOfflineStatus = "notConfigured";

export async function getFarmMapSettings(
  farmId: FarmId,
  dependencies: { repository: FarmMapRepository },
): Promise<FarmMapSettings | null> {
  return dependencies.repository.getByFarmId(farmId);
}

export async function saveFarmMapAddressText(
  input: { farmId: FarmId; addressText: string },
  dependencies: { clock: Clock; idGenerator: IdGenerator; repository: FarmMapRepository },
): Promise<FarmMapSettings> {
  const current = await dependencies.repository.getByFarmId(input.farmId);
  const now = dependencies.clock.now().toISOString();
  const addressText = input.addressText.trim() || undefined;
  const settings = parseFarmMapSettings({
    ...settingsDefaults(input.farmId, dependencies.idGenerator.newId(), now),
    ...current,
    addressText,
    updatedAt: now,
  });

  await dependencies.repository.createOrUpdate(settings);
  return settings;
}

export async function saveFarmMapViewport(
  input: {
    farmId: FarmId;
    defaultCenterLatitude?: number;
    defaultCenterLongitude?: number;
    defaultZoom: number;
    defaultPitch?: number;
    defaultBearing?: number;
  },
  dependencies: { clock: Clock; idGenerator: IdGenerator; repository: FarmMapRepository },
): Promise<FarmMapSettings> {
  const current = await dependencies.repository.getByFarmId(input.farmId);
  const now = dependencies.clock.now().toISOString();
  const settings = parseFarmMapSettings({
    ...settingsDefaults(input.farmId, dependencies.idGenerator.newId(), now),
    ...current,
    defaultCenterLatitude: input.defaultCenterLatitude,
    defaultCenterLongitude: input.defaultCenterLongitude,
    defaultZoom: input.defaultZoom,
    defaultPitch: input.defaultPitch ?? current?.defaultPitch ?? DEFAULT_PITCH,
    defaultBearing: input.defaultBearing ?? current?.defaultBearing ?? DEFAULT_BEARING,
    updatedAt: now,
  });

  await dependencies.repository.createOrUpdate(settings);
  return settings;
}

export async function saveFarmCenterLocation(
  input: {
    farmId: FarmId;
    latitude: number;
    longitude: number;
    addressText?: string;
    source?: FarmPlaceGeometrySource;
    name?: string;
    notes?: string;
  },
  dependencies: { clock: Clock; idGenerator: IdGenerator; repository: FarmMapRepository },
): Promise<{ settings: FarmMapSettings; farmCenter: FarmPlaceGeometry }> {
  const now = dependencies.clock.now().toISOString();
  const currentSettings = await dependencies.repository.getByFarmId(input.farmId);
  const settings = parseFarmMapSettings({
    ...settingsDefaults(input.farmId, dependencies.idGenerator.newId(), now),
    ...currentSettings,
    addressText: input.addressText?.trim() || currentSettings?.addressText,
    defaultCenterLatitude: input.latitude,
    defaultCenterLongitude: input.longitude,
    defaultZoom: currentSettings?.defaultZoom ?? DEFAULT_ZOOM,
    defaultPitch: currentSettings?.defaultPitch ?? DEFAULT_PITCH,
    defaultBearing: currentSettings?.defaultBearing ?? DEFAULT_BEARING,
    updatedAt: now,
  });
  const currentFarmCenter = await dependencies.repository.getFarmCenter(input.farmId);
  const farmCenter = parseFarmPlaceGeometry({
    id: currentFarmCenter?.id ?? dependencies.idGenerator.newId(),
    farmId: input.farmId,
    geometryType: "point",
    geometryRole: "farmCenter",
    geojson: farmCenterPointGeoJson({ latitude: input.latitude, longitude: input.longitude }),
    source: input.source ?? "manualMapEdit",
    name: input.name?.trim() || currentFarmCenter?.name || "Farm center",
    notes: input.notes?.trim() || currentFarmCenter?.notes,
    createdAt: currentFarmCenter?.createdAt ?? now,
    updatedAt: now,
    archivedAt: undefined,
  });

  await dependencies.repository.createOrUpdate(settings);
  await dependencies.repository.upsertFarmCenter(farmCenter);
  return { settings, farmCenter };
}

export async function updateFarmMapOfflineStatus(
  input: {
    farmId: FarmId;
    offlineMapStatus: FarmMapOfflineStatus;
    offlinePackName?: string;
    offlineDownloadedAt?: string;
  },
  dependencies: { clock: Clock; idGenerator: IdGenerator; repository: FarmMapRepository },
): Promise<FarmMapSettings> {
  const current = await dependencies.repository.getByFarmId(input.farmId);
  const now = dependencies.clock.now().toISOString();
  const settings = parseFarmMapSettings({
    ...settingsDefaults(input.farmId, dependencies.idGenerator.newId(), now),
    ...current,
    offlineMapStatus: input.offlineMapStatus,
    offlinePackName: input.offlinePackName?.trim() || undefined,
    offlineDownloadedAt: input.offlineDownloadedAt,
    updatedAt: now,
  });

  await dependencies.repository.createOrUpdate(settings);
  return settings;
}

export async function createFarmPlaceGeometry(
  input: {
    farmId: FarmId;
    placeId?: FarmLocationId;
    geometryRole: FarmPlaceGeometryRole;
    geojson: SupportedGeoJsonGeometry;
    source?: FarmPlaceGeometrySource;
    name?: string;
    notes?: string;
    mapViewLatitude?: number;
    mapViewLongitude?: number;
    mapViewZoom?: number;
    mapViewPitch?: number;
    mapViewBearing?: number;
  },
  dependencies: { clock: Clock; idGenerator: IdGenerator; repository: FarmMapRepository },
): Promise<FarmPlaceGeometry> {
  const now = dependencies.clock.now().toISOString();
  const geometry = parseFarmPlaceGeometry({
    id: dependencies.idGenerator.newId(),
    farmId: input.farmId,
    placeId: input.placeId,
    geometryType: geometryTypeForGeoJson(input.geojson),
    geometryRole: input.geometryRole,
    geojson: input.geojson,
    source: input.source ?? "manualMapEdit",
    name: input.name?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    mapViewLatitude: input.mapViewLatitude,
    mapViewLongitude: input.mapViewLongitude,
    mapViewZoom: input.mapViewZoom,
    mapViewPitch: input.mapViewPitch,
    mapViewBearing: input.mapViewBearing,
    createdAt: now,
    updatedAt: now,
  });

  await dependencies.repository.createGeometry(geometry);
  return geometry;
}

export async function updateFarmPlaceGeometry(
  input: {
    farmId: FarmId;
    geometryId: FarmPlaceGeometryId;
    placeId?: FarmLocationId;
    geometryRole: FarmPlaceGeometryRole;
    geojson: SupportedGeoJsonGeometry;
    source?: FarmPlaceGeometrySource;
    name?: string;
    notes?: string;
    mapViewLatitude?: number;
    mapViewLongitude?: number;
    mapViewZoom?: number;
    mapViewPitch?: number;
    mapViewBearing?: number;
  },
  dependencies: { clock: Clock; repository: FarmMapRepository },
): Promise<FarmPlaceGeometry> {
  const geometries = await dependencies.repository.getGeometriesByFarmId(input.farmId, { includeArchived: true });
  const existing = geometries.find((geometry) => geometry.id === input.geometryId);

  if (!existing) {
    throw new Error("Choose a saved geometry to edit.");
  }

  const geometry = parseFarmPlaceGeometry({
    ...existing,
    placeId: input.placeId,
    geometryType: geometryTypeForGeoJson(input.geojson),
    geometryRole: input.geometryRole,
    geojson: input.geojson,
    source: input.source ?? existing.source,
    name: input.name?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    mapViewLatitude: input.mapViewLatitude ?? existing.mapViewLatitude,
    mapViewLongitude: input.mapViewLongitude ?? existing.mapViewLongitude,
    mapViewZoom: input.mapViewZoom ?? existing.mapViewZoom,
    mapViewPitch: input.mapViewPitch ?? existing.mapViewPitch,
    mapViewBearing: input.mapViewBearing ?? existing.mapViewBearing,
    updatedAt: dependencies.clock.now().toISOString(),
  });

  await dependencies.repository.updateGeometry(geometry);
  return geometry;
}

export async function archiveFarmPlaceGeometry(
  input: { farmId: FarmId; geometryId: FarmPlaceGeometryId },
  dependencies: { clock: Clock; repository: FarmMapRepository },
): Promise<void> {
  await dependencies.repository.archiveGeometry({
    farmId: input.farmId,
    geometryId: input.geometryId,
    archivedAt: dependencies.clock.now().toISOString(),
  });
}

export async function listFarmPlaceGeometries(
  input: { farmId: FarmId; placeId?: FarmLocationId; includeArchived?: boolean },
  dependencies: { repository: FarmMapRepository },
): Promise<FarmPlaceGeometry[]> {
  return input.placeId
    ? dependencies.repository.getGeometriesByPlaceId(input.farmId, input.placeId, {
        includeArchived: input.includeArchived,
      })
    : dependencies.repository.getGeometriesByFarmId(input.farmId, { includeArchived: input.includeArchived });
}

function settingsDefaults(farmId: FarmId, id: string, now: string): FarmMapSettings {
  return {
    id,
    farmId,
    defaultZoom: DEFAULT_ZOOM,
    defaultPitch: DEFAULT_PITCH,
    defaultBearing: DEFAULT_BEARING,
    mapProvider: DEFAULT_PROVIDER,
    offlineMapStatus: DEFAULT_OFFLINE_STATUS,
    createdAt: now,
    updatedAt: now,
  };
}
