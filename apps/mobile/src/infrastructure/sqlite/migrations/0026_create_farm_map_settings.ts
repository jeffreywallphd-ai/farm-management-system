import type { Migration } from "./migrationRunner";

export const createFarmMapSettings: Migration = {
  version: 26,
  name: "create_farm_map_settings",
  statements: [
    `CREATE TABLE IF NOT EXISTS farm_map_settings (
      id TEXT PRIMARY KEY NOT NULL,
      farm_id TEXT NOT NULL UNIQUE,
      address_text TEXT,
      default_center_latitude REAL,
      default_center_longitude REAL,
      default_zoom REAL NOT NULL,
      default_pitch REAL NOT NULL,
      default_bearing REAL NOT NULL,
      map_provider TEXT NOT NULL CHECK (map_provider IN ('fallback', 'mapLibre')),
      offline_map_status TEXT NOT NULL CHECK (offline_map_status IN ('notConfigured', 'notDownloaded', 'downloadQueued', 'downloading', 'downloaded', 'failed', 'unavailable')),
      offline_pack_name TEXT,
      offline_downloaded_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      CHECK ((default_center_latitude IS NULL AND default_center_longitude IS NULL) OR (default_center_latitude IS NOT NULL AND default_center_longitude IS NOT NULL)),
      CHECK (default_center_latitude IS NULL OR (default_center_latitude >= -90 AND default_center_latitude <= 90)),
      CHECK (default_center_longitude IS NULL OR (default_center_longitude >= -180 AND default_center_longitude <= 180)),
      CHECK (default_zoom >= 0 AND default_zoom <= 22),
      CHECK (default_pitch >= 0 AND default_pitch <= 85),
      CHECK (default_bearing >= 0 AND default_bearing <= 360),
      FOREIGN KEY (farm_id) REFERENCES farms(id)
    );`,
    "CREATE INDEX IF NOT EXISTS idx_farm_map_settings_farm ON farm_map_settings(farm_id);",
  ],
};
