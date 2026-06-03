import type { Farm } from "../../../domain/farm/Farm";
import {
  ORGANIC_CERTIFICATION_SCOPE_LABELS,
  ORGANIC_OPERATION_STATUS_LABELS,
} from "../../../domain/organic/OrganicCertification";
import type { Clock } from "../../ports/Clock";
import type { OrganicCertificationRepository } from "../../ports/OrganicCertificationRepository";

export async function createOrganicProfileReport(
  input: { farm: Farm },
  dependencies: { clock: Clock; repository: OrganicCertificationRepository },
): Promise<string> {
  const [profile, scopes] = await Promise.all([
    dependencies.repository.getProfile(input.farm.id),
    dependencies.repository.listScopes(input.farm.id),
  ]);

  if (!profile) {
    throw new Error("Set up organic tracking before creating an Organic Profile Report.");
  }

  const enabledScopes = scopes
    .filter((scope) => scope.enabled)
    .map((scope) => ORGANIC_CERTIFICATION_SCOPE_LABELS[scope.scopeType]);

  return [
    "Organic Profile Report",
    `Generated: ${dependencies.clock.now().toISOString()}`,
    "",
    "This report helps organize records for certifier review. It does not certify the operation, replace an accredited certifier, or provide a legal determination.",
    "",
    `Farm: ${input.farm.name}`,
    `Organic status: ${ORGANIC_OPERATION_STATUS_LABELS[profile.organicStatus]}`,
    `Certifier: ${profile.certifierName ?? "Not entered"}`,
    `Certifier contact: ${profile.certifierContact ?? "Not entered"}`,
    `Certificate number: ${profile.certificateNumber ?? "Not entered"}`,
    `Certificate effective date: ${profile.certificateEffectiveDate ?? "Not entered"}`,
    `Annual update due date: ${profile.annualUpdateDueDate ?? "Not entered"}`,
    `Inspection due window: ${profile.inspectionDueWindow ?? "Not entered"}`,
    `Record retention years: ${profile.recordRetentionYears}`,
    `Enabled scopes: ${enabledScopes.length > 0 ? enabledScopes.join(", ") : "None selected"}`,
    `Notes: ${profile.notes ?? "None"}`,
  ].join("\n");
}
