import assert from "node:assert/strict";
import test from "node:test";

import { buildMobilePilotRecoveryCopyPayload } from "./export-mobile-pilot-data/CreateHarvestRecoveryCopy";
import {
  dateForWeekdayInWeek,
  expandRecurringSchedules,
  getFarmhandWorkView,
  orderedWeekdays,
  startOfWeekFor,
  weekRangeFor,
} from "./manage-farmhands/ListFarmhandWork";
import {
  replaceFarmhandRecurringSchedule,
  replaceFarmhandWeeklySchedule,
  saveFarmhand,
  saveFarmhandRecurringSchedule,
  saveFarmhandWeeklyScheduleBlock,
} from "./manage-farmhands/ManageFarmhands";
import { savePlanningTask } from "./manage-planning/ManagePlanning";
import { normalizePhoneForTelLink } from "../../domain/validation/farmhandValidation";
import { InMemoryFarmReferenceRepository } from "../../testing/fakes/InMemoryFarmReferenceRepository";
import { InMemoryFarmhandRepository } from "../../testing/fakes/InMemoryFarmhandRepository";
import { InMemoryLocalRecordRepository } from "../../testing/fakes/InMemoryLocalRecordRepository";
import { InMemoryPlanningRepository } from "../../testing/fakes/InMemoryPlanningRepository";

const farm = {
  id: "farm-1",
  name: "Farmhand Farm",
  createdAt: "2026-06-03T10:00:00.000Z",
};

function dependencies() {
  let nextId = 1;
  return {
    clock: { now: () => new Date("2026-06-03T12:00:00.000Z") },
    farmReferenceRepository: new InMemoryFarmReferenceRepository(),
    farmhandRepository: new InMemoryFarmhandRepository(),
    idGenerator: { newId: () => `farmhand-${nextId++}` },
    localRecordRepository: new InMemoryLocalRecordRepository({ locations: [], trackedItems: [] }),
    planningRepository: new InMemoryPlanningRepository(),
  };
}

test("farmhands can be saved, edited, called through normalized tel links, and exported locally", async () => {
  const deps = dependencies();
  await deps.farmReferenceRepository.createFarm(farm);

  const farmhand = await saveFarmhand(
    { farmId: farm.id, name: "Sam Rivers", phoneNumber: "(555) 123-4567", notes: "Greenhouse mornings" },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.farmhandRepository },
  );
  const edited = await saveFarmhand(
    { farmId: farm.id, id: farmhand.id, name: "Sam River", phoneNumber: "+1 555 123 4567", status: "inactive" },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.farmhandRepository },
  );

  assert.equal(edited.id, farmhand.id);
  assert.equal(edited.status, "inactive");
  assert.equal(normalizePhoneForTelLink(edited.phoneNumber ?? ""), "+15551234567");
  assert.equal(normalizePhoneForTelLink("12"), undefined);
  await deps.farmhandRepository.saveScheduleSettings({
    farmId: farm.id,
    weekStartsOn: 1,
    updatedAt: "2026-06-03T12:00:00.000Z",
  });

  const recovery = await buildMobilePilotRecoveryCopyPayload(
    { farmId: farm.id },
    {
      clock: deps.clock,
      farmReferenceRepository: deps.farmReferenceRepository,
      farmhandRepository: deps.farmhandRepository,
      localRecordRepository: deps.localRecordRepository,
      planningRepository: deps.planningRepository,
    },
  );

  assert.equal(recovery.farmhands.length, 1);
  assert.equal(recovery.farmhands[0]?.phoneNumber, "+1 555 123 4567");
  assert.equal(recovery.farmhandScheduleSettings?.weekStartsOn, 1);
});

