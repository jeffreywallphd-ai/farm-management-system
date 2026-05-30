import type { FarmNoteTranscript } from "../../domain/events/FarmNoteTranscript";
import type { FarmEventId } from "../../domain/events/FarmEvent";
import type { FarmId } from "../../domain/farm/Farm";
import type { FarmNoteTranscriptRepository } from "../../application/ports/FarmNoteTranscriptRepository";

export class InMemoryFarmNoteTranscriptRepository implements FarmNoteTranscriptRepository {
  private transcripts: FarmNoteTranscript[] = [];

  async saveTranscript(transcript: FarmNoteTranscript): Promise<void> {
    const existingIndex = this.transcripts.findIndex(
      (candidate) => candidate.farmId === transcript.farmId && candidate.farmEventId === transcript.farmEventId,
    );

    if (existingIndex >= 0) {
      this.transcripts[existingIndex] = transcript;
      return;
    }

    this.transcripts.push(transcript);
  }

  async getTranscript(farmId: FarmId, farmEventId: FarmEventId): Promise<FarmNoteTranscript | null> {
    return (
      this.transcripts.find((candidate) => candidate.farmId === farmId && candidate.farmEventId === farmEventId) ?? null
    );
  }

  async listTranscriptsForExport(farmId: FarmId): Promise<FarmNoteTranscript[]> {
    return this.transcripts.filter((transcript) => transcript.farmId === farmId);
  }
}
