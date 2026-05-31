import assert from "node:assert/strict";
import test from "node:test";
import { z } from "zod";

import type { Farm } from "../../domain/farm/Farm";
import type { FarmLocation } from "../../domain/farm/FarmLocation";
import { WHISPER_TINY_EN_MODEL } from "../../domain/transcription/WhisperModel";
import type { FarmEventRepository } from "../ports/FarmEventRepository";
import type { ExportRepository, MobilePilotExportFile } from "../ports/ExportRepository";
import type {
  PhotoAttachmentStorageRepository,
  TemporaryPhotoAttachment,
} from "../ports/PhotoAttachmentStorageRepository";
import {
  TranscriptionAudioUnavailableError,
  TranscriptionModelLoadError,
  TranscriptionModelUnavailableError,
  type VoiceMemoTranscriptionService,
} from "../ports/VoiceMemoTranscriptionService";
import { InMemoryFarmEventRepository } from "../../testing/fakes/InMemoryFarmEventRepository";
import { InMemoryFarmReferenceRepository } from "../../testing/fakes/InMemoryFarmReferenceRepository";
import { InMemoryFarmNoteTranscriptRepository } from "../../testing/fakes/InMemoryFarmNoteTranscriptRepository";
import { InMemoryLocalRecordRepository } from "../../testing/fakes/InMemoryLocalRecordRepository";
import { serializeFarmEventRecoveryPackageManifest } from "../../infrastructure/export/FarmEventRecoveryPackageExporter";
import {
  toNativeFilePath,
  WhisperRnVoiceMemoTranscriptionService,
} from "../../infrastructure/transcription/WhisperRnVoiceMemoTranscriptionService";
import { createFarmEventRecoveryPackage } from "./export-mobile-pilot-data/CreateFarmEventRecoveryPackage";
import { recordFarmEvent } from "./record-farm-event/RecordFarmEvent";
import { recordVoiceMemoFarmEvent } from "./record-voice-memo-farm-event/RecordVoiceMemoFarmEvent";
import { transcribeFarmNoteVoiceMemo } from "./transcribe-farm-note/TranscribeFarmNoteVoiceMemo";
import { getFarmEventDetail } from "./view-farm-events/GetFarmEventDetail";
import { listFarmEvents } from "./view-farm-events/ListFarmEvents";

const farm: Farm = {
  id: "farm-1",
  name: "Pilot Farm",
  createdAt: "2026-05-30T10:00:00.000Z",
};

const field: FarmLocation = {
  id: "place-1",
  farmId: farm.id,
  name: "Field 1",
  kind: "field",
  createdAt: "2026-05-30T10:01:00.000Z",
};

test("recording a farm event creates private metadata and attachment references", async () => {
  const references = new InMemoryFarmReferenceRepository();
  await references.createFarm(farm);
  await references.addLocation(field);
  const eventRepository = new InMemoryFarmEventRepository({ locations: [field] });

  const result = await recordFarmEvent(
    {
      farmId: farm.id,
      eventType: "fieldObservation",
      placeId: field.id,
      note: "  Storm knocked over row cover  ",
      attachments: [
        {
          kind: "voiceMemo",
          localUri: "file:///local/event-1.m4a",
          mimeType: "audio/m4a",
          durationMs: 21_000,
          fileSizeBytes: 120_000,
        },
      ],
    },
    {
      clock: { now: () => new Date("2026-05-30T12:00:00.000Z") },
      farmEventRepository: eventRepository,
      farmReferenceRepository: references,
      idGenerator: new SequenceIds(["event-1", "attachment-1"]),
    },
  );

  assert.equal(result.event.id, "event-1");
  assert.equal(result.event.kind, "FarmEvent");
  assert.equal(result.event.eventType, "fieldObservation");
  assert.equal(result.event.placeId, "place-1");
  assert.equal(result.event.note, "Storm knocked over row cover");
  assert.equal(result.event.privacy, "privateToFarm");
  assert.equal(result.event.schemaVersion, 1);
  assert.equal(result.attachments[0].id, "attachment-1");
  assert.equal(result.attachments[0].eventId, "event-1");
  assert.equal(result.attachments[0].localUri, "file:///local/event-1.m4a");
});

