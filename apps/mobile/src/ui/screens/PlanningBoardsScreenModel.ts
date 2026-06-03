import type { PlanningLink, PlanningTask, PlanningTaskStatus } from "../../domain/planning/Planning";

export const BOARD_COLUMN_STATUSES: PlanningTaskStatus[] = ["notStarted", "ready", "inProgress", "blocked", "done"];

export function selectBoardColumnTasks(tasks: PlanningTask[], status: PlanningTaskStatus): PlanningTask[] {
  return tasks
    .filter((task) => task.status === status)
    .sort((left, right) => {
      const dueDateOrder = (left.dueDate ?? "9999-99-99").localeCompare(right.dueDate ?? "9999-99-99");
      return dueDateOrder || left.sortOrder - right.sortOrder || right.updatedAt.localeCompare(left.updatedAt);
    });
}

export function countFarmNoteLinksByTask(links: PlanningLink[]): Record<string, number> {
  return links.reduce<Record<string, number>>((counts, link) => {
    if (link.taskId && link.linkedRecordType === "farmNote") {
      counts[link.taskId] = (counts[link.taskId] ?? 0) + 1;
    }
    return counts;
  }, {});
}

export function isWipLimitExceeded(tasks: PlanningTask[], status: PlanningTaskStatus, wipLimit?: number): boolean {
  if (!wipLimit || status === "done" || status === "canceled") {
    return false;
  }

  return selectBoardColumnTasks(tasks, status).length > wipLimit;
}
