import type { SQLiteDatabase } from "expo-sqlite";

import type { FarmId } from "../../../domain/farm/Farm";
import type {
  Farmhand,
  FarmhandId,
  FarmhandRecurringSchedule,
  FarmhandScheduleId,
  FarmhandScheduleSettings,
  FarmhandStatus,
  FarmhandWeekday,
  FarmhandWeekStartsOn,
  FarmhandWeeklyScheduleBlock,
} from "../../../domain/farmhand/Farmhand";
import type { FarmhandRepository } from "../../../application/ports/FarmhandRepository";

interface FarmhandRow {
  id: string;
  farm_id: string;
  name: string;
  phone_number: string | null;
  notes: string | null;
  status: FarmhandStatus;
  created_at: string;
  updated_at: string;
}

interface ScheduleSettingsRow {
  farm_id: string;
  week_starts_on: FarmhandWeekStartsOn;
  updated_at: string;
}

interface RecurringScheduleRow {
  id: string;
  farm_id: string;
  farmhand_id: string;
  weekday: FarmhandWeekday;
  start_time: string;
  end_time: string;
  effective_start_date: string | null;
  effective_end_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface WeeklyScheduleBlockRow {
  id: string;
  farm_id: string;
  farmhand_id: string;
  date: string;
  start_time: string;
  end_time: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export class SqliteFarmhandRepository implements FarmhandRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  async saveScheduleSettings(settings: FarmhandScheduleSettings): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO farmhand_schedule_settings (farm_id, week_starts_on, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(farm_id) DO UPDATE SET
        week_starts_on = excluded.week_starts_on,
        updated_at = excluded.updated_at;`,
      [settings.farmId, settings.weekStartsOn, settings.updatedAt],
    );
  }

  async getScheduleSettings(farmId: FarmId): Promise<FarmhandScheduleSettings | null> {
    const row = await this.database.getFirstAsync<ScheduleSettingsRow>(
      "SELECT farm_id, week_starts_on, updated_at FROM farmhand_schedule_settings WHERE farm_id = ? LIMIT 1;",
      [farmId],
    );
    return row ? mapScheduleSettings(row) : null;
  }

  async saveFarmhand(farmhand: Farmhand): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO farmhands (id, farm_id, name, phone_number, notes, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        phone_number = excluded.phone_number,
        notes = excluded.notes,
        status = excluded.status,
        updated_at = excluded.updated_at;`,
      [
        farmhand.id,
        farmhand.farmId,
        farmhand.name,
        farmhand.phoneNumber ?? null,
        farmhand.notes ?? null,
        farmhand.status,
        farmhand.createdAt,
        farmhand.updatedAt,
      ],
    );
  }

  async getFarmhand(farmId: FarmId, id: FarmhandId): Promise<Farmhand | null> {
    const row = await this.database.getFirstAsync<FarmhandRow>(
      "SELECT id, farm_id, name, phone_number, notes, status, created_at, updated_at FROM farmhands WHERE farm_id = ? AND id = ? LIMIT 1;",
      [farmId, id],
    );
    return row ? mapFarmhand(row) : null;
  }

  async listFarmhands(farmId: FarmId): Promise<Farmhand[]> {
    const rows = await this.database.getAllAsync<FarmhandRow>(
      "SELECT id, farm_id, name, phone_number, notes, status, created_at, updated_at FROM farmhands WHERE farm_id = ? ORDER BY status ASC, name ASC;",
      [farmId],
    );
    return rows.map(mapFarmhand);
  }

