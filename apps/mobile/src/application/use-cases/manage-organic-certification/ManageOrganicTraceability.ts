import type { Clock } from "../../ports/Clock";
import type { FarmReferenceRepository } from "../../ports/FarmReferenceRepository";
import type { IdGenerator } from "../../ports/IdGenerator";
import type { OrganicCertificationRepository } from "../../ports/OrganicCertificationRepository";
import type {
  OrganicHandlingEvent,
  OrganicLot,
  OrganicMassBalanceSnapshot,
  OrganicSaleRecord,
  OrganicStorageRecord,
} from "../../../domain/organic/OrganicTraceability";
import {
  organicHandlingEventInputSchema,
  organicLotInputSchema,
  organicSaleRecordInputSchema,
  organicStorageRecordInputSchema,
  parseAttachmentIdsText,
} from "../../../domain/validation/organicTraceabilityValidation";

async function assertPlaceAndCrop(
  farmId: string,
  input: { placeId?: string; cropId?: string; storagePlaceId?: string; facilityPlaceId?: string },
  repository: FarmReferenceRepository,
) {
  const [places, crops] = await Promise.all([repository.listLocations(farmId), repository.listTrackedItems(farmId, "crop")]);
  const hasPlace = (id?: string) => !id || places.some((place) => place.id === id);
  if (!hasPlace(input.placeId)) throw new Error("Choose a saved farm place.");
  if (!hasPlace(input.storagePlaceId)) throw new Error("Choose a saved storage place.");
  if (!hasPlace(input.facilityPlaceId)) throw new Error("Choose a saved handling place or leave it blank.");
  if (input.cropId && !crops.some((crop) => crop.id === input.cropId)) throw new Error("Choose a saved crop.");
}

async function assertLot(farmId: string, lotId: string, repository: OrganicCertificationRepository): Promise<OrganicLot> {
  const lot = await repository.getOrganicLot(farmId, lotId);
  if (!lot) throw new Error("Choose a saved organic lot.");
  return lot;
}

