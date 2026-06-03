import type { Clock } from "../../ports/Clock";
import type { IdGenerator } from "../../ports/IdGenerator";
import type { OrganicCertificationRepository } from "../../ports/OrganicCertificationRepository";
import type { OrganicInspectionReadinessItem, OrganicSystemPlanSection } from "../../../domain/organic/OrganicSystemPlan";
import {
  organicInspectionReadinessItemInputSchema,
  organicSystemPlanSectionInputSchema,
  parseAttachmentIdsText,
} from "../../../domain/validation/organicSystemPlanValidation";

export async function saveOrganicSystemPlanSection(
  input: Parameters<typeof organicSystemPlanSectionInputSchema.parse>[0],
  dependencies: { clock: Clock; idGenerator: IdGenerator; repository: OrganicCertificationRepository },
): Promise<OrganicSystemPlanSection> {
  const parsed = organicSystemPlanSectionInputSchema.parse(input);
  const existing = parsed.id ? await dependencies.repository.getOrganicSystemPlanSection(parsed.farmId, parsed.id) : null;
  const now = dependencies.clock.now().toISOString();
  const section: OrganicSystemPlanSection = {
    id: existing?.id ?? dependencies.idGenerator.newId(),
    farmId: parsed.farmId,
    sectionType: parsed.sectionType,
    title: parsed.title,
    narrative: parsed.narrative,
    readinessStatus: parsed.readinessStatus,
    evidenceAttachmentIds: parseAttachmentIdsText(parsed.evidenceAttachmentIdsText),
    notes: parsed.notes,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  await dependencies.repository.saveOrganicSystemPlanSection(section);
  return section;
}

export async function saveOrganicInspectionReadinessItem(
  input: Parameters<typeof organicInspectionReadinessItemInputSchema.parse>[0],
  dependencies: { clock: Clock; idGenerator: IdGenerator; repository: OrganicCertificationRepository },
): Promise<OrganicInspectionReadinessItem> {
  const parsed = organicInspectionReadinessItemInputSchema.parse(input);
  const existing = parsed.id ? await dependencies.repository.getOrganicInspectionReadinessItem(parsed.farmId, parsed.id) : null;
  const now = dependencies.clock.now().toISOString();
  const item: OrganicInspectionReadinessItem = {
    id: existing?.id ?? dependencies.idGenerator.newId(),
    farmId: parsed.farmId,
    category: parsed.category,
    prompt: parsed.prompt,
    readinessStatus: parsed.readinessStatus,
    notes: parsed.notes,
    evidenceAttachmentIds: parseAttachmentIdsText(parsed.evidenceAttachmentIdsText),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  await dependencies.repository.saveOrganicInspectionReadinessItem(item);
  return item;
}
