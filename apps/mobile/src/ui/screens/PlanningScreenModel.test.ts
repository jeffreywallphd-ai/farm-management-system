import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { PlanningGoal, PlanningTask } from "../../domain/planning/Planning";
import {
  collectGoalTree,
  findRootGoalId,
  selectFocusedGoalScope,
  selectPlanningReviewLists,
} from "./PlanningScreenModel";

describe("PlanningScreenModel", () => {
  it("separates root goals from non-goal tasks for review mode", () => {
    const goals = [
      makeGoal({ id: "goal-a", title: "Goal A" }),
      makeGoal({ id: "subgoal-a", parentGoalId: "goal-a", title: "Subgoal A" }),
      makeGoal({ id: "goal-b", title: "Goal B" }),
    ];
    const tasks = [
      makeTask({ id: "task-standalone", title: "Standalone task" }),
      makeTask({ goalId: "goal-a", id: "task-goal-a", title: "Goal task" }),
    ];

    const reviewLists = selectPlanningReviewLists(goals, tasks);

    assert.deepEqual(reviewLists.rootGoals.map((goal) => goal.id), ["goal-a", "goal-b"]);
    assert.deepEqual(reviewLists.nonGoalTasks.map((task) => task.id), ["task-standalone"]);
  });

  it("scopes goal-with-tasks mode to the selected highest-level goal tree", () => {
    const goals = [
      makeGoal({ id: "root-a", title: "Root A" }),
      makeGoal({ id: "sub-a", parentGoalId: "root-a", title: "Sub A" }),
      makeGoal({ id: "root-b", title: "Root B" }),
    ];
    const tasks = [
      makeTask({ goalId: "root-a", id: "task-root-a", title: "Root A task" }),
      makeTask({ goalId: "sub-a", id: "task-sub-a", title: "Sub A task" }),
      makeTask({ goalId: "root-b", id: "task-root-b", title: "Root B task" }),
      makeTask({ id: "task-standalone", title: "Standalone task" }),
    ];

    const scope = selectFocusedGoalScope("root-a", goals, tasks);

    assert.deepEqual(scope.focusedGoals.map((goal) => goal.id), ["root-a", "sub-a"]);
    assert.deepEqual(scope.focusedTasks.map((task) => task.id), ["task-root-a", "task-sub-a"]);
    assert.deepEqual(scope.taskGoalOptions.map((option) => option.value), ["root-a", "sub-a"]);
  });

  it("keeps parent options inside the focused tree and removes invalid descendants", () => {
    const goals = [
      makeGoal({ id: "root", title: "Root" }),
      makeGoal({ id: "child", parentGoalId: "root", title: "Child" }),
      makeGoal({ id: "grandchild", parentGoalId: "child", title: "Grandchild" }),
      makeGoal({ id: "other-root", title: "Other root" }),
    ];

    const scope = selectFocusedGoalScope("root", goals, [], "child");

    assert.deepEqual(scope.parentGoalOptions.map((option) => option.value), ["root"]);
  });

  it("finds the root goal for nested edits", () => {
    const goals = [
      makeGoal({ id: "root", title: "Root" }),
      makeGoal({ id: "child", parentGoalId: "root", title: "Child" }),
      makeGoal({ id: "grandchild", parentGoalId: "child", title: "Grandchild" }),
    ];

    assert.equal(findRootGoalId(goals[2], goals), "root");
    assert.deepEqual(collectGoalTree("root", goals).map((goal) => goal.id), ["root", "child", "grandchild"]);
  });
});

function makeGoal(overrides: Partial<PlanningGoal>): PlanningGoal {
  return {
    category: "general",
    createdAt: "2026-01-01T00:00:00.000Z",
    farmId: "farm-1",
    id: "goal",
    sortOrder: 0,
    source: "farmer",
    status: "planned",
    title: "Goal",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeTask(overrides: Partial<PlanningTask>): PlanningTask {
  return {
    createdAt: "2026-01-01T00:00:00.000Z",
    farmId: "farm-1",
    id: "task",
    priority: "normal",
    sortOrder: 0,
    source: "farmer",
    status: "notStarted",
    title: "Task",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}