test("farmhand schedule week-start preference is saved locally", async () => {
  const deps = dependencies();
  await deps.farmhandRepository.saveScheduleSettings({
    farmId: farm.id,
    weekStartsOn: 1,
    updatedAt: "2026-06-03T12:00:00.000Z",
  });
  await deps.farmhandRepository.saveScheduleSettings({
    farmId: farm.id,
    weekStartsOn: 0,
    updatedAt: "2026-06-03T12:05:00.000Z",
  });

  const settings = await deps.farmhandRepository.getScheduleSettings(farm.id);

  assert.equal(settings?.weekStartsOn, 0);
  assert.equal(settings?.updatedAt, "2026-06-03T12:05:00.000Z");
});

test("recurring and week-by-week schedules project into a farmhand work week", async () => {
  const deps = dependencies();
  await deps.farmReferenceRepository.createFarm(farm);
  const farmhand = await saveFarmhand(
    { farmId: farm.id, name: "Ari Lopez", phoneNumber: "555-222-3333" },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.farmhandRepository },
  );

  const recurring = await saveFarmhandRecurringSchedule(
    { farmId: farm.id, farmhandId: farmhand.id, weekday: 1, startTime: "08:00", endTime: "12:00", effectiveStartDate: "2026-06-01" },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.farmhandRepository },
  );
  await saveFarmhandRecurringSchedule(
    { farmId: farm.id, id: recurring.id, farmhandId: farmhand.id, weekday: 1, startTime: "07:30", endTime: "12:00", effectiveStartDate: "2026-06-01" },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.farmhandRepository },
  );
  const weekly = await saveFarmhandWeeklyScheduleBlock(
    { farmId: farm.id, farmhandId: farmhand.id, date: "2026-06-04", startTime: "13:00", endTime: "16:00", notes: "Pack CSA" },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.farmhandRepository },
  );
  await saveFarmhandWeeklyScheduleBlock(
    { farmId: farm.id, id: weekly.id, farmhandId: farmhand.id, date: "2026-06-04", startTime: "13:30", endTime: "16:30", notes: "Pack CSA boxes" },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.farmhandRepository },
  );
  const task = await savePlanningTask(
    { farmId: farm.id, assignedFarmhandId: farmhand.id, title: "Wash harvest bins", status: "notStarted", priority: "normal", dueDate: "2026-06-04" },
    { clock: deps.clock, farmhandRepository: deps.farmhandRepository, idGenerator: deps.idGenerator, repository: deps.planningRepository },
  );

  const range = weekRangeFor("2026-06-04");
  assert.deepEqual(range, { dateFrom: "2026-05-31", dateTo: "2026-06-06" });
  const view = await getFarmhandWorkView(
    { farmId: farm.id, farmhandId: farmhand.id, ...range },
    { farmhandRepository: deps.farmhandRepository, planningRepository: deps.planningRepository },
  );

  assert.equal(view.schedule.length, 2);
  assert.equal(view.schedule[0]?.date, "2026-06-01");
  assert.equal(view.schedule[0]?.startTime, "07:30");
  assert.equal(view.schedule[1]?.source, "weekly");
  assert.equal(view.schedule[1]?.startTime, "13:30");
  assert.equal(view.tasks[0]?.id, task.id);

  const recovery = await buildMobilePilotRecoveryCopyPayload(
    { farmId: farm.id },
    {
      clock: deps.clock,
      farmReferenceRepository: deps.farmReferenceRepository,
      farmhandRepository: deps.farmhandRepository,
      localRecordRepository: deps.localRecordRepository,
      planningRepository: deps.planningRepository,
    },
  );
  assert.equal(recovery.farmhandRecurringSchedules[0]?.startTime, "07:30");
  assert.equal(recovery.farmhandWeeklyScheduleBlocks[0]?.notes, "Pack CSA boxes");
  assert.equal(recovery.planningTasks[0]?.assignedFarmhandId, farmhand.id);
});

