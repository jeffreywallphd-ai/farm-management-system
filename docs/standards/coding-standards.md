# Coding Standards

- Status: proposed
- Last reviewed: 2026-05-28
- Canonical for: technology-neutral implementation discipline, boundary separation, and high-risk coding obligations
- Related ADRs: [ADR-0001](../adr/ADR-0001-offline-first-field-operation.md), [ADR-0002](../adr/ADR-0002-history-preserving-idempotent-synchronization.md), [ADR-0003](../adr/ADR-0003-ai-interpretations-require-confirmation.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [ADR-0005](../adr/ADR-0005-data-portability-and-recoverability.md), [ADR-0007](../adr/ADR-0007-standalone-mobile-pilot-before-server-connected-features.md)
- Related docs: [System Overview](../architecture/system-overview.md), [Operational Event Catalog](../domain/operational-event-catalog.md), [Synchronization Architecture](../architecture/synchronization-architecture.md), [AI-Assisted Capture Boundaries](../architecture/ai-assisted-capture-boundaries.md), [Identity, Privacy, and Sharing](../architecture/identity-privacy-and-sharing.md), [Change Impact Matrix](change-impact-matrix.md)
- Related tests: not yet implemented
- Supersedes: none

## Scope and Technology-Neutral Posture

These standards define behavioral and structural expectations independent of implementation language.

Language/framework-specific standards should be added or refined only after later accepted technology decisions. Code must serve the canonical product, domain, architecture, operations, and ADR constraints rather than invent alternatives locally.

## Domain-First Implementation Discipline

Future implementation must:

- Use canonical domain terms consistently in code-facing concepts once implementation begins.
- Model farm actions and observations explicitly instead of hiding them behind generic catch-all abstractions.
- Preserve the distinction among private operational records, shared representations/listings, source captures, AI drafts, confirmed operational records, synchronization status, and attachments.
- Avoid treating capture methods as operational-record types.
- Avoid making technical convenience overwrite farmer-facing meaning.

## Boundary Discipline

The repository does not yet define a final module structure. Future implementation must still keep these responsibilities distinguishable:

| Responsibility | Must remain distinguishable from |
| --- | --- |
| Domain rules and operational meaning | Storage, network transport, UI, model inference |
| Application/use-case orchestration | Framework route handlers and infrastructure drivers |
| Mobile offline retention/sync coordination | UI display concerns alone |
| AI interpretation/draft production | Confirmed operational-record persistence |
| Shared listing publication | Private inventory/record retrieval |
| Attachment handling | Visibility decisions and operational-record meaning |
| Deployment/operations behavior | Farmer domain rules |

A later module/dependency architecture document may formalize code placement and import rules after technology and repository layout decisions are accepted.

## Implementation Restraint

- Implement only behavior authorized by current product scope and canonical docs.
- For the current pilot, implement standalone mobile-local behavior before server-connected scope.
- Do not implement server synchronization, multi-device access, shared publication, responses, or server deployment merely because future architecture documents describe those boundaries.
- Avoid generic platform abstractions before multiple real needs exist.
- Do not create extensibility mechanisms for deferred marketplace, payments, broad AI, federation, or microservice designs.
- Prefer small, comprehensible vertical-slice implementations over speculative framework-building.
- Keep side effects and boundary transitions explicit.
- Avoid silent fallback behavior that obscures record loss, privacy violations, or sync failures.

## Offline and Synchronization Coding Obligations

Code touching current pilot offline behavior must preserve local confirmed-record durability, local saved-state clarity, local history, export/backup expectations, and future-sync-compatible record boundaries.

Code touching later authorized synchronization behavior must preserve:

- Locally confirmed record durability.
- Visible pending, synchronized, failed, or attention-required state.
- Idempotent server acceptance expectations.
- Preservation of legitimate additive records.
- Visibility of discrepancy conditions rather than silent overwrite.
- Distinction between pending publication and active shared visibility.
- Safe handling of failed or retried attachment transfer.

## AI-Assisted Implementation Obligations

- No code path may convert inference directly into confirmed record effects without explicit user confirmation.
- No unconfirmed draft may alter inventory, activity history, shared visibility, or external actions.
- Failed or ambiguous inference must be handled explicitly.
- AI-assisted records must use the same confirmed operational-record rules as manual equivalents.
- Provenance must remain possible without requiring premature model infrastructure.

## Privacy Implementation Obligations

- Private farm records must not be made externally visible by convenience serialization or shared endpoints.
- Shared listings must use explicitly shareable representations.
- Attachments and captures must not inherit wider visibility implicitly.
- Logs, diagnostics, errors, exports, fixtures, and development samples must avoid unnecessary sensitive payload exposure.
- Code review must treat privacy widening as a high-risk change.

## Error Handling and Failure Visibility

- Expected failures must be represented intentionally at boundaries.
- Do not swallow synchronization failures, record rejection, attachment failure, or privacy authorization denial.
- Do not return success when a record, publication, or attachment has only been saved locally or remains pending unless the status is explicit.
- Preserve useful diagnostic context without exposing sensitive content.

## Future Language-Specific Extension Point

After accepted stack decisions, this standard may be supplemented with type-safety requirements, package/import dependency enforcement, error/result conventions, formatting/linting, concurrency/background-job rules, database migration style, and mobile lifecycle conventions.
