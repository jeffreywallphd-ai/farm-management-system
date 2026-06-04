import type { SQLiteDatabase } from "expo-sqlite";

import type { FarmId } from "../../../domain/farm/Farm";
import type { FarmLocation, FarmLocationId, FarmPlaceKind } from "../../../domain/farm/FarmLocation";
import type { FarmhandId } from "../../../domain/farmhand/Farmhand";
import type {
  PlanningGoal,
  PlanningGoalCategory,
  PlanningFarmWorkPackItemState,
  PlanningFarmWorkPackState,
  PlanningGoalId,
  PlanningGoalStatus,
  PlanningBoard,
  PlanningBoardId,
  PlanningBoardScopeType,
  PlanningLink,
  PlanningTaskInstructionPhoto,
  PlanningRecordLinkType,
  PlanningSource,
  PlanningTask,
  PlanningTaskId,
  PlanningTaskPriority,
  PlanningTaskStatus,
} from "../../../domain/planning/Planning";
import type { PlanningRepository } from "../../../application/ports/PlanningRepository";

interface GoalRow {
  id: string;
  farm_id: string;
  parent_goal_id: string | null;
  place_id: string | null;
  title: string;
  description: string | null;
  category: PlanningGoalCategory;
  status: PlanningGoalStatus;
  target_date: string | null;
  source: PlanningSource;
  template_key: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface BoardRow {
  id: string;
  farm_id: string;
  title: string;
  scope_type: PlanningBoardScopeType;
  goal_id: string | null;
  wip_limit: number | null;
  created_at: string;
  updated_at: string;
}

interface TaskRow {
  id: string;
  farm_id: string;
  goal_id: string | null;
  place_id: string | null;
  title: string;
  notes: string | null;
  status: PlanningTaskStatus;
  priority: PlanningTaskPriority;
  planned_start_date: string | null;
  due_date: string | null;
  estimated_minutes: number | null;
  assigned_farmhand_id: string | null;
  instruction_voice_memo_local_uri: string | null;
  instruction_voice_memo_duration_ms: number | null;
  instruction_voice_memo_file_size_bytes: number | null;
  instruction_photo_json: string | null;
  completion_notes: string | null;
  completed_at: string | null;
  source: PlanningSource;
  template_key: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface LinkRow {
  id: string;
  farm_id: string;
  goal_id: string | null;
  task_id: string | null;
  linked_record_type: PlanningRecordLinkType;
  linked_record_id: string;
  notes: string | null;
  created_at: string;
}

interface FarmWorkPackStateRow {
  farm_id: string;
  pack_id: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

interface FarmWorkPackItemStateRow {
  farm_id: string;
  template_key: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

interface LocationRow {
  id: string;
  farm_id: string;
  name: string;
  kind: FarmPlaceKind;
  parent_id: string | null;
  created_at: string;
}

export class SqlitePlanningRepository implements PlanningRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  async getLocation(farmId: FarmId, id: FarmLocationId): Promise<FarmLocation | null> {
    const row = await this.database.getFirstAsync<LocationRow>(
      "SELECT id, farm_id, name, kind, parent_id, created_at FROM farm_locations WHERE farm_id = ? AND id = ? LIMIT 1;",
      [farmId, id],
    );
    return row ? mapLocation(row) : null;
  }

  async saveBoard(board: PlanningBoard): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO planning_boards (id, farm_id, title, scope_type, goal_id, wip_limit, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        scope_type = excluded.scope_type,
        goal_id = excluded.goal_id,
        wip_limit = excluded.wip_limit,
        updated_at = excluded.updated_at;`,
      [
        board.id,
        board.farmId,
        board.title,
        board.scopeType,
        board.goalId ?? null,
        board.wipLimit ?? null,
        board.createdAt,
        board.updatedAt,
      ],
    );
  }

  async getBoard(farmId: FarmId, id: PlanningBoardId): Promise<PlanningBoard | null> {
    const row = await this.database.getFirstAsync<BoardRow>(
      "SELECT id, farm_id, title, scope_type, goal_id, wip_limit, created_at, updated_at FROM planning_boards WHERE farm_id = ? AND id = ? LIMIT 1;",
      [farmId, id],
    );
    return row ? mapBoard(row) : null;
  }

  async listBoards(
    farmId: FarmId,
    filters?: { scopeType?: PlanningBoardScopeType; goalId?: PlanningGoalId | null },
  ): Promise<PlanningBoard[]> {
    const rows = await this.database.getAllAsync<BoardRow>(
      "SELECT id, farm_id, title, scope_type, goal_id, wip_limit, created_at, updated_at FROM planning_boards WHERE farm_id = ? ORDER BY created_at ASC, title ASC;",
      [farmId],
    );
    let boards = rows.map(mapBoard);
    if (filters?.scopeType) boards = boards.filter((board) => board.scopeType === filters.scopeType);
    if (filters && "goalId" in filters) {
      boards = boards.filter((board) => (filters.goalId === null ? !board.goalId : board.goalId === filters.goalId));
    }
    return boards;
  }

  async saveGoal(goal: PlanningGoal): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO planning_goals (
        id, farm_id, parent_goal_id, place_id, title, description, category, status, target_date,
        source, template_key, sort_order, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        parent_goal_id = excluded.parent_goal_id,
        place_id = excluded.place_id,
        title = excluded.title,
        description = excluded.description,
        category = excluded.category,
        status = excluded.status,
        target_date = excluded.target_date,
        source = excluded.source,
        template_key = excluded.template_key,
        sort_order = excluded.sort_order,
        updated_at = excluded.updated_at;`,
      [
        goal.id,
        goal.farmId,
        goal.parentGoalId ?? null,
        goal.placeId ?? null,
        goal.title,
        goal.description ?? null,
        goal.category,
        goal.status,
        goal.targetDate ?? null,
        goal.source,
        goal.templateKey ?? null,
        goal.sortOrder,
        goal.createdAt,
        goal.updatedAt,
      ],
    );
  }

