import type { FarmEventId } from "../../../domain/events/FarmEvent";
import type { FarmId } from "../../../domain/farm/Farm";
import type { FarmNoteTranscriptRepository } from "../../ports/FarmNoteTranscriptRepository";

export function getFarmNoteTranscript(
  farmId: FarmId,
  farmEventId: FarmEventId,
  dependencies: { transcriptionRepository: FarmNoteTranscriptRepository },
) {
  return dependencies.transcriptionRepository.getTranscript(farmId, farmEventId);
}