test("farm event place must belong to the local farm", async () => {
  const references = new InMemoryFarmReferenceRepository();
  await references.createFarm(farm);
  const eventRepository = new InMemoryFarmEventRepository({ locations: [] });

  await assert.rejects(
    () =>
      recordFarmEvent(
        {
          farmId: farm.id,
          placeId: "missing-place",
          attachments: [{ kind: "voiceMemo", localUri: "file:///local/event-1.m4a" }],
        },
        {
          clock: { now: () => new Date("2026-05-30T12:00:00.000Z") },
          farmEventRepository: eventRepository,
          farmReferenceRepository: references,
          idGenerator: new SequenceIds(["event-1", "attachment-1"]),
        },
      ),
    z.ZodError,
  );
});

test("farm event history and detail return newest events with attachments and place context", async () => {
  const references = new InMemoryFarmReferenceRepository();
  await references.createFarm(farm);
  await references.addLocation(field);
  const eventRepository = new InMemoryFarmEventRepository({ locations: [field] });
  const dependencies = {
    farmEventRepository: eventRepository,
    farmReferenceRepository: references,
    idGenerator: new SequenceIds(["event-old", "attachment-old", "event-new", "attachment-new", "photo-attachment-new"]),
  };

  await recordFarmEvent(
    {
      farmId: farm.id,
      eventType: "general",
      attachments: [{ kind: "voiceMemo", localUri: "file:///local/old.m4a" }],
    },
    {
      ...dependencies,
      clock: { now: () => new Date("2026-05-30T09:00:00.000Z") },
    },
  );
  await recordFarmEvent(
    {
      farmId: farm.id,
      eventType: "harvest",
      placeId: field.id,
      attachments: [
        { kind: "voiceMemo", localUri: "file:///local/new.m4a" },
        { kind: "photo", localUri: "file:///local/new-photo.jpg", mimeType: "image/jpeg", width: 640, height: 480 },
      ],
    },
    {
      ...dependencies,
      clock: { now: () => new Date("2026-05-30T11:00:00.000Z") },
    },
  );

  const history = await listFarmEvents(farm.id, { farmEventRepository: eventRepository });
  assert.deepEqual(
    history.map((view) => view.event.id),
    ["event-new", "event-old"],
  );
  assert.equal(history[0].place?.name, "Field 1");
  assert.equal(history[0].attachments[0].localUri, "file:///local/new.m4a");

  const detail = await getFarmEventDetail(farm.id, "event-new", { farmEventRepository: eventRepository });
  assert.equal(detail?.event.eventType, "harvest");
  assert.equal(detail?.attachments.length, 2);
  assert.equal(detail?.attachments[1].kind, "photo");
  assert.equal(detail?.attachments[1].localUri, "file:///local/new-photo.jpg");
});

test("voice memo farm event persists the copied local file reference and clears the temporary file", async () => {
  const references = new InMemoryFarmReferenceRepository();
  await references.createFarm(farm);
  const eventRepository = new InMemoryFarmEventRepository({ locations: [] });
  const voiceMemoStorageRepository = new FakeVoiceMemoStorageRepository();

  const result = await recordVoiceMemoFarmEvent(
    {
      farmId: farm.id,
      eventType: "general",
      temporaryVoiceMemoUri: "file:///cache/temp-recording.m4a",
      durationMs: 14_000,
    },
    {
      clock: { now: () => new Date("2026-05-30T12:00:00.000Z") },
      farmEventRepository: eventRepository,
      farmReferenceRepository: references,
      idGenerator: new SequenceIds(["voice-file-1", "event-1", "attachment-1"]),
      voiceMemoStorageRepository,
    },
  );

  assert.equal(result.attachments[0].localUri, "file:///documents/voice-file-1.m4a");
  assert.deepEqual(voiceMemoStorageRepository.deletedUris, ["file:///cache/temp-recording.m4a"]);
});

