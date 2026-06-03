import { z } from "zod";

import type { OrganicEvidenceLink } from "../../../domain/organic/OrganicEvidenceLink";
import { organicEvidenceLinkInputSchema, type OrganicEvidenceLinkInput } from "../../../domain/validation/organicEvidenceLinkValidation";
import type { Clock } from "../../ports/Clock";
import type { FarmEventRepository } from "../../ports/FarmEventRepository";
import type { IdGenerator } from "../../ports/IdGenerator";
import type { OrganicCertificationRepository } from "../../ports/OrganicCertificationRepository";

export async function saveOrganicEvidenceLink(
  input: OrganicEvidenceLinkInput & { id?: string },
  dependencies: {
    clock: Clock;
    farmEventRepository: FarmEventRepository;
    idGenerator: IdGenerator;
    repository: OrganicCertificationRepository;
  },
): Promise<OrganicEvidenceLink> {
  const parsed = organicEvidenceLinkInputSchema.parse(input);
  const event = await dependencies.farmEventRepository.getFarmEventDetail(parsed.farmId, parsed.farmEventId);
  if (!event) {
    throw new z.ZodError([
      {
        code: "custom",
        message: "Choose a saved farm note.",
        path: ["farmEventId"],
        input: parsed.farmEventId,
      },
    ]);
  }

  const now = dependencies.clock.now().toISOString();
  const existing = input.id
    ? (await dependencies.repository.listOrganicEvidenceLinks(parsed.farmId)).find((link) => link.id === input.id)
    : undefined;
  const link: OrganicEvidenceLink = {
    id: input.id || dependencies.idGenerator.newId(),
    farmId: parsed.farmId,
    farmEventId: parsed.farmEventId,
    category: parsed.category,
    linkedRecordType: parsed.linkedRecordType,
    linkedRecordId: parsed.linkedRecordId,
    evidenceRole: parsed.evidenceRole,
    notes: parsed.notes,
    privacy: "privateToFarm",
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  await dependencies.repository.saveOrganicEvidenceLink(link);
  await dependencies.farmEventRepository.updateFarmEventOrganicReview(parsed.farmId, parsed.farmEventId, false);
  return link;
}

export async function deleteOrganicEvidenceLink(
  input: { farmId: string; id: string },
  dependencies: { repository: OrganicCertificationRepository },
): Promise<void> {
  await dependencies.repository.deleteOrganicEvidenceLink(input.farmId, input.id);
}

export async function markFarmNoteForOrganicReview(
  input: { farmId: string; farmEventId: string; needsOrganicReview: boolean },
  dependencies: { farmEventRepository: FarmEventRepository },
): Promise<void> {
  await dependencies.farmEventRepository.updateFarmEventOrganicReview(
    input.farmId,
    input.farmEventId,
    input.needsOrganicReview,
  );
}
