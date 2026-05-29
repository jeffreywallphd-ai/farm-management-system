import type { Farm } from "../../../domain/farm/Farm";
import { parseReferenceName } from "../../../domain/validation/referenceValidation";
import type { Clock } from "../../ports/Clock";
import type { FarmReferenceRepository } from "../../ports/FarmReferenceRepository";
import type { IdGenerator } from "../../ports/IdGenerator";

export interface SetupFarmInput {
  name: string;
}

export async function setupFarm(
  input: SetupFarmInput,
  dependencies: {
    clock: Clock;
    idGenerator: IdGenerator;
    repository: FarmReferenceRepository;
  },
): Promise<Farm> {
  const existingFarm = await dependencies.repository.getFarm();

  if (existingFarm) {
    return existingFarm;
  }

  const farm: Farm = {
    id: dependencies.idGenerator.newId(),
    name: parseReferenceName(input.name),
    createdAt: dependencies.clock.now().toISOString(),
  };

  await dependencies.repository.createFarm(farm);
  return farm;
}
