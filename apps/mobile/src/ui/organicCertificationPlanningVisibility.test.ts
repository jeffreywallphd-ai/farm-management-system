import assert from "node:assert/strict";
import test from "node:test";

import type { OrganicOperationProfile } from "../domain/organic/OrganicCertification";
import type { PlanningGoal, PlanningTask } from "../domain/planning/Planning";
import {
  filterPlanningForOrganicCertificationPursuit,
  isOrganicCertificationPursuitActive,
} from "./organicCertificationPlanningVisibility";

const timestamp = "2026-06-04T10:00:00.000Z";

test("organic certification pursuit is active only for enabled profile states", () => {
  assert.equal(isOrganicCertificationPursuitActive(null), false);
  assert.equal(isOrganicCertificationPursuitActive(makeProfile({ organicStatus: "notOrganic" })), false);
  assert.equal(isOrganicCertificationPursuitActive(makeProfile({ organicStatus: "transitioning" })), true);
  assert.equal(isOrganicCertificationPursuitActive(makeProfile({ organicStatus: "certified" })), true);
});

test("planning filter hides certification goal trees and tasks when pursuit is off", () => {
  const goals: PlanningGoal[] = [
    makeGoal({ id: "goal-admin", title: "Certification administration", category: "organicCertification", source: "organicCertificationTemplate" }),
    makeGoal({ id: "sub-admin", parentGoalId: "goal-admin", title: "Records", category: "organicCertification", source: "organicCertificationTemplate" }),
    makeGoal({ id: "sub-admin-child", parentGoalId: "sub-admin", title: "Audit trail", category: "organicCertification", source: "organicCertificationTemplate" }),
    makeGoal({ id: "goal-farm", title: "Certification farm work", category: "organicCertification", source: "organicCertificationTemplate" }),
    makeGoal({ id: "goal-general", title: "Greenhouse repairs" }),
  ];
  const tasks: PlanningTask[] = [
    makeTask({ id: "task-admin", goalId: "sub-admin", title: "Collect records", source: "organicCertificationTemplate" }),
    makeTask({ id: "task-farm", goalId: "goal-farm", title: "Check compost temperature", source: "organicCertificationTemplate" }),
    makeTask({ id: "task-general", goalId: "goal-general", title: "Fix vent" }),
    makeTask({ id: "task-standalone", title: "Sharpen hoes" }),
  ];

  const filtered = filterPlanningForOrganicCertificationPursuit(goals, tasks, false);

  assert.deepEqual(filtered.goals.map((goal) => goal.id), ["goal-general"]);
  assert.deepEqual(filtered.tasks.map((task) => task.id), ["task-general", "task-standalone"]);
});

test("planning filter leaves certification records visible when pursuit is on", () => {
  const goals = [
    makeGoal({ id: "goal-admin", category: "organicCertification", source: "organicCertificationTemplate" }),
    makeGoal({ id: "goal-general" }),
  ];
  const tasks = [
    makeTask({ id: "task-admin", goalId: "goal-admin", source: "organicCertificationTemplate" }),
    makeTask({ id: "task-general", goalId: "goal-general" }),
  ];

  const filtered = filterPlanningForOrganicCertificationPursuit(goals, tasks, true);

  assert.deepEqual(filtered.goals.map((goal) => goal.id), ["goal-admin", "goal-general"]);
  assert.deepEqual(filtered.tasks.map((task) => task.id), ["task-admin", "task-general"]);
});

function makeProfile(overrides: Partial<OrganicOperationProfile>): OrganicOperationProfile {
  return {
    createdAt: timestamp,
    farmId: "farm-1",
    id: "profile-1",
    organicStatus: "transitioning",
    recordRetentionYears: 5,
    updatedAt: timestamp,
    ...overrides,
  };
}

function makeGoal(overrides: Partial<PlanningGoal>): PlanningGoal {
  return {
    category: "general",
    createdAt: timestamp,
    farmId: "farm-1",
    id: "goal",
    sortOrder: 0,
    source: "farmer",
    status: "planned",
    title: "Goal",
    updatedAt: timestamp,
    ...overrides,
  };
}

function makeTask(overrides: Partial<PlanningTask>): PlanningTask {
  return {
    createdAt: timestamp,
    farmId: "farm-1",
    id: "task",
    priority: "normal",
    sortOrder: 0,
    source: "farmer",
    status: "notStarted",
    title: "Task",
    updatedAt: timestamp,
    ...overrides,
  };
}
