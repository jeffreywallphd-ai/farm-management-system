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
    });
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