test("voice memo farm event can include copied local photo attachments", async () => {
  const references = new InMemoryFarmReferenceRepository();
  await references.createFarm(farm);
  const eventRepository = new InMemoryFarmEventRepository({ locations: [] });
  const voiceMemoStorageRepository = new FakeVoiceMemoStorageRepository();
  const photoAttachmentStorageRepository = new FakePhotoAttachmentStorageRepository();

  const result = await recordVoiceMemoFarmEvent(
    {
      farmId: farm.id,
      eventType: "fieldObservation",
      temporaryVoiceMemoUri: "file:///cache/temp-recording.m4a",
      temporaryPhotoAttachments: [
        {
          temporaryUri: "file:///cache/photo-1.jpg",
          originalFileName: "greenhouse-photo.heic",
          width: 1200,
          height: 900,
          mimeType: "image/jpeg",
        },
      ],
    },
    {
      clock: { now: () => new Date("2026-05-30T12:00:00.000Z") },
      farmEventRepository: eventRepository,
      farmReferenceRepository: references,
      idGenerator: new SequenceIds(["voice-file-1", "photo-file-1", "event-1", "attachment-1", "attachment-2"]),
      photoAttachmentStorageRepository,
      voiceMemoStorageRepository,
    },
  );

  assert.equal(result.attachments.length, 2);
  assert.equal(result.attachments[1].kind, "photo");
  assert.equal(result.attachments[1].localUri, "file:///documents/photos/photo-file-1.jpg");
  assert.equal(result.attachments[1].width, 1200);
  assert.deepEqual(photoAttachmentStorageRepository.deletedUris, []);
});

test("photo attachment storage receives source photo metadata and does not persist picker cache URI", async () => {
  const references = new InMemoryFarmReferenceRepository();
  await references.createFarm(farm);
  const eventRepository = new InMemoryFarmEventRepository({ locations: [] });
  const voiceMemoStorageRepository = new FakeVoiceMemoStorageRepository();
  const photoAttachmentStorageRepository = new FakePhotoAttachmentStorageRepository();

  const result = await recordVoiceMemoFarmEvent(
    {
      farmId: farm.id,
      eventType: "fieldObservation",
      temporaryVoiceMemoUri: "file:///cache/temp-recording.m4a",
      temporaryPhotoAttachments: [
        {
          temporaryUri: "file:///cache/ImagePicker/selected-photo",
          originalFileName: "wash-pack.png",
          width: 800,
          height: 600,
          mimeType: "image/png",
        },
      ],
    },
    {
      clock: { now: () => new Date("2026-05-30T12:00:00.000Z") },
      farmEventRepository: eventRepository,
      farmReferenceRepository: references,
      idGenerator: new SequenceIds(["voice-file-1", "photo-file-1", "event-1", "attachment-1", "attachment-2"]),
      photoAttachmentStorageRepository,
      voiceMemoStorageRepository,
    },
  );

  assert.deepEqual(photoAttachmentStorageRepository.persistedInputs, [
    {
      fileName: "photo-file-1",
      originalFileName: "wash-pack.png",
      temporaryUri: "file:///cache/ImagePicker/selected-photo",
    },
  ]);
  assert.equal(result.attachments[1].localUri, "file:///documents/photos/photo-file-1.png");
  assert.notEqual(result.attachments[1].localUri, "file:///cache/ImagePicker/selected-photo");
});

test("voice memo farm event cleans up copied and temporary files when metadata save fails", async () => {
  const references = new InMemoryFarmReferenceRepository();
  await references.createFarm(farm);
  const eventRepository = new FailingFarmEventRepository({ locations: [] });
  const voiceMemoStorageRepository = new FakeVoiceMemoStorageRepository();
  const photoAttachmentStorageRepository = new FakePhotoAttachmentStorageRepository();

  await assert.rejects(
    () =>
      recordVoiceMemoFarmEvent(
        {
          farmId: farm.id,
          eventType: "general",
          temporaryVoiceMemoUri: "file:///cache/temp-recording.m4a",
          durationMs: 14_000,
          temporaryPhotoAttachments: [{ temporaryUri: "file:///cache/photo-1.jpg", mimeType: "image/jpeg" }],
        },
        {
          clock: { now: () => new Date("2026-05-30T12:00:00.000Z") },
          farmEventRepository: eventRepository,
          farmReferenceRepository: references,
          idGenerator: new SequenceIds(["voice-file-1", "photo-file-1", "event-1", "attachment-1", "attachment-2"]),
          photoAttachmentStorageRepository,
          voiceMemoStorageRepository,
        },
      ),
    /metadata save failed/,
  );

  assert.deepEqual(voiceMemoStorageRepository.deletedUris, [
    "file:///documents/voice-file-1.m4a",
    "file:///cache/temp-recording.m4a",
  ]);
  assert.deepEqual(photoAttachmentStorageRepository.deletedUris, ["file:///documents/photos/photo-file-1.jpg"]);
});

