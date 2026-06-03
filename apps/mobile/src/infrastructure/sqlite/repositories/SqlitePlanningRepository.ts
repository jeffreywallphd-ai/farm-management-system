import type { SQLiteDatabase } from "expo-sqlite";

import type { FarmId } from "../../../domain/farm/Farm";
import type { FarmLocation, FarmLocationId, FarmPlaceKind } from "../../../domain/farm/FarmLocation";
import type {
  PlanningGoal,
  PlanningGoalCategory,
  PlanningGoalId,
  PlanningGoalStatus,
  PlanningBoard,
  PlanningBoardId,
  PlanningBoardScopeType,
  PlanningLink,
  PlanningPeriod,
  PlanningPeriodId,
  PlanningPeriodType,
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

interface PeriodRow {
  id: string;
  farm_id: string;
  label: string;
  period_type: PlanningPeriodType;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

interface TaskRow {
  id: string;
  farm_id: string;
  goal_id: string | null;
  period_id: string | null;
  place_id: string | null;
  title: string;
  notes: string | null;
  status: PlanningTaskStatus;
  priority: PlanningTaskPriority;
  planned_start_date: string | null;
  due_date: string | null;
  estimated_minutes: number | null;
  responsible_person: string | null;
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

  async savePeriod(period: PlanningPeriod): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO planning_periods (id, farm_id, label, period_type, start_date, end_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
        label = excluded.label,
        period_type = excluded.period_type,
        start_date = excluded.start_date,
        end_date = excluded.end_date,
        updated_at = excluded.updated_at;`,
      [period.id, period.farmId, period.label, period.periodType, period.startDate ?? null, period.endDate ?? null, period.createdAt, period.updatedAt],
    );
  }

  async getPeriod(farmId: FarmId, id: PlanningPeriodId): Promise<PlanningPeriod | null> {
    const row = await this.database.getFirstAsync<PeriodRow>(
      "SELECT id, farm_id, label, period_type, start_date, end_date, created_at, updated_at FROM planning_periods WHERE farm_id = ? AND id = ? LIMIT 1;",
      [farmId, id],
    );
    return row ? mapPeriod(row) : null;
  }

  async listPeriods(farmId: FarmId): Promise<PlanningPeriod[]> {
    const rows = await this.database.getAllAsync<PeriodRow>(
      "SELECT id, farm_id, label, period_type, start_date, end_date, created_at, updated_at FROM planning_periods WHERE farm_id = ? ORDER BY updated_at DESC;",
      [farmId],
    );
    return rows.map(mapPeriod);
  }

  async saveTask(task: PlanningTask): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO planning_tasks (
        id, farm_id, goal_id, period_id, place_id, title, notes, status, priority, planned_start_date,
        due_date, estimated_minutes, responsible_person, completion_notes, completed_at, source,
        template_key, sort_order, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        goal_id = excluded.goal_id,
        period_id = excluded.period_id,
        place_id = excluded.place_id,
        title = excluded.title,
        notes = excluded.notes,
        status = excluded.status,
        priority = excluded.priority,
        planned_start_date = excluded.planned_start_date,
        due_date = excluded.due_date,
        estimated_minutes = excluded.estimated_minutes,
        responsible_person = excluded.responsible_person,
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
        task.periodId ?? null,
        task.placeId ?? null,
        task.title,
        task.notes ?? null,
        task.status,
        task.priority,
        task.plannedStartDate ?? null,
        task.dueDate ?? null,
        task.estimatedMinutes ?? null,
        task.responsiblePerson ?? null,
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
      `SELECT id, farm_id, goal_id, period_id, place_id, title, notes, status, priority, planned_start_date,
        due_date, estimated_minutes, responsible_person, completion_notes, completed_at, source,
        template_key, sort_order, created_at, updated_at
       FROM planning_tasks WHERE farm_id = ? AND id = ? LIMIT 1;`,
      [farmId, id],
    );
    return row ? mapTask(row) : null;
  }

  async listTasks(
    farmId: FarmId,
    filters?: { goalId?: PlanningGoalId; periodId?: PlanningPeriodId; source?: PlanningSource },
  ): Promise<PlanningTask[]> {
    const rows = await this.database.getAllAsync<TaskRow>(
      `SELECT id, farm_id, goal_id, period_id, place_id, title, notes, status, priority, planned_start_date,
        due_date, estimated_minutes, responsible_person, completion_notes, completed_at, source,
        template_key, sort_order, created_at, updated_at
       FROM planning_tasks WHERE farm_id = ? ORDER BY sort_order ASC, updated_at DESC;`,
      [farmId],
    );
    let tasks = rows.map(mapTask);
    if (filters?.goalId) tasks = tasks.filter((task) => task.goalId === filters.goalId);
    if (filters?.periodId) tasks = tasks.filter((task) => task.periodId === filters.periodId);
    if (filters?.source) tasks = tasks.filter((task) => task.source === filters.source);
    return tasks;
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

function mapPeriod(row: PeriodRow): PlanningPeriod {
  return {
    id: row.id,
    farmId: row.farm_id,
    label: row.label,
    periodType: row.period_type,
    startDate: row.start_date ?? undefined,
    endDate: row.end_date ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapTask(row: TaskRow): PlanningTask {
  return {
    id: row.id,
    farmId: row.farm_id,
    goalId: row.goal_id ?? undefined,
    periodId: row.period_id ?? undefined,
    placeId: row.place_id ?? undefined,
    title: row.title,
    notes: row.notes ?? undefined,
    status: row.status,
    priority: row.priority,
    plannedStartDate: row.planned_start_date ?? undefined,
    dueDate: row.due_date ?? undefined,
    estimatedMinutes: row.estimated_minutes ?? undefined,
    responsiblePerson: row.responsible_person ?? undefined,
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
