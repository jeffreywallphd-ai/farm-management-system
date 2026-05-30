import assert from "node:assert/strict";
import test from "node:test";
import { z } from "zod";

import { farmEventInputSchema, farmEventTypeSchema, MAX_FARM_EVENT_NOTE_LENGTH } from "./farmEventValidation";

test("farm event types are constrained to the capture pilot vocabulary", () => {
  assert.equal(farmEventTypeSchema.parse("general"), "general");
  assert.equal(farmEventTypeSchema.parse("harvest"), "harvest");
  assert.throws(() => farmEventTypeSchema.parse("serverSync"));
});

test("farm event input requires a local voice memo attachment", () => {
  const parsed = farmEventInputSchema.parse({
    eventType: "fieldObservation",
    placeId: " place-1 ",
    note: "  Checked storm damage  ",
    attachments: [
      {
        kind: "voiceMemo",
        localUri: "file:///local/farm-note.m4a",
        mimeType: "audio/m4a",
        durationMs: 12_000,
      },
    ],
  });

  assert.equal(parsed.eventType, "fieldObservation");
  assert.equal(parsed.placeId, "place-1");
  assert.equal(parsed.note, "Checked storm damage");
  assert.equal(parsed.attachments[0].localUri, "file:///local/farm-note.m4a");
});

test("farm event input rejects blank, remote, or photo-only attachments", () => {
  assert.throws(
    () =>
      farmEventInputSchema.parse({
        attachments: [{ kind: "voiceMemo", localUri: "   " }],
      }),
    z.ZodError,
  );
  assert.throws(
    () =>
      farmEventInputSchema.parse({
        attachments: [{ kind: "voiceMemo", localUri: "https://example.com/farm-note.m4a" }],
      }),
    z.ZodError,
  );
  assert.throws(
    () =>
      farmEventInputSchema.parse({
        attachments: [{ kind: "photo", localUri: "file:///local/photo.jpg" }],
      }),
    z.ZodError,
  );
});

test("farm event note length is limited", () => {
  assert.throws(() =>
    farmEventInputSchema.parse({
      note: "a".repeat(MAX_FARM_EVENT_NOTE_LENGTH + 1),
      attachments: [{ kind: "voiceMemo", localUri: "file:///local/farm-note.m4a" }],
    }),
  );
});

