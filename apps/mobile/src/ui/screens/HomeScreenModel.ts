import type { PlanningTask } from "../../domain/planning/Planning";
import { selectBoardColumnTasks } from "./PlanningBoardsScreenModel";

export function summarizeHomeTaskCounts(tasks: PlanningTask[]) {
  return {
    blockedTasks: selectBoardColumnTasks(tasks, "blocked").length,
    workableTasks: selectBoardColumnTasks(tasks, "allWorkable").length,
  };
}