  async getGoal(farmId: FarmId, id: PlanningGoalId): Promise<PlanningGoal | null> {
    const row = await this.database.getFirstAsync<GoalRow>(
      `SELECT id, farm_id, parent_goal_id, place_id, title, description, category, status, target_date,
        source, template_key, sort_order, created_at, updated_at
       FROM planning_goals WHERE farm_id = ? AND id = ? LIMIT 1;`,
      [farmId, id],
    );
    return row ? mapGoal(row) : null;
  }

  async listGoals(
    farmId: FarmId,
    filters?: { category?: PlanningGoalCategory; source?: PlanningSource; parentGoalId?: PlanningGoalId | null },
  ): Promise<PlanningGoal[]> {
    const rows = await this.database.getAllAsync<GoalRow>(
      `SELECT id, farm_id, parent_goal_id, place_id, title, description, category, status, target_date,
        source, template_key, sort_order, created_at, updated_at
       FROM planning_goals WHERE farm_id = ? ORDER BY sort_order ASC, updated_at DESC;`,
      [farmId],
    );
    let goals = rows.map(mapGoal);
    if (filters?.category) goals = goals.filter((goal) => goal.category === filters.category);
    if (filters?.source) goals = goals.filter((goal) => goal.source === filters.source);
    if (filters && "parentGoalId" in filters) {
      goals = goals.filter((goal) => (filters.parentGoalId === null ? !goal.parentGoalId : goal.parentGoalId === filters.parentGoalId));
    }
    return goals;
  }

  async deleteGoal(farmId: FarmId, id: PlanningGoalId): Promise<void> {
    await this.database.runAsync("UPDATE planning_tasks SET goal_id = NULL WHERE farm_id = ? AND goal_id = ?;", [farmId, id]);
    await this.database.runAsync("DELETE FROM planning_links WHERE farm_id = ? AND goal_id = ?;", [farmId, id]);
    await this.database.runAsync("DELETE FROM planning_boards WHERE farm_id = ? AND goal_id = ?;", [farmId, id]);
    await this.database.runAsync("DELETE FROM planning_goals WHERE farm_id = ? AND id = ?;", [farmId, id]);
  }

