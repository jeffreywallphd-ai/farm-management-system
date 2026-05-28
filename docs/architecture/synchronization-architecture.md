# Synchronization Architecture

- Status: proposed
- Last reviewed: 2026-05-28
- Canonical for: conceptual synchronization lifecycle, idempotency, server/mobile authority boundaries, conflict classification, and sync status concepts
- Related ADRs: [ADR-0001](../adr/ADR-0001-offline-first-field-operation.md), [ADR-0002](../adr/ADR-0002-history-preserving-idempotent-synchronization.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [ADR-0005](../adr/ADR-0005-data-portability-and-recoverability.md)
- Related docs: [System Overview](system-overview.md), [Offline-First Mobile Architecture](offline-first-mobile-architecture.md), [Persistence and Attachment Storage](persistence-and-attachment-storage.md), [AI-Assisted Capture Boundaries](ai-assisted-capture-boundaries.md), [Identity, Privacy, and Sharing](identity-privacy-and-sharing.md), [Server and Deployment Operating Model](server-and-deployment-operating-model.md), [Operational Event Catalog](../domain/operational-event-catalog.md), [Inventory and Reconciliation Rules](../domain/inventory-and-reconciliation-rules.md), [Sourcing and Local Network Model](../domain/sourcing-and-local-network-model.md)
- Related tests: not yet implemented
- Supersedes: none

## Purpose

This document defines the conceptual synchronization architecture for confirmed records, reference data, attachments, and intentionally shared actions.

It constrains later implementation while remaining independent of final language, database, protocol, and synchronization-library choices.

## Synchronization Purpose

Synchronization reconciles locally retained field work with a server capable of supporting:

- Multi-device farm usage.
- Durable shared farm records.
- Later administration and reporting.
- Intentionally shared need listings.
- Attachment retention.
- Future local or hosted server operation.

Synchronization is not the mechanism by which offline work becomes meaningful to the worker; local retention is required first.

## Synchronization Categories

| Category | Direction | Key concern |
| --- | --- | --- |
| Farm/reference information available to device | Server to mobile, with later local changes only if explicitly supported | Worker needs sufficient context offline |
| Confirmed private operational records created on device | Mobile to server, then available to authorized devices | Idempotent acceptance and history preservation |
| Inventory observations/discrepancy-related records | Mobile to server, then distributed | Preserve multiple observations; do not erase conflict evidence |
| Draft interpretations | Initially local by default; future policy required | Must not be treated as confirmed record |
| Attachments associated with drafts or records | Mobile to server when permitted/needed | Retention, upload status, association integrity |
| Shared listing publication actions | Mobile to server; effective externally only after acceptance | Explicit publication and privacy |
| Responses or shared coordination updates | Server/mobile synchronization later | May require online/shared-authority behavior |

Draft interpretations do not synchronize as operational records. A confirmed AI-assisted record may synchronize as its ordinary operational record type with permitted provenance. Source captures and attachments may synchronize separately under later privacy and retention rules.

Synchronization does not broaden visibility. Private records may synchronize only within authorized private farm contexts. External participants receive only intentionally published shared representations accepted for their audience.

A device may synchronize with a configured permitted server whether that server is hosted, local, cooperative, private-cloud, or technically self-hosted. Server unavailability is a normal condition the mobile system must tolerate. Local-network-without-internet synchronization is a later architecture decision, not an automatic first-slice feature.

## Device-Created Identity and Idempotency Requirement

A locally confirmed record must possess a stable unique identity before synchronization submission.

Retried submissions of the same record must be recognizable as the same intended record. Server acceptance must be idempotent: repeated receipt of an already accepted record must not produce duplicate farm activities or duplicate inventory effects.

Synchronization metadata must distinguish:

- Never submitted.
- Submitted but not yet acknowledged.
- Accepted.
- Failed temporarily.
- Rejected or requires user attention.

This document does not define identifier syntax, UUID libraries, sequence formats, transport envelopes, or database constraints. Later contracts and tests must enforce this behavior.

## Conceptual Push/Pull Synchronization Cycle

1. The mobile client retains new confirmed operational records locally.
2. When permitted by connectivity and user/session state, it submits locally pending records and permitted pending actions.
3. The server evaluates identity, permission, validity, and domain-sensitive acceptance rules.
4. The server acknowledges accepted records or returns a stable rejection/attention outcome.
5. The mobile client retains the outcome and does not discard locally recorded work silently.
6. The client requests permitted records or reference updates created since its prior synchronized position.
7. The client incorporates accepted incoming changes into its local view.
8. Attachments may synchronize separately while retaining association/status information.
9. Shared publications become visible to permitted audiences only after the appropriate server-side acceptance/publication step.

This does not choose between endpoint-based APIs, replication logs, change feeds, event streaming, or another implementation.

## Server Authority Versus Mobile Authority

### Mobile Is Authoritative for Immediate Field Capture Experience

The mobile client must allow the worker to record and retain private supported activities while offline.

### Server Is Authoritative for Shared Synchronization Outcomes

The server must eventually determine:

- Whether a submitted record is accepted into synchronized farm history.
- Whether another authorized device may receive it.
- Whether a listing becomes shared with its intended audience.
- Whether conflict-sensitive shared actions are accepted.
- Whether a submitted action violates authorization or validation rules.

### Neither Side May Silently Falsify Reality

- The mobile client must not claim a shared listing is visible to others before accepted synchronization.
- The server must not discard locally submitted work without a visible outcome.
- The client must not treat an unconfirmed AI draft as an accepted operational record.
- The client must not publish or request publication based solely on AI interpretation.
- The sync process must not overwrite one legitimate farm observation merely because another arrived later.

## Sync Status Concepts

These are conceptual statuses, not final UI labels or technical enums.

### Confirmed Private Operational Records

| Conceptual status | Meaning |
| --- | --- |
| Saved locally | User-confirmed record retained on device |
| Awaiting synchronization | Not yet accepted by server |
| Synchronizing | Transmission/acknowledgment in progress |
| Synchronized | Server has accepted the record |
| Retry pending | Temporary synchronization failure occurred; work remains retained |
| Requires attention | Server could not accept or reconcile the submitted record automatically |

### Shared Listing Publication Actions

| Conceptual status | Meaning |
| --- | --- |
| Draft/private | Not intended to be visible externally yet |
| Pending publication | User requested sharing, but server has not accepted/publicized it |
| Published/synchronized | Available to intended permitted audience |
| Publication failed/requires attention | Not externally effective; user action may be needed |
| Withdrawn/closed, later | No longer active as a shared listing |

Terminology may later be revised for field usability, but the distinction between locally saved, synchronized, and externally published is architectural.

## Conflict Classification

### Class 1: Independent Additive Operational Records

Examples include one worker recording a harvest, another worker recording a separate harvest, multiple equipment observations, or separate planting records where valid.

Initial posture:

- These are generally additive.
- They should normally be accepted as distinct operational records if valid and authorized.
- One does not overwrite the other merely because they concern the same crop, location, or day.

### Class 2: Quantity-Affecting Records Producing Discrepancies

Examples include multiple workers recording material use while offline, an inventory count differing from expected quantity, or a movement/material-use record arriving after a count.

Initial posture:

- Preserve the valid submitted records.
- Compute or expose discrepancy later where relevant.
- Do not silently eliminate conflicting evidence.
- Do not assume last-write-wins quantity replacement is acceptable.

### Class 3: Reference-Data Changes Affecting Offline Entries

Examples include a location or tracked item being renamed, archived, or changed while another device is offline, or a worker recording an activity referencing locally available context that changed on the server.

Initial posture:

- Locally confirmed operational records must not be silently lost.
- Later architecture must decide how renamed/archived reference entities remain resolvable historically.
- Changes that make a record invalid should surface as attention-required, not disappear.

Reference-data versioning is not fully resolved in this prompt.

### Class 4: Shared-Publication or Commitment Conflicts

Examples include a need listing being published or withdrawn while offline, a later availability offer being claimed by multiple participants, shared equipment being tentatively requested by more than one farm, or a limited offer becoming unavailable before offline publication synchronizes.

Initial posture:

- Local preparation is possible where the product allows it.
- External publication, reservation, acceptance, or commitment requires shared-authority validation.
- The UI must not imply a cross-farm commitment has been confirmed merely because an offline action was recorded locally.

Only the need-listing publication case is in or near the first slice. Other cases are later implications, not included features.

## Record Correction and Supersession Implications

Synchronized confirmed records should not be invisibly mutated in ways that destroy auditability.

The exact future mechanism may be correction record, supersession, amendment, or controlled edit history. Offline corrections must eventually synchronize with clear lineage to the record being corrected.

This detailed mechanism is deferred unless product/domain documents later specify it.

## Reference Data Availability While Offline

A device must have sufficient previously synchronized context to record included activities offline.

If needed context is unavailable locally, the app may permit a carefully bounded new-item draft or require later completion, but must not silently invent canonical tracked items.

Exact offline creation of new locations/tracked items is deferred unless already included by product docs. Future architecture must handle reference changes without invalidating historical operational records.

## Synchronization Initiation and Background Behavior

Synchronization may occur when connectivity becomes available and authorization/session state permits.

This document does not decide background operating-system scheduling, polling intervals, push notifications, manual versus automatic sync controls, or network/battery policies.

Later implementation must ensure:

- Ordinary offline work does not depend on background sync being immediate.
- Users can identify whether work remains pending.
- Failed synchronization has a recovery path.
- Future migration, restore, and reconnect behavior must preserve idempotency and visibility boundaries.

## Security and Privacy Constraints

- Synchronization must eventually enforce farm membership and visibility boundaries.
- Private farm records may synchronize only to authorized participants/devices.
- Shared listings may be distributed only according to intentionally selected visibility rules.
- Attachments may contain sensitive information and must follow related record visibility constraints.
- [Identity, Privacy, and Sharing](identity-privacy-and-sharing.md) defines the architecture boundary between private synchronization and intentional publication.

## Architecture Scenario Table

| Scenario | Required architectural outcome |
| --- | --- |
| Worker records harvest without reception | Record retained locally and marked awaiting synchronization |
| Connectivity returns and harvest is submitted twice due to retry | Server accepts once without duplicate operational effect |
| Worker records material use offline; another device records a count | Both valid records preserved; possible discrepancy surfaced later |
| Worker records equipment issue offline | Observation retained and synchronized later without requiring network at capture time |
| Worker prepares a need listing offline | Listing remains pending publication until synchronized/accepted; private records are not exposed automatically |
| User captures photo supporting a count draft offline | Draft/photo may be retained; no operational count effect until user confirms |
| User confirms photo-assisted count offline | Confirmed inventory observation follows normal local-retain-and-sync lifecycle |
| Server rejects submitted action due to validation or permission issue | Local work/status remains visible and requires attention; not silently deleted |
| Device remains offline for an extended period | User can continue supported local work within available local context; app does not falsely claim globally current shared state |

## Required Later Implementation Tests

Future implementation should include verification for:

- Offline record-retention tests.
- Idempotent submission/retry tests.
- Multi-device additive-record synchronization tests.
- Discrepancy-preservation tests.
- Shared-listing pending-publication tests.
- Private-record non-publication tests.
- Rejected-submission visibility/recovery tests.
- Attachment pending/upload linkage tests.
- AI-draft non-effect-on-history tests.
- Long-disconnection/resynchronization scenario tests.
