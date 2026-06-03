import type { Farm } from "../../../domain/farm/Farm";
import { ORGANIC_INPUT_APPROVAL_STATUS_LABELS, ORGANIC_INPUT_CATEGORY_LABELS } from "../../../domain/organic/OrganicInput";
import type { Clock } from "../../ports/Clock";
import type { OrganicCertificationRepository } from "../../ports/OrganicCertificationRepository";

export async function createOrganicInputReport(
  input: { farm: Farm; reportType: "inputList" | "applicationLog" | "approvalEvidence" | "needsReview" },
  dependencies: { clock: Clock; repository: OrganicCertificationRepository },
): Promise<string> {
  const [inputs, applications] = await Promise.all([
    dependencies.repository.listOrganicInputs(input.farm.id),
    dependencies.repository.listOrganicInputApplications(input.farm.id),
  ]);
  const lines = [
    reportTitles[input.reportType],
    `Farm: ${input.farm.name}`,
    `Generated: ${dependencies.clock.now().toISOString()}`,
    "Use: This report organizes local input records for certifier review. It does not verify allowed/prohibited status or replace certifier approval.",
    "",
  ];

  if (input.reportType === "applicationLog") {
    for (const application of applications) {
      const organicInput = inputs.find((candidate) => candidate.id === application.inputId);
      lines.push(`Input: ${organicInput?.name ?? application.inputId}`);
      lines.push(`Date: ${application.date}`);
      lines.push(`Place ID: ${application.placeId ?? "Not recorded"}`);
      lines.push(`Crop ID: ${application.cropId ?? "Not recorded"}`);
      lines.push(`Quantity/rate: ${[application.quantity, application.unit, application.rate].filter(Boolean).join(" ") || "Not recorded"}`);
      lines.push(`Reason: ${application.reason ?? "Not recorded"}`);
      lines.push(`Target problem: ${application.targetProblem ?? "Not recorded"}`);
      lines.push(`Evidence IDs: ${application.evidenceAttachmentIds.join(", ") || "None"}`);
      lines.push("");
    }
  } else {
    const filteredInputs = inputs.filter((organicInput) =>
      input.reportType === "needsReview"
        ? ["needsReview", "unknown", "restricted", "prohibited"].includes(organicInput.approvalStatus)
        : true,
    );

    for (const organicInput of filteredInputs) {
      lines.push(`Input: ${organicInput.name}`);
      lines.push(`Category: ${ORGANIC_INPUT_CATEGORY_LABELS[organicInput.inputCategory]}`);
      lines.push(`Approval status: ${ORGANIC_INPUT_APPROVAL_STATUS_LABELS[organicInput.approvalStatus]}`);
      lines.push(`Manufacturer: ${organicInput.manufacturer ?? "Not recorded"}`);
      lines.push(`Supplier: ${organicInput.supplier ?? "Not recorded"}`);
      lines.push(`Composition: ${organicInput.composition ?? "Not recorded"}`);
      lines.push(`Source: ${organicInput.source ?? "Not recorded"}`);
      lines.push(`Certifier approval date: ${organicInput.certifierApprovalDate ?? "Not recorded"}`);
      lines.push(`Approval expiration date: ${organicInput.approvalExpirationDate ?? "Not recorded"}`);
      lines.push(`Restrictions: ${organicInput.restrictions ?? "None recorded"}`);
      lines.push(`Evidence IDs: ${organicInput.approvalEvidenceAttachmentIds.join(", ") || "None"}`);
      lines.push(`Notes: ${organicInput.notes ?? "None"}`);
      lines.push("");
    }
  }

  if (lines.length === 5) {
    lines.push("No records found for this report.");
  }

  return lines.join("\n");
}

const reportTitles = {
  inputList: "Organic Input List for OSP",
  applicationLog: "Organic Input Application Log",
  approvalEvidence: "Organic Certifier Approval Evidence Packet",
  needsReview: "Organic Restricted/Needs Review Inputs Report",
} as const;
