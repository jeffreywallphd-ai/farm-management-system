import type { FarmEventId } from "../../../domain/events/FarmEvent";
import type { FarmId } from "../../../domain/farm/Farm";
import type { FarmEventRepository, FarmEventView } from "../../ports/FarmEventRepository";

export function getFarmEventDetail(
  farmId: FarmId,
  id: FarmEventId,
  dependencies: { farmEventRepository: FarmEventRepository },
): Promise<FarmEventView | null> {
  return dependencies.farmEventRepository.getFarmEventDetail(farmId, id);
}

