# Persistence and Attachment Storage

- Status: proposed
- Last reviewed: 2026-05-28
- Canonical for: architecture-level persistence responsibilities, attachment lifecycle principles, storage boundaries, and export/data ownership implications
- Related ADRs: [ADR-0002](../adr/ADR-0002-history-preserving-idempotent-synchronization.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [ADR-0005](../adr/ADR-0005-data-portability-and-recoverability.md)
- Related docs: [System Overview](system-overview.md), [Offline-First Mobile Architecture](offline-first-mobile-architecture.md), [Synchronization Architecture](synchronization-architecture.md), [AI-Assisted Capture Boundaries](ai-assisted-capture-boundaries.md), [Identity, Privacy, and Sharing](identity-privacy-and-sharing.md), [Server and Deployment Operating Model](server-and-deployment-operating-model.md), [Backup, Restore, and Data Export Requirements](../operations/backup-restore-and-data-export-requirements.md), [Operational Event Catalog](../domain/operational-event-catalog.md), [Sourcing and Local Network Model](../domain/sourcing-and-local-network-model.md)
- Related tests: not yet implemented
- Supersedes: none

## Purpose

This document defines architecture-level persistence and attachment responsibilities needed for offline and synchronization behavior while avoiding premature database/storage technology selection.

It is narrower than a full server deployment or storage implementation design.

## Why Persistence and Attachments Matter

Farm operational records must survive connectivity interruptions and application restarts. Future photo/audio-supported workflows create file-retention requirements beyond structured records. Source audio and photos are potentially sensitive farm data.

Local and server environments may eventually have different storage implementations. Durable behavior and visibility boundaries matter more at this stage than specific storage technology.

## Conceptual Data Categories

| Data category | Examples | Durability need | Initial sharing posture |
| --- | --- | --- | --- |
| Farm/reference information | locations, crops, materials, countable items | Locally available enough for supported offline work; server-managed synchronization later | Private/authorized |
| Confirmed operational records | harvest, material use, count, movement, issue | Durable locally before sync and durably accepted on server later | Private by default |
| Draft interpretations | voice/photo proposed records | Retained as needed for review; not operational history | Private |
| Attachments | photo, audio, later document | Retained locally pending transfer; linked securely to draft or record | Follows associated privacy policy |
| Sync state | pending/accepted/failed status, cursor/bookkeeping | Durable enough to recover from restarts/retries | Internal |
| Shared listing records/actions | intentionally published need information | Durable with publication status | Shared only after intentional publication and acceptance |

## Structured Record Persistence Responsibilities

- Mobile must durably retain confirmed offline-created records.
- Server must durably retain accepted synchronized records.
- Synchronization metadata must permit safe retry and outcome tracking.
- Operational history must support later correction/audit expectations.
- Private and shared record categories must remain distinguishable.
- Local storage, server storage, caching, exports, and later backups must preserve access classification.

This document does not choose relational tables, document stores, event stores, local storage libraries, or server database products.

## Attachment Responsibilities

- Photos or audio may be captured before synchronization.
- Attachments may be associated with unconfirmed drafts or confirmed records.
- Operational records must remain distinguishable from source captures, interpretation drafts, and attachments.
- Attachment retention must not cause the associated confirmed record to disappear if upload is delayed.
- A failed attachment transfer must remain visible/retryable where the attachment is required or expected.
- Attachment privacy must follow or be more restrictive than the associated draft/record/listing.
- Attachments must not become public or network-shared merely because an associated private record exists.
- Linking a private record to a shared listing must not automatically expose the record's private attachment.
- The system must distinguish "record synchronized" from "attachment synchronized" where necessary.

## Record/Attachment Association Integrity

Later implementation must preserve:

- Which draft or confirmed record an attachment supports.
- Whether an attachment is pending, transferred, failed, discarded, or intentionally removed.
- Whether a confirmed record can remain valid without its attachment, depending on the workflow.
- Whether a photo/audio capture is retained for provenance after a user confirms a record, to be governed by AI-assisted capture, privacy, and retention policy.

Retention durations and exact deletion behavior are not decided here.

## Local Versus Server Storage Distinction

Local storage supports disconnected field work and pending transfer.

Server storage supports synchronized durability, authorized multi-device use, shared-publication behavior, and later export/backup.

The architecture must permit later local-server and hosted-server deployment modes. No particular physical storage implementation is selected here.

## Export and Data Ownership Implication

Accepted farm operational records and user-owned associated content should eventually be exportable in a usable form.

Backup, restore, and export mechanics are defined at a requirements level in [Backup, Restore, and Data Export Requirements](../operations/backup-restore-and-data-export-requirements.md). Persistence decisions must not make user data practically unrecoverable or locked exclusively into a managed service.

Attachments and sensitive captures affect backup, export, retention, and privacy handling. This document still does not choose storage technology.

## Deferred Decisions

This document explicitly defers:

- Local database technology.
- Server database technology.
- Attachment file/object storage technology.
- Media compression and thumbnail processing.
- Retention/deletion policies.
- Encryption implementation.
- Backup/export formats.
- Local-server filesystem layout.
- Cloud storage providers.
- Detailed attachment synchronization contract.
