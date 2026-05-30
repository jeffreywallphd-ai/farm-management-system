import * as FileSystem from "expo-file-system/legacy";

import {
  TranscriptionModelUnavailableError,
  type VoiceMemoTranscriptionService,
} from "../../application/ports/VoiceMemoTranscriptionService";

const DEFAULT_MODEL_NAME = "whisper-tiny.en";
const DEFAULT_MODEL_FILE_NAME = "ggml-tiny.en.bin";
const MODEL_DIRECTORY = "farm-note-transcription-models";

export class WhisperRnVoiceMemoTranscriptionService implements VoiceMemoTranscriptionService {
  constructor(
    private readonly options: {
      modelFileUri?: string;
      modelName?: string;
    } = {},
  ) {}

  async transcribe(input: { localAudioUri: string }) {
    const modelFileUri = this.options.modelFileUri ?? defaultModelFileUri();
    if (!modelFileUri) {
      throw new TranscriptionModelUnavailableError();
    }

    const modelInfo = await FileSystem.getInfoAsync(modelFileUri);
    if (!modelInfo.exists) {
      throw new TranscriptionModelUnavailableError();
    }

    const { initWhisper } = await import("whisper.rn");
    const whisperContext = await initWhisper({
      filePath: modelFileUri,
    });

    try {
      const { promise } = whisperContext.transcribe(input.localAudioUri, { language: "en" });
      const result = await promise;

      return {
        text: result.result.trim(),
        modelName: this.options.modelName ?? DEFAULT_MODEL_NAME,
      };
    } finally {
      await whisperContext.release();
    }
  }
}

function defaultModelFileUri(): string | null {
  if (!FileSystem.documentDirectory) {
    return null;
  }

  return `${FileSystem.documentDirectory}${MODEL_DIRECTORY}/${DEFAULT_MODEL_FILE_NAME}`;
}
