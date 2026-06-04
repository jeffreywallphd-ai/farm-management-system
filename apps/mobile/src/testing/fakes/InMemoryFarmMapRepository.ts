import type { FarmId } from "../../domain/farm/Farm";
import type { FarmLocationId } from "../../domain/farm/FarmLocation";
import type { FarmMapSettings, FarmPlaceGeometry, FarmPlaceGeometryId } from "../../domain/gis/FarmMap";
import type { FarmMapRepository, FarmPlaceGeometryListOptions } from "../../application/ports/FarmMapRepository";

export class InMemoryFarmMapRepository implements FarmMapRepository {
  private settings: FarmMapSettings[] = [];
  private geometries: FarmPlaceGeometry[] = [];

  async getByFarmId(farmId: FarmId): Promise<FarmMapSettings | null> {
    return this.settings.find((settings) => settings.farmId === farmId) ?? null;
  }

  async createOrUpdate(settings: FarmMapSettings): Promise<void> {
    const index = this.settings.findIndex((candidate) => candidate.farmId === settings.farmId);

    if (index >= 0) {
      this.settings[index] = settings;
      return;
    }

    this.settings.push(settings);
  }

  async updateViewport(input: Parameters<FarmMapRepository["updateViewport"]>[0]): Promise<void> {
    const current = await this.requireSettings(input.farmId);
    await this.createOrUpdate({
      ...current,
      defaultCenterLatitude: input.defaultCenterLatitude,
      defaultCenterLongitude: input.defaultCenterLongitude,
      defaultZoom: input.defaultZoom,
      defaultPitch: input.defaultPitch,
      defaultBearing: input.defaultBearing,
      updatedAt: input.updatedAt,
    });
  }

  async updateAddressText(input: Parameters<FarmMapRepository["updateAddressText"]>[0]): Promise<void> {
    const current = await this.requireSettings(input.farmId);
    await this.createOrUpdate({ ...current, addressText: input.addressText, updatedAt: input.updatedAt });
  }

  async updateOfflineMapStatus(input: Parameters<FarmMapRepository["updateOfflineMapStatus"]>[0]): Promise<void> {
    const current = await this.requireSettings(input.farmId);
    await this.createOrUpdate({
      ...current,
      offlineMapStatus: input.offlineMapStatus,
      offlinePackName: input.offlinePackName,
      offlineDownloadedAt: input.offlineDownloadedAt,
      updatedAt: input.updatedAt,
    });
  }

  async createGeometry(geometry: FarmPlaceGeometry): Promise<void> {
    this.geometries.push(geometry);
  }

  async updateGeometry(geometry: FarmPlaceGeometry): Promise<void> {
    const index = this.geometries.findIndex(
      (candidate) => candidate.farmId === geometry.farmId && candidate.id === geometry.id,
    );

    if (index < 0) {
      throw new Error("Choose a saved geometry to edit.");
    }

    this.geometries[index] = geometry;
  }

  async archiveGeometry(input: { farmId: FarmId; geometryId: FarmPlaceGeometryId; archivedAt: string }): Promise<void> {
    const geometry = this.geometries.find(
      (candidate) => candidate.farmId === input.farmId && candidate.id === input.geometryId,
    );

    if (!geometry) {
      throw new Error("Choose a saved geometry to archive.");
    }

    await this.updateGeometry({ ...geometry, updatedAt: input.archivedAt, archivedAt: input.archivedAt });
  }

  async getGeometriesByFarmId(farmId: FarmId, options?: FarmPlaceGeometryListOptions): Promise<FarmPlaceGeometry[]> {
    return this.geometries.filter(
      (geometry) => geometry.farmId === farmId && (options?.includeArchived || !geometry.archivedAt),
    );
  }

  async getGeometriesByPlaceId(
    farmId: FarmId,
    placeId: FarmLocationId,
    options?: FarmPlaceGeometryListOptions,
  ): Promise<FarmPlaceGeometry[]> {
    return this.geometries.filter(
      (geometry) =>
        geometry.farmId === farmId &&
        geometry.placeId === placeId &&
        (options?.includeArchived || !geometry.archivedAt),
    );
  }

  async getFarmCenter(farmId: FarmId): Promise<FarmPlaceGeometry | null> {
    return (
      this.geometries.find(
        (geometry) => geometry.farmId === farmId && geometry.geometryRole === "farmCenter" && !geometry.archivedAt,
      ) ?? null
    );
  }

  async upsertFarmCenter(geometry: FarmPlaceGeometry): Promise<void> {
    const index = this.geometries.findIndex(
      (candidate) => candidate.farmId === geometry.farmId && candidate.geometryRole === "farmCenter",
    );

    if (index >= 0) {
      this.geometries[index] = geometry;
      return;
    }

    this.geometries.push(geometry);
  }

  private async requireSettings(farmId: FarmId): Promise<FarmMapSettings> {
    const settings = await this.getByFarmId(farmId);

    if (!settings) {
      throw new Error("Farm map settings have not been created.");
    }

    return settings;
  }
}
