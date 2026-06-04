import type { FarmId } from "../../domain/farm/Farm";
import type { FarmLocation, FarmLocationId } from "../../domain/farm/FarmLocation";
import type { FarmhandId } from "../../domain/farmhand/Farmhand";
import type {
  PlanningGoal,
  PlanningGoalCategory,
  PlanningGoalId,
  PlanningBoard,
  PlanningBoardId,
  PlanningBoardScopeType,
  PlanningLink,
  PlanningSource,
  PlanningTask,
  PlanningTaskId,
} from "../../domain/planning/Planning";

export interface PlanningRepository {
  getLocation(farmId: FarmId, id: FarmLocationId): Promise<FarmLocation | null>;
  saveBoard(board: PlanningBoard): Promise<void>;
  getBoard(farmId: FarmId, id: PlanningBoardId): Promise<PlanningBoard | null>;
  listBoards(farmId: FarmId, filters?: { scopeType?: PlanningBoardScopeType; goalId?: PlanningGoalId | null }): Promise<PlanningBoard[]>;
  saveGoal(goal: PlanningGoal): Promise<void>;
  getGoal(farmId: FarmId, id: PlanningGoalId): Promise<PlanningGoal | null>;
  listGoals(farmId: FarmId, filters?: { category?: PlanningGoalCategory; source?: PlanningSource; parentGoalId?: PlanningGoalId | null }): Promise<PlanningGoal[]>;
  saveTask(task: PlanningTask): Promise<void>;
  getTask(farmId: FarmId, id: PlanningTaskId): Promise<PlanningTask | null>;
  listTasks(farmId: FarmId, filters?: { goalId?: PlanningGoalId; source?: PlanningSource; assignedFarmhandId?: FarmhandId }): Promise<PlanningTask[]>;
  saveLink(link: PlanningLink): Promise<void>;
  listLinks(farmId: FarmId, filters?: { goalId?: PlanningGoalId; taskId?: PlanningTaskId }): Promise<PlanningLink[]>;
}
