import type { FarmId } from "../../domain/farm/Farm";
import type { FarmLocation, FarmLocationId } from "../../domain/farm/FarmLocation";
import type {
  PlanningGoal,
  PlanningGoalCategory,
  PlanningGoalId,
  PlanningBoard,
  PlanningBoardId,
  PlanningBoardScopeType,
  PlanningLink,
  PlanningPeriod,
  PlanningPeriodId,
  PlanningSource,
  PlanningTask,
  PlanningTaskId,
} from "../../domain/planning/Planning";
import type { PlanningRepository } from "../../application/ports/PlanningRepository";

export class InMemoryPlanningRepository implements PlanningRepository {
  private locations = new Map<FarmId, FarmLocation[]>();
  private boards = new Map<FarmId, PlanningBoard[]>();
  private goals = new Map<FarmId, PlanningGoal[]>();
  private periods = new Map<FarmId, PlanningPeriod[]>();
  private tasks = new Map<FarmId, PlanningTask[]>();
  private links = new Map<FarmId, PlanningLink[]>();

  addLocation(location: FarmLocation): void {
    this.locations.set(location.farmId, [
      location,
      ...(this.locations.get(location.farmId) ?? []).filter((candidate) => candidate.id !== location.id),
    ]);
  }

  async getLocation(farmId: FarmId, id: FarmLocationId): Promise<FarmLocation | null> {
    return this.locations.get(farmId)?.find((location) => location.id === id) ?? null;
  }

  async saveBoard(board: PlanningBoard): Promise<void> {
    const existing = this.boards.get(board.farmId) ?? [];
    this.boards.set(board.farmId, [
      board,
      ...existing.filter((candidate) => candidate.id !== board.id),
    ].sort((left, right) => left.createdAt.localeCompare(right.createdAt) || left.title.localeCompare(right.title)));
  }

  async getBoard(farmId: FarmId, id: PlanningBoardId): Promise<PlanningBoard | null> {
    return this.boards.get(farmId)?.find((board) => board.id === id) ?? null;
  }

  async listBoards(
    farmId: FarmId,
    filters?: { scopeType?: PlanningBoardScopeType; goalId?: PlanningGoalId | null },
  ): Promise<PlanningBoard[]> {
    let records = this.boards.get(farmId) ?? [];
    if (filters?.scopeType) {
      records = records.filter((board) => board.scopeType === filters.scopeType);
    }
    if (filters && "goalId" in filters) {
      records = records.filter((board) => (filters.goalId === null ? !board.goalId : board.goalId === filters.goalId));
    }
    return records;
  }

  async saveGoal(goal: PlanningGoal): Promise<void> {
    const existing = this.goals.get(goal.farmId) ?? [];
    this.goals.set(goal.farmId, [
      goal,
      ...existing.filter((candidate) => candidate.id !== goal.id),
    ].sort(sortByOrderThenUpdated));
  }

  async getGoal(farmId: FarmId, id: PlanningGoalId): Promise<PlanningGoal | null> {
    return this.goals.get(farmId)?.find((goal) => goal.id === id) ?? null;
  }

  async listGoals(
    farmId: FarmId,
    filters?: { category?: PlanningGoalCategory; source?: PlanningSource; parentGoalId?: PlanningGoalId | null },
  ): Promise<PlanningGoal[]> {
    let records = this.goals.get(farmId) ?? [];
    if (filters?.category) {
      records = records.filter((goal) => goal.category === filters.category);
    }
    if (filters?.source) {
      records = records.filter((goal) => goal.source === filters.source);
    }
    if (filters && "parentGoalId" in filters) {
      records = records.filter((goal) => (filters.parentGoalId === null ? !goal.parentGoalId : goal.parentGoalId === filters.parentGoalId));
    }
    return records;
  }

  async savePeriod(period: PlanningPeriod): Promise<void> {
    const existing = this.periods.get(period.farmId) ?? [];
    this.periods.set(period.farmId, [
      period,
      ...existing.filter((candidate) => candidate.id !== period.id),
    ].sort((left, right) => left.label.localeCompare(right.label)));
  }

  async getPeriod(farmId: FarmId, id: PlanningPeriodId): Promise<PlanningPeriod | null> {
    return this.periods.get(farmId)?.find((period) => period.id === id) ?? null;
  }

  async listPeriods(farmId: FarmId): Promise<PlanningPeriod[]> {
    return this.periods.get(farmId) ?? [];
  }

  async saveTask(task: PlanningTask): Promise<void> {
    const existing = this.tasks.get(task.farmId) ?? [];
    this.tasks.set(task.farmId, [
      task,
      ...existing.filter((candidate) => candidate.id !== task.id),
    ].sort(sortByOrderThenUpdated));
  }

  async getTask(farmId: FarmId, id: PlanningTaskId): Promise<PlanningTask | null> {
    return this.tasks.get(farmId)?.find((task) => task.id === id) ?? null;
  }

  async listTasks(
    farmId: FarmId,
    filters?: { goalId?: PlanningGoalId; periodId?: PlanningPeriodId; source?: PlanningSource },
  ): Promise<PlanningTask[]> {
    let records = this.tasks.get(farmId) ?? [];
    if (filters?.goalId) {
      records = records.filter((task) => task.goalId === filters.goalId);
    }
    if (filters?.periodId) {
      records = records.filter((task) => task.periodId === filters.periodId);
    }
    if (filters?.source) {
      records = records.filter((task) => task.source === filters.source);
    }
    return records;
  }

  async saveLink(link: PlanningLink): Promise<void> {
    this.links.set(link.farmId, [link, ...(this.links.get(link.farmId) ?? []).filter((candidate) => candidate.id !== link.id)]);
  }

  async listLinks(farmId: FarmId, filters?: { goalId?: PlanningGoalId; taskId?: PlanningTaskId }): Promise<PlanningLink[]> {
    let records = this.links.get(farmId) ?? [];
    if (filters?.goalId) {
      records = records.filter((link) => link.goalId === filters.goalId);
    }
    if (filters?.taskId) {
      records = records.filter((link) => link.taskId === filters.taskId);
    }
    return records;
  }
}

function sortByOrderThenUpdated<T extends { sortOrder: number; updatedAt: string }>(left: T, right: T): number {
  return left.sortOrder - right.sortOrder || right.updatedAt.localeCompare(left.updatedAt);
}