  async saveTask(task: PlanningTask): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO planning_tasks (
        id, farm_id, goal_id, place_id, title, notes, status, priority, planned_start_date,
        due_date, estimated_minutes, assigned_farmhand_id, instruction_voice_memo_local_uri,
        instruction_voice_memo_duration_ms, instruction_voice_memo_file_size_bytes, instruction_photo_json,
        completion_notes, completed_at, source, template_key, sort_order, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        goal_id = excluded.goal_id,
        place_id = excluded.place_id,
        title = excluded.title,
        notes = excluded.notes,
        status = excluded.status,
        priority = excluded.priority,
        planned_start_date = excluded.planned_start_date,
        due_date = excluded.due_date,
        estimated_minutes = excluded.estimated_minutes,
        assigned_farmhand_id = excluded.assigned_farmhand_id,
        instruction_voice_memo_local_uri = excluded.instruction_voice_memo_local_uri,
        instruction_voice_memo_duration_ms = excluded.instruction_voice_memo_duration_ms,
        instruction_voice_memo_file_size_bytes = excluded.instruction_voice_memo_file_size_bytes,
        instruction_photo_json = excluded.instruction_photo_json,
        completion_notes = excluded.completion_notes,
        completed_at = excluded.completed_at,
        source = excluded.source,
        template_key = excluded.template_key,
        sort_order = excluded.sort_order,
        updated_at = excluded.updated_at;`,
      [
        task.id,
        task.farmId,
        task.goalId ?? null,
        task.placeId ?? null,
        task.title,
        task.notes ?? null,
        task.status,
        task.priority,
        task.plannedStartDate ?? null,
        task.dueDate ?? null,
        task.estimatedMinutes ?? null,
        task.assignedFarmhandId ?? null,
        task.instructionVoiceMemo?.localUri ?? null,
        task.instructionVoiceMemo?.durationMs ?? null,
        task.instructionVoiceMemo?.fileSizeBytes ?? null,
        JSON.stringify(task.instructionPhotos ?? []),
        task.completionNotes ?? null,
        task.completedAt ?? null,
        task.source,
        task.templateKey ?? null,
        task.sortOrder,
        task.createdAt,
        task.updatedAt,
      ],
    );
  }

  async getTask(farmId: FarmId, id: PlanningTaskId): Promise<PlanningTask | null> {
    const row = await this.database.getFirstAsync<TaskRow>(
      `SELECT id, farm_id, goal_id, place_id, title, notes, status, priority, planned_start_date,
        due_date, estimated_minutes, assigned_farmhand_id, instruction_voice_memo_local_uri,
        instruction_voice_memo_duration_ms, instruction_voice_memo_file_size_bytes, instruction_photo_json,
        completion_notes, completed_at, source, template_key, sort_order, created_at, updated_at
       FROM planning_tasks WHERE farm_id = ? AND id = ? LIMIT 1;`,
      [farmId, id],
    );
    return row ? mapTask(row) : null;
  }

  async listTasks(
    farmId: FarmId,
    filters?: { goalId?: PlanningGoalId; source?: PlanningSource; assignedFarmhandId?: FarmhandId },
  ): Promise<PlanningTask[]> {
    const rows = await this.database.getAllAsync<TaskRow>(
      `SELECT id, farm_id, goal_id, place_id, title, notes, status, priority, planned_start_date,
        due_date, estimated_minutes, assigned_farmhand_id, instruction_voice_memo_local_uri,
        instruction_voice_memo_duration_ms, instruction_voice_memo_file_size_bytes, instruction_photo_json,
        completion_notes, completed_at, source, template_key, sort_order, created_at, updated_at
       FROM planning_tasks WHERE farm_id = ? ORDER BY sort_order ASC, updated_at DESC;`,
      [farmId],
    );
    let tasks = rows.map(mapTask);
    if (filters?.goalId) tasks = tasks.filter((task) => task.goalId === filters.goalId);
    if (filters?.source) tasks = tasks.filter((task) => task.source === filters.source);
    if (filters?.assignedFarmhandId) tasks = tasks.filter((task) => task.assignedFarmhandId === filters.assignedFarmhandId);
    return tasks;
  }

  async deleteTask(farmId: FarmId, id: PlanningTaskId): Promise<void> {
    await this.database.runAsync("DELETE FROM planning_links WHERE farm_id = ? AND task_id = ?;", [farmId, id]);
    await this.database.runAsync("DELETE FROM planning_tasks WHERE farm_id = ? AND id = ?;", [farmId, id]);
  }

  async saveLink(link: PlanningLink): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO planning_links (id, farm_id, goal_id, task_id, linked_record_type, linked_record_id, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
        goal_id = excluded.goal_id,
        task_id = excluded.task_id,
        linked_record_type = excluded.linked_record_type,
        linked_record_id = excluded.linked_record_id,
        notes = excluded.notes;`,
      [link.id, link.farmId, link.goalId ?? null, link.taskId ?? null, link.linkedRecordType, link.linkedRecordId, link.notes ?? null, link.createdAt],
    );
  }

  async listLinks(farmId: FarmId, filters?: { goalId?: PlanningGoalId; taskId?: PlanningTaskId }): Promise<PlanningLink[]> {
    const rows = await this.database.getAllAsync<LinkRow>(
      "SELECT id, farm_id, goal_id, task_id, linked_record_type, linked_record_id, notes, created_at FROM planning_links WHERE farm_id = ? ORDER BY created_at DESC;",
      [farmId],
    );
    let links = rows.map(mapLink);
    if (filters?.goalId) links = links.filter((link) => link.goalId === filters.goalId);
    if (filters?.taskId) links = links.filter((link) => link.taskId === filters.taskId);
    return links;
  }

