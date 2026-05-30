import * as FileSystem from "expo-file-system/legacy";

import type { TranscriptionModelRepository } from "../../application/ports/TranscriptionModelRepository";
import { WHISPER_TINY_EN_MODEL } from "../../domain/transcription/WhisperModel";
import { TranscriptionModelUnavailableError } from "../../application/ports/VoiceMemoTranscriptionService";

const MODEL_DIRECTORY = "transcription-models";

export class ExpoWhisperModelRepository implements TranscriptionModelRepository {
  async getModelStatus() {
    const localUri = modelFileUri();
    if (!localUri) {
      return { status: "notInstalled" as const, model: WHISPER_TINY_EN_MODEL };
    }

    const info = await FileSystem.getInfoAsync(localUri);
    if (!info.exists) {
      return { status: "notInstalled" as const, model: WHISPER_TINY_EN_MODEL };
    }

    if (!isPlausibleModelSize(info.size ?? 0)) {
      return {
        status: "invalid" as const,
        reason: "The local transcription model looks incomplete.",
        model: WHISPER_TINY_EN_MODEL,
      };
    }

    return {
      status: "installed" as const,
      localUri,
      fileSizeBytes: info.size ?? WHISPER_TINY_EN_MODEL.expectedSizeBytes,
      model: WHISPER_TINY_EN_MODEL,
    };
  }

  async getInstalledModelUri(): Promise<string> {
    const status = await this.getModelStatus();
    if (status.status !== "installed") {
      throw new TranscriptionModelUnavailableError();
    }

    return status.localUri;
  }

  async downloadModel(onProgress?: (progress: number) => void) {
    const directoryUri = modelDirectoryUri();
    const localUri = modelFileUri();
    if (!directoryUri || !localUri) {
      throw new Error("Local transcription model storage is unavailable on this device.");
    }

    await FileSystem.makeDirectoryAsync(directoryUri, { intermediates: true });
    await this.removeModel();

    const temporaryUri = `${localUri}.download`;
    await FileSystem.deleteAsync(temporaryUri, { idempotent: true });

    const download = FileSystem.createDownloadResumable(
      WHISPER_TINY_EN_MODEL.downloadUrl,
      temporaryUri,
      {},
      (progress) => {
        if (!onProgress || progress.totalBytesExpectedToWrite <= 0) {
          return;
        }

        onProgress(progress.totalBytesWritten / progress.totalBytesExpectedToWrite);
      },
    );
    const result = await download.downloadAsync();
    if (!result?.uri) {
      throw new Error("The transcription model could not be downloaded.");
    }

    const info = await FileSystem.getInfoAsync(result.uri);
    if (!info.exists || !isPlausibleModelSize(info.size ?? 0)) {
      await FileSystem.deleteAsync(result.uri, { idempotent: true });
      throw new Error("The downloaded transcription model looks incomplete.");
    }

    await FileSystem.moveAsync({ from: result.uri, to: localUri });
    return this.getModelStatus();
  }

  async removeModel(): Promise<void> {
    const localUri = modelFileUri();
    if (!localUri) {
      return;
    }

    await FileSystem.deleteAsync(localUri, { idempotent: true });
    await FileSystem.deleteAsync(`${localUri}.download`, { idempotent: true });
  }
}

function modelDirectoryUri(): string | null {
  if (!FileSystem.documentDirectory) {
    return null;
  }

  return `${FileSystem.documentDirectory}${MODEL_DIRECTORY}/`;
}

function modelFileUri(): string | null {
  const directoryUri = modelDirectoryUri();
  return directoryUri ? `${directoryUri}${WHISPER_TINY_EN_MODEL.modelName}` : null;
}

function isPlausibleModelSize(size: number): boolean {
  return size >= WHISPER_TINY_EN_MODEL.minimumSizeBytes && size <= WHISPER_TINY_EN_MODEL.maximumSizeBytes;
}
