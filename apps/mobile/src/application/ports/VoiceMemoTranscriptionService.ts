export interface VoiceMemoTranscriptionResult {
  text: string;
  modelName: string;
}

export class TranscriptionModelUnavailableError extends Error {
  constructor(message = "Transcription model is not installed in this test build.") {
    super(message);
    this.name = "TranscriptionModelUnavailableError";
  }
}

export interface VoiceMemoTranscriptionService {
  transcribe(input: { localAudioUri: string }): Promise<VoiceMemoTranscriptionResult>;
}
