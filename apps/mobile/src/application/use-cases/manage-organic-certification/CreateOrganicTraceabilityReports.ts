import type { Farm } from "../../../domain/farm/Farm";
import type { FarmLocation } from "../../../domain/farm/FarmLocation";
import type { TrackedItem } from "../../../domain/farm/TrackedItem";
import { ORGANIC_HANDLING_EVENT_TYPE_LABELS, ORGANIC_LOT_STATUS_LABELS } from "../../../domain/organic/OrganicTraceability";
import type { Clock } from "../../ports/Clock";
import type { FarmReferenceRepository } from "../../ports/FarmReferenceRepository";
import type { OrganicCertificationRepository } from "../../ports/OrganicCertificationRepository";
import { createOrganicMassBalanceSnapshot } from "./ManageOrganicTraceability";

export async function createOrganicTraceabilityReport(
  input: { farm: Farm; reportType: "lots" | "handling" | "storage" | "sales" | "massBalance"; lotId?: string },
  dependencies: { clock: Clock; farmReferenceRepository?: FarmReferenceRepository; repository: OrganicCertificationRepository },
): Promise<string> {
  const [lots, handlingEvents, storageRecords, saleRecords, locations, crops] = await Promise.all([
    dependencies.repository.listOrganicLots(input.farm.id),
    dependencies.repository.listOrganicHandlingEvents(input.farm.id, input.lotId),
    dependencies.repository.listOrganicStorageRecords(input.farm.id, input.lotId),
    dependencies.repository.listOrganicSaleRecords(input.farm.id, input.lotId),
    dependencies.farmReferenceRepository?.listLocations(input.farm.id) ?? Promise.resolve([]),
    dependencies.farmReferenceRepository?.listTrackedItems(input.farm.id, "crop") ?? Promise.resolve([]),
  ]);
  const selectedLots = input.lotId ? lots.filter((lot) => lot.id === input.lotId) : lots;
  const lotById = new Map(lots.map((lot) => [lot.id, lot]));
  const cropById = new Map(crops.map((crop) => [crop.id, crop]));
  const placeById = new Map(locations.map((location) => [location.id, location]));
  const placeLabel = (placeId?: string) => formatPlaceLabel(placeId, placeById);
  const cropLabel = (cropId?: string) => formatCropLabel(cropId, cropById);
  const lotLabel = (lotId: string) => {
    const lot = lotById.get(lotId);
    return lot ? `${lot.lotCode} (${lotId})` : lotId;
  };
  const lines = [
    reportTitles[input.reportType],
    `Farm: ${input.farm.name}`,
    `Generated: ${dependencies.clock.now().toISOString()}`,
    "Use: This report organizes harvest, handling, storage, sale, and mass-balance records for certifier review. It does not certify compliance.",
    "",
  ];
  if (input.reportType === "lots") {
    for (const lot of selectedLots) {
      lines.push(`Lot: ${lot.lotCode}`);
      lines.push(`Harvest date: ${lot.harvestDate}`);
      lines.push(`Status: ${ORGANIC_LOT_STATUS_LABELS[lot.organicStatus]}`);
      lines.push(`Harvested: ${lot.quantityHarvested} ${lot.unit}`);
      lines.push(`Crop: ${cropLabel(lot.cropId)}`);
      lines.push(`Harvest place: ${placeLabel(lot.placeId)}`);
      lines.push(`Source harvest record ID: ${lot.createdFromHarvestRecordId ?? "Not linked"}`);
      lines.push("");
    }
  } else if (input.reportType === "handling") {
    for (const event of handlingEvents) {
      lines.push(`Handling event: ${ORGANIC_HANDLING_EVENT_TYPE_LABELS[event.eventType]}`);
      lines.push(`Lot: ${lotLabel(event.lotId)}`);
      lines.push(`Date: ${event.eventDate}`);
      lines.push(`Input lots: ${event.inputLotIds.map(lotLabel).join(", ") || "None recorded"}`);
      lines.push(`Output lots: ${event.outputLotIds.map(lotLabel).join(", ") || "None recorded"}`);
      lines.push(`Quantity in/out: ${event.quantityIn ?? "Not recorded"} / ${event.quantityOut ?? "Not recorded"} ${event.unit ?? ""}`.trim());
      lines.push(`Handling place: ${placeLabel(event.facilityPlaceId)}`);
      lines.push(`Equipment: ${event.equipmentUsed ?? "Not recorded"}`);
      lines.push(`Cleaning record ID: ${event.cleaningRecordId ?? "Not recorded"}`);
      lines.push("");
    }
  } else if (input.reportType === "storage") {
    for (const record of storageRecords) {
      lines.push(`Storage lot: ${lotLabel(record.lotId)}`);
      lines.push(`Storage place: ${placeLabel(record.storagePlaceId)}`);
      lines.push(`Date in/out: ${record.dateIn} / ${record.dateOut ?? "Still in storage"}`);
      lines.push(`Quantity in/out: ${record.quantityIn} / ${record.quantityOut ?? 0} ${record.unit}`);
      lines.push(`Container: ${record.containerId ?? "Not recorded"}`);
      lines.push("");
    }
  } else if (input.reportType === "sales") {
    for (const record of saleRecords) {
      lines.push(`Sale lot: ${lotLabel(record.lotId)}`);
      const lot = lotById.get(record.lotId);
      if (lot) {
        lines.push(`Crop: ${cropLabel(lot.cropId)}`);
        lines.push(`Harvest place: ${placeLabel(lot.placeId)}`);
        lines.push(`Harvest date: ${lot.harvestDate}`);
      }
      lines.push(`Buyer: ${record.buyer}`);
      lines.push(`Sale date: ${record.saleDate}`);
      lines.push(`Quantity: ${record.quantity} ${record.unit}`);
      lines.push(`Invoice: ${record.invoiceNumber ?? "Not recorded"}`);
      lines.push(`Organic claim: ${record.organicClaim ?? "Not recorded"}`);
      lines.push("");
    }
  } else {
    const snapshot = await createOrganicMassBalanceSnapshot({ farmId: input.farm.id, lotId: input.lotId }, { repository: dependencies.repository });
    lines.push(`Date range: ${snapshot.dateRange}`);
    lines.push(`Quantity harvested: ${snapshot.quantityHarvested} ${snapshot.unit ?? ""}`.trim());
    lines.push(`Quantity handled: ${snapshot.quantityHandled}`);
    lines.push(`Quantity stored: ${snapshot.quantityStored}`);
    lines.push(`Quantity sold: ${snapshot.quantitySold}`);
    lines.push(`Quantity lost: ${snapshot.quantityLost}`);
    lines.push(`Expected remaining: ${snapshot.expectedRemaining}`);
    lines.push(`Actual remaining: ${snapshot.actualRemaining}`);
    lines.push(`Discrepancy: ${snapshot.discrepancy}`);
  }
  if (lines.length === 5) lines.push("No records found for this report.");
  return lines.join("\n");
}

const reportTitles = {
  lots: "Organic Lot Traceability Report",
  handling: "Organic Handling and Commingling Prevention Report",
  storage: "Organic Storage Report",
  sales: "Organic Sale Traceability Report",
  massBalance: "Organic Mass Balance Report",
} as const;

function formatCropLabel(cropId: string | undefined, cropById: Map<string, TrackedItem>): string {
  if (!cropId) return "Not recorded";
  const crop = cropById.get(cropId);
  return crop ? `${crop.name} (${cropId})` : cropId;
}

function formatPlaceLabel(placeId: string | undefined, placeById: Map<string, FarmLocation>): string {
  if (!placeId) return "Not recorded";
  const place = placeById.get(placeId);
  if (!place) return placeId;
  return `${buildPlacePath(place, placeById)} (${placeId})`;
}

function buildPlacePath(place: FarmLocation, placeById: Map<string, FarmLocation>): string {
  const names = [place.name];
  let current = place.parentId ? placeById.get(place.parentId) : undefined;
  while (current) {
    names.unshift(current.name);
    current = current.parentId ? placeById.get(current.parentId) : undefined;
  }
  return names.join(" / ");
}
