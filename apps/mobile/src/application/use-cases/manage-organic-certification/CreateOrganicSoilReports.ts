import type { Farm } from "../../../domain/farm/Farm";
import { SOIL_FERTILITY_PRACTICE_TYPE_LABELS } from "../../../domain/organic/OrganicSoil";
import type { Clock } from "../../ports/Clock";
import type { OrganicCertificationRepository } from "../../ports/OrganicCertificationRepository";

export async function createOrganicSoilReport(
  input: { farm: Farm; reportType: "soilFertility" | "compost" | "manure" | "rotation" | "erosion" },
  dependencies: { clock: Clock; repository: OrganicCertificationRepository },
): Promise<string> {
  const [practices, batches, logs, manureApplications, rotations] = await Promise.all([
    dependencies.repository.listSoilFertilityPractices(input.farm.id),
    dependencies.repository.listCompostBatches(input.farm.id),
    dependencies.repository.listCompostTemperatureLogs(input.farm.id),
    dependencies.repository.listManureApplications(input.farm.id),
    dependencies.repository.listCropRotationRecords(input.farm.id),
  ]);
  const lines = [
    reportTitles[input.reportType],
    `Farm: ${input.farm.name}`,
    `Generated: ${dependencies.clock.now().toISOString()}`,
    "Use: This report organizes local soil, compost, manure, and rotation records for certifier review. It does not certify compliance.",
    "",
  ];

  if (input.reportType === "compost") {
    for (const batch of batches) {
      lines.push(`Compost batch: ${batch.name}`);
      lines.push(`Method: ${batch.compostingMethod ?? "Not recorded"}`);
      lines.push(`Start date: ${batch.startDate ?? "Not recorded"}`);
      lines.push(`Ingredients: ${batch.ingredients ?? "Not recorded"}`);
      lines.push(`Temperature logs: ${logs.filter((log) => log.compostBatchId === batch.id).length}`);
      lines.push("");
    }
  } else if (input.reportType === "manure") {
    for (const application of manureApplications) {
      lines.push(`Application date: ${application.applicationDate}`);
      lines.push(`Place ID: ${application.placeId ?? "Not recorded"}`);
      lines.push(`Crop ID: ${application.cropId ?? "Not recorded"}`);
      lines.push(`Required interval: ${application.requiredDaysBeforeHarvest} days`);
      lines.push(`Earliest harvest date: ${application.earliestHarvestDate}`);
      lines.push(`Notes: ${application.notes ?? "None"}`);
      lines.push("");
    }
  } else if (input.reportType === "rotation") {
    for (const rotation of rotations) {
      lines.push(`Year: ${rotation.year}`);
      lines.push(`Season: ${rotation.season ?? "Not recorded"}`);
      lines.push(`Place ID: ${rotation.placeId ?? "Not recorded"}`);
      lines.push(`Crop ID: ${rotation.cropId ?? "Not recorded"}`);
      lines.push(`Previous crop ID: ${rotation.previousCropId ?? "Not recorded"}`);
      lines.push(`Purpose: ${rotation.rotationPurpose ?? "Not recorded"}`);
      lines.push(`Cover crop used: ${rotation.coverCropUsed ? "Yes" : "No"}`);
      lines.push("");
    }
  } else {
    const filtered = input.reportType === "erosion" ? practices.filter((practice) => practice.practiceType === "erosionControl") : practices;
    for (const practice of filtered) {
      lines.push(`Practice: ${SOIL_FERTILITY_PRACTICE_TYPE_LABELS[practice.practiceType]}`);
      lines.push(`Date: ${practice.date}`);
      lines.push(`Place ID: ${practice.placeId ?? "Not recorded"}`);
      lines.push(`Crop ID: ${practice.cropId ?? "Not recorded"}`);
      lines.push(`Description: ${practice.description}`);
      lines.push(`Evidence IDs: ${practice.evidenceAttachmentIds.join(", ") || "None"}`);
      lines.push("");
    }
  }

  if (lines.length === 5) {
    lines.push("No records found for this report.");
  }
  return lines.join("\n");
}

const reportTitles = {
  soilFertility: "Organic Soil Fertility Practice Report",
  compost: "Organic Compost Production Log",
  manure: "Organic Manure Application and Harvest Interval Report",
  rotation: "Organic Crop Rotation Report",
  erosion: "Organic Erosion Control Report",
} as const;
