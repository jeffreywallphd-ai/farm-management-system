import type { Migration } from "./migrationRunner";

export const createFarmPlaceGeometries: Migration = {
  version: 27,
  name: "create_farm_place_geometries",
  statements: [
    `CREATE TABLE IF NOT EXISTS farm_place_geometries (
      id TEXT PRIMARY KEY NOT NULL,
      farm_id TEXT NOT NULL,
      place_id TEXT,
      geometry_type TEXT NOT NULL CHECK (geometry_type IN ('point', 'line', 'polygon', 'multiPolygon')),
      geometry_role TEXT NOT NULL CHECK (geometry_role IN ('farmCenter', 'fieldBoundary', 'bedBoundary', 'rowLine', 'greenhouseBoundary', 'buildingFootprint', 'storageArea', 'washPackArea', 'bufferZone', 'waterSource', 'accessRoad', 'adjacentLandRiskArea', 'driftIncidentArea', 'contaminationConcernPoint', 'other')),
      geojson TEXT NOT NULL,
      source TEXT NOT NULL CHECK (source IN ('manualMapEdit', 'gps', 'addressGeocode', 'imported', 'derived')),
      name TEXT,
      notes TEXT,
      map_view_latitude REAL,
      map_view_longitude REAL,
      map_view_zoom REAL,
      map_view_pitch REAL,
      map_view_bearing REAL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      archived_at TEXT,
      FOREIGN KEY (farm_id) REFERENCES farms(id),
      FOREIGN KEY (place_id) REFERENCES farm_locations(id)
    );`,
    "CREATE INDEX IF NOT EXISTS idx_farm_place_geometries_farm ON farm_place_geometries(farm_id, archived_at);",
    "CREATE INDEX IF NOT EXISTS idx_farm_place_geometries_place ON farm_place_geometries(farm_id, place_id, archived_at);",
    "CREATE INDEX IF NOT EXISTS idx_farm_place_geometries_role ON farm_place_geometries(farm_id, geometry_role, archived_at);",
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_farm_place_geometries_active_farm_center ON farm_place_geometries(farm_id) WHERE geometry_role = 'farmCenter' AND archived_at IS NULL;",
  ],
};
