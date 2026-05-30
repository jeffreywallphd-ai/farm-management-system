import type { TranscriptionModelRepository } from "../../application/ports/TranscriptionModelRepository";
import {
  TranscriptionModelUnavailableError,
  type VoiceMemoTranscriptionService,
} from "../../application/ports/VoiceMemoTranscriptionService";
import { WHISPER_TINY_EN_MODEL } from "../../domain/transcription/WhisperModel";

export class WhisperRnVoiceMemoTranscriptionService implements VoiceMemoTranscriptionService {
  constructor(
    private readonly options: {
      modelRepository?: TranscriptionModelRepository;
      modelFileUri?: string;
      modelName?: string;
    } = {},
  ) {}

  async transcribe(input: { localAudioUri: string }) {
    const modelFileUri = this.options.modelFileUri ?? (await this.options.modelRepository?.getInstalledModelUri());
    if (!modelFileUri) {
      throw new TranscriptionModelUnavailableError();
    }

    let whisperModule: typeof import("whisper.rn");
    try {
      whisperModule = await import("whisper.rn");
    } catch {
      throw new TranscriptionModelUnavailableError("Install the internal development build to use local transcription.");
    }

    let whisperContext: Awaited<ReturnType<typeof whisperModule.initWhisper>>;
    try {
      whisperContext = await whisperModule.initWhisper({
        filePath: modelFileUri,
      });
    } catch (error) {
      if (isNativeModuleUnavailable(error)) {
        throw new TranscriptionModelUnavailableError("Install the internal development build to use local transcription.");
      }
      throw error;
    }

    try {
      const { promise } = whisperContext.transcribe(input.localAudioUri, { language: "en" });
      const result = await promise;

      return {
        text: result.result.trim(),
        modelName: this.options.modelName ?? WHISPER_TINY_EN_MODEL.modelVersion,
      };
    } finally {
      await whisperContext.release();
    }
  }
}

function isNativeModuleUnavailable(error: unknown): boolean {
  return error instanceof Error && /native|module|jsi|link/i.test(error.message);
}
