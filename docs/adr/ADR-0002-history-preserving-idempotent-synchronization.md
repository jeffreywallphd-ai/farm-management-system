# ADR-0002: Preserve Operational History and Require Idempotent Synchronization

- Status: accepted
- Date: 2026-05-28
- Last reviewed: 2026-05-28
- Deciders: project owner and contributors
- Canonical for: history-preserving operational records, synchronization idempotency, and non-destructive inventory observations
- Related docs: [Operational Event Catalog](../domain/operational-event-catalog.md), [Inventory and Reconciliation Rules](../domain/inventory-and-reconciliation-rules.md), [Synchronization Architecture](../architecture/synchronization-architecture.md), [Upgrades, Migrations, and Recovery Requirements](../operations/upgrades-migrations-and-recovery-requirements.md)
- Supersedes: none
- Superseded by: none

## Context

Offline mobile devices may reconnect after delay, retry submissions, restart during sync, or submit records alongside other devices. Farm activities, observations, counts, and corrections have historical meaning.

Inventory counts are observations of current reality. They may reveal discrepancies instead of proving that prior activity history should be erased.

## Decision

Locally confirmed operational records require stable identity before synchronization submission. Retrying the same retained submission must not create duplicate accepted operational effects.

Independent legitimate farm activities and observations are generally additive. Inventory counts are observations that may reveal discrepancies rather than silently replacing prior history. Later corrections must preserve auditability or lineage rather than rewriting meaningful history invisibly.

Conflict-sensitive shared commitments require separate validation from ordinary private operational record capture.

## Rationale

Farm record accuracy depends on preserving what was recorded, when it was recorded, and where discrepancies arise. Last-write-wins replacement is unsafe for meaningful activity and quantity history. Idempotent acceptance is required whenever intermittent connectivity and retries exist.

## Alternatives Considered

### Alternative: Last-Write-Wins Records

- Benefits: simpler merge behavior.
- Drawbacks: can erase legitimate observations, hide discrepancies, and corrupt historical meaning.
- Reason not selected: farm records need trustworthy history, not just latest values.

### Alternative: Server-Only Record Creation

- Benefits: simpler duplicate prevention on the server.
- Drawbacks: conflicts with offline field recording.
- Reason not selected: ADR-0001 requires local retention before synchronization.

## Consequences

### Positive

- Retry/replay behavior can be made safe.
- Multiple workers can contribute legitimate records without overwriting each other.
- Discrepancies remain visible for later reconciliation.

### Negative / Tradeoffs

- Later sync, storage, and correction designs must account for identity, lineage, and attention-required outcomes.
- Inventory views may need to explain expected versus observed quantities.

### Risks and Mitigations

- Risk: preserving history may feel more complex than editing a single current value.
- Mitigation: product design can summarize current understanding while retaining traceable operational records underneath.

## Validation and Revisit Conditions

Exact correction, supersession, and reconciliation workflows may evolve with implementation and farmer feedback. The core requirement to avoid duplicate accepted effects and silent destructive overwrite should not be weakened without a superseding ADR.

## Documentation and Test Impact

Future tests must cover retry/idempotency, multi-device additive records, inventory discrepancies, rejected submissions, restore/reconnect behavior, and correction lineage.

This ADR does not decide identifier format, event-store implementation, API/protocol design, sync engine, persistence database, or reconciliation interface.
