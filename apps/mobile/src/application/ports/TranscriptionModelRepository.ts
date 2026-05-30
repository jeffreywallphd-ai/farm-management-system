import type { WhisperModelMetadata } from "../../domain/transcription/WhisperModel";

export type TranscriptionModelStatus =
  | {
      status: "installed";
      localUri: string;
      fileSizeBytes: number;
      model: WhisperModelMetadata;
    }
  | {
      status: "notInstalled";
      model: WhisperModelMetadata;
    }
  | {
      status: "invalid";
      reason: string;
      model: WhisperModelMetadata;
    };

export interface TranscriptionModelRepository {
  getModelStatus(): Promise<TranscriptionModelStatus>;
  getInstalledModelUri(): Promise<string>;
  downloadModel(onProgress?: (progress: number) => void): Promise<TranscriptionModelStatus>;
  removeModel(): Promise<void>;
}
