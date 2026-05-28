# Testing and Verification Standards

- Status: proposed
- Last reviewed: 2026-05-28
- Canonical for: repository-wide behavioral verification strategy and required invariant testing categories
- Related ADRs: [ADR-0001](../adr/ADR-0001-offline-first-field-operation.md), [ADR-0002](../adr/ADR-0002-history-preserving-idempotent-synchronization.md), [ADR-0003](../adr/ADR-0003-ai-interpretations-require-confirmation.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [ADR-0005](../adr/ADR-0005-data-portability-and-recoverability.md)
- Related docs: [Field Workflows](../product/field-workflows.md), [Synchronization Architecture](../architecture/synchronization-architecture.md), [AI-Assisted Capture Boundaries](../architecture/ai-assisted-capture-boundaries.md), [Backup, Restore, and Data Export Requirements](../operations/backup-restore-and-data-export-requirements.md), [Change Impact Matrix](change-impact-matrix.md)
- Related tests: not yet implemented
- Supersedes: none

## Testing Philosophy

Tests exist to protect farmer-relevant behavior, accepted ADR constraints, privacy boundaries, offline reliability, and recovery. Coverage metrics alone are not sufficient evidence of correctness.

Tests must be deterministic and targeted to the layer where a defect should be caught. High-risk cross-boundary workflows require scenario or integration verification in addition to isolated unit tests.

## Test Categories Required Later

| Test category | Purpose |
| --- | --- |
| Domain behavior tests | Protect operational-record meaning, inventory/discrepancy rules, confirmation rules, privacy semantics |
| Application/use-case tests | Protect orchestration, status changes, publication intent, failure mapping, confirmation gates |
| Storage/persistence tests | Protect durability, attachment association, visibility classification, migration behavior |
| Synchronization integration tests | Protect offline submission, retry, idempotency, incoming updates, conflict/attention outcomes |
| AI boundary tests | Protect draft-before-confirmation and no-unconfirmed-effect invariants |
| Privacy/authorization tests | Protect private/shared separation and prohibited exposure |
| Mobile workflow tests | Protect offline recording and understandable field behavior |
| Deployment/operations tests | Protect backup/restore/export/upgrade/recovery behavior when those features exist |
| Accessibility/field-usability verification | Protect practical use under farm conditions |
| Architecture/anti-drift tests | Protect prohibited dependencies or boundary violations after repository structure is selected |

## Foundational Invariant Verification Requirements

### Offline-First Field Operation

Future verification must include:

- A supported activity can be entered and retained without connectivity.
- Locally retained work remains available after app interruption/restart where implementation claims durability.
- Pending synchronization state is distinguishable from synchronized state.
- Supported field entry does not fail merely because the server is unavailable.

### Synchronization and Operational-Record Integrity

Future verification must include:

- Retrying the same confirmed local submission does not create duplicate accepted effects.
- Separate legitimate activities remain separate.
- Quantity-affecting records and later inventory counts preserve discrepancy evidence.
- Server rejection or attention-required outcomes remain visible rather than deleting local work.
- Restore/reconnect scenarios do not silently duplicate accepted records where supported.

### AI-Assisted Capture Trust Boundary

Future verification must include:

- Inference generates only a draft until confirmation.
- Unconfirmed draft has no inventory or history effect.
- Correcting then confirming creates the equivalent ordinary operational record.
- Rejecting a draft creates no operational effect.
- AI interpretation cannot publish a listing or alter visibility.
- Failed or ambiguous capture degrades safely.

### Privacy and Intentional Sharing

Future verification must include:

- Private operational records are not exposed through local-network listing retrieval.
- Publication requires explicit action.
- Need listing output contains only intentionally shareable content.
- Synchronization of private data does not make it externally visible.
- Source photos/audio and AI drafts are not included automatically in shared listings.
- Pending offline publication is not represented as visible/published.

### Data Portability and Recovery

Future verification must include once features exist:

- Exports contain required farm-owned information.
- Restore preserves operational meaning and visibility classification.
- Backup/restore includes or explicitly excludes attachments according to documented policy.
- Migrations preserve accepted invariants.
- Recovery from failed updates or sync interruptions does not silently lose confirmed work.

## Scenario-Style Acceptance Verification

Tests and review scenarios should use farm workflow language where appropriate.

```markdown
### Scenario: Record harvest without reception

Given a worker has locally available farm context needed for entry
And no server connection is available
When the worker confirms a harvest record
Then the harvest remains available locally
And it is marked as awaiting synchronization
And server unavailability does not erase the work
```

```markdown
### Scenario: Retry synchronized material use without duplicate effect

Given a confirmed material-use record was retained locally
And a prior synchronization acknowledgment was not received by the device
When the same record is transmitted again
Then the server recognizes the same intended record
And expected material quantity is not decreased twice
```

```markdown
### Scenario: Photo count remains a draft until confirmed

Given a worker captures a supported photo-count image
When the system proposes a count
Then inventory understanding is unchanged
Until the worker confirms or corrects and confirms the count
```

```markdown
### Scenario: Publish a need without exposing internal inventory

Given a private inventory observation or supply need exists
When a farmer intentionally publishes a need listing
Then the shared listing contains only fields approved for sharing
And external participants cannot retrieve the underlying private count or usage history
```

## Regression Testing Rule

Meaningful defect fixes must add a regression test at the layer where the defect should have been prevented, unless impossible or disproportionate.

When no regression test is added, the change report must state why and identify an alternative verification step. Privacy, sync duplication, record loss, AI auto-confirmation, and backup/restore defects are high-priority regression cases.

## Determinism and Fixture Discipline

Future tests must:

- Control time and identity generation where relevant.
- Avoid external network dependence unless intentionally running an integration environment.
- Use representative farm-domain fixtures rather than generic placeholder data.
- Avoid real sensitive farm data, source captures, personal data, credentials, or production content in fixtures.
- Make offline, pending, confirmed, synchronized, published, and failed states explicit.

## Deferred Tooling

This standard does not select a test framework, browser/mobile automation framework, integration environment tooling, coverage tooling, dependency-rule checker, or CI platform.

Later stack decisions must adopt tooling that can enforce these behavioral requirements.
