export interface PersistedVoiceMemoFile {
  localUri: string;
  fileSizeBytes?: number;
}

export interface VoiceMemoStorageRepository {
  persistVoiceMemoFile(input: {
    temporaryUri: string;
    fileName: string;
  }): Promise<PersistedVoiceMemoFile>;
  deleteLocalFileIfExists(uri: string): Promise<void>;
}

