import type { FarmId } from "../../../domain/farm/Farm";
import type {
  OrganicCertificationScope,
  OrganicOperationProfile,
} from "../../../domain/organic/OrganicCertification";
import { organicOperationProfileInputSchema } from "../../../domain/validation/organicCertificationValidation";
import type { Clock } from "../../ports/Clock";
import type { IdGenerator } from "../../ports/IdGenerator";
import type { OrganicCertificationRepository } from "../../ports/OrganicCertificationRepository";

export async function saveOrganicOperationProfile(
  input: {
    farmId: FarmId;
    organicStatus: string;
    certifierName?: string;
    certifierContact?: string;
    certificateNumber?: string;
    certificateEffectiveDate?: string;
    annualUpdateDueDate?: string;
    inspectionDueWindow?: string;
    recordRetentionYears: string | number;
    notes?: string;
    enabledScopes: string[];
  },
  dependencies: {
    clock: Clock;
    idGenerator: IdGenerator;
    repository: OrganicCertificationRepository;
  },
): Promise<{ profile: OrganicOperationProfile; scopes: OrganicCertificationScope[] }> {
  const parsed = organicOperationProfileInputSchema.parse(input);
  const existingProfile = await dependencies.repository.getProfile(input.farmId);
  const now = dependencies.clock.now().toISOString();
  const profileId = existingProfile?.id ?? dependencies.idGenerator.newId();
  const createdAt = existingProfile?.createdAt ?? now;

  const profile: OrganicOperationProfile = {
    id: profileId,
    farmId: input.farmId,
    organicStatus: parsed.organicStatus,
    certifierName: parsed.certifierName,
    certifierContact: parsed.certifierContact,
    certificateNumber: parsed.certificateNumber,
    certificateEffectiveDate: parsed.certificateEffectiveDate,
    annualUpdateDueDate: parsed.annualUpdateDueDate,
    inspectionDueWindow: parsed.inspectionDueWindow,
    recordRetentionYears: parsed.recordRetentionYears,
    notes: parsed.notes,
    createdAt,
    updatedAt: now,
  };

  const existingScopes = await dependencies.repository.listScopes(input.farmId);
  const existingScopeByType = new Map(existingScopes.map((scope) => [scope.scopeType, scope]));
  const enabledScopeTypes = new Set(parsed.enabledScopes);
  const scopeTypes = new Set([...existingScopes.map((scope) => scope.scopeType), ...parsed.enabledScopes]);
  const scopes: OrganicCertificationScope[] = [...scopeTypes].map((scopeType) => {
    const existingScope = existingScopeByType.get(scopeType);
    return {
      profileId,
      farmId: input.farmId,
      scopeType,
      enabled: enabledScopeTypes.has(scopeType),
      status: enabledScopeTypes.has(scopeType) ? "active" : "notApplicable",
      certifierNotes: existingScope?.certifierNotes,
      createdAt: existingScope?.createdAt ?? now,
      updatedAt: now,
    };
  });

  await dependencies.repository.saveProfile(profile, scopes);
  return { profile, scopes };
}
