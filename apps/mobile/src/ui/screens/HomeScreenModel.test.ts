import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { PlanningTask } from "../../domain/planning/Planning";
import { summarizeHomeTaskCounts } from "./HomeScreenModel";

describe("HomeScreenModel", () => {
  it("counts workable and blocked tasks across all planning tasks", () => {
    const summary = summarizeHomeTaskCounts([
      makeTask({ id: "not-started", status: "notStarted" }),
      makeTask({ id: "in-progress", status: "inProgress" }),
      makeTask({ id: "blocked", status: "blocked" }),
      makeTask({ id: "done", status: "done" }),
      makeTask({ id: "canceled", status: "canceled" }),
    ]);

    assert.deepEqual(summary, {
      blockedTasks: 1,
      workableTasks: 2,
      workableThisWeekTasks: 0,
    });
  });

  it("counts workable tasks due during the current farm week", () => {
    const summary = summarizeHomeTaskCounts([
      makeTask({ id: "week-start", status: "notStarted", dueDate: "2026-06-01" }),
      makeTask({ id: "week-end", status: "inProgress", dueDate: "2026-06-07" }),
      makeTask({ id: "blocked-this-week", status: "blocked", dueDate: "2026-06-04" }),
      makeTask({ id: "next-week", status: "notStarted", dueDate: "2026-06-08" }),
      makeTask({ id: "no-date", status: "notStarted" }),
    ], { today: "2026-06-04", weekStartsOn: 1 });

    assert.equal(summary.workableThisWeekTasks, 2);
  });
});

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
