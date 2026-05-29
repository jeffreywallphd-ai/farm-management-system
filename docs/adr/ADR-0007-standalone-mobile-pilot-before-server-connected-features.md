# ADR-0007: Standalone Mobile Pilot Precedes Server-Connected Features

- Status: accepted
- Date: 2026-05-28
- Last reviewed: 2026-05-28
- Deciders: project owner and contributors
- Canonical for: implementation sequencing that makes the first farmer-testing pilot a standalone offline-first mobile application before server-connected features
- Related docs: [Product Vision and Scope](../product/product-vision-and-scope.md), [Initial Vertical Slice](../product/initial-vertical-slice.md), [Field Workflows](../product/field-workflows.md), [Offline-First Mobile Architecture](../architecture/offline-first-mobile-architecture.md), [Backup, Restore, and Data Export Requirements](../operations/backup-restore-and-data-export-requirements.md), [Decision Readiness Register](decision-readiness-register.md)
- Supersedes: none
- Superseded by: none

## Context

The repository foundation previously described a first vertical slice that included server synchronization, synchronized status, an end-to-end server environment, intentional need-listing publication, and a minimal response/contact path.

After Review 1, the product owner selected a narrower and safer implementation sequence: the first farmer-testing pilot should be a standalone offline-first mobile application used during real farm work for customer discovery and workflow validation.

Farmers may record real operational information during this pilot. A mobile-only pilot therefore still carries data-loss risk even before server synchronization exists.

## Decision

The first implemented pilot is a standalone offline-first mobile application for real farmer workflow validation and customer discovery.

The pilot must not depend on live server availability. Records created in the pilot must be retained locally in a trustworthy manner. Before farmers rely on the pilot for meaningful operational records, the pilot must provide a practical export/backup pathway.

Voice and photo assistance may be tested only as constrained draft-and-confirm experiments. Unconfirmed AI output remains a draft and has no operational, inventory, publication, messaging, or external-sharing effect.

The pilot may capture private internal supply needs for discovery if explicitly scoped, but it does not publish those needs through the platform.

Server synchronization, cross-device operation, in-product shared need listings, responses or messaging, hosted/local/cooperative server implementation, and broader coordination features are deferred from the pilot.

Local record and domain design must not create avoidable barriers to later synchronization or server connectivity. This decision establishes implementation sequence and pilot scope. It does not select mobile framework, persistence technology, export format, AI runtime, server language, synchronization protocol, deployment packaging, or hosting technology.

## Rationale

Farmers can begin testing actual field workflows sooner without waiting for server infrastructure.

Customer discovery should test whether local recordkeeping, understandable local history, voice assistance, and photo counting are valuable before building network capability.

Real farmer testing creates immediate data-loss risk unless export/backup is part of the pilot.

Server-connected sourcing remains a motivating future direction, but it is not necessary to validate the first mobile workflows.

Preserving future-server extensibility prevents a throwaway prototype while avoiding premature backend construction.

## Relationship to Existing ADRs

| Existing ADR | Relationship |
| --- | --- |
| [ADR-0001](ADR-0001-offline-first-field-operation.md) | Strengthened: the standalone mobile pilot depends directly on offline-first field operation. |
| [ADR-0002](ADR-0002-history-preserving-idempotent-synchronization.md) | Preserved as a future synchronization constraint and as a local history/integrity design constraint. |
| [ADR-0003](ADR-0003-ai-interpretations-require-confirmation.md) | Directly governs voice/photo pilot experiments. |
| [ADR-0004](ADR-0004-private-by-default-intentional-sharing.md) | Preserved for private mobile records and future sharing; platform publication is deferred from the pilot. |
| [ADR-0005](ADR-0005-data-portability-and-recoverability.md) | Strengthened: the mobile pilot requires practical export/backup before real reliance. |
| [ADR-0006](ADR-0006-deployment-mode-compatibility.md) | Remains proposed future deployment compatibility guidance and does not authorize server implementation in the pilot. |

## Consequences

### Positive

- The first implementation can focus on field usability, local record retention, local history, constrained AI-assisted drafts, and data-safety basics.
- The project can gather real farmer evidence before investing in synchronization, hosting, local servers, and local-network coordination.
- Future server design still benefits from record identity, provenance, privacy classification, and history-preserving local records.

### Negative / Tradeoffs

- The pilot will not validate cross-device workflows, server synchronization, in-product publication, or shared responses directly.
- Farmers using meaningful pilot data need export/backup support earlier than a disposable prototype might otherwise require.
- Documentation and context packs must distinguish future synchronization compatibility from current implementation authorization.

### Risks and Mitigations

- Risk: contributors may keep treating synchronization or publication as first-slice scope because older docs described it that way.
- Mitigation: product, architecture, operations, standards, and context-routing documents must be corrected to identify standalone mobile as the accepted pilot target.
- Risk: local-only pilot data could be lost through device loss, app uninstall, build replacement, or upgrade.
- Mitigation: practical export/backup and upgrade/recovery expectations are active pilot requirements before meaningful farmer reliance.

## Validation and Revisit Conditions

This sequencing decision should be revisited after farmer discovery shows whether local recordkeeping, local history, constrained AI drafts, private supply-need notes, and export/backup expectations justify server-connected expansion.

Server synchronization, need-listing publication, multi-device operation, hosted/local/cooperative deployment, and responses/messaging require later product and ADR authorization before implementation.

## Documentation and Test Impact

Product scope, field workflows, architecture, operations, standards, and context packs must describe the active pilot as standalone mobile and treat server-connected features as deferred.

Future implementation must verify local mobile retention, local history, safe app interruption/restart behavior, export/backup behavior, constrained AI draft confirmation, and upgrade/replacement data safety before farmers rely on pilot data.

This ADR does not decide mobile framework, local database, identifier format, export file format, AI model/runtime, capture retention policy, server language, synchronization technology, hosting mode, or deployment technology.
