# Documentation Standards

- Status: proposed
- Last reviewed: 2026-05-28
- Canonical for: repository-wide documentation authority, metadata, change completeness, and drift prevention
- Related ADRs: [ADR-0001](../adr/ADR-0001-offline-first-field-operation.md), [ADR-0002](../adr/ADR-0002-history-preserving-idempotent-synchronization.md), [ADR-0003](../adr/ADR-0003-ai-interpretations-require-confirmation.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [ADR-0005](../adr/ADR-0005-data-portability-and-recoverability.md)
- Related docs: [Documentation Governance](../README.md), [Decision Readiness Register](../adr/decision-readiness-register.md), [Change Impact Matrix](change-impact-matrix.md)
- Related tests: not yet implemented
- Supersedes: none

## Documentation Is Part of the Product Control System

Documentation is not optional commentary. It exists to preserve farmer-centered product scope, define operational-record and privacy rules, constrain technical architecture, preserve accepted ADR decisions, guide implementation and review, support safe automated development, and make future changes traceable.

When implementation behavior changes in a way that affects documented product, domain, architecture, operations, or standards behavior, the implementation work is incomplete until the relevant canonical documentation is reviewed and updated.

## Canonical Documentation Hierarchy

| Documentation area | Canonical purpose |
| --- | --- |
| `docs/product/` | Product purpose, validated needs, first-slice scope, workflows, roadmap, product validation |
| `docs/domain/` | Farm terminology, operational-record meaning, inventory, sourcing, AI-confirmation, privacy/visibility semantics |
| `docs/architecture/` | System boundaries, offline/sync behavior, AI boundaries, privacy boundaries, server/deployment operating model |
| `docs/adr/` | Durable accepted/proposed/superseded decisions and readiness classification |
| `docs/standards/` | Repository-wide implementation and review rules |
| `docs/operations/` | Deployment, backup, export, upgrade, restore, and recovery expectations/procedures |
| `docs/context/` | Downstream agent-oriented routing and compact task context only |

## Authority and Conflict Handling

- Accepted ADRs govern specific durable decisions unless superseded.
- Canonical product, domain, architecture, standards, and operations docs govern within their areas.
- Context packs cannot override canonical documentation.
- Prompts, issue comments, chat history, task summaries, and temporary plans are not canonical policy.
- Contradictions must be surfaced and corrected, not silently resolved through code.
- If a proposed standard or implementation would require an unresolved durable decision, the decision must be deferred or addressed through later ADR work.

## Metadata Requirements

Substantive canonical documents must use the repository metadata block defined in [Documentation Governance](../README.md).

- Update `Last reviewed` whenever a substantive document is reviewed and changed.
- Update `Related ADRs` after accepted or proposed ADRs are created or superseded.
- Update `Related tests` after implementation creates tests that enforce documented behavior.
- Mark superseded documents or clearly link their replacements rather than leaving conflicting sources active.

## Documentation Update Triggers

Review and update canonical documentation in the same change when work alters:

- Product scope or explicit non-goals.
- First-slice workflow behavior.
- Farm-domain terminology or operational-record meaning.
- Inventory, discrepancy, or reconciliation rules.
- Offline capture or synchronization behavior.
- AI draft, confirmation, provenance, or source-capture behavior.
- Privacy, visibility, publication, or attachment access.
- Deployment, backup, export, upgrade, migration, or recovery behavior.
- A durable architecture decision.
- Repository-wide implementation or review expectations.
- User-visible field workflow or accessibility requirements.

## Documentation Restraint

- Architecture docs describe intended invariants rather than implementation chronology.
- ADRs capture decisions and rationale rather than duplicate architecture documents.
- Product documents distinguish validated evidence from hypotheses.
- Context packs remain compact and derived.
- Temporary investigations should not become canonical docs without review.
- Avoid duplicated rule text across many documents when accurate cross-links suffice.

## Review Checklist

- Which canonical area does this change affect?
- Does it alter a decision governed by an ADR?
- Does it require a new ADR or supersession?
- Did it change a workflow, invariant, visibility boundary, offline behavior, or recovery expectation?
- Are affected context-routing materials still accurate?
- Are the relevant verification requirements identified or implemented?
- Could a future agent understand the current intended behavior without reading chat history?
