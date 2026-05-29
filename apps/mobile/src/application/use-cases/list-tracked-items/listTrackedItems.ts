import type { FarmId } from "../../../domain/farm/Farm";
import type { TrackedItem, TrackedItemKind } from "../../../domain/farm/TrackedItem";
import type { FarmReferenceRepository } from "../../ports/FarmReferenceRepository";

export function listTrackedItems(
  farmId: FarmId,
  kind: TrackedItemKind,
  repository: FarmReferenceRepository,
): Promise<TrackedItem[]> {
  return repository.listTrackedItems(farmId, kind);
}
