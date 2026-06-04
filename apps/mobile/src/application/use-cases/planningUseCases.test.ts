import assert from "node:assert/strict";
import test from "node:test";

import { buildMobilePilotRecoveryCopyPayload } from "./export-mobile-pilot-data/CreateHarvestRecoveryCopy";
import { ensureOrganicCertificationPlan } from "./manage-planning/CreateOrganicCertificationPlan";
import { getPlanningBoardOverview, getPlanningOverview, selectTasksForBoard } from "./manage-planning/ListPlanning";
import {
  ensureDefaultPlanningBoards,
  movePlanningTaskStatus,
  savePlanningBoard,
  savePlanningGoal,
  savePlanningLink,
  savePlanningTask,
} from "./manage-planning/ManagePlanning";
import { InMemoryFarmReferenceRepository } from "../../testing/fakes/InMemoryFarmReferenceRepository";
import { InMemoryLocalRecordRepository } from "../../testing/fakes/InMemoryLocalRecordRepository";
import { InMemoryPlanningRepository } from "../../testing/fakes/InMemoryPlanningRepository";

const farm = {
  id: "farm-1",
  name: "Planning Farm",
  createdAt: "2026-06-02T10:00:00.000Z",
};

function dependencies() {
  let nextId = 1;
  return {
    clock: { now: () => new Date("2026-06-02T12:00:00.000Z") },
    farmReferenceRepository: new InMemoryFarmReferenceRepository(),
    idGenerator: { newId: () => `planning-${nextId++}` },
    localRecordRepository: new InMemoryLocalRecordRepository({ locations: [], trackedItems: [] }),
    planningRepository: new InMemoryPlanningRepository(),
  };
}

