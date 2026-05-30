import * as FileSystem from "expo-file-system/legacy";

import type {
  PersistedVoiceMemoFile,
  VoiceMemoStorageRepository,
} from "../../application/ports/VoiceMemoStorageRepository";

const VOICE_MEMO_DIRECTORY = "farm-event-voice-memos";

export class ExpoVoiceMemoStorageRepository implements VoiceMemoStorageRepository {
  async persistVoiceMemoFile(input: {
    temporaryUri: string;
    fileName: string;
  }): Promise<PersistedVoiceMemoFile> {
    if (!FileSystem.documentDirectory) {
      throw new Error("Voice memo storage is unavailable on this device.");
    }

    const directoryUri = `${FileSystem.documentDirectory}${VOICE_MEMO_DIRECTORY}/`;
    await FileSystem.makeDirectoryAsync(directoryUri, { intermediates: true });

    const localUri = `${directoryUri}${sanitizeFileName(input.fileName)}.m4a`;
    await FileSystem.copyAsync({
      from: input.temporaryUri,
      to: localUri,
    });
    const info = await FileSystem.getInfoAsync(localUri);

    return {
      localUri,
      fileSizeBytes: info.exists ? info.size : undefined,
    };
  }

  async deleteLocalFileIfExists(uri: string): Promise<void> {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  }
}

function sanitizeFileName(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-");
}