test("saving a farmhand schedule replaces older conflicting schedule rows for that farmhand", async () => {
  const deps = dependencies();
  await deps.farmReferenceRepository.createFarm(farm);
  const farmhand = await saveFarmhand(
    { farmId: farm.id, name: "Mika Chen" },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.farmhandRepository },
  );

  const recurring = await replaceFarmhandRecurringSchedule(
    {
      farmId: farm.id,
      farmhandId: farmhand.id,
      entries: [
        { weekday: 1, startTime: "08:00", endTime: "12:00" },
        { weekday: 3, startTime: "09:00", endTime: "13:00" },
      ],
      notes: "Regular harvest help",
    },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.farmhandRepository },
  );

  assert.equal(recurring.length, 2);
  assert.equal((await deps.farmhandRepository.listRecurringSchedules(farm.id, { farmhandId: farmhand.id })).length, 2);
  assert.equal((await deps.farmhandRepository.listWeeklyScheduleBlocks(farm.id, { farmhandId: farmhand.id })).length, 0);

  const weekly = await replaceFarmhandWeeklySchedule(
    {
      farmId: farm.id,
      farmhandId: farmhand.id,
      blocks: [
        { date: "2026-06-02", startTime: "10:00", endTime: "14:00" },
        { date: "2026-06-05", startTime: "08:00", endTime: "11:00" },
      ],
      notes: "Market week",
    },
    { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.farmhandRepository },
  );

  assert.equal(weekly.length, 2);
  assert.equal((await deps.farmhandRepository.listRecurringSchedules(farm.id, { farmhandId: farmhand.id })).length, 0);
  assert.equal((await deps.farmhandRepository.listWeeklyScheduleBlocks(farm.id, { farmhandId: farmhand.id })).length, 2);
  assert.equal(weekly[0]?.updatedAt, weekly[1]?.updatedAt);

  await assert.rejects(
    () => replaceFarmhandWeeklySchedule(
      {
        farmId: farm.id,
        farmhandId: farmhand.id,
        blocks: [
          { date: "2026-06-02", startTime: "10:00", endTime: "14:00" },
          { date: "2026-06-02", startTime: "15:00", endTime: "17:00" },
        ],
      },
      { clock: deps.clock, idGenerator: deps.idGenerator, repository: deps.farmhandRepository },
    ),
    /Only one schedule entry is allowed for each date/,
  );
});

test("recurring schedule expansion respects effective dates", () => {
  const occurrences = expandRecurringSchedules(
    [
      {
        id: "schedule-1",
        farmId: farm.id,
        farmhandId: "farmhand-1",
        weekday: 3,
        startTime: "09:00",
        endTime: "15:00",
        effectiveStartDate: "2026-06-03",
        effectiveEndDate: "2026-06-10",
      },
    ],
    "2026-06-01",
    "2026-06-14",
  );

  assert.deepEqual(occurrences.map((occurrence) => occurrence.date), ["2026-06-03", "2026-06-10"]);
});

test("farmhand week helpers support Sunday or Monday week starts", () => {
  assert.deepEqual(orderedWeekdays(0), [0, 1, 2, 3, 4, 5, 6]);
  assert.deepEqual(orderedWeekdays(1), [1, 2, 3, 4, 5, 6, 0]);
  assert.equal(startOfWeekFor("2026-06-04", 0), "2026-05-31");
  assert.equal(startOfWeekFor("2026-06-04", 1), "2026-06-01");
  assert.deepEqual(weekRangeFor("2026-06-04", 1), { dateFrom: "2026-06-01", dateTo: "2026-06-07" });
  assert.equal(dateForWeekdayInWeek("2026-06-01", 3, 1), "2026-06-03");
  assert.equal(dateForWeekdayInWeek("2026-06-01", 0, 1), "2026-06-07");
});

test("task assignment rejects missing farmhands when validation repository is supplied", async () => {
  const deps = dependencies();
  await deps.farmReferenceRepository.createFarm(farm);

  await assert.rejects(
    () => savePlanningTask(
      { farmId: farm.id, assignedFarmhandId: "missing", title: "Weed carrots", status: "notStarted", priority: "normal" },
      { clock: deps.clock, farmhandRepository: deps.farmhandRepository, idGenerator: deps.idGenerator, repository: deps.planningRepository },
    ),
    /Assigned farmhand does not exist/,
  );
});
