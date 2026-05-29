# Context Pack: Offline Sync

- Pack name: `offline-sync`
- Status: active
- Last reviewed: 2026-05-28
- Authority posture: Derived context aid only; canonical docs and accepted ADRs govern.

## Purpose

Helps agents work on offline mobile behavior, local retention, future-sync-compatible record identity/history, synchronization after later authorization, discrepancy handling, local recovery, restore/reconnect, and sync-related state.

## Use When

- Local record retention or pending work.
- Future sync queue/outbox/inbox or equivalent after authorization.
- Retry, idempotency, or server acceptance.
- Conflict/discrepancy behavior.
- Local saved-state UI and future synchronization status.
- Attachment local retention or future synchronization.
- Restore/reconnect behavior.
- Publication timing while offline.

## Do Not Use When

- A task changes only product copy or domain terminology without offline/sync behavior.
- A task is pure documentation navigation with no retained state, sync, retry, or publication timing impact.

## Core Guidance

- Supported private field recording must work without server connectivity.
- In the standalone pilot, confirmed work is retained locally and shown in local history without server synchronization.
- Future server-connected synchronization becomes applicable only after later authorized scope.
- Server acceptance must be idempotent.
- Additive operational records should not overwrite each other.
- Inventory discrepancies are preserved rather than silently overwritten.
- Private future sync is not external publication.
- Offline publication requests are not pilot scope; if later authorized, they remain pending until accepted.
- Failures and attention-required states must remain visible.
- Restore, upgrade, and reconnect behavior must avoid duplication or loss.

## Non-Negotiable Constraints

- [ADR-0001](../../adr/ADR-0001-offline-first-field-operation.md): offline field operation is foundational.
- [ADR-0002](../../adr/ADR-0002-history-preserving-idempotent-synchronization.md): retry must not duplicate effects or erase history.
- [ADR-0004](../../adr/ADR-0004-private-by-default-intentional-sharing.md): synchronization is not publication.
- [ADR-0005](../../adr/ADR-0005-data-portability-and-recoverability.md): recovery/migration must preserve meaning and visibility.

## Decisions Still Deferred

Local/server database, sync engine/protocol/library, API transport, background scheduling, identifier implementation, conflict-resolution UI, and offline reference-data creation remain deferred.

## Explicit Non-Goals / Overreach to Avoid

Do not treat this pack as authorization to implement a server, sync protocol, cross-device synchronization, or publication state during the pilot. Do not choose a sync technology, invent server APIs, implement last-write-wins for meaningful farm history, or treat local pending publication as shared visibility.

## Canonical Source Documents and ADRs

- `docs/architecture/offline-first-mobile-architecture.md`: local retained work responsibilities.
- `docs/architecture/synchronization-architecture.md`: sync lifecycle, statuses, idempotency, and conflict posture.
- `docs/architecture/persistence-and-attachment-storage.md`: durable local/server storage and attachments.
- `docs/domain/inventory-and-reconciliation-rules.md`: discrepancy behavior.
- `docs/operations/upgrades-migrations-and-recovery-requirements.md`: restore/reconnect and migration safety.

## Required Standards

- `docs/standards/testing-and-verification-standards.md`
- `docs/standards/logging-and-diagnostics-standards.md`
- `docs/standards/accessibility-and-field-usability-standards.md`
- `docs/standards/change-impact-matrix.md`

## Required Documentation Impact Review

Review offline/sync architecture and operations recovery docs when local retention, sync status, retry, acceptance, conflict, attachment transfer, restore/reconnect, or publication timing changes.

## Required Verification Impact Review

Future implementation must verify offline retention, restart durability, local history, export/backup safety, and discrepancy preservation for the standalone pilot. Later authorized sync work must verify retry/idempotency, additive records, rejected submissions, pending publication, attachment transfer failure, and restore/reconnect behavior.

## Prompt Assembly Notes

Common companions: `mobile-field-capture` for user-visible state, `privacy-and-sharing` for publication or attachments, and `testing-and-diagnostics` for defects or verification.
