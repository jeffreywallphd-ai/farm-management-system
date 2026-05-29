import { z } from "zod";

import type { FarmId } from "../../../domain/farm/Farm";
import type { HarvestRecorded } from "../../../domain/records/HarvestRecorded";
import { parseHarvestInput, type HarvestInput } from "../../../domain/validation/harvestValidation";
import type { Clock } from "../../ports/Clock";
import type { FarmReferenceRepository } from "../../ports/FarmReferenceRepository";
import type { IdGenerator } from "../../ports/IdGenerator";
import type { LocalRecordRepository } from "../../ports/LocalRecordRepository";

export async function recordHarvest(
  input: HarvestInput & { farmId: FarmId },
  dependencies: {
    clock: Clock;
    farmReferenceRepository: FarmReferenceRepository;
    idGenerator: IdGenerator;
    localRecordRepository: LocalRecordRepository;
  },
): Promise<HarvestRecorded> {
  const parsed = parseHarvestInput(input);
  const [crops, locations] = await Promise.all([
    dependencies.farmReferenceRepository.listTrackedItems(input.farmId, "crop"),
    dependencies.farmReferenceRepository.listLocations(input.farmId),
  ]);

  if (!crops.some((crop) => crop.id === parsed.cropId)) {
    throw new z.ZodError([
      {
        code: "custom",
        message: "Choose a crop.",
        path: ["cropId"],
        input: parsed.cropId,
      },
    ]);
  }

  if (!locations.some((location) => location.id === parsed.sourceLocationId)) {
    throw new z.ZodError([
      {
        code: "custom",
        message: "Choose where this harvest came from.",
        path: ["sourceLocationId"],
        input: parsed.sourceLocationId,
      },
    ]);
  }

  const now = dependencies.clock.now().toISOString();
  const record: HarvestRecorded = {
    id: dependencies.idGenerator.newId(),
    kind: "HarvestRecorded",
    farmId: input.farmId,
    cropId: parsed.cropId,
    sourceLocationId: parsed.sourceLocationId,
    quantity: {
      amount: parsed.quantityText,
      unit: parsed.unit,
    },
    effectiveAt: now,
    createdAt: now,
    privacy: "privateToFarm",
    note: parsed.note,
  };

  await dependencies.localRecordRepository.saveHarvest(record);
  return record;
}
