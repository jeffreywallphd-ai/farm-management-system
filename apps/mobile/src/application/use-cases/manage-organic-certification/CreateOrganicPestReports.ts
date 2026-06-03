import type { Farm } from "../../../domain/farm/Farm";
import { PEST_WEED_DISEASE_ACTION_TYPE_LABELS, PEST_WEED_DISEASE_TYPE_LABELS } from "../../../domain/organic/OrganicPest";
import type { Clock } from "../../ports/Clock";
import type { OrganicCertificationRepository } from "../../ports/OrganicCertificationRepository";

export async function createOrganicPestReport(
  input: { farm: Farm; reportType: "pest" | "weed" | "disease" | "inputEscalation" | "plasticMulch" },
  dependencies: { clock: Clock; repository: OrganicCertificationRepository },
): Promise<string> {
  const [observations, actions, mulchRecords] = await Promise.all([
    dependencies.repository.listPestWeedDiseaseObservations(input.farm.id),
    dependencies.repository.listPestWeedDiseaseActions(input.farm.id),
    dependencies.repository.listPlasticMulchRecords(input.farm.id),
  ]);
  const lines = [
    reportTitles[input.reportType],
    `Farm: ${input.farm.name}`,
    `Generated: ${dependencies.clock.now().toISOString()}`,
    "Use: This report organizes pest, weed, disease, and mulch records for certifier review. It does not certify compliance.",
    "",
  ];
  if (input.reportType === "plasticMulch") {
    for (const record of mulchRecords) {
      lines.push(`Material: ${record.material ?? "Not recorded"}`);
      lines.push(`Installed: ${record.installedDate ?? "Not recorded"}`);
      lines.push(`Removed: ${record.removedDate ?? "Not recorded"}`);
      lines.push(`Evidence IDs: ${record.evidenceAttachmentIds.join(", ") || "None"}`);
      lines.push("");
    }
  } else if (input.reportType === "inputEscalation") {
    for (const action of actions.filter((action) => action.inputApplicationId || ["botanical", "allowedSynthetic"].includes(action.actionType))) {
      lines.push(`Action: ${PEST_WEED_DISEASE_ACTION_TYPE_LABELS[action.actionType]}`);
      lines.push(`Observation ID: ${action.observationId}`);
      lines.push(`Why needed: ${action.whyNeeded ?? "Not recorded"}`);
      lines.push(`Input application ID: ${action.inputApplicationId ?? "Not recorded"}`);
      lines.push("");
    }
  } else {
    for (const observation of observations.filter((observation) => observation.type === input.reportType)) {
      lines.push(`${PEST_WEED_DISEASE_TYPE_LABELS[observation.type]} observation: ${observation.description}`);
      lines.push(`Observed: ${observation.observedAt}`);
      lines.push(`Severity: ${observation.severity ?? "Not recorded"}`);
      lines.push(`Actions: ${actions.filter((action) => action.observationId === observation.id).length}`);
      lines.push("");
    }
  }
  if (lines.length === 5) lines.push("No records found for this report.");
  return lines.join("\n");
}

const reportTitles = {
  pest: "Organic Pest Observation and Action Report",
  weed: "Organic Weed Management Report",
  disease: "Organic Disease Management Report",
  inputEscalation: "Organic Input Escalation Justification Report",
  plasticMulch: "Organic Plastic Mulch Removal Report",
} as const;
