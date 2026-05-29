import type { FarmId } from "../../../domain/farm/Farm";
import type { OperationalRecordId } from "../../../domain/records/OperationalRecord";
import type { HarvestRecordView, LocalRecordRepository } from "../../ports/LocalRecordRepository";

export async function getHarvestDetail(
  input: { farmId: FarmId; id: OperationalRecordId },
  repository: LocalRecordRepository,
): Promise<HarvestRecordView | null> {
  return repository.getHarvestDetail(input.farmId, input.id);
}
