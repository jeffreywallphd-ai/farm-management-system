# Identity, Privacy, and Sharing Architecture

- Status: proposed
- Last reviewed: 2026-05-28
- Canonical for: identity, authorized access, visibility, publication, sensitive attachments, and local-network sharing architecture boundaries
- Related ADRs: [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [ADR-0005](../adr/ADR-0005-data-portability-and-recoverability.md)
- Related docs: [System Overview](system-overview.md), [Synchronization Architecture](synchronization-architecture.md), [Persistence and Attachment Storage](persistence-and-attachment-storage.md), [AI-Assisted Capture Boundaries](ai-assisted-capture-boundaries.md), [Server and Deployment Operating Model](server-and-deployment-operating-model.md), [Privacy, Visibility, and Sharing Rules](../domain/privacy-visibility-and-sharing-rules.md), [Sourcing and Local Network Model](../domain/sourcing-and-local-network-model.md), [Local Coordination and Sharing Validation Plan](../product/local-coordination-and-sharing-validation-plan.md)
- Related tests: not yet implemented
- Supersedes: none

## Architecture Purpose

The system contains fundamentally different categories of data:

1. Private farm operational records and related content.
2. Intentionally shared representations such as need listings.
3. Sensitive source captures and attachments.
4. Later coordination interactions visible only to relevant participants.

The architecture must prevent accidental movement from private context to external visibility. This document defines system responsibility boundaries, not authentication technology, authorization frameworks, APIs, encryption mechanisms, storage products, or deployment choices.

## Conceptual Actors and Trust Boundaries

| Actor/context | Meaning | Initial access expectation |
| --- | --- | --- |
| Farm | Owner/controller of its private operational context | Own private operational data and sharing decisions |
| Farm member/worker | Person acting within the farm context | Access limited to later-authorized farm functions |
| Farm administrator/owner, later refined | Person able to manage farm participation and possibly sharing policy | Detailed authority deferred |
| Local-network participant | External permitted participant who may see intentionally shared listings | No access to private farm records merely by network participation |
| External selected recipient, later | Specific farm/person/organization with selected shared access | Deferred |
| Public audience, later if supported | Untrusted broad visibility | Explicitly out of first-slice scope |
| System operator/host administrator | Party maintaining deployment infrastructure | Must not be assumed entitled to unrestricted product-visible operational access; later operational/security policy required |
| AI/inference capability | Processing capability receiving only data necessary for an allowed workflow | Must not determine visibility or sharing |

Exact account, role, invitation, administrator, and system-operator behaviors require later implementation and security decisions.

## Trust Zones

```text
Private Farm Operational Zone
|-- Operational records
|-- Inventory observations/discrepancies
|-- Internal supply needs
|-- Farm locations/tracked items
|-- AI drafts/provenance
`-- Sensitive attachments and source captures

Intentional Publication Boundary
|-- User selects shareable information
|-- User selects permitted audience/visibility
|-- Publication action is retained/submitted
`-- Server validates publication when synchronized

Shared Local Network Zone
|-- Published need listings
|-- Later permitted availability listings
|-- Limited listing response/coordination data
`-- No automatic access to private operational zone
```

Implementation must preserve these zones regardless of storage technology or deployment mode.

All deployment modes preserve the same private-by-default behavior. A server or infrastructure operator role does not imply broad external visibility or product-level permission to use private records. Cooperative hosting does not merge farm-private contexts.

## Identity, Authorization, Visibility, and Publication

| Concept | Architecture meaning |
| --- | --- |
| Identity | Who a person, farm, device, or participating organization is |
| Authentication | How identity is verified; implementation deferred |
| Authorization | Whether an identity may view or perform a particular action; implementation deferred |
| Visibility | Which audience a record or representation is intended to be available to |
| Publication | Intentional transition of a shareable representation into visibility for an audience, subject to validation/synchronization |
| Synchronization | Movement/reconciliation of permitted data; does not automatically broaden visibility |
| Consent | Required agreement for particular sensitive secondary uses, such as future training/evaluation use of captures |

Synchronizing a private record to an authorized server is not the same as publishing that record to a local network.

## Data-Access Architecture Rules

1. Private operational records must be access-controlled within the farm context.
2. External/local-network participants may access only intentionally published representations appropriate to their audience.
3. Internal records that motivated a shared listing must not be returned through listing access paths.
4. Source captures and AI drafts must be access-controlled separately from public/shared representations.
5. A confirmed AI-assisted record follows the same visibility rule as the equivalent manual record.
6. Attachments must not inherit broader visibility accidentally from loosely related objects.
7. Later APIs, local storage, server persistence, exports, logs, and synchronization behavior must maintain these distinctions.
8. Any administrative access to private records or captures must be intentionally governed and auditable later.

## Visibility Model Architecture

| Visibility posture | Architecture requirement |
| --- | --- |
| Private farm data | Must only synchronize or display through authorized farm context |
| Private subset/restricted internal access, later | Architecture should not preclude more sensitive internal restrictions, especially for captures/notes |
| Trusted local-network shared listing | Must be a deliberately published representation available only to allowed network participants |
| Selected-recipient sharing, later | Deferred, but should be possible without converting data to public visibility |
| Public publication, later if ever supported | Not required for initial architecture and must not be enabled accidentally |

This document does not define role matrices, permission strings, policy engines, or database enforcement mechanisms.

## Publication Workflow Boundary

```text
Private inventory observation or farmer-recognized need
-> Private supply need record, if used
-> User intentionally creates shareable listing content
-> User reviews audience and fields to be shared
-> If offline: publication action retained locally as pending
-> If online: publication action submitted for validation
-> Server accepts publication for intended permitted audience
-> Shared listing becomes visible to that audience
```

Rules:

- A private supply need need not be published.
- Publication requires an intentional user action.
- A pending offline listing is not yet externally visible.
- The publication boundary must accept only explicitly shareable listing content, not internal record graphs or attached private history.
- Later withdrawal/closure must have visible status and preserve appropriate audit/history.
- AI may not initiate publication automatically.

## Offline and Synchronization Interaction

- Private operational records may be captured and retained offline.
- Shared-listing drafts or publication requests may be created while offline if supported by product scope.
- An offline publication request remains pending until synchronized and accepted.
- A device may not know all current shared listings/responses while offline.
- A device must not show a local pending publication as visible to others.
- Synchronization must enforce visibility constraints and must not deliver private records to local-network participants.
- Conflict-sensitive coordination outcomes, such as later reservations or accepted offers, require shared-authority validation rather than offline finality.

## AI-Assisted Capture Interaction

- Source audio/photos are private by default.
- AI drafts and correction/provenance information are private by default.
- Confirmation converts a draft into the ordinary operational record type, not into a shared item.
- A confirmed operational record remains private unless a separate permitted sharing action creates a shared representation.
- Even if a future listing is drafted using AI assistance, publication must remain explicit and user-reviewed.
- Model-processing boundaries must not enlarge visibility.

## Attachment Access Architecture

| Attachment context | Default access posture | External-sharing posture |
| --- | --- | --- |
| Voice source audio | Sensitive/private | Not externally shared by default |
| Photo source used for count | Sensitive/private | Not externally shared by default |
| Attachment associated with internal operational record | Private | Requires separate explicit sharing policy/action |
| Attachment intentionally added to a shared listing, later | Shared only to listing audience | Deferred; must be explicit |
| Capture retained for model evaluation, later | Separate governed dataset/access posture | Requires explicit consent/governance |

Constraints:

- Attachment access must be at least as restrictive as its associated private record unless explicitly copied or associated through a permitted shared representation.
- A listing may include shareable text without exposing its underlying source attachment.
- Later implementation must avoid accidental broad access through file URLs, sync replication, storage keys, logging, export, or caching.
- Exact encryption, signed URL, storage, deletion, and retention mechanisms are deferred.

## Data Minimization Principles

Later implementation should favor sharing the minimum information necessary for coordination.

Examples:

- Share "Need 20 bags of potting mix by June 10" rather than internal inventory history.
- Share a general service/pickup area only if needed rather than precise internal farm location.
- Do not include worker identity unless necessary and chosen.
- Do not include source photo/audio unless separately and deliberately shared.
- Avoid including notes that reveal unrelated production or financial information.

## Logging, Diagnostics, Export, and Operations

- Logs must not expose sensitive record contents, source captures, credentials, or unnecessary personal information.
- Diagnostic workflows must preserve privacy constraints even in verbose modes.
- Data exports must distinguish private operational exports from externally published listing data.
- Backups may contain private/sensitive content and must later receive operational protection.
- Hosted and local deployments must preserve the same product-level privacy boundaries, even though operational control differs.
- Exports and operational diagnostics require later privacy/security treatment so they do not become accidental disclosure paths.

Detailed standards and operations documentation will be completed later.

## Abuse, Trust, and Moderation Boundaries

A local-network feature may later require handling misleading listings, inappropriate communication, removed participants, or inappropriate attachment sharing.

The initial slice should avoid broad public posting and complex social functionality. Moderation, dispute handling, reporting, and trust/reputation mechanisms are deferred unless real validation requires them.

## Architecture Decisions Deliberately Deferred

- Account/identity-provider technology.
- Login/session/offline-auth mechanism.
- Farm invitation and membership administration.
- Role/permission model.
- Device registration or revocation.
- Audience-membership implementation.
- Route/API authorization enforcement.
- Row/document/object-level access implementation.
- Encryption and key management.
- Storage access token/signed URL approach.
- Audit-log implementation.
- Data-retention and deletion mechanisms.
- Production privacy policy/legal language.
- Public-sharing or moderation systems.
- Federated network visibility.

## Future Implementation Verification Categories

Future implementation must verify:

- Private operational-record access.
- Intentional-publication-only behavior.
- Listing serialization/data minimization.
- Internal-need versus published-listing separation.
- Offline pending-publication status.
- Synchronization visibility boundaries.
- AI-draft non-publication.
- Source-capture attachment privacy.
- Shared-listing attachment explicit inclusion, if later supported.
- Authorization denial.
- Logging redaction.
- Export separation.
- Withdrawal/closure visibility.
