# Persistence and Attachment Storage

- Status: proposed
- Last reviewed: 2026-05-28
- Canonical for: architecture-level persistence responsibilities, attachment lifecycle principles, storage boundaries, and export/data ownership implications
- Related ADRs: [ADR-0002](../adr/ADR-0002-history-preserving-idempotent-synchronization.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [ADR-0005](../adr/ADR-0005-data-portability-and-recoverability.md), [ADR-0007](../adr/ADR-0007-standalone-mobile-pilot-before-server-connected-features.md), [ADR-0009](../adr/ADR-0009-mobile-pilot-1-local-persistence.md), [ADR-0010](../adr/ADR-0010-mobile-pilot-1-export-and-recovery-copy.md), [ADR-0011](../adr/ADR-0011-mobile-pilot-1-runtime-boundary-validation.md), [ADR-0012](../adr/ADR-0012-voice-photo-first-farm-event-capture-pilot.md), [ADR-0013](../adr/ADR-0013-on-device-farm-note-transcription-with-whisper-rn.md)
- Related docs: [System Overview](system-overview.md), [Offline-First Mobile Architecture](offline-first-mobile-architecture.md), [Synchronization Architecture](synchronization-architecture.md), [AI-Assisted Capture Boundaries](ai-assisted-capture-boundaries.md), [Identity, Privacy, and Sharing](identity-privacy-and-sharing.md), [Server and Deployment Operating Model](server-and-deployment-operating-model.md), [Mobile Pilot Data-Safety Requirements](../operations/mobile-pilot-data-safety-requirements.md), [Backup, Restore, and Data Export Requirements](../operations/backup-restore-and-data-export-requirements.md), [Mobile Pilot 1 Operational Records](../domain/mobile-pilot-1-operational-records.md), [Operational Event Catalog](../domain/operational-event-catalog.md), [Sourcing and Local Network Model](../domain/sourcing-and-local-network-model.md)
- Related tests: [Reference use-case tests](../../apps/mobile/src/application/use-cases/referenceUseCases.test.ts), [Reference validation tests](../../apps/mobile/src/domain/validation/referenceValidation.test.ts), [Manual record use-case tests](../../apps/mobile/src/application/use-cases/manualRecordUseCases.test.ts), [Harvest migration tests](../../apps/mobile/src/infrastructure/sqlite/migrations/harvestMigration.test.ts), [Phase 1 manual smoke test](../../apps/mobile/src/testing/phase-1-manual-smoke-test.md), [Phase 3 manual smoke test](../../apps/mobile/src/testing/phase-3-manual-smoke-test.md)
- Supersedes: none

## Purpose

This document defines architecture-level persistence and attachment responsibilities needed for the standalone mobile pilot and later synchronization behavior. ADR-0009 through ADR-0011 select Mobile Pilot 1 local persistence, export/recovery-copy, and runtime validation mechanisms; broader storage and server technology remain deferred.

It is narrower than a full server deployment or storage implementation design.

## Why Persistence and Attachments Matter

Farm operational records must survive connectivity interruptions and application restarts. Future photo/audio-supported workflows create file-retention requirements beyond structured records. Source audio and photos are potentially sensitive farm data.

Local and server environments may eventually have different storage implementations. Durable behavior and visibility boundaries matter more at this stage than specific storage technology.

## Conceptual Data Categories

| Data category | Examples | Durability need | Initial sharing posture |
| --- | --- | --- | --- |
| Mobile Pilot 1 setup/reference information | farm context, farm places with type and optional parent relationship, crops, materials, countable items needed for included records | Locally available enough for supported offline work; included in export/backup | Private/device-local |
| Mobile Pilot 1 confirmed operational records | harvest, material use, inventory count | Durable locally in the pilot; included in export/backup | Private by default |
| Local activity history | recent included records and their basic correction/status meaning | Durable enough for pilot review and export/backup | Private/device-local |
| Export/recovery-copy data | user-controlled copy of pilot data | Complete enough to understand Mobile Pilot 1 records | Private/sensitive |
| Farm-event captures | voice memo, optional photos, light context, local event metadata | Required by ADR-0012 for the next farmer-shareable pilot | Private/device-local |
| Draft interpretations | saved-note transcript drafts now; extracted fields, photo counts, AI-proposed records later only | Local transcript drafts are retained when generated; structured extraction remains deferred | Private |
| Attachments | photo, audio, later document | Required for ADR-0012 local capture; broader attachment handling remains governed separately | Follows associated privacy policy |
| Sync state | pending/accepted/failed status, cursor/bookkeeping | Future server-connected scope only | Internal |
| Shared listing records/actions | intentionally published need information | Future server-connected scope only | Shared only after intentional publication and acceptance |

## Structured Record Persistence Responsibilities

- Mobile must durably retain confirmed offline-created records.
- Future server implementation must durably retain accepted synchronized records if server-connected scope is later authorized.
- Synchronization metadata must permit safe retry and outcome tracking.
- Operational history must support later correction/audit expectations.
- Private and shared record categories must remain distinguishable.
- Local storage, server storage, caching, exports, and later backups must preserve access classification.

Phase 1 implements the first SQLite-backed local tables for Mobile Pilot 1 setup/reference information: farms, farm places, and tracked items. Farm places are stored through the existing local location concept with a farmer-facing type and optional parent relationship.

Phase 3 adds SQLite-backed local persistence for `HarvestRecorded`, `MaterialUseRecorded`, and `InventoryCountRecorded`, plus unified local activity history and a one-way versioned JSON recovery-copy export for farm setup/reference data and all implemented manual records. The recovery copy includes farm-place type and parent fields so nested place references can be interpreted later.

ADR-0012 adds local farm-event capture metadata and private audio/photo attachment references. The app now includes the first SQLite schema and repository boundary for event metadata and local attachment references, plus local voice memo recording, retained-file copy, playback, optional photo picking/capture, photo preview, durable retained-photo copy from picker/camera cache into app-owned storage before save, previous-note photo review with an unavailable-file state, and a user-controlled ZIP recovery package containing metadata plus retained audio/photo files.

ADR-0013 adds local transcript-draft persistence for saved farm-note voice memos. Transcript drafts store text/status/model metadata locally and export with the farm-note media package when present. The app downloads `ggml-tiny.en.bin` into app-controlled local storage on the device, verifies that the file exists and is within the expected size range, and uses a `whisper.rn` adapter for local transcription in an internal development build. The adapter preserves stored `file://` URIs in SQLite but converts model/audio paths at the native boundary and reports user-safe failure categories for model-open, missing-audio, unsupported-audio, native-module, and runtime failures. Import/restore, sync state, structured AI extraction, publications, and authentication remain unimplemented.

Beyond the Mobile Pilot 1 `expo-sqlite` decision in ADR-0009, this document does not choose server-side relational tables, document stores, event stores, server storage libraries, or server database products.

## Attachment Responsibilities

- Photos or audio are required only for the ADR-0012 local capture-first pilot. Audio may be used for ADR-0013 on-device transcript drafts when the local model is installed. Captures are retained for user review and recovery export, not for server transfer or automatic structured interpretation.
- Attachments may be associated with unconfirmed drafts or confirmed records.
- Operational records must remain distinguishable from source captures, interpretation drafts, and attachments.
- Attachment retention must not cause the associated confirmed record to disappear if upload is delayed.
- A failed attachment transfer must remain visible/retryable where the attachment is required or expected.
- Attachment privacy must follow or be more restrictive than the associated draft/record/listing.
- Attachments must not become public or network-shared merely because an associated private record exists.
- Linking a private record to a shared listing must not automatically expose the record's private attachment.
- The system must distinguish "record synchronized" from "attachment synchronized" where necessary.

## Record/Attachment Association Integrity

Later implementation must preserve:

- Which draft or confirmed record an attachment supports.
- Whether an attachment is pending, transferred, failed, discarded, or intentionally removed.
- Whether a confirmed record can remain valid without its attachment, depending on the workflow.
- Whether a photo/audio capture is retained for provenance after a user confirms a record, to be governed by AI-assisted capture, privacy, and retention policy.

Retention durations and exact deletion behavior are not decided here.

## Local Versus Server Storage Distinction

Local storage supports disconnected field work and pending transfer.

Future server storage supports synchronized durability, authorized multi-device use, shared-publication behavior, and later export/backup if server-connected scope is authorized.

The architecture must permit later local-server and hosted-server deployment modes. No particular physical storage implementation is selected here.

## Export and Data Ownership Implication

Accepted farm operational records and user-owned associated content must be exportable/backed up in a practical way before meaningful standalone mobile pilot reliance, and should eventually remain exportable in a usable form across later server modes.

Backup, restore, and export mechanics are defined at a requirements level in [Backup, Restore, and Data Export Requirements](../operations/backup-restore-and-data-export-requirements.md). Persistence decisions must not make user data practically unrecoverable or locked exclusively into a managed service.

Attachments and sensitive captures affect backup, export, retention, and privacy handling. This document still does not choose attachment storage, server storage, cloud backup, or production backup technology.

## Deferred Decisions

This document explicitly defers:

- Persistence technology beyond Mobile Pilot 1 `expo-sqlite`.
- Server database technology.
- Attachment file/object storage technology.
- Media compression and thumbnail processing.
- Retention/deletion policies.
- Encryption implementation.
- Backup/export formats beyond Mobile Pilot 1 versioned JSON recovery copy.
- Local-server filesystem layout.
- Cloud storage providers.
- Detailed attachment synchronization contract.
