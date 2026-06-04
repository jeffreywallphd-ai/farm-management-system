import assert from "node:assert/strict";
import test from "node:test";

import { ensureOrganicCertificationPlan } from "../../application/use-cases/manage-planning/CreateOrganicCertificationPlan";
import type { PlanningTask } from "../../domain/planning/Planning";
import { InMemoryPlanningRepository } from "../../testing/fakes/InMemoryPlanningRepository";
import { getOrganicCertificationTaskRequirementExplanation } from "./OrganicCertificationTaskRequirementModel";

const farm = {
  id: "farm-1",
  name: "Organic Requirement Farm",
  createdAt: "2026-06-02T10:00:00.000Z",
};

function dependencies() {
  let nextId = 1;
  return {
    clock: { now: () => new Date("2026-06-02T12:00:00.000Z") },
    idGenerator: { newId: () => `organic-plan-${nextId++}` },
    planningRepository: new InMemoryPlanningRepository(),
  };
}

test("organic certification task requirement explanations cover every seeded template task", async () => {
  const deps = dependencies();
  const created = await ensureOrganicCertificationPlan(
    { farmId: farm.id, targetDate: "2026-09-01" },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
  );

  for (const task of created.tasks) {
    const explanation = getOrganicCertificationTaskRequirementExplanation(task);
    assert.equal(explanation.isTemplateMapped, true, `${task.title} should have a specific USDA requirement rationale`);
    assert.notEqual(explanation.reason.trim(), "");
    assert.match(explanation.reason, new RegExp(escapeRegExp(task.title)));
    assert.match(explanation.reason, /expected evidence/i);
    assert.ok(explanation.references.length > 0, `${task.title} should include USDA/NOP references`);
    for (const reference of explanation.references) {
      assert.match(reference.url, /^https:\/\//);
      assert.notEqual(reference.label.trim(), "");
    }
  }

  const uniqueRequirementSummaries = new Set(
    created.tasks.map((task) => getOrganicCertificationTaskRequirementExplanation(task).reason),
  );
  assert.equal(uniqueRequirementSummaries.size, created.tasks.length);
});

test("organic certification task requirement explanations include specific compost and renewal anchors", async () => {
  const deps = dependencies();
  const created = await ensureOrganicCertificationPlan(
    { farmId: farm.id, targetDate: "2026-09-01" },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
  );

  const windrowCompost = created.tasks.find((task) => task.templateKey === "organicCertification:task:farm-compost-confirm-windrow-temperature-window");
  assert.ok(windrowCompost);
  const compostExplanation = getOrganicCertificationTaskRequirementExplanation(windrowCompost);
  assert.match(compostExplanation.reason, /15 days/);
  assert.match(compostExplanation.reason, /five turns/);
  assert.equal(compostExplanation.references.some((reference) => reference.key === "205.203"), true);

  const windrowTurn = created.tasks.find((task) => task.templateKey === "organicCertification:task:farm-compost-turn-windrow-pile");
  assert.ok(windrowTurn);
  const turnExplanation = getOrganicCertificationTaskRequirementExplanation(windrowTurn);
  assert.match(turnExplanation.reason, /turn evidence/);
  assert.equal(turnExplanation.references.some((reference) => reference.key === "205.203"), true);

  const annualRenewal = created.tasks.find((task) => task.templateKey === "organicCertification:task:admin-profile-set-renewal-date");
  assert.ok(annualRenewal);
  const annualRenewalExplanation = getOrganicCertificationTaskRequirementExplanation(annualRenewal);
  assert.equal(annualRenewalExplanation.references.some((reference) => reference.key === "205.406"), true);
});

test("organic certification task requirement explanations fall back for farmer-created tasks", () => {
  const task: PlanningTask = {
    id: "task-1",
    farmId: farm.id,
    title: "Ask certifier about a local edge case",
    status: "notStarted",
    priority: "normal",
    sortOrder: 1,
    source: "organicCertification",
    createdAt: "2026-06-02T12:00:00.000Z",
    updatedAt: "2026-06-02T12:00:00.000Z",
  };

  const explanation = getOrganicCertificationTaskRequirementExplanation(task);

  assert.equal(explanation.isTemplateMapped, false);
  assert.match(explanation.reason, /Ask certifier about a local edge case/);
  assert.equal(explanation.references.map((reference) => reference.key).join(","), "205.201,205.103");
});

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
