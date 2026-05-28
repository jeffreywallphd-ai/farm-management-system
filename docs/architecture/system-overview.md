# System Overview

- Status: proposed
- Last reviewed: 2026-05-28
- Canonical for: first-slice system components, architecture drivers, information categories, and architecture invariants
- Related ADRs: [ADR-0001](../adr/ADR-0001-offline-first-field-operation.md), [ADR-0002](../adr/ADR-0002-history-preserving-idempotent-synchronization.md), [ADR-0003](../adr/ADR-0003-ai-interpretations-require-confirmation.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [ADR-0005](../adr/ADR-0005-data-portability-and-recoverability.md), [ADR-0006](../adr/ADR-0006-deployment-mode-compatibility.md)
- Related docs: [Architecture README](README.md), [Offline-First Mobile Architecture](offline-first-mobile-architecture.md), [Synchronization Architecture](synchronization-architecture.md), [Persistence and Attachment Storage](persistence-and-attachment-storage.md), [Identity, Privacy, and Sharing](identity-privacy-and-sharing.md), [Server and Deployment Operating Model](server-and-deployment-operating-model.md), [Initial Vertical Slice](../product/initial-vertical-slice.md), [Operational Event Catalog](../domain/operational-event-catalog.md)
- Related tests: not yet implemented
- Supersedes: none

## System Purpose

The platform is intended to support small farms by making operational recording and selected local coordination practical under real field conditions, including poor or unavailable connectivity.

Product scope is defined in [Product Vision and Scope](../product/product-vision-and-scope.md) and [Initial Vertical Slice](../product/initial-vertical-slice.md). Farm-domain meaning is defined in [Operational Event Catalog](../domain/operational-event-catalog.md), [Inventory and Reconciliation Rules](../domain/inventory-and-reconciliation-rules.md), [Sourcing and Local Network Model](../domain/sourcing-and-local-network-model.md), and [Privacy, Visibility, and Sharing Rules](../domain/privacy-visibility-and-sharing-rules.md).

## Architecture Drivers

| Driver | Architectural implication |
| --- | --- |
| Field use with intermittent/no reception | Mobile must remain usable offline with local retained work |
| Confirmed farm activities and observations | Operational records must be durable and traceable |
| Quantity-affecting records and counts | History and discrepancies must be preserved |
| Future voice/photo assistance | Draft interpretation must remain separate from confirmed record |
| Selected local sourcing listings | Private operational data must remain separate from intentionally shared publication |
| Local or hosted server possibility | Architecture must not assume only a permanently available public cloud service or only technical self-hosting |
| Open-source direction | Core product behavior must not depend on inaccessible proprietary infrastructure assumptions |

## Conceptual System Components

```text
Mobile Field Client
|-- Locally available farm reference information
|-- Local confirmed operational records
|-- Local pending synchronization state
|-- Local drafts and pending attachments
`-- User-visible synchronization status

Server
|-- Farm and membership authority, later detailed
|-- Accepted operational record synchronization
|-- Shared listing publication/coordination boundary
|-- Attachment acceptance/storage boundary
|-- Incremental synchronization/change distribution
`-- Administration/export/operations capabilities, later detailed

Optional Office/Web Experience, later
`-- Larger-screen administration, review, reporting, or coordination workflows
```

The mobile field client is central to the first vertical slice. An office/web experience may become useful later, but it is not required to define the first offline architecture.

## Conceptual Information Categories

| Information category | Meaning | Initial offline posture |
| --- | --- | --- |
| Reference information | Known farms, locations, tracked items, permitted activity context previously available to the worker | Available locally as needed for field recording |
| Confirmed operational records | Saved activities/observations accepted by the worker as farm records | Created and retained locally offline |
| Draft interpretations | Unconfirmed future voice/photo-assisted proposed records | May exist locally; not treated as farm history |
| Attachments | Photos/audio/files associated with drafts or confirmed records | May be retained locally pending later transfer |
| Shared publication actions | Intentionally created need listings or later offers | May be drafted locally; external effectiveness may require synchronization |
| Sync metadata | Status needed to track retained, submitted, accepted, failed, or attention-required work | Stored locally and visible to the user at an appropriate level |

## Architecture Invariants

1. Core first-slice field recording must remain usable without live network access.
2. Confirmed private operational records must be retained locally before synchronization.
3. Synchronization retries must not silently create duplicate accepted records.
4. Historical operational records and later observations must not be destructively merged in a way that hides discrepancies.
5. AI-supported drafts must not become confirmed records without user confirmation.
6. Private farm operational records must not automatically become shared listings.
7. Failed synchronization must not silently discard user work.
8. Synchronizing private data must not be treated as publication to a local network.
9. Technical implementation choices must preserve these product/domain guarantees.

## Decisions Deferred

This overview intentionally does not decide:

- Language or framework.
- Database.
- Mobile implementation.
- Synchronization engine or protocol implementation.
- Attachment-storage backend.
- Identity/authentication implementation.
- Deployment packaging.
- Final server-mode topology.
- AI implementation.
