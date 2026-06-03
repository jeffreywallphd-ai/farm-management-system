import type { FarmId } from "../../../domain/farm/Farm";
import { parseReferenceName } from "../../../domain/validation/referenceValidation";
import type { FarmReferenceRepository } from "../../ports/FarmReferenceRepository";

export async function updateFarmName(
  input: { farmId: FarmId; name: string },
  dependencies: { repository: FarmReferenceRepository },
): Promise<void> {
  await dependencies.repository.updateFarmName(input.farmId, parseReferenceName(input.name));
}
