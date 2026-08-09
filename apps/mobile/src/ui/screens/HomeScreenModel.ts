import type { PlanningTask } from "../../domain/planning/Planning";
import { weekRangeFor, type WeekStartsOn } from "../../application/use-cases/manage-farmhands/ListFarmhandWork";
import { formatDateInput } from "../components/DateFieldModel";
import { selectBoardColumnTasks } from "./PlanningBoardsScreenModel";

export function summarizeHomeTaskCounts(
  tasks: PlanningTask[],
  options: { today?: string; weekStartsOn?: WeekStartsOn } = {},
) {
  const workableTasks = selectBoardColumnTasks(tasks, "allWorkable");
  const today = options.today ?? formatDateInput(new Date());
  const { dateFrom, dateTo } = weekRangeFor(today, options.weekStartsOn ?? 1);

  return {
    blockedTasks: selectBoardColumnTasks(tasks, "blocked").length,
    workableTasks: workableTasks.length,
    workableThisWeekTasks: workableTasks.filter((task) => task.dueDate && task.dueDate >= dateFrom && task.dueDate <= dateTo).length,
  };
}
