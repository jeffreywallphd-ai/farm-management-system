import type { FarmId } from "../../../domain/farm/Farm";
import type { OperationalRecordId, OperationalRecordKind } from "../../../domain/records/OperationalRecord";
import type { LocalActivityRecordView, LocalRecordRepository } from "../../ports/LocalRecordRepository";

export async function getLocalActivityDetail(
  input: { farmId: FarmId; kind: OperationalRecordKind; id: OperationalRecordId },
  repository: LocalRecordRepository,
): Promise<LocalActivityRecordView | null> {
  return repository.getLocalActivityDetail(input.farmId, input.kind, input.id);
}