test("farm event recovery package contains metadata plus voice and photo media references", async () => {
  const references = new InMemoryFarmReferenceRepository();
  await references.createFarm(farm);
  await references.addLocation(field);
  const eventRepository = new InMemoryFarmEventRepository({ locations: [field] });
  const transcriptRepository = new InMemoryFarmNoteTranscriptRepository();
  const localRecordRepository = new InMemoryLocalRecordRepository({ locations: [field], trackedItems: [] });
  const exportRepository = new CapturingExportRepository();

  await recordFarmEvent(
    {
      farmId: farm.id,
      eventType: "fieldObservation",
      placeId: field.id,
      note: "Photo shows row cover damage",
      attachments: [
        { kind: "voiceMemo", localUri: "file:///documents/voice.m4a", mimeType: "audio/m4a" },
        { kind: "photo", localUri: "file:///documents/photo.jpg", mimeType: "image/jpeg", width: 1200, height: 900 },
      ],
    },
    {
      clock: { now: () => new Date("2026-05-30T12:00:00.000Z") },
      farmEventRepository: eventRepository,
      farmReferenceRepository: references,
      idGenerator: new SequenceIds(["event-1", "voice-attachment-1", "photo-attachment-1"]),
    },
  );
  await transcriptRepository.saveTranscript({
    id: "transcript-1",
    farmId: farm.id,
    farmEventId: "event-1",
    sourceAttachmentId: "voice-attachment-1",
    text: "Photo shows row cover damage",
    status: "completed",
    modelName: "whisper-tiny.en",
    generatedLocally: true,
    createdAt: "2026-05-30T12:01:00.000Z",
    updatedAt: "2026-05-30T12:02:00.000Z",
    privacy: "privateToFarm",
  });

  await createFarmEventRecoveryPackage(
    { farmId: farm.id },
    {
      clock: { now: () => new Date("2026-05-30T13:00:00.000Z") },
      exportRepository,
      farmEventRepository: eventRepository,
      farmNoteTranscriptRepository: transcriptRepository,
      farmReferenceRepository: references,
      localRecordRepository,
    },
  );

  const manifest = JSON.parse(exportRepository.contents);
  assert.equal(manifest.packageVersion, 2);
  assert.equal(manifest.packageSchemaVersion, 2);
  assert.equal(manifest.manualRecoveryCopy.farm.id, farm.id);
  assert.equal(manifest.farmEvents.length, 1);
  assert.equal(manifest.farmEvents[0].attachments.length, 2);
  assert.equal(manifest.farmNoteTranscripts.length, 1);
  assert.equal(manifest.farmNoteTranscripts[0].text, "Photo shows row cover damage");
  assert.equal(manifest.farmNoteTranscripts[0].generatedLocally, true);
  assert.deepEqual(
    exportRepository.mediaFiles.map((file) => file.sourceUri),
    ["file:///documents/voice.m4a", "file:///documents/photo.jpg"],
  );
  assert.equal(manifest.aiDrafts, undefined);
  assert.equal(manifest.syncState, undefined);
  assert.equal(manifest.authentication, undefined);

  assert.throws(
    () =>
      serializeFarmEventRecoveryPackageManifest({
        ...manifest,
        farmNoteTranscripts: [{ ...manifest.farmNoteTranscripts[0], generatedLocally: false }],
      }),
    z.ZodError,
  );
});

