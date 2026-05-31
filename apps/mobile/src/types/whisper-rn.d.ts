declare module "whisper.rn" {
  export function initWhisper(input: { filePath: string }): Promise<{
    transcribe: (
      audioPath: string,
      options?: { language?: string },
    ) => { promise: Promise<{ result: string }> };
    release: () => Promise<void>;
  }>;
}
