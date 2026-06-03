import type { OrganicCertificationRepository } from "../../ports/OrganicCertificationRepository";
import type { Clock } from "../../ports/Clock";
import type { FarmReferenceRepository } from "../../ports/FarmReferenceRepository";
import { calculateOrganicEligibilityDate, organicPlaceProfileInputSchema } from "../../../domain/validation/organicPlaceValidation";
import type { OrganicPlaceProfile } from "../../../domain/organic/OrganicPlace";

export async function saveOrganicPlaceProfile(
  input: Parameters<typeof organicPlaceProfileInputSchema.parse>[0],
  dependencies: {
    clock: Clock;
    farmReferenceRepository: FarmReferenceRepository;
    repository: OrganicCertificationRepository;
  },
): Promise<OrganicPlaceProfile> {
  const parsed = organicPlaceProfileInputSchema.parse(input);
  const places = await dependencies.farmReferenceRepository.listLocations(parsed.farmId);
  const place = places.find((candidate) => candidate.id === parsed.placeId);

  if (!place) {
    throw new Error("Choose a saved farm place before adding organic details.");
  }

  const existing = await dependencies.repository.getPlaceProfile(parsed.farmId, parsed.placeId);
  const now = dependencies.clock.now().toISOString();
  const profile: OrganicPlaceProfile = {
    ...parsed,
    organicEligibilityDate: parsed.organicEligibilityDate ?? calculateOrganicEligibilityDate(parsed.lastProhibitedSubstanceDate),
    evidenceAttachmentIds: existing?.evidenceAttachmentIds ?? [],
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  await dependencies.repository.savePlaceProfile(profile);
  return profile;
}
