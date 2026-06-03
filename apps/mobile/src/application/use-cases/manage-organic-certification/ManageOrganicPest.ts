import type { Clock } from "../../ports/Clock";
import type { FarmReferenceRepository } from "../../ports/FarmReferenceRepository";
import type { IdGenerator } from "../../ports/IdGenerator";
import type { OrganicCertificationRepository } from "../../ports/OrganicCertificationRepository";
import type { PestWeedDiseaseAction, PestWeedDiseaseObservation, PlasticMulchRecord } from "../../../domain/organic/OrganicPest";
import {
  parseAttachmentIdsText,
  pestActionInputSchema,
  pestObservationInputSchema,
  plasticMulchRecordInputSchema,
} from "../../../domain/validation/organicPestValidation";

async function assertOptionalPlaceAndCrop(farmId: string, input: { placeId?: string; cropId?: string }, repository: FarmReferenceRepository) {
  const [places, crops] = await Promise.all([repository.listLocations(farmId), repository.listTrackedItems(farmId, "crop")]);
  if (input.placeId && !places.some((place) => place.id === input.placeId)) throw new Error("Choose a saved farm place or leave it blank.");
  if (input.cropId && !crops.some((crop) => crop.id === input.cropId)) throw new Error("Choose a saved crop or leave it blank.");
}

export async function recordPestWeedDiseaseObservation(
  input: Parameters<typeof pestObservationInputSchema.parse>[0],
  dependencies: { clock: Clock; farmReferenceRepository: FarmReferenceRepository; idGenerator: IdGenerator; repository: OrganicCertificationRepository },
): Promise<PestWeedDiseaseObservation> {
  const parsed = pestObservationInputSchema.parse(input);
  await assertOptionalPlaceAndCrop(parsed.farmId, parsed, dependencies.farmReferenceRepository);
  const now = dependencies.clock.now().toISOString();
  const observation: PestWeedDiseaseObservation = {
    id: dependencies.idGenerator.newId(),
    farmId: parsed.farmId,
    type: parsed.type,
    placeId: parsed.placeId,
    cropId: parsed.cropId,
    observedAt: parsed.observedAt ? `${parsed.observedAt}T00:00:00.000Z` : now,
    severity: parsed.severity,
    description: parsed.description,
    photoAttachmentIds: parseAttachmentIdsText(parsed.photoAttachmentIdsText),
    linkedFarmNoteId: parsed.linkedFarmNoteId,
    createdAt: now,
  };
  await dependencies.repository.savePestWeedDiseaseObservation(observation);
  return observation;
}

export async function recordPestWeedDiseaseAction(
  input: Parameters<typeof pestActionInputSchema.parse>[0],
  dependencies: { clock: Clock; idGenerator: IdGenerator; repository: OrganicCertificationRepository },
): Promise<PestWeedDiseaseAction> {
  const parsed = pestActionInputSchema.parse(input);
  const observation = await dependencies.repository.getPestWeedDiseaseObservation(parsed.farmId, parsed.observationId);
  if (!observation) throw new Error("Choose a saved observation.");
  const now = dependencies.clock.now().toISOString();
  const action: PestWeedDiseaseAction = {
    id: dependencies.idGenerator.newId(),
    farmId: parsed.farmId,
    observationId: parsed.observationId,
    actionType: parsed.actionType,
    actionDate: parsed.actionDate ? `${parsed.actionDate}T00:00:00.000Z` : now,
    description: parsed.description,
    inputApplicationId: parsed.inputApplicationId,
    whyNeeded: parsed.whyNeeded,
    effectivenessNotes: parsed.effectivenessNotes,
    evidenceAttachmentIds: parseAttachmentIdsText(parsed.evidenceAttachmentIdsText),
    createdAt: now,
  };
  await dependencies.repository.savePestWeedDiseaseAction(action);
  return action;
}

export async function recordPlasticMulchRecord(
  input: Parameters<typeof plasticMulchRecordInputSchema.parse>[0],
  dependencies: { clock: Clock; farmReferenceRepository: FarmReferenceRepository; idGenerator: IdGenerator; repository: OrganicCertificationRepository },
): Promise<PlasticMulchRecord> {
  const parsed = plasticMulchRecordInputSchema.parse(input);
  await assertOptionalPlaceAndCrop(parsed.farmId, parsed, dependencies.farmReferenceRepository);
  const record: PlasticMulchRecord = {
    id: dependencies.idGenerator.newId(),
    farmId: parsed.farmId,
    placeId: parsed.placeId,
    cropId: parsed.cropId,
    installedDate: parsed.installedDate,
    removedDate: parsed.removedDate,
    material: parsed.material,
    notes: parsed.notes,
    evidenceAttachmentIds: parseAttachmentIdsText(parsed.evidenceAttachmentIdsText),
    createdAt: dependencies.clock.now().toISOString(),
  };
  await dependencies.repository.savePlasticMulchRecord(record);
  return record;
}
