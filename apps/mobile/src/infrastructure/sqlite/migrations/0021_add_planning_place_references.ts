import type { Migration } from "./migrationRunner";

export const addPlanningPlaceReferences: Migration = {
  version: 21,
  name: "add_planning_place_references",
  statements: [
    "ALTER TABLE planning_goals ADD COLUMN place_id TEXT;",
    "ALTER TABLE planning_tasks ADD COLUMN place_id TEXT;",
    "CREATE INDEX IF NOT EXISTS idx_planning_goals_place ON planning_goals(farm_id, place_id);",
    "CREATE INDEX IF NOT EXISTS idx_planning_tasks_place ON planning_tasks(farm_id, place_id);",
  ],
};
