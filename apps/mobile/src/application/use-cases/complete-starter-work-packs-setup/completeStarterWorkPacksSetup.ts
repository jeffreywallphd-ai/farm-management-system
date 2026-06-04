import type { Farm, FarmId } from "../../../domain/farm/Farm";
import type { Clock } from "../../ports/Clock";
import type { FarmReferenceRepository } from "../../ports/FarmReferenceRepository";

export async function completeStarterWorkPacksSetup(
  farmId: FarmId,
  dependencies: { clock: Clock; repository: FarmReferenceRepository },
): Promise<Farm | null> {
  const completedAt = dependencies.clock.now().toISOString();
  await dependencies.repository.markStarterWorkPacksSetupComplete(farmId, completedAt);
  return dependencies.repository.getFarm();
}
