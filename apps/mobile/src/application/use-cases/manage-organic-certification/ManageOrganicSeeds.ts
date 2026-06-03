import type { Clock } from "../../ports/Clock";
import type { FarmReferenceRepository } from "../../ports/FarmReferenceRepository";
import type { IdGenerator } from "../../ports/IdGenerator";
import type { OrganicCertificationRepository } from "../../ports/OrganicCertificationRepository";
import type { CommercialAvailabilitySearch, OrganicPlantingEvent, SeedLot } from "../../../domain/organic/OrganicSeed";
import {
  commercialAvailabilitySearchInputSchema,
  organicPlantingEventInputSchema,
  seedLotInputSchema,
} from "../../../domain/validation/organicSeedValidation";

export async function saveSeedLot(
  input: Parameters<typeof seedLotInputSchema.parse>[0],
  dependencies: { clock: Clock; farmReferenceRepository: FarmReferenceRepository; idGenerator: IdGenerator; repository: OrganicCertificationRepository },
): Promise<SeedLot> {
  const parsed = seedLotInputSchema.parse(input);
  if (parsed.cropId) {
    const crops = await dependencies.farmReferenceRepository.listTrackedItems(parsed.farmId, "crop");
    if (!crops.some((crop) => crop.id === parsed.cropId)) {
      throw new Error("Choose a saved crop or leave it blank.");
    }
  }
  const existing = parsed.id ? await dependencies.repository.getSeedLot(parsed.farmId, parsed.id) : null;
  const now = dependencies.clock.now().toISOString();
  const seedLot: SeedLot = {
    ...parsed,
    id: existing?.id ?? parsed.id ?? dependencies.idGenerator.newId(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  await dependencies.repository.saveSeedLot(seedLot);
  return seedLot;
}

export async function recordCommercialAvailabilitySearch(
  input: Parameters<typeof commercialAvailabilitySearchInputSchema.parse>[0],
  dependencies: { clock: Clock; idGenerator: IdGenerator; repository: OrganicCertificationRepository },
): Promise<CommercialAvailabilitySearch> {
  const parsed = commercialAvailabilitySearchInputSchema.parse(input);
  const seedLot = await dependencies.repository.getSeedLot(parsed.farmId, parsed.seedLotId);
  if (!seedLot) {
    throw new Error("Choose a saved seed lot.");
  }
  const now = dependencies.clock.now().toISOString();
  const search: CommercialAvailabilitySearch = {
    id: dependencies.idGenerator.newId(),
    farmId: parsed.farmId,
    seedLotId: parsed.seedLotId,
    crop: parsed.crop,
    variety: parsed.variety,
    searchedOn: parsed.searchedOn ?? now.slice(0, 10),
    supplierName: parsed.supplierName,
    result: parsed.result,
    evidenceAttachmentId: parsed.evidenceAttachmentId,
    notes: parsed.notes,
    createdAt: now,
  };
  await dependencies.repository.saveCommercialAvailabilitySearch(search);
  return search;
}

export async function recordOrganicPlantingEvent(
  input: Parameters<typeof organicPlantingEventInputSchema.parse>[0],
  dependencies: { clock: Clock; farmReferenceRepository: FarmReferenceRepository; idGenerator: IdGenerator; repository: OrganicCertificationRepository },
): Promise<OrganicPlantingEvent> {
  const parsed = organicPlantingEventInputSchema.parse(input);
  const [seedLot, crops, places] = await Promise.all([
    dependencies.repository.getSeedLot(parsed.farmId, parsed.seedLotId),
    dependencies.farmReferenceRepository.listTrackedItems(parsed.farmId, "crop"),
    dependencies.farmReferenceRepository.listLocations(parsed.farmId),
  ]);
  if (!seedLot) {
    throw new Error("Choose a saved seed lot.");
  }
  if (parsed.cropId && !crops.some((crop) => crop.id === parsed.cropId)) {
    throw new Error("Choose a saved crop or leave it blank.");
  }
  if (parsed.placeId && !places.some((place) => place.id === parsed.placeId)) {
    throw new Error("Choose a saved farm place or leave it blank.");
  }
  const now = dependencies.clock.now().toISOString();
  const event: OrganicPlantingEvent = {
    id: dependencies.idGenerator.newId(),
    farmId: parsed.farmId,
    seedLotId: parsed.seedLotId,
    cropId: parsed.cropId,
    placeId: parsed.placeId,
    date: parsed.date ? `${parsed.date}T00:00:00.000Z` : now,
    quantityPlanted: parsed.quantityPlanted,
    transplantOrDirectSeed: parsed.transplantOrDirectSeed,
    linkedFarmNoteId: parsed.linkedFarmNoteId,
    createdAt: now,
  };
  await dependencies.repository.saveOrganicPlantingEvent(event);
  return event;
}
