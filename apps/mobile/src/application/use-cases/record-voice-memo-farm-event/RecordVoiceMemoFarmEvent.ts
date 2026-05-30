import type { FarmEvent, FarmEventAttachment } from "../../../domain/events/FarmEvent";
import type { FarmId } from "../../../domain/farm/Farm";
import type { FarmEventInput } from "../../../domain/validation/farmEventValidation";
import type { Clock } from "../../ports/Clock";
import type { FarmEventRepository } from "../../ports/FarmEventRepository";
import type { FarmReferenceRepository } from "../../ports/FarmReferenceRepository";
import type { IdGenerator } from "../../ports/IdGenerator";
import type {
  PersistedPhotoAttachment,
  PhotoAttachmentStorageRepository,
  TemporaryPhotoAttachment,
} from "../../ports/PhotoAttachmentStorageRepository";
import type { VoiceMemoStorageRepository } from "../../ports/VoiceMemoStorageRepository";
import { recordFarmEvent } from "../record-farm-event/RecordFarmEvent";

export async function recordVoiceMemoFarmEvent(
  input: Omit<FarmEventInput, "attachments"> & {
    farmId: FarmId;
    temporaryVoiceMemoUri: string;
    durationMs?: number;
    temporaryPhotoAttachments?: TemporaryPhotoAttachment[];
  },
  dependencies: {
    clock: Clock;
    farmEventRepository: FarmEventRepository;
    farmReferenceRepository: FarmReferenceRepository;
    idGenerator: IdGenerator;
    photoAttachmentStorageRepository?: PhotoAttachmentStorageRepository;
    voiceMemoStorageRepository: VoiceMemoStorageRepository;
  },
): Promise<{ event: FarmEvent; attachments: FarmEventAttachment[] }> {
  const fileName = dependencies.idGenerator.newId();
  const persistedFile = await dependencies.voiceMemoStorageRepository.persistVoiceMemoFile({
    temporaryUri: input.temporaryVoiceMemoUri,
    fileName,
  });
  const persistedPhotos: PersistedPhotoAttachment[] = [];

  try {
    for (const photo of input.temporaryPhotoAttachments ?? []) {
      if (!dependencies.photoAttachmentStorageRepository) {
        throw new Error("Photo storage is unavailable on this device.");
      }

      persistedPhotos.push(
        await dependencies.photoAttachmentStorageRepository.persistPhotoAttachment({
          ...photo,
          fileName: dependencies.idGenerator.newId(),
        }),
      );
    }

    return await recordFarmEvent(
      {
        farmId: input.farmId,
        eventType: input.eventType,
        placeId: input.placeId,
        note: input.note,
        attachments: [
          {
            kind: "voiceMemo",
            localUri: persistedFile.localUri,
            mimeType: "audio/m4a",
            durationMs: input.durationMs,
            fileSizeBytes: persistedFile.fileSizeBytes,
          },
          ...persistedPhotos.map((photo) => ({
            kind: "photo" as const,
            localUri: photo.localUri,
            mimeType: photo.mimeType,
            width: photo.width,
            height: photo.height,
            fileSizeBytes: photo.fileSizeBytes,
          })),
        ],
      },
      dependencies,
    );
  } catch (error) {
    await dependencies.voiceMemoStorageRepository.deleteLocalFileIfExists(persistedFile.localUri);
    for (const photo of persistedPhotos) {
      await dependencies.photoAttachmentStorageRepository?.deleteLocalFileIfExists(photo.localUri);
    }
    throw error;
  } finally {
    await dependencies.voiceMemoStorageRepository.deleteLocalFileIfExists(input.temporaryVoiceMemoUri);
  }
}
