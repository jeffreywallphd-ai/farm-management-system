import { z } from "zod";

import type { FarmId } from "../../../domain/farm/Farm";
import type { InventoryCountRecorded } from "../../../domain/records/InventoryCountRecorded";
import { parseInventoryCountInput, type InventoryCountInput } from "../../../domain/validation/manualRecordValidation";
import type { Clock } from "../../ports/Clock";
import type { FarmReferenceRepository } from "../../ports/FarmReferenceRepository";
import type { IdGenerator } from "../../ports/IdGenerator";
import type { LocalRecordRepository } from "../../ports/LocalRecordRepository";

export async function recordInventoryCount(
  input: InventoryCountInput & { farmId: FarmId },
  dependencies: {
    clock: Clock;
    farmReferenceRepository: FarmReferenceRepository;
    idGenerator: IdGenerator;
    localRecordRepository: LocalRecordRepository;
  },
): Promise<InventoryCountRecorded> {
  const parsed = parseInventoryCountInput(input);
  const [items, locations] = await Promise.all([
    dependencies.farmReferenceRepository.listTrackedItems(input.farmId),
    dependencies.farmReferenceRepository.listLocations(input.farmId),
  ]);
  const selectedItem = items.find((item) => item.id === parsed.trackedItemId);

  if (!selectedItem || !["material", "countableItem"].includes(selectedItem.kind)) {
    throw new z.ZodError([
      {
        code: "custom",
        message: "Choose a material or countable item.",
        path: ["trackedItemId"],
        input: parsed.trackedItemId,
      },
    ]);
  }

  if (parsed.locationId && !locations.some((location) => location.id === parsed.locationId)) {
    throw new z.ZodError([
      {
        code: "custom",
        message: "Choose a saved location or leave it blank.",
        path: ["locationId"],
        input: parsed.locationId,
      },
    ]);
  }

  const now = dependencies.clock.now().toISOString();
  const record: InventoryCountRecorded = {
    id: dependencies.idGenerator.newId(),
    kind: "InventoryCountRecorded",
    farmId: input.farmId,
    trackedItemId: parsed.trackedItemId,
    observedQuantity: { amount: parsed.quantityText, unit: parsed.unit },
    locationId: parsed.locationId,
    effectiveAt: now,
    createdAt: now,
    privacy: "privateToFarm",
    note: parsed.note,
  };

  await dependencies.localRecordRepository.saveInventoryCount(record);
  return record;
}