test("saved voice memo can be transcribed into a local draft transcript", async () => {
  const references = new InMemoryFarmReferenceRepository();
  await references.createFarm(farm);
  const eventRepository = new InMemoryFarmEventRepository({ locations: [] });
  const transcriptRepository = new InMemoryFarmNoteTranscriptRepository();

  await recordFarmEvent(
    {
      farmId: farm.id,
      attachments: [{ kind: "voiceMemo", localUri: "file:///documents/voice.m4a", mimeType: "audio/m4a" }],
    },
    {
      clock: { now: () => new Date("2026-05-30T12:00:00.000Z") },
      farmEventRepository: eventRepository,
      farmReferenceRepository: references,
      idGenerator: new SequenceIds(["event-1", "voice-attachment-1"]),
    },
  );

  const transcript = await transcribeFarmNoteVoiceMemo(
    { farmId: farm.id, farmEventId: "event-1" },
    {
      clock: { now: () => new Date("2026-05-30T12:05:00.000Z") },
      farmEventRepository: eventRepository,
      idGenerator: new SequenceIds(["transcript-1"]),
      transcriptionRepository: transcriptRepository,
      transcriptionService: new FakeTranscriptionService("Row cover needs repair."),
    },
  );

  assert.equal(transcript.id, "transcript-1");
  assert.equal(transcript.status, "completed");
  assert.equal(transcript.text, "Row cover needs repair.");
  assert.equal(transcript.modelName, "whisper-tiny.en");
  assert.equal(transcript.generatedLocally, true);
  assert.equal(transcript.privacy, "privateToFarm");
  assert.equal((await transcriptRepository.getTranscript(farm.id, "event-1"))?.text, "Row cover needs repair.");
});

test("transcription reports model-missing state without deleting the voice memo", async () => {
  const references = new InMemoryFarmReferenceRepository();
  await references.createFarm(farm);
  const eventRepository = new InMemoryFarmEventRepository({ locations: [] });
  const transcriptRepository = new InMemoryFarmNoteTranscriptRepository();

  await recordFarmEvent(
    {
      farmId: farm.id,
      attachments: [{ kind: "voiceMemo", localUri: "file:///documents/voice.m4a", mimeType: "audio/m4a" }],
    },
    {
      clock: { now: () => new Date("2026-05-30T12:00:00.000Z") },
      farmEventRepository: eventRepository,
      farmReferenceRepository: references,
      idGenerator: new SequenceIds(["event-1", "voice-attachment-1"]),
    },
  );

  const transcript = await transcribeFarmNoteVoiceMemo(
    { farmId: farm.id, farmEventId: "event-1" },
    {
      clock: { now: () => new Date("2026-05-30T12:05:00.000Z") },
      farmEventRepository: eventRepository,
      idGenerator: new SequenceIds(["transcript-1"]),
      transcriptionRepository: transcriptRepository,
      transcriptionService: new MissingModelTranscriptionService(),
    },
  );

  const detail = await eventRepository.getFarmEventDetail(farm.id, "event-1");
  assert.equal(transcript.status, "failed");
  assert.equal(transcript.errorSummary, "Transcription model is not installed in this test build.");
  assert.equal(detail?.attachments[0].localUri, "file:///documents/voice.m4a");
});

test("transcription saves actionable failure messages for model and audio problems", async () => {
  const references = new InMemoryFarmReferenceRepository();
  await references.createFarm(farm);
  const eventRepository = new InMemoryFarmEventRepository({ locations: [] });
  const transcriptRepository = new InMemoryFarmNoteTranscriptRepository();

  await recordFarmEvent(
    {
      farmId: farm.id,
      attachments: [{ kind: "voiceMemo", localUri: "file:///documents/voice.m4a", mimeType: "audio/m4a" }],
    },
    {
      clock: { now: () => new Date("2026-05-30T12:00:00.000Z") },
      farmEventRepository: eventRepository,
      farmReferenceRepository: references,
      idGenerator: new SequenceIds(["event-1", "voice-attachment-1"]),
    },
  );

  const modelFailure = await transcribeFarmNoteVoiceMemo(
    { farmId: farm.id, farmEventId: "event-1" },
    {
      clock: { now: () => new Date("2026-05-30T12:05:00.000Z") },
      farmEventRepository: eventRepository,
      idGenerator: new SequenceIds(["transcript-1"]),
      transcriptionRepository: transcriptRepository,
      transcriptionService: new FailingTranscriptionService(new TranscriptionModelLoadError()),
    },
  );
  const audioFailure = await transcribeFarmNoteVoiceMemo(
    { farmId: farm.id, farmEventId: "event-1" },
    {
      clock: { now: () => new Date("2026-05-30T12:10:00.000Z") },
      farmEventRepository: eventRepository,
      idGenerator: new SequenceIds(["unused-transcript-id"]),
      transcriptionRepository: transcriptRepository,
      transcriptionService: new FailingTranscriptionService(new TranscriptionAudioUnavailableError()),
    },
  );

  assert.equal(modelFailure.errorSummary, "The transcription model could not be opened. Try reinstalling the model.");
  assert.equal(audioFailure.id, modelFailure.id);
  assert.equal(audioFailure.errorSummary, "The saved voice memo file is unavailable on this device.");
  assert.equal((await eventRepository.getFarmEventDetail(farm.id, "event-1"))?.attachments[0].localUri, "file:///documents/voice.m4a");
});

