import type { Clock } from "../../ports/Clock";
import type { IdGenerator } from "../../ports/IdGenerator";
import type { FarmReferenceRepository } from "../../ports/FarmReferenceRepository";
import type { OrganicCertificationRepository } from "../../ports/OrganicCertificationRepository";
import type { OrganicBoundaryEvidence } from "../../../domain/organic/OrganicPlace";
import { organicBoundaryEvidenceInputSchema } from "../../../domain/validation/organicPlaceValidation";

export async function addOrganicBoundaryEvidence(
  input: Parameters<typeof organicBoundaryEvidenceInputSchema.parse>[0],
  dependencies: {
    clock: Clock;
    farmReferenceRepository: FarmReferenceRepository;
    idGenerator: IdGenerator;
    repository: OrganicCertificationRepository;
  },
): Promise<OrganicBoundaryEvidence> {
  const parsed = organicBoundaryEvidenceInputSchema.parse(input);
  const places = await dependencies.farmReferenceRepository.listLocations(parsed.farmId);

  if (!places.some((place) => place.id === parsed.placeId)) {
    throw new Error("Choose a saved farm place before adding boundary evidence.");
  }

  const now = dependencies.clock.now().toISOString();
  const evidence: OrganicBoundaryEvidence = {
    id: dependencies.idGenerator.newId(),
    farmId: parsed.farmId,
    placeId: parsed.placeId,
    evidenceType: parsed.evidenceType,
    description: parsed.description,
    attachmentUri: parsed.attachmentUri,
    capturedAt: parsed.capturedAt ? `${parsed.capturedAt}T00:00:00.000Z` : now,
    createdAt: now,
  };

  await dependencies.repository.saveBoundaryEvidence(evidence);
  return evidence;
}
