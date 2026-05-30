import type { FarmId } from "../../../domain/farm/Farm";
import type { FarmEventView, FarmEventRepository } from "../../ports/FarmEventRepository";

export function listFarmEvents(
  farmId: FarmId,
  dependencies: { farmEventRepository: FarmEventRepository },
): Promise<FarmEventView[]> {
  return dependencies.farmEventRepository.listFarmEvents(farmId);
}

