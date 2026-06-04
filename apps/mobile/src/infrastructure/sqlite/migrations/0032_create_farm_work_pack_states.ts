import type { Migration } from "./migrationRunner";

export const createFarmWorkPackStates: Migration = {
  version: 32,
  name: "create_farm_work_pack_states",
  statements: [
    `CREATE TABLE IF NOT EXISTS farm_work_pack_states (
      farm_id TEXT NOT NULL,
      pack_id TEXT NOT NULL,
      is_active INTEGER NOT NULL CHECK (is_active IN (0, 1)),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (farm_id, pack_id)
    );`,
    "CREATE INDEX IF NOT EXISTS idx_farm_work_pack_states_farm_active ON farm_work_pack_states(farm_id, is_active);",
  ],
};
