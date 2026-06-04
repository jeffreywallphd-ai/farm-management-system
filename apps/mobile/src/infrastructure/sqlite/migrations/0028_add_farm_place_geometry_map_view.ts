import type { Migration } from "./migrationRunner";

export const addFarmPlaceGeometryMapView: Migration = {
  version: 28,
  name: "add_farm_place_geometry_map_view",
  statements: [
    "ALTER TABLE farm_place_geometries ADD COLUMN map_view_latitude REAL;",
    "ALTER TABLE farm_place_geometries ADD COLUMN map_view_longitude REAL;",
    "ALTER TABLE farm_place_geometries ADD COLUMN map_view_zoom REAL;",
    "ALTER TABLE farm_place_geometries ADD COLUMN map_view_pitch REAL;",
    "ALTER TABLE farm_place_geometries ADD COLUMN map_view_bearing REAL;",
  ],
};
