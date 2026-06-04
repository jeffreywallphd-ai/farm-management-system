import assert from "node:assert/strict";
import test from "node:test";

import { buildMobilePilotRecoveryCopyPayload } from "./export-mobile-pilot-data/CreateHarvestRecoveryCopy";
import {
  ensureFarmWorkPacks,
  getFarmWorkPackSetupSummary,
  listInactiveFarmWorkPackItemTemplateKeys,
  setFarmWorkPackActive,
  setFarmWorkPackItemActive,
} from "./manage-planning/DefaultFarmWorkPacks";
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
import { filterPlanningForActiveFarmWorkPacks } from "../../ui/farmWorkPackPlanningVisibility";

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

  const renamedGoal = await savePlanningGoal(
    { ...goal, title: "Prepare spring beds and tunnels" },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
  );
  const renamedBoards = await ensureDefaultPlanningBoards(
    { farmId: farm.id },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
  );

  assert.equal(
    renamedBoards.find((board) => board.scopeType === "goal" && board.goalId === renamedGoal.id)?.title,
    "Prepare spring beds and tunnels",
  );
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

test("default farm work packs create ordinary local planning records without duplicates", async () => {
  const deps = dependencies();
  await deps.farmReferenceRepository.createFarm(farm);

  const created = await ensureFarmWorkPacks(
    { farmId: farm.id, packIds: ["marketGardenPlanning", "compostWork"] },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
  );

  assert.deepEqual(created.packIds, ["marketGardenPlanning", "compostWork"]);
  assert.equal(created.goals.filter((goal) => !goal.parentGoalId).length, 2);
  assert.equal(created.goals.some((goal) => goal.title === "Plan market garden crop work"), true);
  assert.equal(created.goals.some((goal) => goal.title === "Do compost work"), true);
  assert.equal(created.tasks.some((task) => task.title === "Create seeding calendar"), true);
  assert.equal(created.tasks.some((task) => task.title === "Check compost temperature"), true);
  assert.equal(created.tasks.every((task) => task.source === "farmWorkTemplate"), true);
  assert.equal(created.tasks.every((task) => task.templateKey?.startsWith("farmWorkPack:")), true);

  const boards = await ensureDefaultPlanningBoards(
    { farmId: farm.id },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
  );
  assert.equal(boards.some((board) => board.title === "Plan market garden crop work"), true);
  assert.equal(boards.some((board) => board.title === "Do compost work"), true);

  const rerun = await ensureFarmWorkPacks(
    { farmId: farm.id, packIds: ["compostWork", "marketGardenPlanning"] },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
  );

  assert.equal(rerun.tasks.length, created.tasks.length);
  assert.equal((await deps.planningRepository.listGoals(farm.id, { source: "farmWorkTemplate" })).length, created.goals.length);
  assert.equal((await deps.planningRepository.listTasks(farm.id, { source: "farmWorkTemplate" })).length, created.tasks.length);
  assert.equal((await deps.planningRepository.listFarmWorkPackStates(farm.id)).every((state) => state.isActive), true);
});

test("default farm work packs preserve farmer edits and report setup status", async () => {
  const deps = dependencies();
  await deps.farmReferenceRepository.createFarm(farm);
  const created = await ensureFarmWorkPacks(
    { farmId: farm.id, packIds: ["chickenCareWork"] },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
  );
  const feedTask = created.tasks.find((task) => task.title === "Feed chickens");
  assert.ok(feedTask);

  await savePlanningTask(
    { ...feedTask, title: "Feed laying hens", status: "inProgress", dueDate: "2026-06-05" },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
  );

  await ensureFarmWorkPacks(
    { farmId: farm.id, packIds: ["chickenCareWork"] },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
  );
  const editedTask = await deps.planningRepository.getTask(farm.id, feedTask.id);
  assert.equal(editedTask?.title, "Feed laying hens");
  assert.equal(editedTask?.status, "inProgress");
  assert.equal(editedTask?.dueDate, "2026-06-05");

  const summaries = await getFarmWorkPackSetupSummary(
    { farmId: farm.id },
    { repository: deps.planningRepository },
  );
  assert.equal(summaries.find((summary) => summary.id === "chickenCareWork")?.isApplied, true);
  assert.equal(summaries.find((summary) => summary.id === "chickenCareWork")?.isActive, true);
  assert.equal(summaries.find((summary) => summary.id === "greenhouseSeedlingPlanning")?.isApplied, false);
  assert.equal(summaries.find((summary) => summary.id === "chickenCareWork")?.taskCount, created.tasks.length);
  assert.equal(summaries.find((summary) => summary.id === "chickenCarePlanning")?.group, "administrationPlanning");
  assert.equal(summaries.find((summary) => summary.id === "chickenCareWork")?.group, "farmWork");
});

