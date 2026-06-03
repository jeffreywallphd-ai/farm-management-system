import type { Farm } from "../../../domain/farm/Farm";
import { ORGANIC_ADVANCED_SCOPE_TYPE_LABELS } from "../../../domain/organic/OrganicAdvancedScope";
import { ORGANIC_READINESS_STATUS_LABELS } from "../../../domain/organic/OrganicSystemPlan";
import type { Clock } from "../../ports/Clock";
import type { OrganicCertificationRepository } from "../../ports/OrganicCertificationRepository";

export async function createOrganicAdvancedScopeReport(
  input: { farm: Farm },
  dependencies: { clock: Clock; repository: OrganicCertificationRepository },
): Promise<string> {
  const records = await dependencies.repository.listOrganicAdvancedScopeRecords(input.farm.id);
  const lines = [
    "Organic Advanced Scope Readiness Report",
    `Farm: ${input.farm.name}`,
    `Generated: ${dependencies.clock.now().toISOString()}`,
    "Use: This report organizes advanced organic scope notes for certifier review. It does not implement full specialty-scope compliance or make legal determinations.",
    "",
  ];
  for (const record of records) {
    lines.push(`${ORGANIC_ADVANCED_SCOPE_TYPE_LABELS[record.scopeType]}: ${record.topic}`);
    lines.push(`Status: ${ORGANIC_READINESS_STATUS_LABELS[record.readinessStatus]}`);
    lines.push(record.description);
    lines.push(`Evidence IDs: ${record.evidenceAttachmentIds.join(", ") || "None"}`);
    lines.push(`Notes: ${record.notes ?? "Not recorded"}`);
    lines.push("");
  }
  if (records.length === 0) lines.push("No advanced scope records found.");
  return lines.join("\n");
}
