import type { OrganicOperationProfile } from "../domain/organic/OrganicCertification";
import type { PlanningGoal, PlanningTask } from "../domain/planning/Planning";

export function isOrganicCertificationPursuitActive(profile?: OrganicOperationProfile | null): boolean {
  return Boolean(profile && profile.organicStatus !== "notOrganic");
}

export function filterPlanningForOrganicCertificationPursuit(
  goals: PlanningGoal[],
  tasks: PlanningTask[],
  isPursuitActive: boolean,
): { goals: PlanningGoal[]; tasks: PlanningTask[] } {
  if (isPursuitActive) {
    return { goals, tasks };
  }

  const hiddenGoalIds = collectCertificationPlanningGoalIds(goals);

  return {
    goals: goals.filter((goal) => !hiddenGoalIds.has(goal.id)),
    tasks: tasks.filter((task) => !isCertificationPlanningTask(task) && (!task.goalId || !hiddenGoalIds.has(task.goalId))),
  };
}

function collectCertificationPlanningGoalIds(goals: PlanningGoal[]): Set<string> {
  const hiddenGoalIds = new Set(
    goals
      .filter(isCertificationPlanningGoal)
      .map((goal) => goal.id),
  );
  let addedChild = true;

  while (addedChild) {
    addedChild = false;
    for (const goal of goals) {
      if (goal.parentGoalId && hiddenGoalIds.has(goal.parentGoalId) && !hiddenGoalIds.has(goal.id)) {
        hiddenGoalIds.add(goal.id);
        addedChild = true;
      }
    }
  }

  return hiddenGoalIds;
}

function isCertificationPlanningGoal(goal: PlanningGoal): boolean {
  return (
    goal.category === "organicCertification" ||
    goal.source === "organicCertificationTemplate" ||
    goal.source === "organicCertification" ||
    goal.templateKey?.startsWith("organicCertification:") === true
  );
}

function isCertificationPlanningTask(task: PlanningTask): boolean {
  return (
    task.source === "organicCertificationTemplate" ||
    task.source === "organicCertification" ||
    task.templateKey?.startsWith("organicCertification:") === true
  );
}
