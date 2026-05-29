import type { FarmId } from "../../../domain/farm/Farm";
import type { HarvestRecordView, LocalRecordRepository } from "../../ports/LocalRecordRepository";

export async function listHarvestHistory(
  farmId: FarmId,
  repository: LocalRecordRepository,
): Promise<HarvestRecordView[]> {
  return repository.listHarvestHistory(farmId);
}
