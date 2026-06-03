import type { Farm } from "../../../domain/farm/Farm";
import { SEED_LOT_ORGANIC_STATUS_LABELS } from "../../../domain/organic/OrganicSeed";
import type { Clock } from "../../ports/Clock";
import type { OrganicCertificationRepository } from "../../ports/OrganicCertificationRepository";

export async function createOrganicSeedReport(
  input: { farm: Farm; reportType: "seedLots" | "commercialAvailability" | "plantingEvents" | "traceability" },
  dependencies: { clock: Clock; repository: OrganicCertificationRepository },
): Promise<string> {
  const [seedLots, searches, plantings] = await Promise.all([
    dependencies.repository.listSeedLots(input.farm.id),
    dependencies.repository.listCommercialAvailabilitySearches(input.farm.id),
    dependencies.repository.listOrganicPlantingEvents(input.farm.id),
  ]);
  const lines = [
    reportTitles[input.reportType],
    `Farm: ${input.farm.name}`,
    `Generated: ${dependencies.clock.now().toISOString()}`,
    "Use: This report organizes seed and planting-stock records for certifier review. It does not verify commercial availability or certification status.",
    "",
  ];

  if (input.reportType === "commercialAvailability") {
    for (const search of searches) {
      lines.push(`Seed lot ID: ${search.seedLotId}`);
      lines.push(`Supplier searched: ${search.supplierName}`);
      lines.push(`Result: ${search.result}`);
      lines.push(`Searched on: ${search.searchedOn}`);
      lines.push(`Evidence: ${search.evidenceAttachmentId ?? "None"}`);
      lines.push(`Notes: ${search.notes ?? "None"}`);
      lines.push("");
    }
  } else if (input.reportType === "plantingEvents" || input.reportType === "traceability") {
    for (const planting of plantings) {
      const seedLot = seedLots.find((candidate) => candidate.id === planting.seedLotId);
      lines.push(`Seed lot: ${seedLot?.variety ?? planting.seedLotId}`);
      lines.push(`Date: ${planting.date}`);
      lines.push(`Crop ID: ${planting.cropId ?? seedLot?.cropId ?? "Not recorded"}`);
      lines.push(`Place ID: ${planting.placeId ?? "Not recorded"}`);
      lines.push(`Quantity planted: ${planting.quantityPlanted ?? "Not recorded"}`);
      lines.push(`Method: ${planting.transplantOrDirectSeed ?? "Not recorded"}`);
      lines.push("");
    }
  } else {
    for (const seedLot of seedLots) {
      const searchCount = searches.filter((search) => search.seedLotId === seedLot.id).length;
      lines.push(`Seed lot: ${seedLot.variety}`);
      lines.push(`Crop ID: ${seedLot.cropId ?? "Not recorded"}`);
      lines.push(`Supplier: ${seedLot.supplier ?? "Not recorded"}`);
      lines.push(`Lot number: ${seedLot.lotNumber ?? "Not recorded"}`);
      lines.push(`Organic status: ${SEED_LOT_ORGANIC_STATUS_LABELS[seedLot.organicStatus]}`);
      lines.push(`Seed treatment: ${seedLot.seedTreatment ?? "Not recorded"}`);
      lines.push(`Commercial availability searches: ${searchCount}`);
      lines.push(`Invoice: ${seedLot.invoiceAttachmentId ?? "None"}`);
      lines.push(`Label: ${seedLot.labelAttachmentId ?? "None"}`);
      lines.push("");
    }
  }

  if (lines.length === 5) {
    lines.push("No records found for this report.");
  }
  return lines.join("\n");
}

const reportTitles = {
  seedLots: "Organic Seed and Planting Stock Report",
  commercialAvailability: "Organic Commercial Availability Search Report",
  plantingEvents: "Organic Planting Event Report",
  traceability: "Organic Seed-to-Crop Traceability Report",
} as const;
