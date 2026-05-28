# Context Pack: Offline Sync

- Pack name: `offline-sync`
- Status: active
- Last reviewed: 2026-05-28
- Authority posture: Derived context aid only; canonical docs and accepted ADRs govern.

## Purpose

Helps agents work on offline mobile behavior, local retention, synchronization, replay/retry, discrepancy handling, pending publication, restore/reconnect, and sync-related state.

## Use When

- Local record retention or pending work.
- Sync queue/outbox/inbox or equivalent.
- Retry, idempotency, or server acceptance.
- Conflict/discrepancy behavior.
- Offline status UI tied to synchronization.
- Attachment synchronization.
- Restore/reconnect behavior.
- Publication timing while offline.

## Do Not Use When

- A task changes only product copy or domain terminology without offline/sync behavior.
- A task is pure documentation navigation with no retained state, sync, retry, or publication timing impact.

## Core Guidance

- Supported private field recording must work without server connectivity.
- Confirmed work is retained locally before synchronization.
- Server acceptance must be idempotent.
- Additive operational records should not overwrite each other.
- Inventory discrepancies are preserved rather than silently overwritten.
- Private sync is not external publication.
- Offline publication requests remain pending until accepted.
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

Do not choose a sync technology, invent server APIs, implement last-write-wins for meaningful farm history, or treat local pending publication as shared visibility.

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

Future implementation must verify offline retention, restart durability, retry/idempotency, additive records, discrepancy preservation, rejected submissions, pending publication, attachment transfer failure, and restore/reconnect behavior.

## Prompt Assembly Notes

Common companions: `mobile-field-capture` for user-visible state, `privacy-and-sharing` for publication or attachments, and `testing-and-diagnostics` for defects or verification.
