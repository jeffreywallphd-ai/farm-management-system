import * as FileSystem from "expo-file-system/legacy";

import type {
  PersistedPhotoAttachment,
  PhotoAttachmentStorageRepository,
  TemporaryPhotoAttachment,
} from "../../application/ports/PhotoAttachmentStorageRepository";

const PHOTO_ATTACHMENT_DIRECTORY = "farm-event-photos";

export class ExpoPhotoAttachmentStorageRepository implements PhotoAttachmentStorageRepository {
  async persistPhotoAttachment(input: TemporaryPhotoAttachment & { fileName: string }): Promise<PersistedPhotoAttachment> {
    if (!FileSystem.documentDirectory) {
      throw new Error("Photo storage is unavailable on this device.");
    }

    const directoryUri = `${FileSystem.documentDirectory}${PHOTO_ATTACHMENT_DIRECTORY}/`;
    await FileSystem.makeDirectoryAsync(directoryUri, { intermediates: true });

    const extension = extensionForMimeType(input.mimeType);
    const localUri = `${directoryUri}${sanitizeFileName(input.fileName)}.${extension}`;
    await FileSystem.copyAsync({
      from: input.temporaryUri,
      to: localUri,
    });
    const info = await FileSystem.getInfoAsync(localUri);

    return {
      localUri,
      width: input.width,
      height: input.height,
      mimeType: input.mimeType ?? "image/jpeg",
      fileSizeBytes: info.exists ? info.size : undefined,
    };
  }

  async deleteLocalFileIfExists(uri: string): Promise<void> {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  }
}

function extensionForMimeType(mimeType?: string): string {
  if (mimeType === "image/png") {
    return "png";
  }

  if (mimeType === "image/heic" || mimeType === "image/heif") {
    return "heic";
  }

  return "jpg";
}

function sanitizeFileName(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-");
}
