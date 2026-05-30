# Mobile Pilot Data-Safety Requirements

- Status: accepted
- Last reviewed: 2026-05-28
- Canonical for: device-local Mobile Pilot 1 data retention, export/backup expectations, farmer communication, update/replacement safety, and limitations before real pilot reliance
- Related ADRs: [ADR-0001](../adr/ADR-0001-offline-first-field-operation.md), [ADR-0002](../adr/ADR-0002-history-preserving-idempotent-synchronization.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [ADR-0005](../adr/ADR-0005-data-portability-and-recoverability.md), [ADR-0007](../adr/ADR-0007-standalone-mobile-pilot-before-server-connected-features.md), [ADR-0009](../adr/ADR-0009-mobile-pilot-1-local-persistence.md), [ADR-0010](../adr/ADR-0010-mobile-pilot-1-export-and-recovery-copy.md), [ADR-0011](../adr/ADR-0011-mobile-pilot-1-runtime-boundary-validation.md), [ADR-0012](../adr/ADR-0012-voice-photo-first-farm-event-capture-pilot.md), [ADR-0013](../adr/ADR-0013-on-device-farm-note-transcription-with-whisper-rn.md)
- Related docs: [Mobile Pilot 1 Implementation Scope](../product/mobile-pilot-1-implementation-scope.md), [Mobile Pilot 1 Operational Records](../domain/mobile-pilot-1-operational-records.md), [Offline-First Mobile Architecture](../architecture/offline-first-mobile-architecture.md), [Backup, Restore, and Data Export Requirements](backup-restore-and-data-export-requirements.md), [Upgrades, Migrations, and Recovery Requirements](upgrades-migrations-and-recovery-requirements.md), [Mobile App README](../../apps/mobile/README.md)
- Related tests: [Harvest use-case tests](../../apps/mobile/src/application/use-cases/harvestUseCases.test.ts), [Manual record use-case tests](../../apps/mobile/src/application/use-cases/manualRecordUseCases.test.ts)
- Supersedes: none

## Purpose

This document defines accepted operational requirements for protecting real farmer-created data in Mobile Pilot 1 without accepting future hosted, local-server, synchronization, or deployment-mode designs.

## Active Mobile Pilot 1 Requirements

Before a farmer relies on Mobile Pilot 1 for meaningful records:

1. Confirmed Mobile Pilot 1 records must be durably retained locally according to the implemented persistence guarantees.
2. The app must provide a practical user-controlled export or backup mechanism for:
   - Local farm setup needed to interpret records.
   - Farm places used by included records, including place type and parent relationships needed to interpret nested paths.
   - Tracked crops, materials, and countable items used by included records, including the crop reference data needed to interpret `HarvestRecorded` records by stable crop ID.
   - `HarvestRecorded`.
   - `MaterialUseRecorded`.
   - `InventoryCountRecorded`.
   - Farm-event capture metadata, voice memo files, photo files, and transcript drafts when present.
   - Essential identifiers, timestamps, quantities, units, location/item relationships, and privacy classification needed to understand the records.
3. The app must clearly communicate:
   - Records are stored on the device.
   - Loss, uninstall, replacement, or update risk exists if the user has not exported/backed up data.
   - What the export/backup includes.
   - Whether restore/import is supported in the pilot or not yet supported.
4. If the pilot does not initially support restore/import, the mechanism must not be labeled as full backup/restore. It should be labeled accurately as an export or recovery copy according to actual capability.
5. App updates or test-build replacement must not silently destroy retained farmer records without clear warning and an available export/recovery step.
6. Exported data is private and may reveal sensitive farm operations. User-facing guidance and later testing must reflect that.
7. ADR-0009, ADR-0010, and ADR-0011 select Mobile Pilot 1 local persistence, export/recovery-copy, and runtime validation mechanisms. This document does not select cloud backup, server backup, synchronization, encryption technology, restore/import behavior, or production backup technology.
8. Crop rename, deletion, and history-snapshot behavior remain deferred until reference-editing behavior is explicitly scoped. Export/recovery-copy behavior must still preserve enough tracked crop information to interpret saved harvest records.

Phase 3 implements a one-way versioned JSON recovery copy for the complete manual Mobile Pilot 1 core: local farm setup/reference data and saved `HarvestRecorded`, `MaterialUseRecorded`, and `InventoryCountRecorded` records. The recovery copy is generated locally and passed to the device-native share/save flow. Restore/import is still not implemented, so user-facing language must continue to say "recovery copy" or "export" rather than full backup/restore.

Farm-place hierarchy in the recovery copy is data-safety context only. It helps interpret records such as `Field 1 > Bed 1 > Row 1` after export, but it does not imply restore/import, mapping, GIS, server backup, or cloud backup behavior.

The app now has event metadata and local attachment-reference storage foundation for the ADR-0012 capture-first pilot, plus a user-controlled ZIP media recovery package that includes event metadata with retained audio and photo files. ADR-0013 transcript drafts are generated locally after the on-device model is installed and are included in that package when present, clearly as generated local draft text. The package remains user-controlled and does not upload, synchronize, or share captured media automatically. Restore/import remains unimplemented.

## Scope Boundary

This accepted document governs Mobile Pilot 1 only.

The broader proposed operations documents remain future guidance for:

- Server backups.
- Hosted export.
- Local-server restore.
- Migration between deployments.
- Synchronization recovery.
- Sensitive audio/photo handling in Mobile Pilot 2 or later.
