import type { FarmId } from "../../domain/farm/Farm";
import type { FarmLocation, FarmLocationId } from "../../domain/farm/FarmLocation";
import type { FarmhandId } from "../../domain/farmhand/Farmhand";
import type {
  PlanningGoal,
  PlanningGoalCategory,
  PlanningFarmWorkPackItemState,
  PlanningFarmWorkPackState,
  PlanningGoalId,
  PlanningBoard,
  PlanningBoardId,
  PlanningBoardScopeType,
  PlanningLink,
  PlanningSource,
  PlanningTask,
  PlanningTaskId,
} from "../../domain/planning/Planning";
import type { PlanningRepository } from "../../application/ports/PlanningRepository";

export class InMemoryPlanningRepository implements PlanningRepository {
  private locations = new Map<FarmId, FarmLocation[]>();
  private boards = new Map<FarmId, PlanningBoard[]>();
  private goals = new Map<FarmId, PlanningGoal[]>();
  private tasks = new Map<FarmId, PlanningTask[]>();
  private links = new Map<FarmId, PlanningLink[]>();
  private farmWorkPackStates = new Map<FarmId, PlanningFarmWorkPackState[]>();
  private farmWorkPackItemStates = new Map<FarmId, PlanningFarmWorkPackItemState[]>();

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

  async deleteGoal(farmId: FarmId, id: PlanningGoalId): Promise<void> {
    this.goals.set(farmId, (this.goals.get(farmId) ?? []).filter((goal) => goal.id !== id));
    this.tasks.set(farmId, (this.tasks.get(farmId) ?? []).map((task) => task.goalId === id ? { ...task, goalId: undefined } : task));
    this.links.set(farmId, (this.links.get(farmId) ?? []).filter((link) => link.goalId !== id));
    this.boards.set(farmId, (this.boards.get(farmId) ?? []).filter((board) => board.goalId !== id));
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
    filters?: { goalId?: PlanningGoalId; source?: PlanningSource; assignedFarmhandId?: FarmhandId },
  ): Promise<PlanningTask[]> {
    let records = this.tasks.get(farmId) ?? [];
    if (filters?.goalId) {
      records = records.filter((task) => task.goalId === filters.goalId);
    }
    if (filters?.source) {
      records = records.filter((task) => task.source === filters.source);
    }
    if (filters?.assignedFarmhandId) {
      records = records.filter((task) => task.assignedFarmhandId === filters.assignedFarmhandId);
    }
    return records;
  }

  async deleteTask(farmId: FarmId, id: PlanningTaskId): Promise<void> {
    this.tasks.set(farmId, (this.tasks.get(farmId) ?? []).filter((task) => task.id !== id));
    this.links.set(farmId, (this.links.get(farmId) ?? []).filter((link) => link.taskId !== id));
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

  async saveFarmWorkPackState(state: PlanningFarmWorkPackState): Promise<void> {
    const existing = this.farmWorkPackStates.get(state.farmId) ?? [];
    this.farmWorkPackStates.set(state.farmId, [
      state,
      ...existing.filter((candidate) => candidate.packId !== state.packId),
    ].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)));
  }

  async listFarmWorkPackStates(farmId: FarmId): Promise<PlanningFarmWorkPackState[]> {
    return this.farmWorkPackStates.get(farmId) ?? [];
  }

  async saveFarmWorkPackItemState(state: PlanningFarmWorkPackItemState): Promise<void> {
    const existing = this.farmWorkPackItemStates.get(state.farmId) ?? [];
    this.farmWorkPackItemStates.set(state.farmId, [
      state,
      ...existing.filter((candidate) => candidate.templateKey !== state.templateKey),
    ].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)));
  }

  async listFarmWorkPackItemStates(farmId: FarmId): Promise<PlanningFarmWorkPackItemState[]> {
    return this.farmWorkPackItemStates.get(farmId) ?? [];
  }
}

function sortByOrderThenUpdated<T extends { sortOrder: number; updatedAt: string }>(left: T, right: T): number {
  return left.sortOrder - right.sortOrder || right.updatedAt.localeCompare(left.updatedAt);
}
