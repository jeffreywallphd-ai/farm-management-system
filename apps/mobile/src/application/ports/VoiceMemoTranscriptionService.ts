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

export class TranscriptionModelLoadError extends Error {
  constructor(message = "The transcription model could not be opened. Try reinstalling the model.") {
    super(message);
    this.name = "TranscriptionModelLoadError";
  }
}

export class TranscriptionAudioUnavailableError extends Error {
  constructor(message = "The saved voice memo file is unavailable on this device.") {
    super(message);
    this.name = "TranscriptionAudioUnavailableError";
  }
}

export class UnsupportedTranscriptionAudioError extends Error {
  constructor(message = "This voice memo can be played but cannot be transcribed in this build.") {
    super(message);
    this.name = "UnsupportedTranscriptionAudioError";
  }
}

export class TranscriptionRuntimeError extends Error {
  constructor(message = "Transcript could not be generated on this device.") {
    super(message);
    this.name = "TranscriptionRuntimeError";
  }
}

export interface VoiceMemoTranscriptionService {
  transcribe(input: { localAudioUri: string }): Promise<VoiceMemoTranscriptionResult>;
}