test("default farm work packs can add selected tasks without creating the whole pack", async () => {
  const deps = dependencies();
  await deps.farmReferenceRepository.createFarm(farm);
  const summaries = await getFarmWorkPackSetupSummary(
    { farmId: farm.id },
    { repository: deps.planningRepository },
  );
  const compostWork = summaries.find((summary) => summary.id === "compostWork");
  const temperatureTaskKey = compostWork?.goals
    .flatMap((goal) => goal.subgoals)
    .flatMap((subgoal) => subgoal.tasks)
    .find((task) => task.title === "Check compost temperature")?.templateKey;
  assert.ok(temperatureTaskKey);

  const created = await ensureFarmWorkPacks(
    {
      farmId: farm.id,
      packIds: ["compostWork"],
      taskTemplateKeysByPackId: { compostWork: [temperatureTaskKey] },
    },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
  );

  assert.deepEqual(created.packIds, ["compostWork"]);
  assert.equal(created.goals.length, 2);
  assert.equal(created.tasks.length, 1);
  assert.equal(created.tasks[0].title, "Check compost temperature");
  assert.equal(created.goals.some((goal) => goal.title === "Do compost work"), true);
  assert.equal(created.goals.some((goal) => goal.title === "Manage compost piles"), true);

  const updatedSummary = (await getFarmWorkPackSetupSummary(
    { farmId: farm.id },
    { repository: deps.planningRepository },
  )).find((summary) => summary.id === "compostWork");
  assert.equal(updatedSummary?.isApplied, true);
  assert.equal(updatedSummary?.isActive, true);
  assert.equal(
    updatedSummary?.goals.flatMap((goal) => goal.subgoals).flatMap((subgoal) => subgoal.tasks).find((task) => task.title === "Check compost temperature")?.isApplied,
    true,
  );
  assert.equal(
    updatedSummary?.goals.flatMap((goal) => goal.subgoals).find((subgoal) => subgoal.title === "Manage compost piles")?.isActive,
    true,
  );
  assert.equal(
    updatedSummary?.goals.flatMap((goal) => goal.subgoals).flatMap((subgoal) => subgoal.tasks).find((task) => task.title === "Check compost temperature")?.isActive,
    true,
  );
  assert.equal(
    updatedSummary?.goals.flatMap((goal) => goal.subgoals).flatMap((subgoal) => subgoal.tasks).find((task) => task.title === "Turn compost pile")?.isApplied,
    false,
  );
});

