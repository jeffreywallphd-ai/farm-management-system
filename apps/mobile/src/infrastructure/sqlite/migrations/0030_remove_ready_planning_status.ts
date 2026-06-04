import type { Migration } from "./migrationRunner";

export const removeReadyPlanningStatus: Migration = {
  version: 30,
  name: "remove_ready_planning_status",
  statements: [
    "PRAGMA foreign_keys = OFF;",
    `CREATE TABLE IF NOT EXISTS planning_tasks_status_rebuilt (
      id TEXT PRIMARY KEY NOT NULL,
      farm_id TEXT NOT NULL,
      goal_id TEXT,
      place_id TEXT,
      title TEXT NOT NULL,
      notes TEXT,
      status TEXT NOT NULL CHECK (status IN ('notStarted', 'inProgress', 'blocked', 'done', 'canceled')),
      priority TEXT NOT NULL CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
      planned_start_date TEXT,
      due_date TEXT,
      estimated_minutes INTEGER,
      assigned_farmhand_id TEXT,
      instruction_voice_memo_local_uri TEXT,
      instruction_voice_memo_duration_ms INTEGER,
      instruction_voice_memo_file_size_bytes INTEGER,
      instruction_photo_json TEXT NOT NULL DEFAULT '[]',
      completion_notes TEXT,
      completed_at TEXT,
      source TEXT NOT NULL CHECK (source IN ('farmer', 'organicCertificationTemplate', 'organicCertification')),
      template_key TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (farm_id) REFERENCES farms(id),
      FOREIGN KEY (goal_id) REFERENCES planning_goals(id),
      FOREIGN KEY (place_id) REFERENCES farm_locations(id),
      FOREIGN KEY (assigned_farmhand_id) REFERENCES farmhands(id)
    );`,
    `INSERT INTO planning_tasks_status_rebuilt (
      id, farm_id, goal_id, place_id, title, notes, status, priority, planned_start_date,
      due_date, estimated_minutes, assigned_farmhand_id, instruction_voice_memo_local_uri,
      instruction_voice_memo_duration_ms, instruction_voice_memo_file_size_bytes, instruction_photo_json,
      completion_notes, completed_at, source, template_key, sort_order, created_at, updated_at
    )
    SELECT
      id, farm_id, goal_id, place_id, title, notes, CASE WHEN status = 'ready' THEN 'notStarted' ELSE status END, priority, planned_start_date,
      due_date, estimated_minutes, assigned_farmhand_id, instruction_voice_memo_local_uri,
      instruction_voice_memo_duration_ms, instruction_voice_memo_file_size_bytes, instruction_photo_json,
      completion_notes, completed_at, source, template_key, sort_order, created_at, updated_at
    FROM planning_tasks;`,
    "DROP TABLE planning_tasks;",
    "ALTER TABLE planning_tasks_status_rebuilt RENAME TO planning_tasks;",
    "CREATE INDEX IF NOT EXISTS idx_planning_tasks_farm ON planning_tasks(farm_id);",
    "CREATE INDEX IF NOT EXISTS idx_planning_tasks_goal ON planning_tasks(farm_id, goal_id);",
    "CREATE INDEX IF NOT EXISTS idx_planning_tasks_place ON planning_tasks(farm_id, place_id);",
    "CREATE INDEX IF NOT EXISTS idx_planning_tasks_assigned_farmhand ON planning_tasks(farm_id, assigned_farmhand_id);",
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_planning_tasks_template ON planning_tasks(farm_id, template_key) WHERE template_key IS NOT NULL;",
    "PRAGMA foreign_keys = ON;",
  ],
};
