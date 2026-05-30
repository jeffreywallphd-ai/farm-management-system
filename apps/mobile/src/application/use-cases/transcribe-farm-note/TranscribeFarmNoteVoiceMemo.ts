import type { FarmNoteTranscript } from "../../../domain/events/FarmNoteTranscript";
import type { FarmEventId } from "../../../domain/events/FarmEvent";
import type { FarmId } from "../../../domain/farm/Farm";
import type { Clock } from "../../ports/Clock";
import type { FarmEventRepository } from "../../ports/FarmEventRepository";
import type { FarmNoteTranscriptRepository } from "../../ports/FarmNoteTranscriptRepository";
import type { IdGenerator } from "../../ports/IdGenerator";
import {
  TranscriptionAudioUnavailableError,
  TranscriptionModelLoadError,
  TranscriptionModelUnavailableError,
  TranscriptionRuntimeError,
  UnsupportedTranscriptionAudioError,
  type VoiceMemoTranscriptionService,
} from "../../ports/VoiceMemoTranscriptionService";

export async function transcribeFarmNoteVoiceMemo(
  input: { farmId: FarmId; farmEventId: FarmEventId },
  dependencies: {
    clock: Clock;
    farmEventRepository: FarmEventRepository;
    idGenerator: IdGenerator;
    transcriptionRepository: FarmNoteTranscriptRepository;
    transcriptionService: VoiceMemoTranscriptionService;
  },
): Promise<FarmNoteTranscript> {
  const event = await dependencies.farmEventRepository.getFarmEventDetail(input.farmId, input.farmEventId);
  const voiceMemo = event?.attachments.find((attachment) => attachment.kind === "voiceMemo");

  if (!event || !voiceMemo) {
    throw new Error("This farm note does not have a voice memo to transcribe.");
  }

  const now = dependencies.clock.now().toISOString();
  const existingTranscript = await dependencies.transcriptionRepository.getTranscript(input.farmId, input.farmEventId);
  const baseTranscript = {
    id: existingTranscript?.id ?? dependencies.idGenerator.newId(),
    farmId: input.farmId,
    farmEventId: input.farmEventId,
    sourceAttachmentId: voiceMemo.id,
    createdAt: existingTranscript?.createdAt ?? now,
    updatedAt: now,
    generatedLocally: true as const,
    privacy: "privateToFarm" as const,
  };

  try {
    const result = await dependencies.transcriptionService.transcribe({ localAudioUri: voiceMemo.localUri });
    const transcript: FarmNoteTranscript = {
      ...baseTranscript,
      text: result.text,
      status: "completed",
      modelName: result.modelName,
    };
    await dependencies.transcriptionRepository.saveTranscript(transcript);
    return transcript;
  } catch (error) {
    const transcript: FarmNoteTranscript = {
      ...baseTranscript,
      status: "failed",
      modelName: "whisper-tiny.en",
      errorSummary: userSafeTranscriptionErrorMessage(error),
    };
    await dependencies.transcriptionRepository.saveTranscript(transcript);
    return transcript;
  }
}

function userSafeTranscriptionErrorMessage(error: unknown): string {
  if (
    error instanceof TranscriptionModelUnavailableError ||
    error instanceof TranscriptionModelLoadError ||
    error instanceof TranscriptionAudioUnavailableError ||
    error instanceof UnsupportedTranscriptionAudioError ||
    error instanceof TranscriptionRuntimeError
  ) {
    return error.message;
  }

  return "Transcript could not be generated on this device.";
}
