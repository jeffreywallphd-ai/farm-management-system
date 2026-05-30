import {
  TranscriptionModelUnavailableError,
  type VoiceMemoTranscriptionService,
} from "../../application/ports/VoiceMemoTranscriptionService";

export class UnavailableVoiceMemoTranscriptionService implements VoiceMemoTranscriptionService {
  async transcribe(): Promise<never> {
    throw new TranscriptionModelUnavailableError();
  }
}
