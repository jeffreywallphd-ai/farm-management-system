import type { FarmLocation, FarmLocationId, FarmPlaceKind } from "../../../domain/farm/FarmLocation";
import { farmPlaceInputSchema } from "../../../domain/validation/referenceValidation";
import type { FarmReferenceRepository } from "../../ports/FarmReferenceRepository";

export async function updateLocation(
  input: {
    farmId: string;
    id: FarmLocationId;
    name: string;
    kind?: FarmPlaceKind;
    parentId?: FarmLocationId;
  },
  dependencies: {
    repository: FarmReferenceRepository;
  },
): Promise<FarmLocation> {
  const places = await dependencies.repository.listLocations(input.farmId);
  const existing = places.find((place) => place.id === input.id);

  if (!existing) {
    throw new Error("Choose a saved farm place to edit.");
  }

  const parsed = farmPlaceInputSchema.parse({
    name: input.name,
    kind: input.kind ?? "other",
    parentId: input.parentId ?? "",
  });

  if (parsed.parentId === input.id) {
    throw new Error("A place cannot be inside itself.");
  }

  if (parsed.parentId) {
    const parent = places.find((place) => place.id === parsed.parentId);

    if (!parent) {
      throw new Error("Choose a saved parent place or leave it as a top-level place.");
    }

    let nextParentId = parent.parentId;
    const ancestors = new Set<FarmLocationId>([parent.id]);

    while (nextParentId) {
      if (nextParentId === input.id) {
        throw new Error("A place cannot be moved inside one of its child places.");
      }

      if (ancestors.has(nextParentId)) {
        throw new Error("This parent relationship would create a loop.");
      }

      ancestors.add(nextParentId);
      nextParentId = places.find((place) => place.id === nextParentId)?.parentId;
    }
  }

  const location: FarmLocation = {
    ...existing,
    name: parsed.name,
    kind: parsed.kind,
    parentId: parsed.parentId,
  };

  await dependencies.repository.updateLocation(location);
  return location;
}
