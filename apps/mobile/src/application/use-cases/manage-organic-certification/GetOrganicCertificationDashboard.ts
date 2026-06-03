import type { FarmId } from "../../../domain/farm/Farm";
import type { OrganicCertificationRepository } from "../../ports/OrganicCertificationRepository";

export async function getOrganicCertificationDashboard(
  input: { farmId: FarmId },
  dependencies: { repository: OrganicCertificationRepository },
) {
  const [profile, scopes] = await Promise.all([
    dependencies.repository.getProfile(input.farmId),
    dependencies.repository.listScopes(input.farmId),
  ]);

  if (!profile) {
    return { profile: null, enabledScopes: [], missingSetupItems: ["Organic tracking is not set up."] };
  }

  const enabledScopes = scopes.filter((scope) => scope.enabled);
  const missingSetupItems: string[] = [];

  if (enabledScopes.length === 0 && profile.organicStatus !== "notOrganic") {
    missingSetupItems.push("Choose at least one organic scope that applies to this farm.");
  }

  if ((profile.organicStatus === "certified" || profile.organicStatus === "splitOperation") && !profile.certifierName) {
    missingSetupItems.push("Add certifier information for certified or split-operation tracking.");
  }

  if (!profile.annualUpdateDueDate && profile.organicStatus !== "notOrganic") {
    missingSetupItems.push("Add the annual update due date when you know it.");
  }

  return { profile, enabledScopes, missingSetupItems };
}
