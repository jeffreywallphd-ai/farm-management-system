import type { SQLiteDatabase } from "expo-sqlite";

import type { Farm, FarmId } from "../../../domain/farm/Farm";
import type { FarmLocation, FarmPlaceKind } from "../../../domain/farm/FarmLocation";
import type { TrackedItem, TrackedItemKind } from "../../../domain/farm/TrackedItem";
import type { Unit } from "../../../domain/quantities/Unit";
import type { FarmReferenceRepository } from "../../../application/ports/FarmReferenceRepository";

interface FarmRow {
  id: string;
  name: string;
  created_at: string;
  core_places_setup_completed_at: string | null;
}

interface LocationRow {
  id: string;
  farm_id: string;
  name: string;
  kind: FarmPlaceKind;
  parent_id: string | null;
  created_at: string;
}

interface TrackedItemRow {
  id: string;
  farm_id: string;
  kind: TrackedItemKind;
  name: string;
  created_at: string;
  default_unit: Unit | null;
}

export class SqliteFarmReferenceRepository implements FarmReferenceRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  async createFarm(farm: Farm): Promise<void> {
    await this.database.runAsync(
      "INSERT INTO farms (id, name, created_at, core_places_setup_completed_at) VALUES (?, ?, ?, ?);",
      [farm.id, farm.name, farm.createdAt, farm.corePlacesSetupCompletedAt ?? null],
    );
  }

  async getFarm(): Promise<Farm | null> {
    const row = await this.database.getFirstAsync<FarmRow>(
      "SELECT id, name, created_at, core_places_setup_completed_at FROM farms ORDER BY created_at ASC LIMIT 1;",
    );

    return row ? mapFarm(row) : null;
  }

  async markCorePlacesSetupComplete(farmId: FarmId, completedAt: string): Promise<void> {
    await this.database.runAsync(
      "UPDATE farms SET core_places_setup_completed_at = ? WHERE id = ?;",
      [completedAt, farmId],
    );
  }

  async addLocation(location: FarmLocation): Promise<void> {
    await this.database.runAsync(
      "INSERT INTO farm_locations (id, farm_id, name, kind, parent_id, created_at) VALUES (?, ?, ?, ?, ?, ?);",
      [location.id, location.farmId, location.name, location.kind, location.parentId ?? null, location.createdAt],
    );
  }

  async updateLocation(location: FarmLocation): Promise<void> {
    await this.database.runAsync(
      "UPDATE farm_locations SET name = ?, kind = ?, parent_id = ? WHERE id = ? AND farm_id = ?;",
      [location.name, location.kind, location.parentId ?? null, location.id, location.farmId],
    );
  }

  async listLocations(farmId: FarmId): Promise<FarmLocation[]> {
    const rows = await this.database.getAllAsync<LocationRow>(
      "SELECT id, farm_id, name, kind, parent_id, created_at FROM farm_locations WHERE farm_id = ? ORDER BY created_at ASC;",
      [farmId],
    );

    return rows.map(mapLocation);
  }

  async addTrackedItem(item: TrackedItem): Promise<void> {
    await this.database.runAsync(
      "INSERT INTO tracked_items (id, farm_id, kind, name, created_at, default_unit) VALUES (?, ?, ?, ?, ?, ?);",
      [item.id, item.farmId, item.kind, item.name, item.createdAt, item.defaultUnit ?? null],
    );
  }

  async updateTrackedItem(item: TrackedItem): Promise<void> {
    await this.database.runAsync(
      "UPDATE tracked_items SET name = ?, default_unit = ? WHERE id = ? AND farm_id = ? AND kind = ?;",
      [item.name, item.defaultUnit ?? null, item.id, item.farmId, item.kind],
    );
  }

  async listTrackedItems(farmId: FarmId, kind?: TrackedItemKind): Promise<TrackedItem[]> {
    const rows = kind
      ? await this.database.getAllAsync<TrackedItemRow>(
          "SELECT id, farm_id, kind, name, created_at, default_unit FROM tracked_items WHERE farm_id = ? AND kind = ? ORDER BY created_at ASC;",
          [farmId, kind],
        )
      : await this.database.getAllAsync<TrackedItemRow>(
          "SELECT id, farm_id, kind, name, created_at, default_unit FROM tracked_items WHERE farm_id = ? ORDER BY created_at ASC;",
          [farmId],
        );

    return rows.map(mapTrackedItem);
  }
}

function mapFarm(row: FarmRow): Farm {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    corePlacesSetupCompletedAt: row.core_places_setup_completed_at ?? undefined,
  };
}

function mapLocation(row: LocationRow): FarmLocation {
  return {
    id: row.id,
    farmId: row.farm_id,
    name: row.name,
    kind: row.kind,
    parentId: row.parent_id ?? undefined,
    createdAt: row.created_at,
  };
}

function mapTrackedItem(row: TrackedItemRow): TrackedItem {
  return {
    id: row.id,
    farmId: row.farm_id,
    kind: row.kind,
    name: row.name,
    createdAt: row.created_at,
    defaultUnit: row.default_unit ?? undefined,
  };
}
