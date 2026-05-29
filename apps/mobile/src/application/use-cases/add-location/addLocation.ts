import type { FarmLocation } from "../../../domain/farm/FarmLocation";
import { parseReferenceName } from "../../../domain/validation/referenceValidation";
import type { Clock } from "../../ports/Clock";
import type { FarmReferenceRepository } from "../../ports/FarmReferenceRepository";
import type { IdGenerator } from "../../ports/IdGenerator";

export async function addLocation(
  input: { farmId: string; name: string },
  dependencies: {
    clock: Clock;
    idGenerator: IdGenerator;
    repository: FarmReferenceRepository;
  },
): Promise<FarmLocation> {
  const location: FarmLocation = {
    id: dependencies.idGenerator.newId(),
    farmId: input.farmId,
    name: parseReferenceName(input.name),
    createdAt: dependencies.clock.now().toISOString(),
  };

  await dependencies.repository.addLocation(location);
  return location;
}
