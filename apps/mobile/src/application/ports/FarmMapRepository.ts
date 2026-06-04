import type { FarmId } from "../../domain/farm/Farm";
import type { FarmLocationId } from "../../domain/farm/FarmLocation";
import type {
  FarmMapOfflineStatus,
  FarmMapSettings,
  FarmPlaceGeometry,
  FarmPlaceGeometryId,
} from "../../domain/gis/FarmMap";

export interface FarmPlaceGeometryListOptions {
  includeArchived?: boolean;
}

export interface FarmMapRepository {
  getByFarmId(farmId: FarmId): Promise<FarmMapSettings | null>;
  createOrUpdate(settings: FarmMapSettings): Promise<void>;
  updateViewport(input: {
    farmId: FarmId;
    defaultCenterLatitude?: number;
    defaultCenterLongitude?: number;
    defaultZoom: number;
    defaultPitch: number;
    defaultBearing: number;
    updatedAt: string;
  }): Promise<void>;
  updateAddressText(input: { farmId: FarmId; addressText?: string; updatedAt: string }): Promise<void>;
  updateOfflineMapStatus(input: {
    farmId: FarmId;
    offlineMapStatus: FarmMapOfflineStatus;
    offlinePackName?: string;
    offlineDownloadedAt?: string;
    updatedAt: string;
  }): Promise<void>;

  createGeometry(geometry: FarmPlaceGeometry): Promise<void>;
  updateGeometry(geometry: FarmPlaceGeometry): Promise<void>;
  archiveGeometry(input: { farmId: FarmId; geometryId: FarmPlaceGeometryId; archivedAt: string }): Promise<void>;
  getGeometriesByFarmId(farmId: FarmId, options?: FarmPlaceGeometryListOptions): Promise<FarmPlaceGeometry[]>;
  getGeometriesByPlaceId(
    farmId: FarmId,
    placeId: FarmLocationId,
    options?: FarmPlaceGeometryListOptions,
  ): Promise<FarmPlaceGeometry[]>;
  getFarmCenter(farmId: FarmId): Promise<FarmPlaceGeometry | null>;
  upsertFarmCenter(geometry: FarmPlaceGeometry): Promise<void>;
}
