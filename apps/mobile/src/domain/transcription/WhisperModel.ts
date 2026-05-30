export const WHISPER_TINY_EN_MODEL = {
  modelName: "ggml-tiny.en.bin",
  modelDisplayName: "Whisper tiny.en",
  modelVersion: "tiny.en",
  downloadUrl: "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.en.bin",
  expectedSizeBytes: 77_700_000,
  minimumSizeBytes: 70 * 1024 * 1024,
  maximumSizeBytes: 90 * 1024 * 1024,
} as const;

export type WhisperModelMetadata = typeof WHISPER_TINY_EN_MODEL;