export async function saveOrganicLot(
  input: Parameters<typeof organicLotInputSchema.parse>[0],
  dependencies: { clock: Clock; farmReferenceRepository: FarmReferenceRepository; idGenerator: IdGenerator; repository: OrganicCertificationRepository },
): Promise<OrganicLot> {
  const parsed = organicLotInputSchema.parse(input);
  await assertPlaceAndCrop(parsed.farmId, parsed, dependencies.farmReferenceRepository);
  const existing = parsed.id ? await dependencies.repository.getOrganicLot(parsed.farmId, parsed.id) : null;
  const now = dependencies.clock.now().toISOString();
  const lot: OrganicLot = {
    id: existing?.id ?? dependencies.idGenerator.newId(),
    farmId: parsed.farmId,
    lotCode: parsed.lotCode,
    cropId: parsed.cropId,
    placeId: parsed.placeId,
    harvestDate: `${parsed.harvestDate}T00:00:00.000Z`,
    organicStatus: parsed.organicStatus,
    quantityHarvested: parsed.quantityHarvested,
    unit: parsed.unit,
    createdFromHarvestRecordId: parsed.createdFromHarvestRecordId,
    notes: parsed.notes,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  await dependencies.repository.saveOrganicLot(lot);
  return lot;
}

export async function recordOrganicHandlingEvent(
  input: Parameters<typeof organicHandlingEventInputSchema.parse>[0],
  dependencies: { clock: Clock; farmReferenceRepository: FarmReferenceRepository; idGenerator: IdGenerator; repository: OrganicCertificationRepository },
): Promise<OrganicHandlingEvent> {
  const parsed = organicHandlingEventInputSchema.parse(input);
  await assertLot(parsed.farmId, parsed.lotId, dependencies.repository);
  await assertPlaceAndCrop(parsed.farmId, parsed, dependencies.farmReferenceRepository);
  const now = dependencies.clock.now().toISOString();
  const event: OrganicHandlingEvent = {
    id: dependencies.idGenerator.newId(),
    farmId: parsed.farmId,
    lotId: parsed.lotId,
    eventType: parsed.eventType,
    eventDate: parsed.eventDate ? `${parsed.eventDate}T00:00:00.000Z` : now,
    inputLotIds: parsed.inputLotIds,
    outputLotIds: parsed.outputLotIds,
    quantityIn: parsed.quantityIn,
    quantityOut: parsed.quantityOut,
    unit: parsed.unit,
    facilityPlaceId: parsed.facilityPlaceId,
    equipmentUsed: parsed.equipmentUsed,
    cleaningRecordId: parsed.cleaningRecordId,
    notes: parsed.notes,
    createdAt: now,
  };
  await dependencies.repository.saveOrganicHandlingEvent(event);
  return event;
}

export async function recordOrganicStorageRecord(
  input: Parameters<typeof organicStorageRecordInputSchema.parse>[0],
  dependencies: { clock: Clock; farmReferenceRepository: FarmReferenceRepository; idGenerator: IdGenerator; repository: OrganicCertificationRepository },
): Promise<OrganicStorageRecord> {
  const parsed = organicStorageRecordInputSchema.parse(input);
  await assertLot(parsed.farmId, parsed.lotId, dependencies.repository);
  await assertPlaceAndCrop(parsed.farmId, parsed, dependencies.farmReferenceRepository);
  const record: OrganicStorageRecord = {
    id: dependencies.idGenerator.newId(),
    farmId: parsed.farmId,
    lotId: parsed.lotId,
    storagePlaceId: parsed.storagePlaceId,
    dateIn: `${parsed.dateIn}T00:00:00.000Z`,
    dateOut: parsed.dateOut ? `${parsed.dateOut}T00:00:00.000Z` : undefined,
    quantityIn: parsed.quantityIn,
    quantityOut: parsed.quantityOut,
    unit: parsed.unit,
    containerId: parsed.containerId,
    notes: parsed.notes,
    createdAt: dependencies.clock.now().toISOString(),
  };
  await dependencies.repository.saveOrganicStorageRecord(record);
  return record;
}

export async function recordOrganicSaleRecord(
  input: Parameters<typeof organicSaleRecordInputSchema.parse>[0],
  dependencies: { clock: Clock; idGenerator: IdGenerator; repository: OrganicCertificationRepository },
): Promise<OrganicSaleRecord> {
  const parsed = organicSaleRecordInputSchema.parse(input);
  await assertLot(parsed.farmId, parsed.lotId, dependencies.repository);
  const record: OrganicSaleRecord = {
    id: dependencies.idGenerator.newId(),
    farmId: parsed.farmId,
    lotId: parsed.lotId,
    buyer: parsed.buyer,
    saleDate: `${parsed.saleDate}T00:00:00.000Z`,
    quantity: parsed.quantity,
    unit: parsed.unit,
    invoiceNumber: parsed.invoiceNumber,
    organicClaim: parsed.organicClaim,
    evidenceAttachmentIds: parseAttachmentIdsText(parsed.evidenceAttachmentIdsText),
    createdAt: dependencies.clock.now().toISOString(),
  };
  await dependencies.repository.saveOrganicSaleRecord(record);
  return record;
}

export async function createOrganicMassBalanceSnapshot(
  input: { farmId: string; cropId?: string; lotId?: string; dateRange?: string },
  dependencies: { repository: OrganicCertificationRepository },
): Promise<OrganicMassBalanceSnapshot> {
  const [allLots, handlingEvents, storageRecords, saleRecords] = await Promise.all([
    dependencies.repository.listOrganicLots(input.farmId),
    dependencies.repository.listOrganicHandlingEvents(input.farmId),
    dependencies.repository.listOrganicStorageRecords(input.farmId),
    dependencies.repository.listOrganicSaleRecords(input.farmId),
  ]);
  const lots = allLots.filter((lot) => (!input.lotId || lot.id === input.lotId) && (!input.cropId || lot.cropId === input.cropId));
  const lotIds = new Set(lots.map((lot) => lot.id));
  const quantityHarvested = sum(lots.map((lot) => lot.quantityHarvested));
  const relevantHandling = handlingEvents.filter((event) => lotIds.has(event.lotId) || event.inputLotIds.some((id) => lotIds.has(id)) || event.outputLotIds.some((id) => lotIds.has(id)));
  const relevantStorage = storageRecords.filter((record) => lotIds.has(record.lotId));
  const relevantSales = saleRecords.filter((record) => lotIds.has(record.lotId));
  const quantityHandled = sum(relevantHandling.map((event) => event.quantityOut ?? 0));
  const handlingLoss = sum(relevantHandling.map((event) => Math.max((event.quantityIn ?? 0) - (event.quantityOut ?? event.quantityIn ?? 0), 0)));
  const quantitySold = sum(relevantSales.map((record) => record.quantity));
  const quantityLost = handlingLoss;
  const storageRemaining = sum(relevantStorage.map((record) => record.quantityIn - (record.quantityOut ?? 0)));
  const expectedRemaining = quantityHarvested - quantitySold - quantityLost;
  const actualRemaining = relevantStorage.length > 0 ? storageRemaining : expectedRemaining;
  return {
    cropId: input.cropId,
    lotId: input.lotId,
    dateRange: input.dateRange ?? "All local records",
    quantityHarvested,
    quantityPurchased: 0,
    quantityHandled,
    quantityStored: storageRemaining,
    quantitySold,
    quantityLost,
    expectedRemaining,
    actualRemaining,
    discrepancy: actualRemaining - expectedRemaining,
    unit: lots[0]?.unit,
  };
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
