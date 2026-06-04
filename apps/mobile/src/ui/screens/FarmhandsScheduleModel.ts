import type {
  FarmhandRecurringSchedule,
  FarmhandWeekday,
  FarmhandWeeklyScheduleBlock,
} from "../../domain/farmhand/Farmhand";
import { FARMHAND_WEEKDAY_LABELS } from "../../domain/farmhand/Farmhand";
import {
  orderedWeekdays,
  startOfWeekFor,
  type WeekStartsOn,
} from "../../application/use-cases/manage-farmhands/ListFarmhandWork";
import { formatTimeDisplay } from "../components/TimeFieldModel";

export type CurrentFarmhandSchedule =
  | {
      kind: "recurring";
      entries: FarmhandRecurringSchedule[];
      updatedAt: string;
    }
  | {
      kind: "weekly";
      entries: FarmhandWeeklyScheduleBlock[];
      updatedAt: string;
      weekStartDate: string;
    };

const latestEditWindowMs = 2 * 60 * 1000;

export function selectCurrentFarmhandSchedule(
  recurringSchedules: FarmhandRecurringSchedule[],
  weeklyBlocks: FarmhandWeeklyScheduleBlock[],
  weekStartsOn: WeekStartsOn,
): CurrentFarmhandSchedule | null {
  const latestRecurringUpdatedAt = latestUpdatedAt(recurringSchedules);
  const latestWeeklyUpdatedAt = latestUpdatedAt(weeklyBlocks);

  if (!latestRecurringUpdatedAt && !latestWeeklyUpdatedAt) {
    return null;
  }

  if (latestWeeklyUpdatedAt && (!latestRecurringUpdatedAt || latestWeeklyUpdatedAt > latestRecurringUpdatedAt)) {
    const latestWeeklyBlock = latestByUpdatedAt(weeklyBlocks);
    const weekStartDate = startOfWeekFor(latestWeeklyBlock.date, weekStartsOn);
    return {
      kind: "weekly",
      entries: weeklyBlocks
        .filter((block) => startOfWeekFor(block.date, weekStartsOn) === weekStartDate)
        .filter((block) => isInLatestEditWindow(block.updatedAt, latestWeeklyUpdatedAt))
        .sort((left, right) => weekdayOrderForDate(left.date, weekStartsOn) - weekdayOrderForDate(right.date, weekStartsOn) || left.startTime.localeCompare(right.startTime)),
      updatedAt: latestWeeklyUpdatedAt,
      weekStartDate,
    };
  }

  const latestRecurring = latestRecurringUpdatedAt ?? "";
  return {
    kind: "recurring",
    entries: recurringSchedules
      .filter((schedule) => isInLatestEditWindow(schedule.updatedAt, latestRecurring))
      .sort((left, right) => weekdayOrder(left.weekday, weekStartsOn) - weekdayOrder(right.weekday, weekStartsOn) || left.startTime.localeCompare(right.startTime)),
    updatedAt: latestRecurring,
  };
}

export function scheduleSummaryLines(schedule: CurrentFarmhandSchedule, weekStartsOn: WeekStartsOn): string[] {
  if (schedule.kind === "recurring") {
    return schedule.entries.map((entry) => [
      FARMHAND_WEEKDAY_LABELS[entry.weekday],
      `${formatTimeDisplay(entry.startTime)}-${formatTimeDisplay(entry.endTime)}`,
      entry.effectiveStartDate ? `starts ${entry.effectiveStartDate}` : "",
      entry.effectiveEndDate ? `ends ${entry.effectiveEndDate}` : "",
    ].filter(Boolean).join(" - "));
  }

  return schedule.entries
    .slice()
    .sort((left, right) => weekdayOrderForDate(left.date, weekStartsOn) - weekdayOrderForDate(right.date, weekStartsOn) || left.startTime.localeCompare(right.startTime))
    .map((entry) => `${FARMHAND_WEEKDAY_LABELS[weekdayForDate(entry.date)]} ${entry.date} - ${formatTimeDisplay(entry.startTime)}-${formatTimeDisplay(entry.endTime)}`);
}

export function scheduleNotes(schedule: CurrentFarmhandSchedule): string | undefined {
  const notes = schedule.entries.map((entry) => entry.notes).filter((note): note is string => Boolean(note));
  return notes.length && notes.every((note) => note === notes[0]) ? notes[0] : undefined;
}

function latestUpdatedAt(entries: Array<{ updatedAt: string }>): string | undefined {
  return entries.reduce<string | undefined>((latest, entry) => (!latest || entry.updatedAt > latest ? entry.updatedAt : latest), undefined);
}

function latestByUpdatedAt<T extends { updatedAt: string }>(entries: T[]): T {
  return entries.slice().sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0] as T;
}

function isInLatestEditWindow(updatedAt: string, latestUpdatedAt: string): boolean {
  const updatedTime = Date.parse(updatedAt);
  const latestTime = Date.parse(latestUpdatedAt);
  if (!Number.isFinite(updatedTime) || !Number.isFinite(latestTime)) {
    return updatedAt === latestUpdatedAt;
  }
  return latestTime - updatedTime <= latestEditWindowMs;
}

function weekdayOrder(weekday: FarmhandWeekday, weekStartsOn: WeekStartsOn): number {
  return orderedWeekdays(weekStartsOn).indexOf(weekday);
}

function weekdayOrderForDate(date: string, weekStartsOn: WeekStartsOn): number {
  return weekdayOrder(weekdayForDate(date), weekStartsOn);
}

function weekdayForDate(date: string): FarmhandWeekday {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).getDay() as FarmhandWeekday;
}
