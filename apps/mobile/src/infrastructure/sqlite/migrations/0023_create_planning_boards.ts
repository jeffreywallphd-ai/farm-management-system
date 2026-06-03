import type { Migration } from "./migrationRunner";

export const createPlanningBoards: Migration = {
  version: 23,
  name: "create_planning_boards",
  statements: [
    `CREATE TABLE IF NOT EXISTS planning_boards (
      id TEXT PRIMARY KEY NOT NULL,
      farm_id TEXT NOT NULL,
      title TEXT NOT NULL,
      scope_type TEXT NOT NULL CHECK (scope_type IN ('goal', 'nonGoalTasks')),
      goal_id TEXT,
      wip_limit INTEGER,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      CHECK ((scope_type = 'goal' AND goal_id IS NOT NULL) OR (scope_type = 'nonGoalTasks' AND goal_id IS NULL)),
      FOREIGN KEY (farm_id) REFERENCES farms(id),
      FOREIGN KEY (goal_id) REFERENCES planning_goals(id)
    );`,
    "CREATE INDEX IF NOT EXISTS idx_planning_boards_farm ON planning_boards(farm_id);",
    "CREATE INDEX IF NOT EXISTS idx_planning_boards_goal ON planning_boards(farm_id, goal_id);",
  ],
};
