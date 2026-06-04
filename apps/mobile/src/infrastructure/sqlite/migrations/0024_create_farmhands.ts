import type { Migration } from "./migrationRunner";

export const createFarmhands: Migration = {
  version: 24,
  name: "create_farmhands",
  statements: [
    `CREATE TABLE IF NOT EXISTS farmhands (
      id TEXT PRIMARY KEY NOT NULL,
      farm_id TEXT NOT NULL,
      name TEXT NOT NULL,
      phone_number TEXT,
      notes TEXT,
      status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (farm_id) REFERENCES farms(id)
    );`,
    "CREATE INDEX IF NOT EXISTS idx_farmhands_farm ON farmhands(farm_id);",
    "CREATE INDEX IF NOT EXISTS idx_farmhands_status ON farmhands(farm_id, status);",
    `CREATE TABLE IF NOT EXISTS farmhand_recurring_schedules (
      id TEXT PRIMARY KEY NOT NULL,
      farm_id TEXT NOT NULL,
      farmhand_id TEXT NOT NULL,
      weekday INTEGER NOT NULL CHECK (weekday >= 0 AND weekday <= 6),
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      effective_start_date TEXT,
      effective_end_date TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (farm_id) REFERENCES farms(id),
      FOREIGN KEY (farmhand_id) REFERENCES farmhands(id)
    );`,
    "CREATE INDEX IF NOT EXISTS idx_farmhand_recurring_farmhand ON farmhand_recurring_schedules(farm_id, farmhand_id);",
    `CREATE TABLE IF NOT EXISTS farmhand_weekly_schedule_blocks (
      id TEXT PRIMARY KEY NOT NULL,
      farm_id TEXT NOT NULL,
      farmhand_id TEXT NOT NULL,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (farm_id) REFERENCES farms(id),
      FOREIGN KEY (farmhand_id) REFERENCES farmhands(id)
    );`,
    "CREATE INDEX IF NOT EXISTS idx_farmhand_weekly_farmhand ON farmhand_weekly_schedule_blocks(farm_id, farmhand_id, date);",
    "ALTER TABLE planning_tasks ADD COLUMN assigned_farmhand_id TEXT REFERENCES farmhands(id);",
    "CREATE INDEX IF NOT EXISTS idx_planning_tasks_assigned_farmhand ON planning_tasks(farm_id, assigned_farmhand_id);",
  ],
};
