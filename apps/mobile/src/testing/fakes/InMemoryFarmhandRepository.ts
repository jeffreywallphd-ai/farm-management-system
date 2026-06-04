import type { FarmId } from "../../domain/farm/Farm";
import type {
  Farmhand,
  FarmhandId,
  FarmhandRecurringSchedule,
  FarmhandScheduleId,
  FarmhandScheduleSettings,
  FarmhandWeeklyScheduleBlock,
} from "../../domain/farmhand/Farmhand";
import type { FarmhandRepository } from "../../application/ports/FarmhandRepository";

export class InMemoryFarmhandRepository implements FarmhandRepository {
  private farmhands = new Map<FarmId, Farmhand[]>();
  private scheduleSettings = new Map<FarmId, FarmhandScheduleSettings>();
  private recurringSchedules = new Map<FarmId, FarmhandRecurringSchedule[]>();
  private weeklyScheduleBlocks = new Map<FarmId, FarmhandWeeklyScheduleBlock[]>();

  async saveScheduleSettings(settings: FarmhandScheduleSettings): Promise<void> {
    this.scheduleSettings.set(settings.farmId, settings);
  }

  async getScheduleSettings(farmId: FarmId): Promise<FarmhandScheduleSettings | null> {
    return this.scheduleSettings.get(farmId) ?? null;
  }

  async saveFarmhand(farmhand: Farmhand): Promise<void> {
    const existing = this.farmhands.get(farmhand.farmId) ?? [];
    this.farmhands.set(farmhand.farmId, [
      farmhand,
      ...existing.filter((candidate) => candidate.id !== farmhand.id),
    ].sort((left, right) => left.status.localeCompare(right.status) || left.name.localeCompare(right.name)));
  }

  async getFarmhand(farmId: FarmId, id: FarmhandId): Promise<Farmhand | null> {
    return this.farmhands.get(farmId)?.find((farmhand) => farmhand.id === id) ?? null;
  }

  async listFarmhands(farmId: FarmId): Promise<Farmhand[]> {
    return this.farmhands.get(farmId) ?? [];
  }

  async saveRecurringSchedule(schedule: FarmhandRecurringSchedule): Promise<void> {
    const existing = this.recurringSchedules.get(schedule.farmId) ?? [];
    this.recurringSchedules.set(schedule.farmId, [
      schedule,
      ...existing.filter((candidate) => candidate.id !== schedule.id),
    ].sort((left, right) => left.weekday - right.weekday || left.startTime.localeCompare(right.startTime)));
  }

  async replaceRecurringSchedulesForFarmhand(farmId: FarmId, farmhandId: FarmhandId, schedules: FarmhandRecurringSchedule[]): Promise<void> {
    const existing = this.recurringSchedules.get(farmId) ?? [];
    this.recurringSchedules.set(farmId, [
      ...schedules,
      ...existing.filter((candidate) => candidate.farmhandId !== farmhandId),
    ].sort((left, right) => left.weekday - right.weekday || left.startTime.localeCompare(right.startTime)));
    this.weeklyScheduleBlocks.set(farmId, (this.weeklyScheduleBlocks.get(farmId) ?? []).filter((block) => block.farmhandId !== farmhandId));
  }

  async getRecurringSchedule(farmId: FarmId, id: FarmhandScheduleId): Promise<FarmhandRecurringSchedule | null> {
    return this.recurringSchedules.get(farmId)?.find((schedule) => schedule.id === id) ?? null;
  }

  async listRecurringSchedules(farmId: FarmId, filters?: { farmhandId?: FarmhandId }): Promise<FarmhandRecurringSchedule[]> {
    let records = this.recurringSchedules.get(farmId) ?? [];
    if (filters?.farmhandId) {
      records = records.filter((schedule) => schedule.farmhandId === filters.farmhandId);
    }
    return records;
  }

  async saveWeeklyScheduleBlock(block: FarmhandWeeklyScheduleBlock): Promise<void> {
    const existing = this.weeklyScheduleBlocks.get(block.farmId) ?? [];
    this.weeklyScheduleBlocks.set(block.farmId, [
      block,
      ...existing.filter((candidate) => candidate.id !== block.id),
    ].sort((left, right) => left.date.localeCompare(right.date) || left.startTime.localeCompare(right.startTime)));
  }

  async replaceWeeklyScheduleBlocksForFarmhand(farmId: FarmId, farmhandId: FarmhandId, blocks: FarmhandWeeklyScheduleBlock[]): Promise<void> {
    const existing = this.weeklyScheduleBlocks.get(farmId) ?? [];
    this.weeklyScheduleBlocks.set(farmId, [
      ...blocks,
      ...existing.filter((candidate) => candidate.farmhandId !== farmhandId),
    ].sort((left, right) => left.date.localeCompare(right.date) || left.startTime.localeCompare(right.startTime)));
    this.recurringSchedules.set(farmId, (this.recurringSchedules.get(farmId) ?? []).filter((schedule) => schedule.farmhandId !== farmhandId));
  }

  async getWeeklyScheduleBlock(farmId: FarmId, id: FarmhandScheduleId): Promise<FarmhandWeeklyScheduleBlock | null> {
    return this.weeklyScheduleBlocks.get(farmId)?.find((block) => block.id === id) ?? null;
  }

  async listWeeklyScheduleBlocks(
    farmId: FarmId,
    filters?: { farmhandId?: FarmhandId; dateFrom?: string; dateTo?: string },
  ): Promise<FarmhandWeeklyScheduleBlock[]> {
    let records = this.weeklyScheduleBlocks.get(farmId) ?? [];
    if (filters?.farmhandId) records = records.filter((block) => block.farmhandId === filters.farmhandId);
    if (filters?.dateFrom) records = records.filter((block) => block.date >= filters.dateFrom!);
    if (filters?.dateTo) records = records.filter((block) => block.date <= filters.dateTo!);
    return records;
  }
}
