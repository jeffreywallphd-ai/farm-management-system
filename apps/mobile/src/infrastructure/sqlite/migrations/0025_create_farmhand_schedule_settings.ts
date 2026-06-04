import type { Migration } from "./migrationRunner";

export const createFarmhandScheduleSettings: Migration = {
  version: 25,
  name: "create_farmhand_schedule_settings",
  statements: [
    `CREATE TABLE IF NOT EXISTS farmhand_schedule_settings (
      farm_id TEXT PRIMARY KEY NOT NULL,
      week_starts_on INTEGER NOT NULL CHECK (week_starts_on IN (0, 1)),
      updated_at TEXT NOT NULL,
      FOREIGN KEY (farm_id) REFERENCES farms(id)
    );`,
  ],
};
