import type { Clock } from "../../ports/Clock";
import type { FarmReferenceRepository } from "../../ports/FarmReferenceRepository";
import type { IdGenerator } from "../../ports/IdGenerator";
import type { OrganicCertificationRepository } from "../../ports/OrganicCertificationRepository";
import type { OrganicInput } from "../../../domain/organic/OrganicInput";
import { organicInputInputSchema, parseAttachmentIdsText } from "../../../domain/validation/organicInputValidation";

export async function saveOrganicInput(
  input: Parameters<typeof organicInputInputSchema.parse>[0],
  dependencies: {
    clock: Clock;
    farmReferenceRepository: FarmReferenceRepository;
    idGenerator: IdGenerator;
    repository: OrganicCertificationRepository;
  },
): Promise<OrganicInput> {
  const parsed = organicInputInputSchema.parse(input);
  if (parsed.materialId) {
    const materials = await dependencies.farmReferenceRepository.listTrackedItems(parsed.farmId, "material");
    if (!materials.some((material) => material.id === parsed.materialId)) {
      throw new Error("Choose a saved material or leave the material link blank.");
    }
  }

  const existing = parsed.id ? await dependencies.repository.getOrganicInput(parsed.farmId, parsed.id) : null;
  const now = dependencies.clock.now().toISOString();
  const organicInput: OrganicInput = {
    id: existing?.id ?? parsed.id ?? dependencies.idGenerator.newId(),
    farmId: parsed.farmId,
    materialId: parsed.materialId,
    name: parsed.name,
    inputCategory: parsed.inputCategory,
    manufacturer: parsed.manufacturer,
    supplier: parsed.supplier,
    composition: parsed.composition,
    source: parsed.source,
    approvalStatus: parsed.approvalStatus,
    approvalEvidenceAttachmentIds: parseAttachmentIdsText(parsed.approvalEvidenceAttachmentIdsText),
    certifierApprovalDate: parsed.certifierApprovalDate,
    approvalExpirationDate: parsed.approvalExpirationDate,
    restrictions: parsed.restrictions,
    notes: parsed.notes,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  await dependencies.repository.saveOrganicInput(organicInput);
  return organicInput;
}
