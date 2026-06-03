import type { Clock } from "../../ports/Clock";
import type { FarmReferenceRepository } from "../../ports/FarmReferenceRepository";
import type { IdGenerator } from "../../ports/IdGenerator";
import type { OrganicCertificationRepository } from "../../ports/OrganicCertificationRepository";
import type {
  CompostBatch,
  CompostTemperatureLog,
  CropRotationRecord,
  ManureApplication,
  SoilFertilityPractice,
} from "../../../domain/organic/OrganicSoil";
import {
  calculateEarliestHarvestDate,
  calculateManureInterval,
  compostBatchInputSchema,
  compostTemperatureLogInputSchema,
  cropRotationRecordInputSchema,
  manureApplicationInputSchema,
  parseAttachmentIdsText,
  soilFertilityPracticeInputSchema,
} from "../../../domain/validation/organicSoilValidation";

async function assertOptionalPlaceAndCrop(
  farmId: string,
  input: { placeId?: string; cropId?: string; previousCropId?: string },
  repository: FarmReferenceRepository,
) {
  const [places, crops] = await Promise.all([
    repository.listLocations(farmId),
    repository.listTrackedItems(farmId, "crop"),
  ]);
  if (input.placeId && !places.some((place) => place.id === input.placeId)) {
    throw new Error("Choose a saved farm place or leave it blank.");
  }
  if (input.cropId && !crops.some((crop) => crop.id === input.cropId)) {
    throw new Error("Choose a saved crop or leave it blank.");
  }
  if (input.previousCropId && !crops.some((crop) => crop.id === input.previousCropId)) {
    throw new Error("Choose a saved previous crop or leave it blank.");
  }
}

export async function recordSoilFertilityPractice(
  input: Parameters<typeof soilFertilityPracticeInputSchema.parse>[0],
  dependencies: { clock: Clock; farmReferenceRepository: FarmReferenceRepository; idGenerator: IdGenerator; repository: OrganicCertificationRepository },
): Promise<SoilFertilityPractice> {
  const parsed = soilFertilityPracticeInputSchema.parse(input);
  await assertOptionalPlaceAndCrop(parsed.farmId, parsed, dependencies.farmReferenceRepository);
  const now = dependencies.clock.now().toISOString();
  const practice: SoilFertilityPractice = {
    id: dependencies.idGenerator.newId(),
    farmId: parsed.farmId,
    placeId: parsed.placeId,
    practiceType: parsed.practiceType,
    cropId: parsed.cropId,
    date: parsed.date ? `${parsed.date}T00:00:00.000Z` : now,
    description: parsed.description,
    evidenceAttachmentIds: parseAttachmentIdsText(parsed.evidenceAttachmentIdsText),
    linkedFarmNoteId: parsed.linkedFarmNoteId,
    createdAt: now,
  };
  await dependencies.repository.saveSoilFertilityPractice(practice);
  return practice;
}

export async function saveCompostBatch(
  input: Parameters<typeof compostBatchInputSchema.parse>[0],
  dependencies: { clock: Clock; idGenerator: IdGenerator; repository: OrganicCertificationRepository },
): Promise<CompostBatch> {
  const parsed = compostBatchInputSchema.parse(input);
  const existing = parsed.id ? await dependencies.repository.getCompostBatch(parsed.farmId, parsed.id) : null;
  const now = dependencies.clock.now().toISOString();
  const batch: CompostBatch = {
    ...parsed,
    id: existing?.id ?? parsed.id ?? dependencies.idGenerator.newId(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  await dependencies.repository.saveCompostBatch(batch);
  return batch;
}

export async function recordCompostTemperatureLog(
  input: Parameters<typeof compostTemperatureLogInputSchema.parse>[0],
  dependencies: { clock: Clock; idGenerator: IdGenerator; repository: OrganicCertificationRepository },
): Promise<CompostTemperatureLog> {
  const parsed = compostTemperatureLogInputSchema.parse(input);
  const batch = await dependencies.repository.getCompostBatch(parsed.farmId, parsed.compostBatchId);
  if (!batch) {
    throw new Error("Choose a saved compost batch.");
  }
  const now = dependencies.clock.now().toISOString();
  const log: CompostTemperatureLog = {
    id: dependencies.idGenerator.newId(),
    farmId: parsed.farmId,
    compostBatchId: parsed.compostBatchId,
    date: parsed.date ? `${parsed.date}T00:00:00.000Z` : now,
    temperatureF: parsed.temperatureF,
    turned: parsed.turned,
    notes: parsed.notes,
    createdAt: now,
  };
  await dependencies.repository.saveCompostTemperatureLog(log);
  return log;
}

export async function recordManureApplication(
  input: Parameters<typeof manureApplicationInputSchema.parse>[0],
  dependencies: { clock: Clock; farmReferenceRepository: FarmReferenceRepository; idGenerator: IdGenerator; repository: OrganicCertificationRepository },
): Promise<ManureApplication> {
  const parsed = manureApplicationInputSchema.parse(input);
  await assertOptionalPlaceAndCrop(parsed.farmId, parsed, dependencies.farmReferenceRepository);
  const now = dependencies.clock.now().toISOString();
  const applicationDate = parsed.applicationDate ?? now.slice(0, 10);
  const requiredDaysBeforeHarvest = calculateManureInterval(parsed.ediblePortionContactSoil);
  const application: ManureApplication = {
    id: dependencies.idGenerator.newId(),
    farmId: parsed.farmId,
    placeId: parsed.placeId,
    cropId: parsed.cropId,
    applicationDate: `${applicationDate}T00:00:00.000Z`,
    manureType: parsed.manureType,
    incorporated: parsed.incorporated,
    ediblePortionContactSoil: parsed.ediblePortionContactSoil,
    requiredDaysBeforeHarvest,
    earliestHarvestDate: calculateEarliestHarvestDate(applicationDate, requiredDaysBeforeHarvest),
    quantity: parsed.quantity,
    notes: parsed.notes,
    createdAt: now,
  };
  await dependencies.repository.saveManureApplication(application);
  return application;
}

export async function recordCropRotationRecord(
  input: Parameters<typeof cropRotationRecordInputSchema.parse>[0],
  dependencies: { clock: Clock; farmReferenceRepository: FarmReferenceRepository; idGenerator: IdGenerator; repository: OrganicCertificationRepository },
): Promise<CropRotationRecord> {
  const parsed = cropRotationRecordInputSchema.parse(input);
  await assertOptionalPlaceAndCrop(parsed.farmId, parsed, dependencies.farmReferenceRepository);
  const record: CropRotationRecord = {
    id: dependencies.idGenerator.newId(),
    farmId: parsed.farmId,
    placeId: parsed.placeId,
    cropId: parsed.cropId,
    season: parsed.season,
    year: parsed.year,
    previousCropId: parsed.previousCropId,
    rotationPurpose: parsed.rotationPurpose,
    coverCropUsed: parsed.coverCropUsed,
    notes: parsed.notes,
    createdAt: dependencies.clock.now().toISOString(),
  };
  await dependencies.repository.saveCropRotationRecord(record);
  return record;
}
