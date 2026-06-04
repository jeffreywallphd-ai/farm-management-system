import assert from "node:assert/strict";
import test from "node:test";

import type { Farmhand } from "../../domain/farmhand/Farmhand";
import type { PlanningBoard, PlanningGoal, PlanningLink, PlanningTask } from "../../domain/planning/Planning";
import {
  buildTaskAssignmentOptions,
  countFarmNoteLinksByTask,
  describeBoardTask,
  describeBoardTaskSummary,
  isWipLimitExceeded,
  selectBoardColumnTasks,
  selectBoardsForFarmhand,
  selectBoardTasksForFarmhand,
} from "./PlanningBoardsScreenModel";

const baseTask = {
  farmId: "farm-1",
  priority: "normal",
  source: "farmer",
  sortOrder: 0,
  createdAt: "2026-06-02T10:00:00.000Z",
  updatedAt: "2026-06-02T10:00:00.000Z",
} as const;

test("board column tasks filter and sort by due date", () => {
  const tasks: PlanningTask[] = [
    { ...baseTask, id: "task-1", title: "Later", status: "notStarted", dueDate: "2026-06-20" },
    { ...baseTask, id: "task-2", title: "Sooner", status: "notStarted", dueDate: "2026-06-05" },
    { ...baseTask, id: "task-3", title: "Other", status: "blocked" },
  ];

  assert.deepEqual(selectBoardColumnTasks(tasks, "notStarted").map((task) => task.id), ["task-2", "task-1"]);
  assert.deepEqual(selectBoardColumnTasks(tasks, "allIncomplete").map((task) => task.id), ["task-2", "task-1", "task-3"]);
  assert.deepEqual(selectBoardColumnTasks(tasks, "allWorkable").map((task) => task.id), ["task-2", "task-1"]);
});

test("board model counts farm-note links by task", () => {
  const links: PlanningLink[] = [
    { id: "link-1", farmId: "farm-1", taskId: "task-1", linkedRecordType: "farmNote", linkedRecordId: "event-1", createdAt: "2026-06-02T10:00:00.000Z" },
    { id: "link-2", farmId: "farm-1", taskId: "task-1", linkedRecordType: "farmNote", linkedRecordId: "event-2", createdAt: "2026-06-02T10:00:00.000Z" },
    { id: "link-3", farmId: "farm-1", taskId: "task-1", linkedRecordType: "farmPlace", linkedRecordId: "place-1", createdAt: "2026-06-02T10:00:00.000Z" },
  ];

  assert.deepEqual(countFarmNoteLinksByTask(links), { "task-1": 2 });
});

test("board task summary names priority and linked farm events", () => {
  const task: PlanningTask = {
    ...baseTask,
    id: "task-1",
    title: "Seed carrots",
    status: "notStarted",
    priority: "high",
  };

  assert.equal(describeBoardTaskSummary(task, 0), "High priority");
  assert.equal(describeBoardTaskSummary(task, 1), "High priority - 1 linked farm event");
  assert.equal(describeBoardTaskSummary(task, 2), "High priority - 2 linked farm events");
});

test("board task details include description, place path, and target completion date", () => {
  const locations = [
    { id: "field-1", farmId: "farm-1", name: "North Field", kind: "field", createdAt: baseTask.createdAt },
    { id: "bed-1", farmId: "farm-1", parentId: "field-1", name: "Bed 1", kind: "bed", createdAt: baseTask.updatedAt },
  ] as const;
  const task: PlanningTask = {
    ...baseTask,
    id: "task-1",
    title: "Seed carrots",
    notes: "Seed the west half before rain.",
    placeId: "bed-1",
    status: "notStarted",
    dueDate: "2026-06-05",
  };

  assert.deepEqual(describeBoardTask(task, [...locations]), {
    description: "Seed the west half before rain.",
    place: "North Field > Bed 1",
    targetCompletionDate: "2026-06-05",
  });
});

test("board task details use farmer-readable placeholders when optional context is missing", () => {
  const task: PlanningTask = {
    ...baseTask,
    id: "task-1",
    title: "Seed carrots",
    status: "notStarted",
  };

  assert.deepEqual(describeBoardTask(task, []), {
    description: "No description yet",
    place: "No place set",
    targetCompletionDate: "No target completion date set",
  });
});

