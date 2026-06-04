import type { PlanningGoal, PlanningTask } from "../../domain/planning/Planning";

export type PlanningMode = "createGoal" | "singleTask" | "review";

export function getPlanningEditScrollY(itemY: number, topPadding: number): number {
  return Math.max(0, itemY - topPadding);
}

export function selectPlanningReviewLists(goals: PlanningGoal[], tasks: PlanningTask[]) {
  return {
    rootGoals: goals.filter((goal) => !goal.parentGoalId),
    nonGoalTasks: tasks.filter((task) => !task.goalId),
  };
}

export function selectFocusedGoalScope(
  rootGoalId: string,
  goals: PlanningGoal[],
  tasks: PlanningTask[],
  editingGoalId = "",
) {
  const focusedGoals = rootGoalId ? collectGoalTree(rootGoalId, goals) : [];
  const focusedTasks = focusedGoals.length
    ? tasks.filter((task) => task.goalId && focusedGoals.some((goal) => goal.id === task.goalId))
    : [];

  return {
    focusedGoals,
    focusedRootGoal: rootGoalId ? goals.find((goal) => goal.id === rootGoalId) : undefined,
    focusedTasks,
    parentGoalOptions: focusedGoals
      .filter((goal) => goal.id !== editingGoalId && !isDescendantGoal(goal.id, editingGoalId, goals))
      .map((goal) => ({ label: goal.title, value: goal.id })),
    taskGoalOptions: focusedGoals.map((goal) => ({ label: goal.title, value: goal.id })),
  };
}

export function collectGoalTree(rootGoalId: string, goals: PlanningGoal[]): PlanningGoal[] {
  const collected: PlanningGoal[] = [];
  const visit = (goalId: string, seen: Set<string>) => {
    if (seen.has(goalId)) return;
    const goal = goals.find((candidate) => candidate.id === goalId);
    if (!goal) return;
    seen.add(goalId);
    collected.push(goal);
    goals.filter((candidate) => candidate.parentGoalId === goalId).forEach((child) => visit(child.id, seen));
  };
  visit(rootGoalId, new Set());
  return collected;
}

export function findRootGoalId(goal: PlanningGoal, goals: PlanningGoal[]): string {
  let cursor = goal;
  const seen = new Set<string>();
  while (cursor.parentGoalId && !seen.has(cursor.id)) {
    seen.add(cursor.id);
    const parent = goals.find((candidate) => candidate.id === cursor.parentGoalId);
    if (!parent) break;
    cursor = parent;
  }
  return cursor.id;
}

export function isDescendantGoal(candidateGoalId: string, ancestorGoalId: string, goals: PlanningGoal[]): boolean {
  if (!ancestorGoalId) {
    return false;
  }
  let cursor = goals.find((goal) => goal.id === candidateGoalId);
  const seen = new Set<string>();
  while (cursor?.parentGoalId && !seen.has(cursor.id)) {
    seen.add(cursor.id);
    if (cursor.parentGoalId === ancestorGoalId) {
      return true;
    }
    cursor = goals.find((goal) => goal.id === cursor?.parentGoalId);
  }
  return false;
}
