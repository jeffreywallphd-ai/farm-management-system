export interface TemporaryPhotoAttachment {
  temporaryUri: string;
  originalFileName?: string;
  width?: number;
  height?: number;
  mimeType?: string;
}

export interface PersistedPhotoAttachment {
  localUri: string;
  width?: number;
  height?: number;
  mimeType?: string;
  fileSizeBytes?: number;
}

export interface PhotoAttachmentStorageRepository {
  persistPhotoAttachment(input: TemporaryPhotoAttachment & { fileName: string }): Promise<PersistedPhotoAttachment>;
  deleteLocalFileIfExists(uri: string): Promise<void>;
}
