import type { TrackedItem } from "../../../domain/farm/TrackedItem";
import { parseReferenceName, trackedItemKindSchema } from "../../../domain/validation/referenceValidation";
import type { Clock } from "../../ports/Clock";
import type { FarmReferenceRepository } from "../../ports/FarmReferenceRepository";
import type { IdGenerator } from "../../ports/IdGenerator";

export async function addTrackedItem(
  input: { farmId: string; kind: string; name: string },
  dependencies: {
    clock: Clock;
    idGenerator: IdGenerator;
    repository: FarmReferenceRepository;
  },
): Promise<TrackedItem> {
  const item: TrackedItem = {
    id: dependencies.idGenerator.newId(),
    farmId: input.farmId,
    kind: trackedItemKindSchema.parse(input.kind),
    name: parseReferenceName(input.name),
    createdAt: dependencies.clock.now().toISOString(),
  };

  await dependencies.repository.addTrackedItem(item);
  return item;
}
