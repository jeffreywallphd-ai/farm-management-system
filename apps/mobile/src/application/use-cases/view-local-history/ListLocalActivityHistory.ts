import type { FarmId } from "../../../domain/farm/Farm";
import type { LocalActivityRecordView, LocalRecordRepository } from "../../ports/LocalRecordRepository";

export async function listLocalActivityHistory(
  farmId: FarmId,
  repository: LocalRecordRepository,
): Promise<LocalActivityRecordView[]> {
  return repository.listLocalActivityHistory(farmId);
}
