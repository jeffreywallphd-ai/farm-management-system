# Upgrades, Migrations, and Recovery Requirements

- Status: proposed
- Last reviewed: 2026-05-28
- Canonical for: upgrade safety, migration expectations, synchronization repair, failure visibility, and recovery requirements
- Related ADRs: [ADR-0001](../adr/ADR-0001-offline-first-field-operation.md), [ADR-0002](../adr/ADR-0002-history-preserving-idempotent-synchronization.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [ADR-0005](../adr/ADR-0005-data-portability-and-recoverability.md), [ADR-0007](../adr/ADR-0007-standalone-mobile-pilot-before-server-connected-features.md)
- Related docs: [Operations README](README.md), [Deployment Modes](deployment-modes.md), [Backup, Restore, and Data Export Requirements](backup-restore-and-data-export-requirements.md), [Synchronization Architecture](../architecture/synchronization-architecture.md), [Server and Deployment Operating Model](../architecture/server-and-deployment-operating-model.md)
- Related tests: not yet implemented
- Supersedes: none

## Purpose

This document defines product and operational expectations for upgrades, data migrations, synchronization repair, failure visibility, and recoverability across supported deployment modes.

It establishes safety expectations without implementing upgrade tooling.

## Why Upgrades and Recovery Matter

Operational software used during farm work must not become unreliable or data-destructive when application versions change, mobile devices are offline during server updates, schema or record formats evolve, attachment transfers fail, local servers experience hardware or power failures, hosted systems have interruptions, devices reconnect after extended disconnection, or users replace devices or change deployment modes later.

For the standalone mobile pilot, app updates, test build replacement, reinstall, phone replacement, local data representation changes, and local export/backup failures are immediate recovery risks even before a server exists.

## Upgrade Safety Principles

1. Upgrades must not silently destroy or reinterpret confirmed operational records.
2. Privacy/visibility classifications must remain intact through migration.
3. AI-assisted provenance and attachment relationships must not be widened or lost accidentally.
4. Mobile devices with unsynchronized records must be considered before incompatible server changes are released.
5. A recovery/rollback or backup requirement must exist before destructive migrations.
6. Users should not have to reason about low-level schema migrations during ordinary product updates.
7. Technical administrators may receive detailed migration guidance for self-hosted operation; simplified local users require safer guided behavior later.

## Standalone Mobile Pilot Update Safety

- A pilot app update must not silently discard locally retained records.
- Changing local data representation during pilot iterations requires migration/recovery consideration before farmers rely on recorded data.
- A test build replacement, reinstall, or app reset must not be treated casually once farmers have recorded real work.
- Export/backup should be available and understandable before risky pilot upgrades or replacements.
- Later server reconnect/synchronization constraints remain future-facing and must not be represented as current pilot recovery capability.

## Mobile/Server Version Compatibility Implication

Mobile devices may remain offline while the server changes. Later implementation must consider compatibility between older mobile clients carrying retained local records and newer server behavior.

Confirmed offline-created work must not be silently lost merely because it was submitted after a server upgrade. Detailed versioning, compatibility-window, or migration protocol decisions are deferred.

## Synchronization Recovery Scenarios

| Scenario | Required product/architecture posture |
| --- | --- |
| Mobile device has unsynchronized confirmed records when app restarts | Records remain retained and pending |
| Sync attempt temporarily fails | Work remains local and retryable |
| Server is unavailable for extended time | Supported offline capture remains usable within locally available context |
| Server rejects a record after reconnect | Record/status remains visible and requires attention rather than disappearing |
| Attachment upload fails after record sync | Record and attachment state remain distinguishable; retry/recovery possible later |
| Local server fails before some devices synchronize | Device-retained pending work must remain recoverable when server is restored/replaced later |
| Backup is restored and previously connected devices reconnect | Later implementation must avoid record duplication or unintended visibility changes |
| A shared publication request was pending during outage | Must not be presented as externally active until accepted |
| Mobile/server versions differ | Later compatibility rules must prevent silent loss/corruption |

## Upgrade Experience by Deployment Mode

| Deployment mode | Later upgrade expectation |
| --- | --- |
| Managed hosted service | Operator manages server upgrades; mobile/client compatibility and farmer data protection remain required |
| Simplified local farm server | Guided update process with clear backup/recovery state before risky changes |
| Technical self-hosted deployment | Documented administrator upgrade/migration process with supported backup/restore procedure |
| Cooperative/private-cloud deployment | Operator-admin process plus strong farm-boundary/privacy preservation |

## Data Migration Requirements

- Migrations must be versioned and traceable.
- Migration behavior affecting operational meaning, privacy, sharing, sync, or attachments must update canonical docs and likely require an ADR.
- Migration must preserve stable record meaning where possible.
- Irreversible migrations require explicit safeguards and recovery expectations.
- Migration testing must use representative first-slice domain records and later sensitive/shared cases where supported.

This document does not select migration tools or schema design.

## Operational Diagnostics and Health Expectations

- Server operators need understandable health and failure information.
- Simplified local-farm operation requires clear status rather than raw infrastructure errors.
- Synchronization problems must be diagnosable without exposing sensitive payload contents unnecessarily.
- Backup status, restore outcome, update outcome, attachment failure, and sync backlog/attention states may require later operational visibility.
- Detailed observability standards belong in later standards work, but this document identifies the operating needs.

## Incident and Recovery Boundaries

Future operations/security work must address risks relevant to released features, including:

- Data-corruption recovery.
- Lost/replaced mobile device.
- Local-server hardware failure.
- Compromised credentials/device/server.
- Accidental listing publication.
- Attachment privacy incident.
- Hosted-service outage.
- Export before service discontinuation.

Full incident response procedures are not part of this foundational prompt.

## Required Later Verification Categories

Future implementation must verify:

- Upgrade preservation.
- Migration rollback/recovery where applicable.
- Older-client pending-record submission.
- Synchronization repair.
- Attachment failure/retry.
- Restored-server reconnect/idempotency.
- Privacy/visibility preservation after migration.
- Local-server recovery usability.
- Operational-status clarity for simplified local mode.
