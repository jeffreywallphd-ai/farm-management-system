import type { FarmId } from "../../../domain/farm/Farm";
import type { PlanningBoard, PlanningBoardId, PlanningGoal, PlanningLink, PlanningTask } from "../../../domain/planning/Planning";
import type { PlanningRepository } from "../../ports/PlanningRepository";

export interface PlanningGoalView {
  goal: PlanningGoal;
  childGoals: PlanningGoal[];
  tasks: PlanningTask[];
}

export interface PlanningOverview {
  goals: PlanningGoal[];
  rootGoals: PlanningGoal[];
  boards: PlanningBoard[];
  tasks: PlanningTask[];
  openTasks: PlanningTask[];
}

export interface PlanningBoardOverview {
  board: PlanningBoard;
  goals: PlanningGoal[];
  tasks: PlanningTask[];
  links: PlanningLink[];
}

export async function getPlanningOverview(
  input: { farmId: FarmId },
  dependencies: { repository: PlanningRepository },
): Promise<PlanningOverview> {
  const [goals, boards, tasks] = await Promise.all([
    dependencies.repository.listGoals(input.farmId),
    dependencies.repository.listBoards(input.farmId),
    dependencies.repository.listTasks(input.farmId),
  ]);

  return {
    goals,
    rootGoals: goals.filter((goal) => !goal.parentGoalId),
    boards,
    tasks,
    openTasks: tasks.filter((task) => task.status !== "done" && task.status !== "canceled"),
  };
}

export async function getPlanningBoardOverview(
  input: { farmId: FarmId; boardId: PlanningBoardId },
  dependencies: { repository: PlanningRepository },
): Promise<PlanningBoardOverview> {
  const board = await dependencies.repository.getBoard(input.farmId, input.boardId);
  if (!board) {
    throw new Error("Planning board does not exist on this farm.");
  }

  const [goals, allTasks, links] = await Promise.all([
    dependencies.repository.listGoals(input.farmId),
    dependencies.repository.listTasks(input.farmId),
    dependencies.repository.listLinks(input.farmId),
  ]);
  return {
    board,
    goals,
    tasks: selectTasksForBoard(board, goals, allTasks),
    links,
  };
}

export function selectTasksForBoard(board: PlanningBoard, goals: PlanningGoal[], tasks: PlanningTask[]): PlanningTask[] {
  if (board.scopeType === "nonGoalTasks") {
    return tasks.filter((task) => !task.goalId);
  }

  if (!board.goalId) {
    return [];
  }

  const goalIds = new Set(collectGoalIds(board.goalId, goals));
  return tasks.filter((task) => task.goalId && goalIds.has(task.goalId));
}

export async function getPlanningGoalViews(
  input: { farmId: FarmId; category?: PlanningGoal["category"]; source?: PlanningGoal["source"] },
  dependencies: { repository: PlanningRepository },
): Promise<PlanningGoalView[]> {
  const [goals, tasks] = await Promise.all([
    dependencies.repository.listGoals(input.farmId, { category: input.category, source: input.source }),
    dependencies.repository.listTasks(input.farmId, { source: input.source }),
  ]);

  return goals
    .filter((goal) => !goal.parentGoalId)
    .map((goal) => ({
      goal,
      childGoals: goals.filter((candidate) => candidate.parentGoalId === goal.id),
      tasks: tasks.filter((task) => task.goalId === goal.id),
    }));
}

function collectGoalIds(rootGoalId: string, goals: PlanningGoal[]): string[] {
  const collected: string[] = [];
  const visit = (goalId: string, seen: Set<string>) => {
    if (seen.has(goalId)) return;
    const goal = goals.find((candidate) => candidate.id === goalId);
    if (!goal) return;
    seen.add(goalId);
    collected.push(goalId);
    goals.filter((candidate) => candidate.parentGoalId === goalId).forEach((child) => visit(child.id, seen));
  };
  visit(rootGoalId, new Set());
  return collected;
}
