import type { FarmEventAttachmentId, FarmEventId } from "./FarmEvent";
import type { FarmId } from "../farm/Farm";
import type { PrivacyClassification } from "../privacy/PrivacyClassification";

export type FarmNoteTranscriptId = string;
export type FarmNoteTranscriptStatus = "completed" | "failed";

export interface FarmNoteTranscript {
  id: FarmNoteTranscriptId;
  farmId: FarmId;
  farmEventId: FarmEventId;
  sourceAttachmentId: FarmEventAttachmentId;
  text?: string;
  status: FarmNoteTranscriptStatus;
  modelName: string;
  generatedLocally: true;
  errorSummary?: string;
  createdAt: string;
  updatedAt: string;
  privacy: PrivacyClassification;
}
