import type { Clock } from "../../ports/Clock";
import type { FarmReferenceRepository } from "../../ports/FarmReferenceRepository";
import type { IdGenerator } from "../../ports/IdGenerator";
import type { OrganicCertificationRepository } from "../../ports/OrganicCertificationRepository";
import type { OrganicInputApplication } from "../../../domain/organic/OrganicInput";
import { organicInputApplicationInputSchema, parseAttachmentIdsText } from "../../../domain/validation/organicInputValidation";

export async function recordOrganicInputApplication(
  input: Parameters<typeof organicInputApplicationInputSchema.parse>[0],
  dependencies: {
    clock: Clock;
    farmReferenceRepository: FarmReferenceRepository;
    idGenerator: IdGenerator;
    repository: OrganicCertificationRepository;
  },
): Promise<OrganicInputApplication> {
  const parsed = organicInputApplicationInputSchema.parse(input);
  const [organicInput, places, crops] = await Promise.all([
    dependencies.repository.getOrganicInput(parsed.farmId, parsed.inputId),
    dependencies.farmReferenceRepository.listLocations(parsed.farmId),
    dependencies.farmReferenceRepository.listTrackedItems(parsed.farmId, "crop"),
  ]);

  if (!organicInput) {
    throw new Error("Choose a saved organic input.");
  }
  if (parsed.placeId && !places.some((place) => place.id === parsed.placeId)) {
    throw new Error("Choose a saved farm place or leave it blank.");
  }
  if (parsed.cropId && !crops.some((crop) => crop.id === parsed.cropId)) {
    throw new Error("Choose a saved crop or leave it blank.");
  }

  const now = dependencies.clock.now().toISOString();
  const application: OrganicInputApplication = {
    id: dependencies.idGenerator.newId(),
    farmId: parsed.farmId,
    inputId: parsed.inputId,
    placeId: parsed.placeId,
    cropId: parsed.cropId,
    date: parsed.date ? `${parsed.date}T00:00:00.000Z` : now,
    quantity: parsed.quantity,
    unit: parsed.unit,
    rate: parsed.rate,
    reason: parsed.reason,
    targetProblem: parsed.targetProblem,
    weatherNotes: parsed.weatherNotes,
    appliedBy: parsed.appliedBy,
    evidenceAttachmentIds: parseAttachmentIdsText(parsed.evidenceAttachmentIdsText),
    linkedFarmNoteId: parsed.linkedFarmNoteId,
    createdAt: now,
    updatedAt: now,
  };

  await dependencies.repository.saveOrganicInputApplication(application);
  return application;
}
