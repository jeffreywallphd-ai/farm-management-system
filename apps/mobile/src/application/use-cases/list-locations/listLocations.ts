import type { FarmId } from "../../../domain/farm/Farm";
import type { FarmLocation } from "../../../domain/farm/FarmLocation";
import type { FarmReferenceRepository } from "../../ports/FarmReferenceRepository";

export function listLocations(
  farmId: FarmId,
  repository: FarmReferenceRepository,
): Promise<FarmLocation[]> {
  return repository.listLocations(farmId);
}