test("farm note without a voice memo cannot be transcribed", async () => {
  const references = new InMemoryFarmReferenceRepository();
  await references.createFarm(farm);
  const eventRepository = new InMemoryFarmEventRepository({ locations: [] });

  await eventRepository.saveFarmEvent(
    {
      id: "event-1",
      kind: "FarmEvent",
      farmId: farm.id,
      eventType: "general",
      note: "Typed note only",
      capturedAt: "2026-05-30T12:00:00.000Z",
      createdAt: "2026-05-30T12:00:00.000Z",
      privacy: "privateToFarm",
      schemaVersion: 1,
    },
    [],
  );

  await assert.rejects(
    () =>
      transcribeFarmNoteVoiceMemo(
        { farmId: farm.id, farmEventId: "event-1" },
        {
          clock: { now: () => new Date("2026-05-30T12:05:00.000Z") },
          farmEventRepository: eventRepository,
          idGenerator: new SequenceIds(["transcript-1"]),
          transcriptionRepository: new InMemoryFarmNoteTranscriptRepository(),
          transcriptionService: new FakeTranscriptionService("No audio."),
        },
      ),
    /does not have a voice memo/,
  );
});

test("retrying transcription updates the existing draft instead of creating duplicates", async () => {
  const references = new InMemoryFarmReferenceRepository();
  await references.createFarm(farm);
  const eventRepository = new InMemoryFarmEventRepository({ locations: [] });
  const transcriptRepository = new InMemoryFarmNoteTranscriptRepository();

  await recordFarmEvent(
    {
      farmId: farm.id,
      attachments: [{ kind: "voiceMemo", localUri: "file:///documents/voice.m4a", mimeType: "audio/m4a" }],
    },
    {
      clock: { now: () => new Date("2026-05-30T12:00:00.000Z") },
      farmEventRepository: eventRepository,
      farmReferenceRepository: references,
      idGenerator: new SequenceIds(["event-1", "voice-attachment-1"]),
    },
  );

  const first = await transcribeFarmNoteVoiceMemo(
    { farmId: farm.id, farmEventId: "event-1" },
    {
      clock: { now: () => new Date("2026-05-30T12:05:00.000Z") },
      farmEventRepository: eventRepository,
      idGenerator: new SequenceIds(["transcript-1"]),
      transcriptionRepository: transcriptRepository,
      transcriptionService: new MissingModelTranscriptionService(),
    },
  );
  const second = await transcribeFarmNoteVoiceMemo(
    { farmId: farm.id, farmEventId: "event-1" },
    {
      clock: { now: () => new Date("2026-05-30T12:10:00.000Z") },
      farmEventRepository: eventRepository,
      idGenerator: new SequenceIds(["unused-transcript-id"]),
      transcriptionRepository: transcriptRepository,
      transcriptionService: new FakeTranscriptionService("Second try worked."),
    },
  );

  assert.equal(first.id, "transcript-1");
  assert.equal(second.id, "transcript-1");
  assert.equal(second.status, "completed");
  assert.equal(second.text, "Second try worked.");
  assert.equal((await transcriptRepository.listTranscriptsForExport(farm.id)).length, 1);
});

test("whisper adapter reports model-missing state before loading native transcription", async () => {
  const service = new WhisperRnVoiceMemoTranscriptionService({
    modelRepository: {
      async getModelStatus() {
        return { status: "notInstalled", model: WHISPER_TINY_EN_MODEL };
      },
      async getInstalledModelUri() {
        throw new TranscriptionModelUnavailableError();
      },
      async downloadModel() {
        return { status: "notInstalled", model: WHISPER_TINY_EN_MODEL };
      },
      async removeModel() {},
    },
  });

  await assert.rejects(
    () => service.transcribe({ localAudioUri: "file:///documents/voice.m4a" }),
    TranscriptionModelUnavailableError,
  );
});

