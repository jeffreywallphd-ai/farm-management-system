import assert from "node:assert/strict";
import test from "node:test";
import { z } from "zod";

import type { Farm } from "../../domain/farm/Farm";
import type { FarmLocation } from "../../domain/farm/FarmLocation";
import type { FarmEventRepository } from "../ports/FarmEventRepository";
import type { ExportRepository, MobilePilotExportFile } from "../ports/ExportRepository";
import type {
  PhotoAttachmentStorageRepository,
  TemporaryPhotoAttachment,
} from "../ports/PhotoAttachmentStorageRepository";
import { InMemoryFarmEventRepository } from "../../testing/fakes/InMemoryFarmEventRepository";
import { InMemoryFarmReferenceRepository } from "../../testing/fakes/InMemoryFarmReferenceRepository";
import { InMemoryLocalRecordRepository } from "../../testing/fakes/InMemoryLocalRecordRepository";
import { createFarmEventRecoveryPackage } from "./export-mobile-pilot-data/CreateFarmEventRecoveryPackage";
import { recordFarmEvent } from "./record-farm-event/RecordFarmEvent";
import { recordVoiceMemoFarmEvent } from "./record-voice-memo-farm-event/RecordVoiceMemoFarmEvent";
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
    idGenerator: new SequenceIds(["event-old", "attachment-old", "event-new", "attachment-new"]),
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
      attachments: [{ kind: "voiceMemo", localUri: "file:///local/new.m4a" }],
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
  assert.equal(detail?.attachments.length, 1);
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

  await createFarmEventRecoveryPackage(
    { farmId: farm.id },
    {
      clock: { now: () => new Date("2026-05-30T13:00:00.000Z") },
      exportRepository,
      farmEventRepository: eventRepository,
      farmReferenceRepository: references,
      localRecordRepository,
    },
  );

  const manifest = JSON.parse(exportRepository.contents);
  assert.equal(manifest.packageVersion, 1);
  assert.equal(manifest.manualRecoveryCopy.farm.id, farm.id);
  assert.equal(manifest.farmEvents.length, 1);
  assert.equal(manifest.farmEvents[0].attachments.length, 2);
  assert.deepEqual(
    exportRepository.mediaFiles.map((file) => file.sourceUri),
    ["file:///documents/voice.m4a", "file:///documents/photo.jpg"],
  );
  assert.equal(manifest.aiDrafts, undefined);
  assert.equal(manifest.syncState, undefined);
  assert.equal(manifest.authentication, undefined);
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

  async persistPhotoAttachment(input: TemporaryPhotoAttachment & { fileName: string }) {
    return {
      localUri: `file:///documents/photos/${input.fileName}.jpg`,
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
