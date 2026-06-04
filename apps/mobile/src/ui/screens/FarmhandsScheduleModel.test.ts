import assert from "node:assert/strict";
import test from "node:test";

import type { FarmhandRecurringSchedule, FarmhandWeeklyScheduleBlock } from "../../domain/farmhand/Farmhand";
import { scheduleSummaryLines, selectCurrentFarmhandSchedule } from "./FarmhandsScheduleModel";

const baseRecurring = {
  farmId: "farm-1",
  farmhandId: "farmhand-1",
  createdAt: "2026-06-03T12:00:00.000Z",
};

const baseWeekly = {
  farmId: "farm-1",
  farmhandId: "farmhand-1",
  createdAt: "2026-06-04T12:00:00.000Z",
};

test("current farmhand schedule chooses the latest schedule kind and orders weekly days by configured week start", () => {
  const recurring: FarmhandRecurringSchedule[] = [
    { ...baseRecurring, id: "recurring-1", weekday: 1, startTime: "08:00", endTime: "12:00", updatedAt: "2026-06-03T12:00:00.000Z" },
  ];
  const weekly: FarmhandWeeklyScheduleBlock[] = [
    { ...baseWeekly, id: "weekly-sun", date: "2026-06-07", startTime: "09:00", endTime: "12:00", updatedAt: "2026-06-04T12:00:00.000Z" },
    { ...baseWeekly, id: "weekly-mon", date: "2026-06-01", startTime: "08:00", endTime: "11:00", updatedAt: "2026-06-04T12:00:00.000Z" },
  ];

  const schedule = selectCurrentFarmhandSchedule(recurring, weekly, 1);

  assert.equal(schedule?.kind, "weekly");
  assert.equal(schedule?.entries[0]?.id, "weekly-mon");
  assert.deepEqual(schedule ? scheduleSummaryLines(schedule, 1) : [], [
    "Monday 2026-06-01 - 8:00 AM-11:00 AM",
    "Sunday 2026-06-07 - 9:00 AM-12:00 PM",
  ]);
});

test("current farmhand schedule displays only the most recent edit window", () => {
  const recurring: FarmhandRecurringSchedule[] = [
    { ...baseRecurring, id: "old-mon", weekday: 1, startTime: "08:00", endTime: "10:00", updatedAt: "2026-06-03T12:00:00.000Z" },
    { ...baseRecurring, id: "new-wed", weekday: 3, startTime: "09:00", endTime: "13:00", updatedAt: "2026-06-03T12:20:00.000Z" },
    { ...baseRecurring, id: "new-fri", weekday: 5, startTime: "10:00", endTime: "14:00", updatedAt: "2026-06-03T12:20:01.000Z" },
  ];

  const schedule = selectCurrentFarmhandSchedule(recurring, [], 1);

  assert.equal(schedule?.kind, "recurring");
  assert.deepEqual(schedule?.entries.map((entry) => entry.id), ["new-wed", "new-fri"]);
});
