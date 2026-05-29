# System Overview

- Status: proposed
- Last reviewed: 2026-05-28
- Canonical for: immediate standalone mobile pilot topology, future server-connected expansion boundaries, information categories, and architecture invariants
- Related ADRs: [ADR-0001](../adr/ADR-0001-offline-first-field-operation.md), [ADR-0002](../adr/ADR-0002-history-preserving-idempotent-synchronization.md), [ADR-0003](../adr/ADR-0003-ai-interpretations-require-confirmation.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [ADR-0005](../adr/ADR-0005-data-portability-and-recoverability.md), [ADR-0006](../adr/ADR-0006-deployment-mode-compatibility.md), [ADR-0007](../adr/ADR-0007-standalone-mobile-pilot-before-server-connected-features.md)
- Related docs: [Architecture README](README.md), [Offline-First Mobile Architecture](offline-first-mobile-architecture.md), [Synchronization Architecture](synchronization-architecture.md), [Persistence and Attachment Storage](persistence-and-attachment-storage.md), [Identity, Privacy, and Sharing](identity-privacy-and-sharing.md), [Server and Deployment Operating Model](server-and-deployment-operating-model.md), [Initial Vertical Slice](../product/initial-vertical-slice.md), [Operational Event Catalog](../domain/operational-event-catalog.md)
- Related tests: not yet implemented
- Supersedes: none

## System Purpose

The platform is intended to support small farms by making operational recording practical under real field conditions, including poor or unavailable connectivity.

The accepted first implementation target is a standalone offline-first mobile pilot. Server synchronization, hosted/local/cooperative server operation, in-product listing publication, responses, and broader coordination remain future expansion areas.

## Immediate Topology: Standalone Mobile Pilot

```text
Standalone Mobile Pilot
|-- Local farm setup/reference information
|-- Local confirmed operational records
|-- Local activity history
|-- Constrained AI-assisted drafts and confirmation
|-- Local retained captures/provenance according to pilot policy
`-- Local export/backup pathway
```

The pilot must not require server availability. Local records and captures remain private by default. Practical export/backup is required before farmers rely on the pilot for meaningful operational records.

## Future Topology: Server-Connected Expansion

```text
Future Server-Connected Expansion
|-- Synchronization across devices
|-- Hosted/local/cooperative server modes
|-- Intentional shared need listings
|-- Controlled responses/coordination
`-- Broader backup/recovery/administration pathways
```

This future topology is not authorized by the standalone pilot. It requires later product, ADR, architecture, operations, and implementation work.

## Architecture Drivers

| Driver | Architectural implication |
| --- | --- |
| Field use with intermittent/no reception | Mobile must remain usable offline with locally retained work |
| Standalone mobile pilot sequencing | Local save, local history, local data safety, and export/backup come before server implementation |
| Confirmed farm activities and observations | Operational records must be durable, traceable, and meaningful locally |
| Quantity-affecting records and counts | History and discrepancies must be preserved |
| Future voice/photo assistance | Draft interpretation must remain separate from confirmed record |
| Private supply needs and future sourcing | Private operational data must remain separate from any later shared publication |
| Future server compatibility | Local record/domain design should avoid unnecessary barriers to later sync |
| Open-source direction | Core behavior must not depend on inaccessible proprietary infrastructure assumptions |

## Conceptual Information Categories

| Information category | Meaning | Pilot posture |
| --- | --- | --- |
| Reference information | Local farm, locations, tracked items, and supported entry context | Created/available locally as needed for pilot workflows |
| Confirmed operational records | Saved activities/observations accepted by the worker as farm records | Created and retained locally |
| Draft interpretations | Unconfirmed voice/photo-assisted proposed records | Local drafts only; not farm history until confirmed |
| Attachments/source captures | Photos/audio/files associated with drafts or records | Sensitive local content according to pilot policy |
| Private supply needs | Internal recognition of a material/resource need | Optional local/private discovery workflow |
| Shared publication actions | Intentional need listings or later offers | Deferred from pilot |
| Sync metadata | Server submission/acceptance/retry state | Deferred from pilot; local identity/history should support later sync |
| Export/backup artifacts | User-controlled retrieval or backup of pilot data | Active pilot data-safety concern |

## Architecture Invariants

1. Core pilot field recording must remain usable without live network access or server reachability.
2. Confirmed private operational records must be retained locally before any future synchronization exists.
3. Local records must preserve enough identity, time, quantity, location/item, provenance, and privacy classification to avoid blocking later synchronization.
4. Historical operational records and later observations must not be destructively merged in a way that hides discrepancies.
5. AI-supported drafts must not become confirmed records without user confirmation.
6. Private farm operational records and private supply needs must not automatically become shared listings.
7. Practical export/backup is required before meaningful farmer reliance on standalone pilot data.
8. Future synchronization of private data must not be treated as publication to a local network.
9. Technical implementation choices must preserve these product/domain guarantees.

## Decisions Deferred

This overview intentionally does not decide language, framework, mobile implementation, local persistence technology, data/export format, synchronization engine or protocol, attachment-storage backend, identity/authentication implementation, server language, deployment packaging, final server-mode topology, or AI implementation.
