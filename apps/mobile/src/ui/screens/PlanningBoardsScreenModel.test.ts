import assert from "node:assert/strict";
import test from "node:test";

import type { PlanningLink, PlanningTask } from "../../domain/planning/Planning";
import { countFarmNoteLinksByTask, isWipLimitExceeded, selectBoardColumnTasks } from "./PlanningBoardsScreenModel";

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
    { ...baseTask, id: "task-1", title: "Later", status: "ready", dueDate: "2026-06-20" },
    { ...baseTask, id: "task-2", title: "Sooner", status: "ready", dueDate: "2026-06-05" },
    { ...baseTask, id: "task-3", title: "Other", status: "blocked" },
  ];

  assert.deepEqual(selectBoardColumnTasks(tasks, "ready").map((task) => task.id), ["task-2", "task-1"]);
});

test("board model counts farm-note links by task", () => {
  const links: PlanningLink[] = [
    { id: "link-1", farmId: "farm-1", taskId: "task-1", linkedRecordType: "farmNote", linkedRecordId: "event-1", createdAt: "2026-06-02T10:00:00.000Z" },
    { id: "link-2", farmId: "farm-1", taskId: "task-1", linkedRecordType: "farmNote", linkedRecordId: "event-2", createdAt: "2026-06-02T10:00:00.000Z" },
    { id: "link-3", farmId: "farm-1", taskId: "task-1", linkedRecordType: "farmPlace", linkedRecordId: "place-1", createdAt: "2026-06-02T10:00:00.000Z" },
  ];

  assert.deepEqual(countFarmNoteLinksByTask(links), { "task-1": 2 });
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
