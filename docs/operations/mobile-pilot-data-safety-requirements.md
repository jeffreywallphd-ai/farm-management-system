# Mobile Pilot Data-Safety Requirements

- Status: accepted
- Last reviewed: 2026-05-28
- Canonical for: device-local Mobile Pilot 1 data retention, export/backup expectations, farmer communication, update/replacement safety, and limitations before real pilot reliance
- Related ADRs: [ADR-0001](../adr/ADR-0001-offline-first-field-operation.md), [ADR-0002](../adr/ADR-0002-history-preserving-idempotent-synchronization.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [ADR-0005](../adr/ADR-0005-data-portability-and-recoverability.md), [ADR-0007](../adr/ADR-0007-standalone-mobile-pilot-before-server-connected-features.md), [ADR-0009](../adr/ADR-0009-mobile-pilot-1-local-persistence.md), [ADR-0010](../adr/ADR-0010-mobile-pilot-1-export-and-recovery-copy.md), [ADR-0011](../adr/ADR-0011-mobile-pilot-1-runtime-boundary-validation.md)
- Related docs: [Mobile Pilot 1 Implementation Scope](../product/mobile-pilot-1-implementation-scope.md), [Mobile Pilot 1 Operational Records](../domain/mobile-pilot-1-operational-records.md), [Offline-First Mobile Architecture](../architecture/offline-first-mobile-architecture.md), [Backup, Restore, and Data Export Requirements](backup-restore-and-data-export-requirements.md), [Upgrades, Migrations, and Recovery Requirements](upgrades-migrations-and-recovery-requirements.md), [Mobile App README](../../apps/mobile/README.md)
- Related tests: not yet implemented
- Supersedes: none

## Purpose

This document defines accepted operational requirements for protecting real farmer-created data in Mobile Pilot 1 without accepting future hosted, local-server, synchronization, or deployment-mode designs.

## Active Mobile Pilot 1 Requirements

Before a farmer relies on Mobile Pilot 1 for meaningful records:

1. Confirmed Mobile Pilot 1 records must be durably retained locally according to the implemented persistence guarantees.
2. The app must provide a practical user-controlled export or backup mechanism for:
   - Local farm setup needed to interpret records.
   - Locations used by included records.
   - Tracked crops, materials, and countable items used by included records.
   - `HarvestRecorded`.
   - `MaterialUseRecorded`.
   - `InventoryCountRecorded`.
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

## Scope Boundary

This accepted document governs Mobile Pilot 1 only.

The broader proposed operations documents remain future guidance for:

- Server backups.
- Hosted export.
- Local-server restore.
- Migration between deployments.
- Synchronization recovery.
- Sensitive audio/photo handling in Mobile Pilot 2 or later.
