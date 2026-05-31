import type { TrackedItem, TrackedItemId, TrackedItemKind } from "../../../domain/farm/TrackedItem";
import { parseReferenceName, trackedItemKindSchema } from "../../../domain/validation/referenceValidation";
import type { FarmReferenceRepository } from "../../ports/FarmReferenceRepository";

export async function updateTrackedItem(
  input: { farmId: string; id: TrackedItemId; kind: TrackedItemKind; name: string },
  dependencies: { repository: FarmReferenceRepository },
): Promise<TrackedItem> {
  const kind = trackedItemKindSchema.parse(input.kind);
  const items = await dependencies.repository.listTrackedItems(input.farmId, kind);
  const existing = items.find((item) => item.id === input.id);

  if (!existing) {
    throw new Error("Choose a saved setup item to edit.");
  }

  const item: TrackedItem = {
    ...existing,
    name: parseReferenceName(input.name),
  };

  await dependencies.repository.updateTrackedItem(item);
  return item;
}
