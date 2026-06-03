import type { Farm } from "../../../domain/farm/Farm";
import type { FarmLocation } from "../../../domain/farm/FarmLocation";
import { ORGANIC_BOUNDARY_EVIDENCE_TYPE_LABELS, ORGANIC_PLACE_STATUS_LABELS } from "../../../domain/organic/OrganicPlace";
import type { Clock } from "../../ports/Clock";
import type { FarmReferenceRepository } from "../../ports/FarmReferenceRepository";
import type { OrganicCertificationRepository } from "../../ports/OrganicCertificationRepository";

export async function createOrganicPlacesReport(
  input: { farm: Farm; reportType: "landEligibility" | "transitionStatus" | "boundaryBuffer" | "contaminationDrift" },
  dependencies: {
    clock: Clock;
    farmReferenceRepository: FarmReferenceRepository;
    repository: OrganicCertificationRepository;
  },
): Promise<string> {
  const [places, profiles, evidence] = await Promise.all([
    dependencies.farmReferenceRepository.listLocations(input.farm.id),
    dependencies.repository.listPlaceProfiles(input.farm.id),
    dependencies.repository.listBoundaryEvidence(input.farm.id),
  ]);
  const title = reportTitles[input.reportType];
  const lines = [
    title,
    `Farm: ${input.farm.name}`,
    `Generated: ${dependencies.clock.now().toISOString()}`,
    "Use: This report organizes local records for certifier review. It does not certify land or make a legal determination.",
    "",
  ];

  for (const profile of profiles) {
    const placePath = buildFarmPlacePath(places, profile.placeId) ?? "Unknown place";
    if (!includeProfileInReport(input.reportType, profile.contaminationRisks)) {
      continue;
    }

    lines.push(`Place: ${placePath}`);
    lines.push(`Organic status: ${ORGANIC_PLACE_STATUS_LABELS[profile.organicStatus]}`);
    lines.push(`Transition start: ${profile.transitionStartDate ?? "Not recorded"}`);
    lines.push(`Last prohibited substance date: ${profile.lastProhibitedSubstanceDate ?? "Not recorded"}`);
    lines.push(`Planning eligibility date: ${profile.organicEligibilityDate ?? "Not recorded"}`);
    lines.push(`Certified organic since: ${profile.certifiedOrganicSinceDate ?? "Not recorded"}`);
    lines.push(`Boundary: ${profile.boundaryDescription ?? "Not recorded"}`);
    lines.push(`Buffer: ${profile.bufferDescription ?? "Not recorded"}`);
    lines.push(`Adjacent land use: ${profile.adjacentLandUse ?? "Not recorded"}`);
    lines.push(`Contamination/drift risks: ${profile.contaminationRisks ?? "Not recorded"}`);
    lines.push(`Certifier approved in app record: ${profile.certifierApproved ? "Yes" : "No"}`);
    lines.push(`Certifier notes: ${profile.certifierNotes ?? "None"}`);

    const placeEvidence = evidence.filter((item) => item.placeId === profile.placeId);
    lines.push(`Evidence records: ${placeEvidence.length}`);
    for (const item of placeEvidence) {
      lines.push(`- ${ORGANIC_BOUNDARY_EVIDENCE_TYPE_LABELS[item.evidenceType]} on ${item.capturedAt}: ${item.description}${item.attachmentUri ? ` (${item.attachmentUri})` : ""}`);
    }
    lines.push("");
  }

  if (profiles.length === 0 || lines.length === 5) {
    lines.push("No organic place profiles recorded yet.");
  }

  return lines.join("\n");
}

function includeProfileInReport(reportType: string, contaminationRisks?: string): boolean {
  if (reportType === "contaminationDrift") {
    return Boolean(contaminationRisks);
  }

  return true;
}

const reportTitles: Record<"landEligibility" | "transitionStatus" | "boundaryBuffer" | "contaminationDrift", string> = {
  landEligibility: "Organic Land Eligibility Report",
  transitionStatus: "Organic Transition Status Report",
  boundaryBuffer: "Organic Boundary and Buffer Report",
  contaminationDrift: "Organic Contamination/Drift Incident Report",
};

function buildFarmPlacePath(places: FarmLocation[], placeId?: string): string | undefined {
  const byId = new Map(places.map((place) => [place.id, place]));
  const names: string[] = [];
  let current = placeId ? byId.get(placeId) : undefined;
  const visited = new Set<string>();

  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    names.unshift(current.name);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }

  return names.length > 0 ? names.join(" > ") : undefined;
}
