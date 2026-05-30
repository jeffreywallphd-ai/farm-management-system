import type { FarmNoteTranscript } from "../../domain/events/FarmNoteTranscript";
import type { FarmEventId } from "../../domain/events/FarmEvent";
import type { FarmId } from "../../domain/farm/Farm";

export interface FarmNoteTranscriptRepository {
  saveTranscript(transcript: FarmNoteTranscript): Promise<void>;
  getTranscript(farmId: FarmId, farmEventId: FarmEventId): Promise<FarmNoteTranscript | null>;
  listTranscriptsForExport(farmId: FarmId): Promise<FarmNoteTranscript[]>;
}