test("wip warning ignores done work and fires for crowded active columns", () => {
  const tasks: PlanningTask[] = [
    { ...baseTask, id: "task-1", title: "One", status: "inProgress" },
    { ...baseTask, id: "task-2", title: "Two", status: "inProgress" },
  ];

  assert.equal(isWipLimitExceeded(tasks, "inProgress", 1), true);
  assert.equal(isWipLimitExceeded(tasks, "done", 1), false);
  assert.equal(isWipLimitExceeded(tasks, "inProgress"), false);
});

test("board farmhand filter keeps only boards with work assigned to the selected farmhand", () => {
  const boards: PlanningBoard[] = [
    { id: "board-1", farmId: "farm-1", title: "Greenhouse", scopeType: "goal", goalId: "goal-1", createdAt: baseTask.createdAt, updatedAt: baseTask.updatedAt },
    { id: "board-2", farmId: "farm-1", title: "Non-goal farm work", scopeType: "nonGoalTasks", createdAt: baseTask.createdAt, updatedAt: baseTask.updatedAt },
    { id: "board-3", farmId: "farm-1", title: "Retired certification goal", scopeType: "goal", goalId: "missing-goal", createdAt: baseTask.createdAt, updatedAt: baseTask.updatedAt },
  ];
  const goals: PlanningGoal[] = [
    { id: "goal-1", farmId: "farm-1", title: "Greenhouse", category: "general", status: "planned", source: "farmer", sortOrder: 0, createdAt: baseTask.createdAt, updatedAt: baseTask.updatedAt },
    { id: "goal-2", farmId: "farm-1", parentGoalId: "goal-1", title: "Seedlings", category: "general", status: "planned", source: "farmer", sortOrder: 1, createdAt: baseTask.createdAt, updatedAt: baseTask.updatedAt },
  ];
  const tasks: PlanningTask[] = [
    { ...baseTask, id: "task-1", goalId: "goal-2", title: "Water seedlings", status: "notStarted", assignedFarmhandId: "farmhand-1" },
    { ...baseTask, id: "task-2", title: "Wash crates", status: "notStarted", assignedFarmhandId: "farmhand-2" },
    { ...baseTask, id: "task-3", title: "Sharpen hoes", status: "notStarted" },
  ];

  assert.deepEqual(selectBoardsForFarmhand(boards, goals, tasks, "farmhand-1").map((board) => board.id), ["board-1"]);
  assert.deepEqual(selectBoardTasksForFarmhand(boards[0]!, goals, tasks, "farmhand-1").map((task) => task.id), ["task-1"]);
  assert.deepEqual(selectBoardsForFarmhand(boards, goals, tasks, "farmhand-2").map((board) => board.id), ["board-2"]);
  assert.deepEqual(selectBoardsForFarmhand(boards, goals, tasks, "all").map((board) => board.id), ["board-1", "board-2"]);
});

test("board selector hides non-goal board when there are no non-goal tasks", () => {
  const boards: PlanningBoard[] = [
    { id: "board-1", farmId: "farm-1", title: "Greenhouse", scopeType: "goal", goalId: "goal-1", createdAt: baseTask.createdAt, updatedAt: baseTask.updatedAt },
    { id: "board-2", farmId: "farm-1", title: "Non-goal farm work", scopeType: "nonGoalTasks", createdAt: baseTask.createdAt, updatedAt: baseTask.updatedAt },
  ];
  const goals: PlanningGoal[] = [
    { id: "goal-1", farmId: "farm-1", title: "Greenhouse", category: "general", status: "planned", source: "farmer", sortOrder: 0, createdAt: baseTask.createdAt, updatedAt: baseTask.updatedAt },
  ];
  const tasks: PlanningTask[] = [
    { ...baseTask, id: "task-1", goalId: "goal-1", title: "Water seedlings", status: "notStarted" },
  ];

  assert.deepEqual(selectBoardsForFarmhand(boards, goals, tasks, "all").map((board) => board.id), ["board-1"]);
});

test("task assignment options include unassigned and preserve inactive farmhand context", () => {
  const farmhands: Farmhand[] = [
    { id: "farmhand-1", farmId: "farm-1", name: "Ana", status: "active", createdAt: baseTask.createdAt, updatedAt: baseTask.updatedAt },
    { id: "farmhand-2", farmId: "farm-1", name: "Lee", status: "inactive", createdAt: baseTask.createdAt, updatedAt: baseTask.updatedAt },
  ];

  assert.deepEqual(buildTaskAssignmentOptions(farmhands), [
    { label: "Unassigned", value: "" },
    { label: "Ana", value: "farmhand-1" },
    { label: "Lee (inactive)", value: "farmhand-2" },
  ]);
});
