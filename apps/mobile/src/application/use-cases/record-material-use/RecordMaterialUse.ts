import { z } from "zod";

import type { FarmId } from "../../../domain/farm/Farm";
import type { MaterialUseRecorded } from "../../../domain/records/MaterialUseRecorded";
import { parseMaterialUseInput, type MaterialUseInput } from "../../../domain/validation/manualRecordValidation";
import type { Clock } from "../../ports/Clock";
import type { FarmReferenceRepository } from "../../ports/FarmReferenceRepository";
import type { IdGenerator } from "../../ports/IdGenerator";
import type { LocalRecordRepository } from "../../ports/LocalRecordRepository";

export async function recordMaterialUse(
  input: MaterialUseInput & { farmId: FarmId },
  dependencies: {
    clock: Clock;
    farmReferenceRepository: FarmReferenceRepository;
    idGenerator: IdGenerator;
    localRecordRepository: LocalRecordRepository;
  },
): Promise<MaterialUseRecorded> {
  const parsed = parseMaterialUseInput(input);
  const [materials, locations] = await Promise.all([
    dependencies.farmReferenceRepository.listTrackedItems(input.farmId, "material"),
    dependencies.farmReferenceRepository.listLocations(input.farmId),
  ]);

  if (!materials.some((material) => material.id === parsed.materialId)) {
    throw new z.ZodError([
      { code: "custom", message: "Choose a material.", path: ["materialId"], input: parsed.materialId },
    ]);
  }

  if (parsed.useLocationId && !locations.some((location) => location.id === parsed.useLocationId)) {
    throw new z.ZodError([
      {
        code: "custom",
        message: "Choose a saved location or leave it blank.",
        path: ["useLocationId"],
        input: parsed.useLocationId,
      },
    ]);
  }

  const now = dependencies.clock.now().toISOString();
  const record: MaterialUseRecorded = {
    id: dependencies.idGenerator.newId(),
    kind: "MaterialUseRecorded",
    farmId: input.farmId,
    materialId: parsed.materialId,
    quantity: { amount: parsed.quantityText, unit: parsed.unit },
    useLocationId: parsed.useLocationId,
    effectiveAt: now,
    createdAt: now,
    privacy: "privateToFarm",
    note: parsed.note,
  };

  await dependencies.localRecordRepository.saveMaterialUse(record);
  return record;
}
