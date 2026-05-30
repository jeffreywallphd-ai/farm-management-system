import { z } from "zod";

import type { FarmEvent, FarmEventAttachment } from "../../../domain/events/FarmEvent";
import { parseFarmEventInput, type FarmEventInput } from "../../../domain/validation/farmEventValidation";
import type { Clock } from "../../ports/Clock";
import type { FarmEventRepository } from "../../ports/FarmEventRepository";
import type { FarmReferenceRepository } from "../../ports/FarmReferenceRepository";
import type { IdGenerator } from "../../ports/IdGenerator";
import type { FarmId } from "../../../domain/farm/Farm";

export async function recordFarmEvent(
  input: FarmEventInput & { farmId: FarmId },
  dependencies: {
    clock: Clock;
    farmEventRepository: FarmEventRepository;
    farmReferenceRepository: FarmReferenceRepository;
    idGenerator: IdGenerator;
  },
): Promise<{ event: FarmEvent; attachments: FarmEventAttachment[] }> {
  const parsed = parseFarmEventInput(input);
  const farm = await dependencies.farmReferenceRepository.getFarm();

  if (!farm || farm.id !== input.farmId) {
    throw new z.ZodError([
      {
        code: "custom",
        message: "Set up your farm before recording a farm note.",
        path: ["farmId"],
        input: input.farmId,
      },
    ]);
  }

  if (parsed.placeId) {
    const places = await dependencies.farmReferenceRepository.listLocations(input.farmId);
    if (!places.some((place) => place.id === parsed.placeId)) {
      throw new z.ZodError([
        {
          code: "custom",
          message: "Choose a saved farm place or leave it blank.",
          path: ["placeId"],
          input: parsed.placeId,
        },
      ]);
    }
  }

  const now = dependencies.clock.now().toISOString();
  const eventId = dependencies.idGenerator.newId();
  const event: FarmEvent = {
    id: eventId,
    kind: "FarmEvent",
    farmId: input.farmId,
    eventType: parsed.eventType,
    placeId: parsed.placeId,
    note: parsed.note,
    capturedAt: now,
    createdAt: now,
    privacy: "privateToFarm",
    schemaVersion: 1,
  };
  const attachments: FarmEventAttachment[] = parsed.attachments.map((attachment) => ({
    id: dependencies.idGenerator.newId(),
    farmId: input.farmId,
    eventId,
    kind: attachment.kind,
    localUri: attachment.localUri,
    mimeType: attachment.mimeType,
    durationMs: attachment.durationMs,
    width: attachment.width,
    height: attachment.height,
    fileSizeBytes: attachment.fileSizeBytes,
    createdAt: now,
  }));

  await dependencies.farmEventRepository.saveFarmEvent(event, attachments);
  return { event, attachments };
}