test("starter work pack subgoals and tasks can be deactivated without deleting planning records", async () => {
  const deps = dependencies();
  await deps.farmReferenceRepository.createFarm(farm);
  const created = await ensureFarmWorkPacks(
    { farmId: farm.id, packIds: ["compostWork"] },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
  );
  const manageCompostSubgoal = created.goals.find((goal) => goal.title === "Manage compost piles");
  const temperatureTask = created.tasks.find((task) => task.title === "Check compost temperature");
  const moistureTask = created.tasks.find((task) => task.title === "Check compost pile moisture");
  assert.ok(manageCompostSubgoal?.templateKey);
  assert.ok(temperatureTask?.templateKey);
  assert.ok(moistureTask);

  await setFarmWorkPackItemActive(
    { farmId: farm.id, templateKey: temperatureTask.templateKey, isActive: false },
    { clock: deps.clock, repository: deps.planningRepository },
  );

  let inactiveTemplateKeys = await listInactiveFarmWorkPackItemTemplateKeys(
    { farmId: farm.id },
    { repository: deps.planningRepository },
  );
  assert.deepEqual(inactiveTemplateKeys, [temperatureTask.templateKey]);

  let visible = filterPlanningForActiveFarmWorkPacks(
    await deps.planningRepository.listGoals(farm.id),
    await deps.planningRepository.listTasks(farm.id),
    [],
    inactiveTemplateKeys,
  );
  assert.equal(visible.tasks.some((task) => task.id === temperatureTask.id), false);
  assert.equal(visible.tasks.some((task) => task.id === moistureTask.id), true);
  assert.equal((await deps.planningRepository.getTask(farm.id, temperatureTask.id))?.title, "Check compost temperature");

  await setFarmWorkPackItemActive(
    { farmId: farm.id, templateKey: manageCompostSubgoal.templateKey, isActive: false },
    { clock: deps.clock, repository: deps.planningRepository },
  );

  inactiveTemplateKeys = await listInactiveFarmWorkPackItemTemplateKeys(
    { farmId: farm.id },
    { repository: deps.planningRepository },
  );
  visible = filterPlanningForActiveFarmWorkPacks(
    await deps.planningRepository.listGoals(farm.id),
    await deps.planningRepository.listTasks(farm.id),
    [],
    inactiveTemplateKeys,
  );
  assert.equal(visible.goals.some((goal) => goal.id === manageCompostSubgoal.id), false);
  assert.equal(visible.tasks.some((task) => task.goalId === manageCompostSubgoal.id), false);

  const summary = (await getFarmWorkPackSetupSummary(
    { farmId: farm.id },
    { repository: deps.planningRepository },
  )).find((candidate) => candidate.id === "compostWork");
  const summarySubgoal = summary?.goals.flatMap((goal) => goal.subgoals).find((subgoal) => subgoal.templateKey === manageCompostSubgoal.templateKey);
  const summaryTask = summary?.goals.flatMap((goal) => goal.subgoals).flatMap((subgoal) => subgoal.tasks).find((task) => task.templateKey === temperatureTask.templateKey);
  assert.equal(summarySubgoal?.isApplied, true);
  assert.equal(summarySubgoal?.isActive, false);
  assert.equal(summaryTask?.isApplied, true);
  assert.equal(summaryTask?.isActive, false);

  const recovery = await buildMobilePilotRecoveryCopyPayload(
    { farmId: farm.id },
    {
      clock: deps.clock,
      farmReferenceRepository: deps.farmReferenceRepository,
      localRecordRepository: deps.localRecordRepository,
      planningRepository: deps.planningRepository,
    },
  );
  assert.equal(recovery.farmWorkPackItemStates.some((state) => state.templateKey === manageCompostSubgoal.templateKey && !state.isActive), true);
  assert.equal(recovery.planningTasks.some((task) => task.id === temperatureTask.id), true);
});

