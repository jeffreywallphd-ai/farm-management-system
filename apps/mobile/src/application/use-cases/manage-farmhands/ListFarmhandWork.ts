import type { FarmhandRepository } from "../../ports/FarmhandRepository";
import type { PlanningRepository } from "../../ports/PlanningRepository";
import type {
  Farmhand,
  FarmhandScheduleOccurrence,
} from "../../../domain/farmhand/Farmhand";
import type { PlanningTask } from "../../../domain/planning/Planning";

export type WeekStartsOn = 0 | 1;

export interface FarmhandWorkView {
  farmhand: Farmhand;
  schedule: FarmhandScheduleOccurrence[];
  tasks: PlanningTask[];
}

export async function getFarmhandWorkView(
  input: { farmId: string; farmhandId: string; dateFrom: string; dateTo: string },
  dependencies: { farmhandRepository: FarmhandRepository; planningRepository: PlanningRepository },
): Promise<FarmhandWorkView> {
  const farmhand = await dependencies.farmhandRepository.getFarmhand(input.farmId, input.farmhandId);
  if (!farmhand) {
    throw new Error("Farmhand does not exist on this farm.");
  }

  const [recurringSchedules, weeklyBlocks, tasks] = await Promise.all([
    dependencies.farmhandRepository.listRecurringSchedules(input.farmId, { farmhandId: input.farmhandId }),
    dependencies.farmhandRepository.listWeeklyScheduleBlocks(input.farmId, {
      farmhandId: input.farmhandId,
      dateFrom: input.dateFrom,
      dateTo: input.dateTo,
    }),
    dependencies.planningRepository.listTasks(input.farmId, { assignedFarmhandId: input.farmhandId }),
  ]);

  return {
    farmhand,
    schedule: [
      ...expandRecurringSchedules(recurringSchedules, input.dateFrom, input.dateTo),
      ...weeklyBlocks.map((block): FarmhandScheduleOccurrence => ({
        id: `weekly:${block.id}`,
        farmId: block.farmId,
        farmhandId: block.farmhandId,
        source: "weekly",
        sourceId: block.id,
        date: block.date,
        startTime: block.startTime,
        endTime: block.endTime,
        notes: block.notes,
      })),
    ].sort(sortOccurrences),
    tasks,
  };
}

export function expandRecurringSchedules(
  schedules: Array<{
    id: string;
    farmId: string;
    farmhandId: string;
    weekday: number;
    startTime: string;
    endTime: string;
    effectiveStartDate?: string;
    effectiveEndDate?: string;
    notes?: string;
  }>,
  dateFrom: string,
  dateTo: string,
): FarmhandScheduleOccurrence[] {
  const occurrences: FarmhandScheduleOccurrence[] = [];
  for (const date of dateRange(dateFrom, dateTo)) {
    const weekday = weekdayForDate(date);
    for (const schedule of schedules) {
      if (schedule.weekday !== weekday) {
        continue;
      }
      if (schedule.effectiveStartDate && date < schedule.effectiveStartDate) {
        continue;
      }
      if (schedule.effectiveEndDate && date > schedule.effectiveEndDate) {
        continue;
      }
      occurrences.push({
        id: `recurring:${schedule.id}:${date}`,
        farmId: schedule.farmId,
        farmhandId: schedule.farmhandId,
        source: "recurring",
        sourceId: schedule.id,
        date,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        notes: schedule.notes,
      });
    }
  }
  return occurrences;
}

export function orderedWeekdays(weekStartsOn: WeekStartsOn): number[] {
  return weekStartsOn === 1 ? [1, 2, 3, 4, 5, 6, 0] : [0, 1, 2, 3, 4, 5, 6];
}

export function startOfWeekFor(date: string, weekStartsOn: WeekStartsOn = 0): string {
  const start = parseDate(date);
  const offset = (start.getDay() - weekStartsOn + 7) % 7;
  start.setDate(start.getDate() - offset);
  return formatDate(start);
}

export function dateForWeekdayInWeek(weekStartDate: string, weekday: number, weekStartsOn: WeekStartsOn = 0): string {
  const start = parseDate(startOfWeekFor(weekStartDate, weekStartsOn));
  const offset = (weekday - weekStartsOn + 7) % 7;
  start.setDate(start.getDate() + offset);
  return formatDate(start);
}

export function weekRangeFor(date: string, weekStartsOn: WeekStartsOn = 0): { dateFrom: string; dateTo: string } {
  const start = parseDate(startOfWeekFor(date, weekStartsOn));
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { dateFrom: formatDate(start), dateTo: formatDate(end) };
}

function dateRange(dateFrom: string, dateTo: string): string[] {
  const dates: string[] = [];
  const cursor = parseDate(dateFrom);
  const end = parseDate(dateTo);
  while (cursor <= end) {
    dates.push(formatDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

function weekdayForDate(date: string): number {
  return parseDate(date).getDay();
}

function parseDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function sortOccurrences(left: FarmhandScheduleOccurrence, right: FarmhandScheduleOccurrence): number {
  return left.date.localeCompare(right.date) || left.startTime.localeCompare(right.startTime);
}
