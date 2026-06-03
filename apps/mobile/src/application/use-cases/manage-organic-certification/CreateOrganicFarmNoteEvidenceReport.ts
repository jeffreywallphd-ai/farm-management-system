import type { Farm } from "../../../domain/farm/Farm";
import {
  ORGANIC_EVIDENCE_CATEGORY_LABELS,
  ORGANIC_EVIDENCE_RECORD_TYPE_LABELS,
  ORGANIC_EVIDENCE_ROLE_LABELS,
} from "../../../domain/organic/OrganicEvidenceLink";
import type { Clock } from "../../ports/Clock";
import type { FarmEventRepository } from "../../ports/FarmEventRepository";
import type { OrganicCertificationRepository } from "../../ports/OrganicCertificationRepository";

export async function createOrganicFarmNoteEvidenceReport(
  input: { farm: Farm },
  dependencies: { clock: Clock; farmEventRepository: FarmEventRepository; repository: OrganicCertificationRepository },
): Promise<string> {
  const [links, events] = await Promise.all([
    dependencies.repository.listOrganicEvidenceLinks(input.farm.id),
    dependencies.farmEventRepository.listFarmEvents(input.farm.id),
  ]);
  const eventsById = new Map(events.map((event) => [event.event.id, event]));
  const lines = [
    "Organic Farm Note Evidence Report",
    `Farm: ${input.farm.name}`,
    `Generated: ${dependencies.clock.now().toISOString()}`,
    "Use: This report lists farmer-confirmed links from farm notes to organic readiness records. It does not certify compliance.",
    "",
  ];

  for (const link of links) {
    const event = eventsById.get(link.farmEventId);
    lines.push(`Category: ${ORGANIC_EVIDENCE_CATEGORY_LABELS[link.category]}`);
    lines.push(`Farm note: ${link.farmEventId}${event ? ` (${event.event.capturedAt})` : ""}`);
    lines.push(`Role: ${ORGANIC_EVIDENCE_ROLE_LABELS[link.evidenceRole]}`);
    lines.push(`Linked record: ${link.linkedRecordType ? ORGANIC_EVIDENCE_RECORD_TYPE_LABELS[link.linkedRecordType] : "No specific record"}${link.linkedRecordId ? ` ${link.linkedRecordId}` : ""}`);
    lines.push(`Attachments: ${event ? event.attachments.map((attachment) => attachment.kind).join(", ") || "None" : "Farm note unavailable"}`);
    lines.push(`Notes: ${link.notes ?? "None"}`);
    lines.push("");
  }

  if (lines.length === 5) {
    lines.push("No linked farm-note evidence records found.");
  }
  return lines.join("\n");
}