  async saveFarmWorkPackState(state: PlanningFarmWorkPackState): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO farm_work_pack_states (farm_id, pack_id, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(farm_id, pack_id) DO UPDATE SET
        is_active = excluded.is_active,
        updated_at = excluded.updated_at;`,
      [state.farmId, state.packId, state.isActive ? 1 : 0, state.createdAt, state.updatedAt],
    );
  }

  async listFarmWorkPackStates(farmId: FarmId): Promise<PlanningFarmWorkPackState[]> {
    const rows = await this.database.getAllAsync<FarmWorkPackStateRow>(
      "SELECT farm_id, pack_id, is_active, created_at, updated_at FROM farm_work_pack_states WHERE farm_id = ? ORDER BY updated_at DESC;",
      [farmId],
    );
    return rows.map(mapFarmWorkPackState);
  }

  async saveFarmWorkPackItemState(state: PlanningFarmWorkPackItemState): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO farm_work_pack_item_states (farm_id, template_key, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(farm_id, template_key) DO UPDATE SET
        is_active = excluded.is_active,
        updated_at = excluded.updated_at;`,
      [state.farmId, state.templateKey, state.isActive ? 1 : 0, state.createdAt, state.updatedAt],
    );
  }

  async listFarmWorkPackItemStates(farmId: FarmId): Promise<PlanningFarmWorkPackItemState[]> {
    const rows = await this.database.getAllAsync<FarmWorkPackItemStateRow>(
      "SELECT farm_id, template_key, is_active, created_at, updated_at FROM farm_work_pack_item_states WHERE farm_id = ? ORDER BY updated_at DESC;",
      [farmId],
    );
    return rows.map(mapFarmWorkPackItemState);
  }
}

function mapGoal(row: GoalRow): PlanningGoal {
  return {
    id: row.id,
    farmId: row.farm_id,
    parentGoalId: row.parent_goal_id ?? undefined,
    placeId: row.place_id ?? undefined,
    title: row.title,
    description: row.description ?? undefined,
    category: row.category,
    status: row.status,
    targetDate: row.target_date ?? undefined,
    source: row.source,
    templateKey: row.template_key ?? undefined,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapBoard(row: BoardRow): PlanningBoard {
  return {
    id: row.id,
    farmId: row.farm_id,
    title: row.title,
    scopeType: row.scope_type,
    goalId: row.goal_id ?? undefined,
    wipLimit: row.wip_limit ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapTask(row: TaskRow): PlanningTask {
  return {
    id: row.id,
    farmId: row.farm_id,
    goalId: row.goal_id ?? undefined,
    placeId: row.place_id ?? undefined,
    title: row.title,
    notes: row.notes ?? undefined,
    status: row.status,
    priority: row.priority,
    plannedStartDate: row.planned_start_date ?? undefined,
    dueDate: row.due_date ?? undefined,
    estimatedMinutes: row.estimated_minutes ?? undefined,
    assignedFarmhandId: row.assigned_farmhand_id ?? undefined,
    instructionVoiceMemo: row.instruction_voice_memo_local_uri
      ? {
        localUri: row.instruction_voice_memo_local_uri,
        durationMs: row.instruction_voice_memo_duration_ms ?? undefined,
        fileSizeBytes: row.instruction_voice_memo_file_size_bytes ?? undefined,
      }
      : undefined,
    instructionPhotos: parseInstructionPhotos(row.instruction_photo_json),
    completionNotes: row.completion_notes ?? undefined,
    completedAt: row.completed_at ?? undefined,
    source: row.source,
    templateKey: row.template_key ?? undefined,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
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

function mapLink(row: LinkRow): PlanningLink {
  return {
    id: row.id,
    farmId: row.farm_id,
    goalId: row.goal_id ?? undefined,
    taskId: row.task_id ?? undefined,
    linkedRecordType: row.linked_record_type,
    linkedRecordId: row.linked_record_id,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}

function mapFarmWorkPackState(row: FarmWorkPackStateRow): PlanningFarmWorkPackState {
  return {
    farmId: row.farm_id,
    packId: row.pack_id,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapFarmWorkPackItemState(row: FarmWorkPackItemStateRow): PlanningFarmWorkPackItemState {
  return {
    farmId: row.farm_id,
    templateKey: row.template_key,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function parseInstructionPhotos(value: string | null): PlanningTaskInstructionPhoto[] {
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((photo): photo is PlanningTaskInstructionPhoto =>
        Boolean(
          photo
          && typeof photo === "object"
          && "localUri" in photo
          && typeof (photo as { localUri?: unknown }).localUri === "string",
        ))
      .map((photo) => ({
        localUri: photo.localUri,
        width: typeof photo.width === "number" ? photo.width : undefined,
        height: typeof photo.height === "number" ? photo.height : undefined,
        mimeType: typeof photo.mimeType === "string" ? photo.mimeType : undefined,
        fileSizeBytes: typeof photo.fileSizeBytes === "number" ? photo.fileSizeBytes : undefined,
      }));
  } catch {
    return [];
  }
}
