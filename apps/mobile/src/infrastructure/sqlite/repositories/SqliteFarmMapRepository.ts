import type { SQLiteDatabase } from "expo-sqlite";

import type { FarmId } from "../../../domain/farm/Farm";
import type { FarmLocationId } from "../../../domain/farm/FarmLocation";
import type {
  FarmMapOfflineStatus,
  FarmMapProvider,
  FarmMapSettings,
  FarmPlaceGeometry,
  FarmPlaceGeometryId,
  FarmPlaceGeometryRole,
  FarmPlaceGeometrySource,
  FarmPlaceGeometryType,
} from "../../../domain/gis/FarmMap";
import { parseFarmMapSettings, parseFarmPlaceGeometry, parseGeoJsonGeometry } from "../../../domain/validation/gisValidation";
import type { FarmMapRepository, FarmPlaceGeometryListOptions } from "../../../application/ports/FarmMapRepository";

interface FarmMapSettingsRow {
  id: string;
  farm_id: string;
  address_text: string | null;
  default_center_latitude: number | null;
  default_center_longitude: number | null;
  default_zoom: number;
  default_pitch: number;
  default_bearing: number;
  map_provider: FarmMapProvider;
  offline_map_status: FarmMapOfflineStatus;
  offline_pack_name: string | null;
  offline_downloaded_at: string | null;
  created_at: string;
  updated_at: string;
}

interface FarmPlaceGeometryRow {
  id: string;
  farm_id: string;
  place_id: string | null;
  geometry_type: FarmPlaceGeometryType;
  geometry_role: FarmPlaceGeometryRole;
  geojson: string;
  source: FarmPlaceGeometrySource;
  name: string | null;
  notes: string | null;
  map_view_latitude: number | null;
  map_view_longitude: number | null;
  map_view_zoom: number | null;
  map_view_pitch: number | null;
  map_view_bearing: number | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export class SqliteFarmMapRepository implements FarmMapRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  async getByFarmId(farmId: FarmId): Promise<FarmMapSettings | null> {
    const row = await this.database.getFirstAsync<FarmMapSettingsRow>(
      `SELECT id, farm_id, address_text, default_center_latitude, default_center_longitude,
        default_zoom, default_pitch, default_bearing, map_provider, offline_map_status,
        offline_pack_name, offline_downloaded_at, created_at, updated_at
       FROM farm_map_settings WHERE farm_id = ? LIMIT 1;`,
      [farmId],
    );

    return row ? mapFarmMapSettings(row) : null;
  }

