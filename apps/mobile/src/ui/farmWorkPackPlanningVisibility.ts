import { getFarmWorkPackIdForTemplateKey, type FarmWorkPackId } from "../application/use-cases/manage-planning/DefaultFarmWorkPacks";
import type { PlanningGoal, PlanningTask } from "../domain/planning/Planning";

export function filterPlanningForActiveFarmWorkPacks(
  goals: PlanningGoal[],
  tasks: PlanningTask[],
  inactivePackIds: FarmWorkPackId[],
  inactiveTemplateKeys: string[] = [],
): { goals: PlanningGoal[]; tasks: PlanningTask[] } {
  if (!inactivePackIds.length && !inactiveTemplateKeys.length) {
    return { goals, tasks };
  }

  const inactivePackIdSet = new Set(inactivePackIds);
  const inactiveTemplateKeySet = new Set(inactiveTemplateKeys);
  const visibleGoalCandidates = goals.filter((goal) => {
    const packId = getFarmWorkPackIdForTemplateKey(goal.templateKey);
    if (packId && inactivePackIdSet.has(packId)) {
      return false;
    }

    return !goal.templateKey || !inactiveTemplateKeySet.has(goal.templateKey);
  });
  const visibleGoalIds = new Set(visibleGoalCandidates.map((goal) => goal.id));
  let changed = true;

  while (changed) {
    changed = false;
    for (const goal of visibleGoalCandidates) {
      if (goal.parentGoalId && !visibleGoalIds.has(goal.parentGoalId) && visibleGoalIds.delete(goal.id)) {
        changed = true;
      }
    }
  }

  const visibleGoals = visibleGoalCandidates.filter((goal) => visibleGoalIds.has(goal.id));

  return {
    goals: visibleGoals,
    tasks: tasks.filter((task) => {
      const packId = getFarmWorkPackIdForTemplateKey(task.templateKey);
      if (packId && inactivePackIdSet.has(packId)) {
        return false;
      }
      if (task.templateKey && inactiveTemplateKeySet.has(task.templateKey)) {
        return false;
      }

      return !task.goalId || visibleGoalIds.has(task.goalId);
    }),
  };
}
