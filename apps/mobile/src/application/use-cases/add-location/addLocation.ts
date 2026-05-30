import type { FarmLocation, FarmLocationId, FarmPlaceKind } from "../../../domain/farm/FarmLocation";
import { farmPlaceInputSchema } from "../../../domain/validation/referenceValidation";
import type { Clock } from "../../ports/Clock";
import type { FarmReferenceRepository } from "../../ports/FarmReferenceRepository";
import type { IdGenerator } from "../../ports/IdGenerator";

export async function addLocation(
  input: { farmId: string; name: string; kind?: FarmPlaceKind; parentId?: FarmLocationId },
  dependencies: {
    clock: Clock;
    idGenerator: IdGenerator;
    repository: FarmReferenceRepository;
  },
): Promise<FarmLocation> {
  const parsed = farmPlaceInputSchema.parse({
    name: input.name,
    kind: input.kind ?? "other",
    parentId: input.parentId ?? "",
  });
  const id = dependencies.idGenerator.newId();

  if (parsed.parentId === id) {
    throw new Error("A place cannot be inside itself.");
  }

  if (parsed.parentId) {
    const places = await dependencies.repository.listLocations(input.farmId);
    const parent = places.find((place) => place.id === parsed.parentId);

    if (!parent) {
      throw new Error("Choose a saved parent place or leave it as a top-level place.");
    }

    const ancestors = new Set<FarmLocationId>();
    let nextParentId = parent.parentId;

    while (nextParentId) {
      if (ancestors.has(nextParentId)) {
        throw new Error("This parent relationship would create a loop.");
      }

      ancestors.add(nextParentId);
      nextParentId = places.find((place) => place.id === nextParentId)?.parentId;
    }
  }

  const location: FarmLocation = {
    id,
    farmId: input.farmId,
    name: parsed.name,
    kind: parsed.kind,
    parentId: parsed.parentId,
    createdAt: dependencies.clock.now().toISOString(),
  };

  await dependencies.repository.addLocation(location);
  return location;
}