test("deactivated farm work packs are hidden from planning views while retained for reporting and export", async () => {
  const deps = dependencies();
  await deps.farmReferenceRepository.createFarm(farm);
  const created = await ensureFarmWorkPacks(
    { farmId: farm.id, packIds: ["chickenCareWork"] },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
  );
  const feedTask = created.tasks.find((task) => task.title === "Feed chickens");
  assert.ok(feedTask);
  await savePlanningTask(
    { ...feedTask, status: "done", completionNotes: "Fed the laying flock before morning harvest." },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
  );

  await setFarmWorkPackActive(
    { farmId: farm.id, packId: "chickenCareWork", isActive: false },
    { clock: deps.clock, repository: deps.planningRepository },
  );

  const summaries = await getFarmWorkPackSetupSummary(
    { farmId: farm.id },
    { repository: deps.planningRepository },
  );
  assert.equal(summaries.find((summary) => summary.id === "chickenCareWork")?.isActive, false);

  const allGoals = await deps.planningRepository.listGoals(farm.id);
  const allTasks = await deps.planningRepository.listTasks(farm.id);
  const visible = filterPlanningForActiveFarmWorkPacks(allGoals, allTasks, ["chickenCareWork"]);
  assert.equal(visible.goals.length, 0);
  assert.equal(visible.tasks.length, 0);

  const retainedTask = await deps.planningRepository.getTask(farm.id, feedTask.id);
  assert.equal(retainedTask?.status, "done");
  assert.equal(retainedTask?.completionNotes, "Fed the laying flock before morning harvest.");
  assert.ok(retainedTask?.completedAt);

  const recovery = await buildMobilePilotRecoveryCopyPayload(
    { farmId: farm.id },
    {
      clock: deps.clock,
      farmReferenceRepository: deps.farmReferenceRepository,
      localRecordRepository: deps.localRecordRepository,
      planningRepository: deps.planningRepository,
    },
  );
  assert.equal(recovery.planningTasks.some((task) => task.id === feedTask.id && task.status === "done"), true);
  assert.equal(recovery.farmWorkPackStates.find((state) => state.packId === "chickenCareWork")?.isActive, false);
});

