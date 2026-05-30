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

    const extension = extensionForPhoto(input);
    const localUri = `${directoryUri}${sanitizeFileName(input.fileName)}.${extension}`;
    await FileSystem.copyAsync({
      from: input.temporaryUri,
      to: localUri,
    });
    const info = await FileSystem.getInfoAsync(localUri);
    if (!info.exists || !info.size) {
      await FileSystem.deleteAsync(localUri, { idempotent: true });
      throw new Error("The selected photo could not be saved on this device.");
    }

    return {
      localUri,
      width: input.width,
      height: input.height,
      mimeType: input.mimeType ?? "image/jpeg",
      fileSizeBytes: info.size,
    };
  }

  async deleteLocalFileIfExists(uri: string): Promise<void> {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  }
}

function extensionForPhoto(input: TemporaryPhotoAttachment & { fileName: string }): string {
  const sourceExtension = extensionFromName(input.temporaryUri);
  if (sourceExtension) {
    return sourceExtension;
  }

  if (input.mimeType === "image/png") {
    return "png";
  }

  if (input.mimeType === "image/heic" || input.mimeType === "image/heif") {
    return "heic";
  }

  return extensionFromName(input.originalFileName) ?? "jpg";
}

function extensionFromName(value?: string): string | undefined {
  const withoutQuery = value?.split("?")[0];
  const match = withoutQuery?.match(/\.([a-zA-Z0-9]+)$/);
  const extension = match?.[1]?.toLowerCase();

  if (!extension || extension.length > 5) {
    return undefined;
  }

  if (extension === "jpeg") {
    return "jpg";
  }

  return extension;
}

function sanitizeFileName(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-");
}
