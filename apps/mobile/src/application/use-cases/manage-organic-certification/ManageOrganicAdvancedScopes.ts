import type { Clock } from "../../ports/Clock";
import type { IdGenerator } from "../../ports/IdGenerator";
import type { OrganicCertificationRepository } from "../../ports/OrganicCertificationRepository";
import type { OrganicAdvancedScopeRecord } from "../../../domain/organic/OrganicAdvancedScope";
import { organicAdvancedScopeRecordInputSchema, parseAttachmentIdsText } from "../../../domain/validation/organicAdvancedScopeValidation";

export async function saveOrganicAdvancedScopeRecord(
  input: Parameters<typeof organicAdvancedScopeRecordInputSchema.parse>[0],
  dependencies: { clock: Clock; idGenerator: IdGenerator; repository: OrganicCertificationRepository },
): Promise<OrganicAdvancedScopeRecord> {
  const parsed = organicAdvancedScopeRecordInputSchema.parse(input);
  const existing = parsed.id ? await dependencies.repository.getOrganicAdvancedScopeRecord(parsed.farmId, parsed.id) : null;
  const now = dependencies.clock.now().toISOString();
  const record: OrganicAdvancedScopeRecord = {
    id: existing?.id ?? dependencies.idGenerator.newId(),
    farmId: parsed.farmId,
    scopeType: parsed.scopeType,
    topic: parsed.topic,
    description: parsed.description,
    readinessStatus: parsed.readinessStatus,
    evidenceAttachmentIds: parseAttachmentIdsText(parsed.evidenceAttachmentIdsText),
    notes: parsed.notes,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  await dependencies.repository.saveOrganicAdvancedScopeRecord(record);
  return record;
}