test("default farm work packs reject unknown pack IDs", async () => {
  const deps = dependencies();
  await deps.farmReferenceRepository.createFarm(farm);

  await assert.rejects(
    () => ensureFarmWorkPacks(
      { farmId: farm.id, packIds: ["marketGardenPlanning", "unknown-pack"] },
      { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
    ),
    /Farm work pack does not exist/,
  );
});

test("organic certification template creates standalone certification subgoals and preserves adjusted timelines", async () => {
  const deps = dependencies();
  await deps.farmReferenceRepository.createFarm(farm);
  const retiredGoal = await savePlanningGoal(
    {
      farmId: farm.id,
      title: "Prepare inspection evidence",
      category: "organicCertification",
      status: "planned",
      source: "organicCertificationTemplate",
      templateKey: "organicCertification:subgoal:inspection-evidence",
    },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
  );
  const retiredTask = await savePlanningTask(
    {
      farmId: farm.id,
      goalId: retiredGoal.id,
      title: "Connect farm events to certification requirements",
      status: "notStarted",
      priority: "high",
      source: "organicCertificationTemplate",
      templateKey: "organicCertification:task:inspection-evidence-1",
    },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
  );

  const created = await ensureOrganicCertificationPlan(
    { farmId: farm.id, targetDate: "2026-09-01" },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
  );

  assert.equal(created.goal.title, "Complete certification administration work");
  assert.deepEqual(created.goals.map((goal) => goal.title), [
    "Complete certification administration work",
    "Complete certification farm work",
  ]);
  assert.equal(created.administrationGoal.parentGoalId, undefined);
  assert.equal(created.farmWorkGoal.parentGoalId, undefined);
  assert.equal(created.subgoals.length, 14);
  assert.equal(created.tasks.length, 123);
  const subgoalTitles = created.subgoals.map((goal) => goal.title);
  assert.deepEqual(subgoalTitles, [
    "Set up certification profile",
    "Set up recordkeeping and audit trail administration",
    "Review input approvals and restrictions",
    "Draft OSP practices, inputs, and monitoring",
    "Document OSP recordkeeping and prevention procedures",
    "Document land and transition status",
    "Track input applications and evidence",
    "Organize seed and planting records",
    "Document soil fertility and crop rotation practices",
    "Manage compost evidence",
    "Track raw manure applications and harvest intervals",
    "Document pest, weed, disease, and mulch practices",
    "Prepare lot traceability records",
    "Review handling, storage, sales, and mass balance",
  ]);
  assert.equal(created.subgoals.filter((goal) => goal.parentGoalId === created.administrationGoal.id).length, 5);
  assert.equal(created.subgoals.filter((goal) => goal.parentGoalId === created.farmWorkGoal.id).length, 9);
  const certificationBoards = await ensureDefaultPlanningBoards(
    { farmId: farm.id },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
  );
  assert.equal(
    certificationBoards.some((board) => board.scopeType === "goal" && board.goalId === created.administrationGoal.id),
    true,
  );
  assert.equal(
    certificationBoards.some((board) => board.scopeType === "goal" && board.goalId === created.farmWorkGoal.id),
    true,
  );
  assert.equal(certificationBoards.some((board) => board.title === "Complete certification administration work"), true);
  assert.equal(certificationBoards.some((board) => board.title === "Complete certification farm work"), true);
  assert.equal(created.tasks.some((task) => task.title === "Turn windrow compost pile"), true);
  assert.equal(
    created.tasks.some((task) => task.title === "Confirm windrow temperature window" && task.notes?.includes("131-170 F for 15 days") && task.notes?.includes("at least five turns")),
    true,
  );
  assert.equal(created.tasks.some((task) => task.title === "Check windrow compost temperature"), true);
  assert.equal(created.tasks.some((task) => task.title === "Flag cold or unfinished pile for review"), true);
  assert.equal(created.tasks.some((task) => task.notes?.includes("90-day or 120-day earliest harvest date")), true);
  assert.equal(created.tasks.some((task) => task.title === "Confirm input approval before use"), true);
  assert.equal(created.tasks.some((task) => task.title === "Record each input application date"), true);
  assert.equal(created.tasks.some((task) => task.title === "Record input quantity and rate"), true);
  assert.equal(created.tasks.some((task) => task.title === "Create lot record for organic-claim product"), true);
  assert.equal(created.tasks.some((task) => task.title === "Assign lot code"), true);
  assert.equal(created.tasks.some((task) => task.title === "Record exact organic claim wording"), true);
  assert.equal(created.tasks.some((task) => task.title === "Create follow-up tasks for OSP gaps"), true);
  assert.equal(created.subgoals.some((goal) => goal.title === "Prepare inspection evidence"), false);
  assert.equal(created.subgoals.some((goal) => goal.title === "Generate certification or renewal package"), false);
  assert.equal(await deps.planningRepository.getGoal(farm.id, retiredGoal.id), null);
  assert.equal(await deps.planningRepository.getTask(farm.id, retiredTask.id), null);

  const compostGoal = created.subgoals.find((goal) => goal.title === "Manage compost evidence");
  const manureGoal = created.subgoals.find((goal) => goal.title === "Track raw manure applications and harvest intervals");
  const inputApplicationsGoal = created.subgoals.find((goal) => goal.title === "Track input applications and evidence");
  const handlingGoal = created.subgoals.find((goal) => goal.title === "Review handling, storage, sales, and mass balance");
  assert.equal(created.tasks.find((task) => task.title === "Turn windrow compost pile")?.goalId, compostGoal?.id);
  assert.equal(created.tasks.find((task) => task.title === "Calculate manure harvest interval date")?.goalId, manureGoal?.id);
  assert.equal(created.tasks.find((task) => task.title === "Record each input application date")?.goalId, inputApplicationsGoal?.id);
  assert.equal(created.tasks.find((task) => task.title === "Run mass-balance review")?.goalId, handlingGoal?.id);

  const firstTask = created.tasks[0];
  await savePlanningTask(
    { ...firstTask, dueDate: "2026-08-15", status: "inProgress" },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
  );

  const rerun = await ensureOrganicCertificationPlan(
    { farmId: farm.id, targetDate: "2026-10-01" },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.planningRepository },
  );

  assert.equal(rerun.tasks.length, 123);
  assert.equal((await deps.planningRepository.listTasks(farm.id, { source: "organicCertificationTemplate" })).length, 123);
  assert.equal((await deps.planningRepository.getTask(farm.id, firstTask.id))?.dueDate, "2026-08-15");
  assert.equal((await deps.planningRepository.getTask(farm.id, firstTask.id))?.status, "inProgress");
});