  async saveRecurringSchedule(schedule: FarmhandRecurringSchedule): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO farmhand_recurring_schedules (
        id, farm_id, farmhand_id, weekday, start_time, end_time, effective_start_date, effective_end_date, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        farmhand_id = excluded.farmhand_id,
        weekday = excluded.weekday,
        start_time = excluded.start_time,
        end_time = excluded.end_time,
        effective_start_date = excluded.effective_start_date,
        effective_end_date = excluded.effective_end_date,
        notes = excluded.notes,
        updated_at = excluded.updated_at;`,
      [
        schedule.id,
        schedule.farmId,
        schedule.farmhandId,
        schedule.weekday,
        schedule.startTime,
        schedule.endTime,
        schedule.effectiveStartDate ?? null,
        schedule.effectiveEndDate ?? null,
        schedule.notes ?? null,
        schedule.createdAt,
        schedule.updatedAt,
      ],
    );
  }

  async replaceRecurringSchedulesForFarmhand(farmId: FarmId, farmhandId: FarmhandId, schedules: FarmhandRecurringSchedule[]): Promise<void> {
    await this.database.runAsync(
      "DELETE FROM farmhand_recurring_schedules WHERE farm_id = ? AND farmhand_id = ?;",
      [farmId, farmhandId],
    );
    await this.database.runAsync(
      "DELETE FROM farmhand_weekly_schedule_blocks WHERE farm_id = ? AND farmhand_id = ?;",
      [farmId, farmhandId],
    );
    for (const schedule of schedules) {
      await this.saveRecurringSchedule(schedule);
    }
  }

  async getRecurringSchedule(farmId: FarmId, id: FarmhandScheduleId): Promise<FarmhandRecurringSchedule | null> {
    const row = await this.database.getFirstAsync<RecurringScheduleRow>(
      `SELECT id, farm_id, farmhand_id, weekday, start_time, end_time, effective_start_date, effective_end_date, notes, created_at, updated_at
       FROM farmhand_recurring_schedules WHERE farm_id = ? AND id = ? LIMIT 1;`,
      [farmId, id],
    );
    return row ? mapRecurringSchedule(row) : null;
  }

  async listRecurringSchedules(farmId: FarmId, filters?: { farmhandId?: FarmhandId }): Promise<FarmhandRecurringSchedule[]> {
    const rows = await this.database.getAllAsync<RecurringScheduleRow>(
      `SELECT id, farm_id, farmhand_id, weekday, start_time, end_time, effective_start_date, effective_end_date, notes, created_at, updated_at
       FROM farmhand_recurring_schedules WHERE farm_id = ? ORDER BY weekday ASC, start_time ASC;`,
      [farmId],
    );
    let schedules = rows.map(mapRecurringSchedule);
    if (filters?.farmhandId) schedules = schedules.filter((schedule) => schedule.farmhandId === filters.farmhandId);
    return schedules;
  }

  async saveWeeklyScheduleBlock(block: FarmhandWeeklyScheduleBlock): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO farmhand_weekly_schedule_blocks (id, farm_id, farmhand_id, date, start_time, end_time, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
        farmhand_id = excluded.farmhand_id,
        date = excluded.date,
        start_time = excluded.start_time,
        end_time = excluded.end_time,
        notes = excluded.notes,
        updated_at = excluded.updated_at;`,
      [
        block.id,
        block.farmId,
        block.farmhandId,
        block.date,
        block.startTime,
        block.endTime,
        block.notes ?? null,
        block.createdAt,
        block.updatedAt,
      ],
    );
  }

  async replaceWeeklyScheduleBlocksForFarmhand(farmId: FarmId, farmhandId: FarmhandId, blocks: FarmhandWeeklyScheduleBlock[]): Promise<void> {
    await this.database.runAsync(
      "DELETE FROM farmhand_weekly_schedule_blocks WHERE farm_id = ? AND farmhand_id = ?;",
      [farmId, farmhandId],
    );
    await this.database.runAsync(
      "DELETE FROM farmhand_recurring_schedules WHERE farm_id = ? AND farmhand_id = ?;",
      [farmId, farmhandId],
    );
    for (const block of blocks) {
      await this.saveWeeklyScheduleBlock(block);
    }
  }

  async getWeeklyScheduleBlock(farmId: FarmId, id: FarmhandScheduleId): Promise<FarmhandWeeklyScheduleBlock | null> {
    const row = await this.database.getFirstAsync<WeeklyScheduleBlockRow>(
      "SELECT id, farm_id, farmhand_id, date, start_time, end_time, notes, created_at, updated_at FROM farmhand_weekly_schedule_blocks WHERE farm_id = ? AND id = ? LIMIT 1;",
      [farmId, id],
    );
    return row ? mapWeeklyScheduleBlock(row) : null;
  }

  async listWeeklyScheduleBlocks(
    farmId: FarmId,
    filters?: { farmhandId?: FarmhandId; dateFrom?: string; dateTo?: string },
  ): Promise<FarmhandWeeklyScheduleBlock[]> {
    const rows = await this.database.getAllAsync<WeeklyScheduleBlockRow>(
      "SELECT id, farm_id, farmhand_id, date, start_time, end_time, notes, created_at, updated_at FROM farmhand_weekly_schedule_blocks WHERE farm_id = ? ORDER BY date ASC, start_time ASC;",
      [farmId],
    );
    let blocks = rows.map(mapWeeklyScheduleBlock);
    if (filters?.farmhandId) blocks = blocks.filter((block) => block.farmhandId === filters.farmhandId);
    if (filters?.dateFrom) blocks = blocks.filter((block) => block.date >= filters.dateFrom!);
    if (filters?.dateTo) blocks = blocks.filter((block) => block.date <= filters.dateTo!);
    return blocks;
  }
}

function mapScheduleSettings(row: ScheduleSettingsRow): FarmhandScheduleSettings {
  return {
    farmId: row.farm_id,
    weekStartsOn: row.week_starts_on,
    updatedAt: row.updated_at,
  };
}

function mapFarmhand(row: FarmhandRow): Farmhand {
  return {
    id: row.id,
    farmId: row.farm_id,
    name: row.name,
    phoneNumber: row.phone_number ?? undefined,
    notes: row.notes ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRecurringSchedule(row: RecurringScheduleRow): FarmhandRecurringSchedule {
  return {
    id: row.id,
    farmId: row.farm_id,
    farmhandId: row.farmhand_id,
    weekday: row.weekday,
    startTime: row.start_time,
    endTime: row.end_time,
    effectiveStartDate: row.effective_start_date ?? undefined,
    effectiveEndDate: row.effective_end_date ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapWeeklyScheduleBlock(row: WeeklyScheduleBlockRow): FarmhandWeeklyScheduleBlock {
  return {
    id: row.id,
    farmId: row.farm_id,
    farmhandId: row.farmhand_id,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
