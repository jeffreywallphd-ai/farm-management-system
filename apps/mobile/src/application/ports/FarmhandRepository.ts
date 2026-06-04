import type { FarmId } from "../../domain/farm/Farm";
import type {
  Farmhand,
  FarmhandId,
  FarmhandRecurringSchedule,
  FarmhandScheduleId,
  FarmhandScheduleSettings,
  FarmhandWeeklyScheduleBlock,
} from "../../domain/farmhand/Farmhand";

export interface FarmhandRepository {
  saveScheduleSettings(settings: FarmhandScheduleSettings): Promise<void>;
  getScheduleSettings(farmId: FarmId): Promise<FarmhandScheduleSettings | null>;
  saveFarmhand(farmhand: Farmhand): Promise<void>;
  getFarmhand(farmId: FarmId, id: FarmhandId): Promise<Farmhand | null>;
  listFarmhands(farmId: FarmId): Promise<Farmhand[]>;
  saveRecurringSchedule(schedule: FarmhandRecurringSchedule): Promise<void>;
  replaceRecurringSchedulesForFarmhand(farmId: FarmId, farmhandId: FarmhandId, schedules: FarmhandRecurringSchedule[]): Promise<void>;
  getRecurringSchedule(farmId: FarmId, id: FarmhandScheduleId): Promise<FarmhandRecurringSchedule | null>;
  listRecurringSchedules(farmId: FarmId, filters?: { farmhandId?: FarmhandId }): Promise<FarmhandRecurringSchedule[]>;
  saveWeeklyScheduleBlock(block: FarmhandWeeklyScheduleBlock): Promise<void>;
  replaceWeeklyScheduleBlocksForFarmhand(farmId: FarmId, farmhandId: FarmhandId, blocks: FarmhandWeeklyScheduleBlock[]): Promise<void>;
  getWeeklyScheduleBlock(farmId: FarmId, id: FarmhandScheduleId): Promise<FarmhandWeeklyScheduleBlock | null>;
  listWeeklyScheduleBlocks(
    farmId: FarmId,
    filters?: { farmhandId?: FarmhandId; dateFrom?: string; dateTo?: string },
  ): Promise<FarmhandWeeklyScheduleBlock[]>;
}
