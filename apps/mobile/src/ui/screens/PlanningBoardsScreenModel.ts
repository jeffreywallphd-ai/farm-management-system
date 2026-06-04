import type { FarmLocation } from "../../domain/farm/FarmLocation";
import type { FarmhandId } from "../../domain/farmhand/Farmhand";
import type { PlanningBoard, PlanningGoal, PlanningLink, PlanningTask, PlanningTaskStatus } from "../../domain/planning/Planning";
import { selectTasksForBoard } from "../../application/use-cases/manage-planning/ListPlanning";
import { buildFarmPlacePath } from "../farmPlaceDisplay";

export type BoardColumnStatus = Exclude<PlanningTaskStatus, "canceled">;

export const BOARD_COLUMN_STATUSES: BoardColumnStatus[] = ["notStarted", "inProgress", "blocked", "done"];
export const BOARD_COLUMN_FILTERS = ["allIncomplete", "allWorkable", ...BOARD_COLUMN_STATUSES] as const;

export type BoardColumnFilter = (typeof BOARD_COLUMN_FILTERS)[number];

export const BOARD_COLUMN_FILTER_LABELS: Record<BoardColumnFilter, string> = {
  allIncomplete: "All Incomplete",
  allWorkable: "All Workable",
  notStarted: "Not started",
  inProgress: "In progress",
  blocked: "Blocked",
  done: "Done",
};

const BOARD_COLUMN_FILTER_STATUSES: Record<BoardColumnFilter, PlanningTaskStatus[]> = {
  allIncomplete: ["notStarted", "inProgress", "blocked"],
  allWorkable: ["notStarted", "inProgress"],
  notStarted: ["notStarted"],
  inProgress: ["inProgress"],
  blocked: ["blocked"],
  done: ["done"],
};

export function selectBoardColumnTasks(tasks: PlanningTask[], filter: BoardColumnFilter): PlanningTask[] {
  const statuses = BOARD_COLUMN_FILTER_STATUSES[filter];
  return tasks
    .filter((task) => statuses.includes(task.status))
    .sort((left, right) => {
      const dueDateOrder = (left.dueDate ?? "9999-99-99").localeCompare(right.dueDate ?? "9999-99-99");
      return dueDateOrder || left.sortOrder - right.sortOrder || right.updatedAt.localeCompare(left.updatedAt);
    });
}

export function selectBoardTasksForFarmhand(
  board: PlanningBoard,
  goals: PlanningGoal[],
  tasks: PlanningTask[],
  farmhandId: FarmhandId | "all",
): PlanningTask[] {
  const boardTasks = selectTasksForBoard(board, goals, tasks);
  if (farmhandId === "all") {
    return boardTasks;
  }

  return boardTasks.filter((task) => task.assignedFarmhandId === farmhandId);
}

export function selectBoardsForFarmhand(
  boards: PlanningBoard[],
  goals: PlanningGoal[],
  tasks: PlanningTask[],
  farmhandId: FarmhandId | "all",
): PlanningBoard[] {
  if (farmhandId === "all") {
    return boards;
  }

  return boards.filter((board) => selectBoardTasksForFarmhand(board, goals, tasks, farmhandId).length > 0);
}

export function countFarmNoteLinksByTask(links: PlanningLink[]): Record<string, number> {
  return links.reduce<Record<string, number>>((counts, link) => {
    if (link.taskId && link.linkedRecordType === "farmNote") {
      counts[link.taskId] = (counts[link.taskId] ?? 0) + 1;
    }
    return counts;
  }, {});
}

export function isWipLimitExceeded(tasks: PlanningTask[], filter: BoardColumnFilter, wipLimit?: number): boolean {
  if (!wipLimit || filter === "done" || filter === "allIncomplete" || filter === "allWorkable") {
    return false;
  }

  return selectBoardColumnTasks(tasks, filter).length > wipLimit;
}

export function describeBoardTask(task: PlanningTask, locations: FarmLocation[]) {
  return {
    description: task.notes?.trim() || "No description yet",
    place: buildFarmPlacePath(locations, task.placeId) ?? "No place set",
    targetCompletionDate: task.dueDate ?? "No target completion date set",
  };
}