  async createOrUpdate(settings: FarmMapSettings): Promise<void> {
    const parsed = parseFarmMapSettings(settings);
    const values = farmMapSettingsValues(parsed);
    const current = await this.getByFarmId(parsed.farmId);

    if (current) {
      await this.database.runAsync(
        `UPDATE farm_map_settings
         SET address_text = ?, default_center_latitude = ?, default_center_longitude = ?,
          default_zoom = ?, default_pitch = ?, default_bearing = ?, map_provider = ?,
          offline_map_status = ?, offline_pack_name = ?, offline_downloaded_at = ?, updated_at = ?
         WHERE farm_id = ?;`,
        ...sqliteValues([
          values.addressText,
          values.defaultCenterLatitude,
          values.defaultCenterLongitude,
          values.defaultZoom,
          values.defaultPitch,
          values.defaultBearing,
          values.mapProvider,
          values.offlineMapStatus,
          values.offlinePackName,
          values.offlineDownloadedAt,
          values.updatedAt,
          values.farmId,
        ]),
      );
      return;
    }

    await this.database.runAsync(
      `INSERT INTO farm_map_settings (
        id, farm_id, address_text, default_center_latitude, default_center_longitude,
        default_zoom, default_pitch, default_bearing, map_provider, offline_map_status,
        offline_pack_name, offline_downloaded_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      ...sqliteValues([
        values.id,
        values.farmId,
        values.addressText,
        values.defaultCenterLatitude,
        values.defaultCenterLongitude,
        values.defaultZoom,
        values.defaultPitch,
        values.defaultBearing,
        values.mapProvider,
        values.offlineMapStatus,
        values.offlinePackName,
        values.offlineDownloadedAt,
        values.createdAt,
        values.updatedAt,
      ]),
    );
  }

  async updateViewport(input: Parameters<FarmMapRepository["updateViewport"]>[0]): Promise<void> {
    await this.database.runAsync(
      `UPDATE farm_map_settings
       SET default_center_latitude = ?, default_center_longitude = ?, default_zoom = ?,
        default_pitch = ?, default_bearing = ?, updated_at = ?
       WHERE farm_id = ?;`,
      ...sqliteValues([
        input.defaultCenterLatitude ?? null,
        input.defaultCenterLongitude ?? null,
        input.defaultZoom,
        input.defaultPitch,
        input.defaultBearing,
        input.updatedAt,
        input.farmId,
      ]),
    );
  }

  async updateAddressText(input: Parameters<FarmMapRepository["updateAddressText"]>[0]): Promise<void> {
    await this.database.runAsync(
      "UPDATE farm_map_settings SET address_text = ?, updated_at = ? WHERE farm_id = ?;",
      ...sqliteValues([input.addressText ?? null, input.updatedAt, input.farmId]),
    );
  }

  async updateOfflineMapStatus(input: Parameters<FarmMapRepository["updateOfflineMapStatus"]>[0]): Promise<void> {
    await this.database.runAsync(
      `UPDATE farm_map_settings
       SET offline_map_status = ?, offline_pack_name = ?, offline_downloaded_at = ?, updated_at = ?
       WHERE farm_id = ?;`,
      ...sqliteValues([
        input.offlineMapStatus,
        input.offlinePackName ?? null,
        input.offlineDownloadedAt ?? null,
        input.updatedAt,
        input.farmId,
      ]),
    );
  }

  async createGeometry(geometry: FarmPlaceGeometry): Promise<void> {
    const parsed = parseFarmPlaceGeometry(geometry);

    await this.database.runAsync(
      `INSERT INTO farm_place_geometries (
        id, farm_id, place_id, geometry_type, geometry_role, geojson, source, name, notes,
        map_view_latitude, map_view_longitude, map_view_zoom, map_view_pitch, map_view_bearing,
        created_at, updated_at, archived_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      ...rowValues(parsed),
    );
  }

  async updateGeometry(geometry: FarmPlaceGeometry): Promise<void> {
    const parsed = parseFarmPlaceGeometry(geometry);

    await this.database.runAsync(
      `UPDATE farm_place_geometries
       SET place_id = ?, geometry_type = ?, geometry_role = ?, geojson = ?, source = ?,
        name = ?, notes = ?, map_view_latitude = ?, map_view_longitude = ?, map_view_zoom = ?,
        map_view_pitch = ?, map_view_bearing = ?, updated_at = ?, archived_at = ?
       WHERE farm_id = ? AND id = ?;`,
      ...sqliteValues([
        parsed.placeId ?? null,
        parsed.geometryType,
        parsed.geometryRole,
        JSON.stringify(parsed.geojson),
        parsed.source,
        parsed.name ?? null,
        parsed.notes ?? null,
        parsed.mapViewLatitude ?? null,
        parsed.mapViewLongitude ?? null,
        parsed.mapViewZoom ?? null,
        parsed.mapViewPitch ?? null,
        parsed.mapViewBearing ?? null,
        parsed.updatedAt,
        parsed.archivedAt ?? null,
        parsed.farmId,
        parsed.id,
      ]),
    );
  }

  async archiveGeometry(input: { farmId: FarmId; geometryId: FarmPlaceGeometryId; archivedAt: string }): Promise<void> {
    await this.database.runAsync(
      "UPDATE farm_place_geometries SET updated_at = ?, archived_at = ? WHERE farm_id = ? AND id = ?;",
      ...sqliteValues([input.archivedAt, input.archivedAt, input.farmId, input.geometryId]),
    );
  }

  async getGeometriesByFarmId(farmId: FarmId, options?: FarmPlaceGeometryListOptions): Promise<FarmPlaceGeometry[]> {
    const rows = await this.database.getAllAsync<FarmPlaceGeometryRow>(
      `SELECT id, farm_id, place_id, geometry_type, geometry_role, geojson, source, name, notes,
        map_view_latitude, map_view_longitude, map_view_zoom, map_view_pitch, map_view_bearing,
        created_at, updated_at, archived_at
       FROM farm_place_geometries
       WHERE farm_id = ? ${options?.includeArchived ? "" : "AND archived_at IS NULL"}
       ORDER BY created_at ASC;`,
      [farmId],
    );

    return rows.map(mapFarmPlaceGeometry);
  }

  async getGeometriesByPlaceId(
    farmId: FarmId,
    placeId: FarmLocationId,
    options?: FarmPlaceGeometryListOptions,
  ): Promise<FarmPlaceGeometry[]> {
    const rows = await this.database.getAllAsync<FarmPlaceGeometryRow>(
      `SELECT id, farm_id, place_id, geometry_type, geometry_role, geojson, source, name, notes,
        map_view_latitude, map_view_longitude, map_view_zoom, map_view_pitch, map_view_bearing,
        created_at, updated_at, archived_at
       FROM farm_place_geometries
       WHERE farm_id = ? AND place_id = ? ${options?.includeArchived ? "" : "AND archived_at IS NULL"}
       ORDER BY created_at ASC;`,
      [farmId, placeId],
    );

    return rows.map(mapFarmPlaceGeometry);
  }

  async getFarmCenter(farmId: FarmId): Promise<FarmPlaceGeometry | null> {
    const row = await this.database.getFirstAsync<FarmPlaceGeometryRow>(
      `SELECT id, farm_id, place_id, geometry_type, geometry_role, geojson, source, name, notes,
        map_view_latitude, map_view_longitude, map_view_zoom, map_view_pitch, map_view_bearing,
        created_at, updated_at, archived_at
       FROM farm_place_geometries
       WHERE farm_id = ? AND geometry_role = 'farmCenter' AND archived_at IS NULL
       ORDER BY updated_at DESC LIMIT 1;`,
      [farmId],
    );

    return row ? mapFarmPlaceGeometry(row) : null;
  }

  async upsertFarmCenter(geometry: FarmPlaceGeometry): Promise<void> {
    const existing = await this.getFarmCenter(geometry.farmId);

    if (existing) {
      await this.updateGeometry({ ...geometry, id: existing.id, createdAt: existing.createdAt });
      return;
    }

    await this.createGeometry(geometry);
  }
}

function mapFarmMapSettings(row: FarmMapSettingsRow): FarmMapSettings {
  return parseFarmMapSettings({
    id: row.id,
    farmId: row.farm_id,
    addressText: row.address_text ?? undefined,
    defaultCenterLatitude: row.default_center_latitude ?? undefined,
    defaultCenterLongitude: row.default_center_longitude ?? undefined,
    defaultZoom: row.default_zoom,
    defaultPitch: row.default_pitch,
    defaultBearing: row.default_bearing,
    mapProvider: row.map_provider,
    offlineMapStatus: row.offline_map_status,
    offlinePackName: row.offline_pack_name ?? undefined,
    offlineDownloadedAt: row.offline_downloaded_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

function mapFarmPlaceGeometry(row: FarmPlaceGeometryRow): FarmPlaceGeometry {
  return parseFarmPlaceGeometry({
    id: row.id,
    farmId: row.farm_id,
    placeId: row.place_id ?? undefined,
    geometryType: row.geometry_type,
    geometryRole: row.geometry_role,
    geojson: parseGeoJsonGeometry(JSON.parse(row.geojson)),
    source: row.source,
    name: row.name ?? undefined,
    notes: row.notes ?? undefined,
    mapViewLatitude: row.map_view_latitude ?? undefined,
    mapViewLongitude: row.map_view_longitude ?? undefined,
    mapViewZoom: row.map_view_zoom ?? undefined,
    mapViewPitch: row.map_view_pitch ?? undefined,
    mapViewBearing: row.map_view_bearing ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at ?? undefined,
  });
}

function farmMapSettingsValues(settings: FarmMapSettings): Record<string, string | number | null> {
  return {
    id: settings.id,
    farmId: settings.farmId,
    addressText: settings.addressText ?? null,
    defaultCenterLatitude: settings.defaultCenterLatitude ?? null,
    defaultCenterLongitude: settings.defaultCenterLongitude ?? null,
    defaultZoom: settings.defaultZoom,
    defaultPitch: settings.defaultPitch,
    defaultBearing: settings.defaultBearing,
    mapProvider: settings.mapProvider,
    offlineMapStatus: settings.offlineMapStatus,
    offlinePackName: settings.offlinePackName ?? null,
    offlineDownloadedAt: settings.offlineDownloadedAt ?? null,
    createdAt: settings.createdAt,
    updatedAt: settings.updatedAt,
  };
}

function rowValues(geometry: FarmPlaceGeometry): (string | number | null)[] {
  return sqliteValues([
    geometry.id,
    geometry.farmId,
    geometry.placeId ?? null,
    geometry.geometryType,
    geometry.geometryRole,
    JSON.stringify(geometry.geojson),
    geometry.source,
    geometry.name ?? null,
    geometry.notes ?? null,
    geometry.mapViewLatitude ?? null,
    geometry.mapViewLongitude ?? null,
    geometry.mapViewZoom ?? null,
    geometry.mapViewPitch ?? null,
    geometry.mapViewBearing ?? null,
    geometry.createdAt,
    geometry.updatedAt,
    geometry.archivedAt ?? null,
  ]);
}

function sqliteValues(values: (string | number | null | undefined)[]): (string | number | null)[] {
  return values.map((value) => value ?? null);
}