test("whisper adapter converts Expo file URIs to native paths for whisper.rn", () => {
  assert.equal(
    toNativeFilePath("file:///data/user/0/app/files/transcription-models/ggml-tiny.en.bin"),
    "/data/user/0/app/files/transcription-models/ggml-tiny.en.bin",
  );
  assert.equal(toNativeFilePath("file:///data/user/0/app/files/farm%20memo.m4a"), "/data/user/0/app/files/farm memo.m4a");
  assert.equal(toNativeFilePath("/data/user/0/app/files/farm memo.m4a"), "/data/user/0/app/files/farm memo.m4a");
});

class SequenceIds {
  private index = 0;

  constructor(private readonly ids: string[]) {}

  newId(): string {
    const id = this.ids[this.index];
    this.index += 1;
    if (!id) {
      throw new Error("No test ID configured.");
    }
    return id;
  }
}

class FakeVoiceMemoStorageRepository {
  deletedUris: string[] = [];

  async persistVoiceMemoFile(input: { temporaryUri: string; fileName: string }) {
    assert.equal(input.temporaryUri, "file:///cache/temp-recording.m4a");
    return {
      localUri: `file:///documents/${input.fileName}.m4a`,
      fileSizeBytes: 42,
    };
  }

  async deleteLocalFileIfExists(uri: string): Promise<void> {
    this.deletedUris.push(uri);
  }
}

class FakePhotoAttachmentStorageRepository implements PhotoAttachmentStorageRepository {
  deletedUris: string[] = [];
  persistedInputs: { fileName: string; originalFileName?: string; temporaryUri: string }[] = [];

  async persistPhotoAttachment(input: TemporaryPhotoAttachment & { fileName: string }) {
    this.persistedInputs.push({
      fileName: input.fileName,
      originalFileName: input.originalFileName,
      temporaryUri: input.temporaryUri,
    });
    return {
      localUri: `file:///documents/photos/${input.fileName}.${input.mimeType === "image/png" ? "png" : "jpg"}`,
      width: input.width,
      height: input.height,
      mimeType: input.mimeType,
      fileSizeBytes: 84,
    };
  }

  async deleteLocalFileIfExists(uri: string): Promise<void> {
    this.deletedUris.push(uri);
  }
}

class FailingFarmEventRepository extends InMemoryFarmEventRepository implements FarmEventRepository {
  override async saveFarmEvent(): Promise<void> {
    throw new Error("metadata save failed");
  }
}

class FakeTranscriptionService {
  constructor(private readonly text: string) {}

  async transcribe() {
    return {
      text: this.text,
      modelName: "whisper-tiny.en",
    };
  }
}

class MissingModelTranscriptionService implements VoiceMemoTranscriptionService {
  async transcribe(): Promise<never> {
    throw new TranscriptionModelUnavailableError();
  }
}

class FailingTranscriptionService implements VoiceMemoTranscriptionService {
  constructor(private readonly error: Error) {}

  async transcribe(): Promise<never> {
    throw this.error;
  }
}

class CapturingExportRepository implements ExportRepository {
  contents = "";
  mediaFiles: { sourceUri: string; packagePath: string }[] = [];

  async writeRecoveryCopy(input: { fileName: string; contents: string }): Promise<MobilePilotExportFile> {
    this.contents = input.contents;
    return { uri: `memory://${input.fileName}`, fileName: input.fileName, mimeType: "application/json" };
  }

  async writeRecoveryPackage(input: {
    fileName: string;
    metadataContents: string;
    mediaFiles: { sourceUri: string; packagePath: string }[];
  }): Promise<MobilePilotExportFile> {
    this.contents = input.metadataContents;
    this.mediaFiles = input.mediaFiles;
    return { uri: `memory://${input.fileName}`, fileName: input.fileName, mimeType: "application/zip" };
  }

  async shareRecoveryCopy(): Promise<void> {}
}