test("planning goals support subgoals, assignment-ready tasks, instruction media, links, and recovery export", async () => {
  const deps = dependencies();
  await deps.farmReferenceRepository.createFarm(farm);
  const field = { id: "field-1", farmId: farm.id, name: "North Field", kind: "field" as const, createdAt: farm.createdAt };
  const bed = { id: "bed-1", farmId: farm.id, name: "Bed 1", kind: "bed" as const, parentId: field.id, createdAt: farm.createdAt };
  await deps.farmReferenceRepository.addLocation(field);
  await deps.farmReferenceRepository.addLocation(bed);
  deps.planningRepository.addLocation(field);
  deps.planningRepository.addLocation(bed);

  const goal = await savePlanningGoal(
    { farmId: farm.id, placeId: field.id, title: "Prepare north field", category: "cropProduction", status: "active", targetDate: "2026-06-30" },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
  );
  const subgoal = await savePlanningGoal(
    { farmId: farm.id, parentGoalId: goal.id, title: "Finish bed prep", category: "cropProduction", status: "planned" },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
  );
  const task = await savePlanningTask(
    {
      farmId: farm.id,
      goalId: subgoal.id,
      placeId: bed.id,
      title: "Broadfork Bed 3",
      status: "notStarted",
      priority: "high",
      plannedStartDate: "2026-06-03",
      dueDate: "2026-06-05",
      instructionVoiceMemo: { localUri: "file:///task-instructions.m4a", durationMs: 45_000, fileSizeBytes: 1234 },
      instructionPhotos: [{ localUri: "file:///task-instructions.jpg", width: 1200, height: 900, mimeType: "image/jpeg", fileSizeBytes: 4567 }],
    },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
  );
  const link = await savePlanningLink(
    { farmId: farm.id, taskId: task.id, linkedRecordType: "farmNote", linkedRecordId: "farm-note-1" },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
  );

  const overview = await getPlanningOverview({ farmId: farm.id }, { repository: deps.planningRepository });
  assert.equal(overview.rootGoals[0].id, goal.id);
  assert.equal(overview.rootGoals[0].placeId, field.id);
  assert.equal(overview.tasks[0].plannedStartDate, "2026-06-03");
  assert.equal(overview.tasks[0].placeId, bed.id);
  assert.equal(overview.tasks[0].instructionVoiceMemo?.localUri, "file:///task-instructions.m4a");
  assert.equal(overview.tasks[0].instructionPhotos?.length, 1);
  assert.equal((await deps.planningRepository.listLinks(farm.id, { taskId: task.id }))[0].id, link.id);

  await assert.rejects(
    () => savePlanningGoal(
      { farmId: farm.id, id: goal.id, parentGoalId: subgoal.id, title: goal.title, category: goal.category, status: goal.status },
      { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
    ),
    /own subgoals/,
  );

  const recovery = await buildMobilePilotRecoveryCopyPayload(
    { farmId: farm.id },
    {
      clock: deps.clock,
      farmReferenceRepository: deps.farmReferenceRepository,
      localRecordRepository: deps.localRecordRepository,
      planningRepository: deps.planningRepository,
    },
  );
  assert.equal(recovery.planningGoals.length, 2);
  assert.equal(recovery.planningBoards.length, 0);
  assert.equal(recovery.planningTasks.length, 1);
  assert.equal(recovery.planningLinks.length, 1);
  assert.equal(recovery.planningGoals.find((candidate) => candidate.id === goal.id)?.placeId, field.id);
  assert.equal(recovery.planningTasks.find((candidate) => candidate.id === task.id)?.placeId, bed.id);
  assert.equal(recovery.planningTasks.find((candidate) => candidate.id === task.id)?.instructionPhotos?.[0]?.localUri, "file:///task-instructions.jpg");
});

test("planning boards default to root goal boards and a non-goal task board", async () => {
  const deps = dependencies();
  await deps.farmReferenceRepository.createFarm(farm);
  const goal = await savePlanningGoal(
    { farmId: farm.id, title: "Prepare spring beds", category: "cropProduction", status: "active" },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
  );
  const subgoal = await savePlanningGoal(
    { farmId: farm.id, parentGoalId: goal.id, title: "North bed prep", category: "cropProduction", status: "planned" },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
  );
  const goalTask = await savePlanningTask(
    { farmId: farm.id, goalId: subgoal.id, title: "Broadfork beds", status: "notStarted", priority: "high" },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
  );
  const nonGoalTask = await savePlanningTask(
    { farmId: farm.id, title: "Pick up row cover", status: "notStarted", priority: "normal" },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
  );

  const boards = await ensureDefaultPlanningBoards(
    { farmId: farm.id },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
  );

  assert.equal(boards.length, 2);
  const goalBoard = boards.find((board) => board.scopeType === "goal");
  const nonGoalBoard = boards.find((board) => board.scopeType === "nonGoalTasks");
  assert.equal(goalBoard?.goalId, goal.id);
  assert.equal(nonGoalBoard?.title, "Non-goal farm work");
  assert.deepEqual(selectTasksForBoard(goalBoard!, [goal, subgoal], [goalTask, nonGoalTask]).map((task) => task.id), [goalTask.id]);
  assert.deepEqual(selectTasksForBoard(nonGoalBoard!, [goal, subgoal], [goalTask, nonGoalTask]).map((task) => task.id), [nonGoalTask.id]);
});

test("planning board overview includes linked farm events and status movement", async () => {
  const deps = dependencies();
  await deps.farmReferenceRepository.createFarm(farm);
  const goal = await savePlanningGoal(
    { farmId: farm.id, title: "Finish greenhouse prep", category: "infrastructure", status: "active" },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
  );
  const task = await savePlanningTask(
    { farmId: farm.id, goalId: goal.id, title: "Clean benches", status: "notStarted", priority: "normal" },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
  );
  const board = await savePlanningBoard(
    { farmId: farm.id, title: "Greenhouse board", scopeType: "goal", goalId: goal.id, wipLimit: 3 },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
  );
  await savePlanningLink(
    { farmId: farm.id, taskId: task.id, linkedRecordType: "farmNote", linkedRecordId: "event-1" },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
  );

  const overview = await getPlanningBoardOverview({ farmId: farm.id, boardId: board.id }, { repository: deps.planningRepository });
  assert.equal(overview.tasks[0].id, task.id);
  assert.equal(overview.links.length, 1);

  const moved = await movePlanningTaskStatus(
    { farmId: farm.id, taskId: task.id, status: "inProgress" },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
  );
  assert.equal(moved.status, "inProgress");
  assert.equal((await deps.planningRepository.getTask(farm.id, task.id))?.status, "inProgress");

  const recovery = await buildMobilePilotRecoveryCopyPayload(
    { farmId: farm.id },
    {
      clock: deps.clock,
      farmReferenceRepository: deps.farmReferenceRepository,
      localRecordRepository: deps.localRecordRepository,
      planningRepository: deps.planningRepository,
    },
  );
  assert.equal(recovery.planningBoards[0].id, board.id);
  assert.equal(recovery.planningBoards[0].wipLimit, 3);
});

test("planning edits reject unknown local IDs instead of creating duplicate records", async () => {
  const deps = dependencies();
  await deps.farmReferenceRepository.createFarm(farm);

  await assert.rejects(
    () => savePlanningGoal(
      { farmId: farm.id, id: "missing-goal", title: "Missing goal", category: "general", status: "planned" },
      { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
    ),
    /Planning goal does not exist/,
  );
  await assert.rejects(
    () => savePlanningTask(
      { farmId: farm.id, id: "missing-task", title: "Missing task", status: "notStarted", priority: "normal" },
      { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
    ),
    /Planning task does not exist/,
  );
});

test("organic certification template creates standalone certification subgoals and preserves adjusted timelines", async () => {
  const deps = dependencies();
  await deps.farmReferenceRepository.createFarm(farm);

  const created = await ensureOrganicCertificationPlan(
    { farmId: farm.id, targetDate: "2026-09-01" },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
  );

  assert.equal(created.goal.title, "Complete organic certification readiness");
  assert.equal(created.subgoals.length, 10);
  assert.equal(created.tasks.length, 20);

  const firstTask = created.tasks[0];
  await savePlanningTask(
    { ...firstTask, dueDate: "2026-08-15", status: "inProgress" },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
  );

  const rerun = await ensureOrganicCertificationPlan(
    { farmId: farm.id, targetDate: "2026-10-01" },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
  );

  assert.equal(rerun.tasks.length, 20);
  assert.equal((await deps.planningRepository.listTasks(farm.id, { source: "organicCertificationTemplate" })).length, 20);
  assert.equal((await deps.planningRepository.getTask(farm.id, firstTask.id))?.dueDate, "2026-08-15");
  assert.equal((await deps.planningRepository.getTask(farm.id, firstTask.id))?.status, "inProgress");
});
