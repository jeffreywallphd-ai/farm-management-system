import type { TranscriptionModelRepository } from "../../application/ports/TranscriptionModelRepository";
import {
  TranscriptionAudioUnavailableError,
  TranscriptionModelLoadError,
  TranscriptionModelUnavailableError,
  TranscriptionRuntimeError,
  UnsupportedTranscriptionAudioError,
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
    const FileSystem = await import("expo-file-system/legacy");
    const modelInfo = await FileSystem.getInfoAsync(modelFileUri);
    if (!modelInfo.exists) {
      throw new TranscriptionModelLoadError();
    }
    const audioInfo = await FileSystem.getInfoAsync(input.localAudioUri);
    if (!audioInfo.exists) {
      throw new TranscriptionAudioUnavailableError();
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
        filePath: toNativeFilePath(modelFileUri),
      });
    } catch (error) {
      if (isNativeModuleUnavailable(error)) {
        throw new TranscriptionModelUnavailableError("Install the internal development build to use local transcription.");
      }
      throw new TranscriptionModelLoadError();
    }

    try {
      const { promise } = whisperContext.transcribe(toNativeFilePath(input.localAudioUri), { language: "en" });
      const result = await promise;

      return {
        text: result.result.trim(),
        modelName: this.options.modelName ?? WHISPER_TINY_EN_MODEL.modelVersion,
      };
    } catch (error) {
      if (isUnsupportedAudioError(error)) {
        throw new UnsupportedTranscriptionAudioError();
      }

      throw new TranscriptionRuntimeError();
    } finally {
      await whisperContext.release().catch(() => undefined);
    }
  }
}

function isNativeModuleUnavailable(error: unknown): boolean {
  return error instanceof Error && /native|module|jsi|link/i.test(error.message);
}

function isUnsupportedAudioError(error: unknown): boolean {
  return error instanceof Error && /audio|decode|format|wav|codec|m4a|aac/i.test(error.message);
}

export function toNativeFilePath(uriOrPath: string): string {
  if (!uriOrPath.startsWith("file://")) {
    return uriOrPath;
  }

  const nativePath = uriOrPath.replace(/^file:\/\//, "");
  try {
    return decodeURI(nativePath);
  } catch {
    return nativePath;
  }
}
