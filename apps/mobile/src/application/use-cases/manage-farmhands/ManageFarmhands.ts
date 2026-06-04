import type { Clock } from "../../ports/Clock";
import type { FarmhandRepository } from "../../ports/FarmhandRepository";
import type { IdGenerator } from "../../ports/IdGenerator";
import type {
  Farmhand,
  FarmhandWeekday,
  FarmhandRecurringSchedule,
  FarmhandWeeklyScheduleBlock,
} from "../../../domain/farmhand/Farmhand";
import {
  farmhandInputSchema,
  farmhandRecurringScheduleInputSchema,
  farmhandWeeklyScheduleBlockInputSchema,
} from "../../../domain/validation/farmhandValidation";

interface FarmhandDependencies {
  clock: Clock;
  idGenerator: IdGenerator;
  repository: FarmhandRepository;
}

export async function saveFarmhand(
  input: Parameters<typeof farmhandInputSchema.parse>[0],
  dependencies: FarmhandDependencies,
): Promise<Farmhand> {
  const parsed = farmhandInputSchema.parse(input);
  const existing = parsed.id ? await dependencies.repository.getFarmhand(parsed.farmId, parsed.id) : null;
  if (parsed.id && !existing) {
    throw new Error("Farmhand does not exist on this farm.");
  }

  const now = dependencies.clock.now().toISOString();
  const farmhand: Farmhand = {
    id: existing?.id ?? dependencies.idGenerator.newId(),
    farmId: parsed.farmId,
    name: parsed.name,
    phoneNumber: parsed.phoneNumber,
    notes: parsed.notes,
    status: parsed.status,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  await dependencies.repository.saveFarmhand(farmhand);
  return farmhand;
}

export async function saveFarmhandRecurringSchedule(
  input: Parameters<typeof farmhandRecurringScheduleInputSchema.parse>[0],
  dependencies: FarmhandDependencies,
): Promise<FarmhandRecurringSchedule> {
  const parsed = farmhandRecurringScheduleInputSchema.parse(input);
  const existing = parsed.id ? await dependencies.repository.getRecurringSchedule(parsed.farmId, parsed.id) : null;
  if (parsed.id && !existing) {
    throw new Error("Recurring schedule does not exist on this farm.");
  }
  await assertFarmhandExists(parsed.farmId, parsed.farmhandId, dependencies.repository);

  const now = dependencies.clock.now().toISOString();
  const schedule: FarmhandRecurringSchedule = {
    id: existing?.id ?? dependencies.idGenerator.newId(),
    farmId: parsed.farmId,
    farmhandId: parsed.farmhandId,
    weekday: parsed.weekday,
    startTime: parsed.startTime,
    endTime: parsed.endTime,
    effectiveStartDate: parsed.effectiveStartDate,
    effectiveEndDate: parsed.effectiveEndDate,
    notes: parsed.notes,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  await dependencies.repository.saveRecurringSchedule(schedule);
  return schedule;
}

export async function replaceFarmhandRecurringSchedule(
  input: {
    effectiveEndDate?: string;
    effectiveStartDate?: string;
    entries: Array<{ endTime: string; startTime: string; weekday: FarmhandWeekday }>;
    farmhandId: string;
    farmId: string;
    notes?: string;
  },
  dependencies: FarmhandDependencies,
): Promise<FarmhandRecurringSchedule[]> {
  if (!input.entries.length) {
    throw new Error("Choose at least one recurring day.");
  }
  assertUniqueValues(input.entries.map((entry) => String(entry.weekday)), "Only one schedule entry is allowed for each day.");
  await assertFarmhandExists(input.farmId, input.farmhandId, dependencies.repository);

  const now = dependencies.clock.now().toISOString();
  const schedules = input.entries.map((entry): FarmhandRecurringSchedule => {
    const parsed = farmhandRecurringScheduleInputSchema.parse({
      farmId: input.farmId,
      farmhandId: input.farmhandId,
      weekday: entry.weekday,
      startTime: entry.startTime,
      endTime: entry.endTime,
      effectiveStartDate: input.effectiveStartDate,
      effectiveEndDate: input.effectiveEndDate,
      notes: input.notes,
    });

    return {
      id: dependencies.idGenerator.newId(),
      farmId: parsed.farmId,
      farmhandId: parsed.farmhandId,
      weekday: parsed.weekday,
      startTime: parsed.startTime,
      endTime: parsed.endTime,
      effectiveStartDate: parsed.effectiveStartDate,
      effectiveEndDate: parsed.effectiveEndDate,
      notes: parsed.notes,
      createdAt: now,
      updatedAt: now,
    };
  });

  await dependencies.repository.replaceRecurringSchedulesForFarmhand(input.farmId, input.farmhandId, schedules);
  return schedules;
}

export async function saveFarmhandWeeklyScheduleBlock(
  input: Parameters<typeof farmhandWeeklyScheduleBlockInputSchema.parse>[0],
  dependencies: FarmhandDependencies,
): Promise<FarmhandWeeklyScheduleBlock> {
  const parsed = farmhandWeeklyScheduleBlockInputSchema.parse(input);
  const existing = parsed.id ? await dependencies.repository.getWeeklyScheduleBlock(parsed.farmId, parsed.id) : null;
  if (parsed.id && !existing) {
    throw new Error("Weekly schedule block does not exist on this farm.");
  }
  await assertFarmhandExists(parsed.farmId, parsed.farmhandId, dependencies.repository);

  const now = dependencies.clock.now().toISOString();
  const block: FarmhandWeeklyScheduleBlock = {
    id: existing?.id ?? dependencies.idGenerator.newId(),
    farmId: parsed.farmId,
    farmhandId: parsed.farmhandId,
    date: parsed.date,
    startTime: parsed.startTime,
    endTime: parsed.endTime,
    notes: parsed.notes,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  await dependencies.repository.saveWeeklyScheduleBlock(block);
  return block;
}

export async function replaceFarmhandWeeklySchedule(
  input: {
    blocks: Array<{ date: string; endTime: string; startTime: string }>;
    farmhandId: string;
    farmId: string;
    notes?: string;
  },
  dependencies: FarmhandDependencies,
): Promise<FarmhandWeeklyScheduleBlock[]> {
  if (!input.blocks.length) {
    throw new Error("Choose at least one day for the week.");
  }
  assertUniqueValues(input.blocks.map((block) => block.date), "Only one schedule entry is allowed for each date.");
  await assertFarmhandExists(input.farmId, input.farmhandId, dependencies.repository);

  const now = dependencies.clock.now().toISOString();
  const blocks = input.blocks.map((block): FarmhandWeeklyScheduleBlock => {
    const parsed = farmhandWeeklyScheduleBlockInputSchema.parse({
      farmId: input.farmId,
      farmhandId: input.farmhandId,
      date: block.date,
      startTime: block.startTime,
      endTime: block.endTime,
      notes: input.notes,
    });

    return {
      id: dependencies.idGenerator.newId(),
      farmId: parsed.farmId,
      farmhandId: parsed.farmhandId,
      date: parsed.date,
      startTime: parsed.startTime,
      endTime: parsed.endTime,
      notes: parsed.notes,
      createdAt: now,
      updatedAt: now,
    };
  });

  await dependencies.repository.replaceWeeklyScheduleBlocksForFarmhand(input.farmId, input.farmhandId, blocks);
  return blocks;
}

async function assertFarmhandExists(farmId: string, farmhandId: string, repository: FarmhandRepository): Promise<void> {
  if (!(await repository.getFarmhand(farmId, farmhandId))) {
    throw new Error("Farmhand does not exist on this farm.");
  }
}

function assertUniqueValues(values: string[], message: string): void {
  if (new Set(values).size !== values.length) {
    throw new Error(message);
  }
}
