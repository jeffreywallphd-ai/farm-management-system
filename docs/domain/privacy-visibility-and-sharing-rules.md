# Privacy, Visibility, and Sharing Rules

- Status: proposed
- Last reviewed: 2026-05-28
- Canonical for: private-by-default farm data, visibility classes, intentional sharing, shared representations, and sensitive content handling
- Related ADRs: [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [ADR-0005](../adr/ADR-0005-data-portability-and-recoverability.md)
- Related docs: [Glossary](glossary.md), [Operational Event Catalog](operational-event-catalog.md), [Inventory and Reconciliation Rules](inventory-and-reconciliation-rules.md), [Sourcing and Local Network Model](sourcing-and-local-network-model.md), [AI-Assisted Capture and Confirmation Rules](ai-assisted-capture-and-confirmation-rules.md), [Identity, Privacy, and Sharing Architecture](../architecture/identity-privacy-and-sharing.md), [Server and Deployment Operating Model](../architecture/server-and-deployment-operating-model.md), [Backup, Restore, and Data Export Requirements](../operations/backup-restore-and-data-export-requirements.md), [Local Coordination and Sharing Validation Plan](../product/local-coordination-and-sharing-validation-plan.md)
- Related tests: not yet implemented
- Supersedes: none

## Purpose and Relationship to Other Domain Documents

This document defines farmer-centered privacy, visibility, intentional sharing, and sensitive-content rules for the first product slice and controlled future expansion.

It complements:

- [Operational Event Catalog](operational-event-catalog.md), which defines private farm activities and observations.
- [Inventory and Reconciliation Rules](inventory-and-reconciliation-rules.md), which defines internal quantity understanding.
- [Sourcing and Local Network Model](sourcing-and-local-network-model.md), which defines supply needs, listings, and local-network concepts.
- [AI-Assisted Capture and Confirmation Rules](ai-assisted-capture-and-confirmation-rules.md), which defines source captures, drafts, confirmation, and provenance.

This document is canonical for whether domain information is private, intentionally shareable, or out of scope for sharing. It does not choose authentication, authorization, database, transport, encryption, or storage mechanisms.

These privacy rules apply consistently across hosted, local, cooperative, private-cloud, and technical self-hosted modes. Operating infrastructure is not the same as product-level permission to use or expose private farm data. Backups and exports may contain sensitive data and require later protection and handling rules.

## Core Privacy Concepts

| Concept | Meaning |
| --- | --- |
| Private farm operational data | Information recorded for internal farm operation and not visible outside authorized farm participation by default. |
| Farm participant | A person recognized as part of the farm context for supported product workflows; detailed permissions are deferred. |
| Authorized farm access | Permission to view or act on private farm information; implementation is deferred. |
| Sharing action | A deliberate user action that creates or publishes information for an audience beyond private farm use. |
| Visibility | The audience to whom a particular record or published representation is available. |
| Shared representation | A deliberately created limited view or listing derived from selected information, rather than exposure of the underlying private record. |
| Local farm network | A selected or trusted sharing audience for local coordination; membership mechanics are deferred. |
| External audience | Any audience outside the private farm context, including nearby farms, organizations, or a future public audience. |
| Sensitive attachment | A photo, audio recording, document, or other file that may disclose private or personal information. |
| Publication | Making a shared representation available to an intended audience after required confirmation and synchronization. |
| Withdrawal | Intentionally making an active shared listing no longer available to its audience, subject to synchronization state. |
| Audit trail | Retained evidence that meaningful sharing, publication, or withdrawal actions occurred; detailed implementation is deferred. |
| Consent | Intentional agreement where later data uses, such as model evaluation or broader attachment sharing, require permission. |

## Visibility Classes

| Visibility class | Meaning | Examples | Initial support posture |
| --- | --- | --- | --- |
| Private to farm | Visible only within authorized farm operational context | activities, counts, internal needs, source captures | Required/default |
| Private to selected farm participants, later | Narrower internal access within a farm where needed | sensitive notes or captures | Conceptually recognized; detailed permissions deferred |
| Shared with trusted local network | Visible only to permitted local-network participants | intentionally published need listing | Required concept for narrow sourcing workflow |
| Shared with selected external participants, later | Visible to specific invited farms or organizations | direct offer/request | Deferred unless product scope includes it |
| Public, later if ever supported | Visible outside trusted relationships | public listing | Explicitly deferred; not assumed |

Private to farm is the default. Moving information to a wider visibility class requires an intentional action and appropriate authority. The first slice should not require public visibility. Exact role, invitation, membership, and permission systems are later architecture decisions.

## Data Classification

| Information type | Default visibility | May be intentionally shared in first slice? | Constraints |
| --- | --- | ---: | --- |
| Farm identity/profile details | Private unless minimally needed for listing attribution | Limited details may be required later | Exact published identity deferred |
| Farm member/worker details | Private | No | Do not expose through listings |
| Farm locations | Private | No by default | General pickup/location notes may be separately entered later |
| Planting/transplanting records | Private | No | No automatic exposure |
| Harvest records | Private | No | No automatic sales/availability implication |
| Material-use records | Private | No | No automatic need publication |
| Inventory counts | Private | No | Must not be disclosed automatically |
| Inventory discrepancies | Private | No | Sensitive operational information |
| Equipment issues | Private | No | No automatic sharing |
| Internal supply need | Private | No until transformed into listing | Separate from shared representation |
| Shared need listing | Trusted-network visibility after publication | Yes | Contains only intentionally shared fields |
| Availability listing | Private until intentionally published; feature may be deferred | Not unless already included in scope | Does not expose total inventory |
| Listing response | Limited to relevant parties/audience later | Conceptually yes | Detailed access deferred |
| Audio source capture | Private/sensitive | No by default | Separate explicit permission required for any later sharing |
| Photo source capture | Private/sensitive | No by default | Separate explicit permission required for any later sharing |
| AI-assisted draft | Private | No | Not an operational record or listing |
| Confirmed AI-assisted operational record | Same privacy as equivalent manual record | Only through separate sharing flow | Capture method changes no visibility rule |
| Provenance/correction metadata | Private by default | No | May be sensitive |
| Future model-evaluation dataset | Not authorized by operational capture alone | No | Requires separate governance/consent |

## Intentional Publication Rule

The conceptual transformation from private need to shared listing is:

```text
Private operational information and/or user recognition
-> Private supply need
-> User intentionally chooses to create/share listing
-> User reviews shareable fields and intended audience
-> Publication action submitted or retained pending synchronization
-> Listing becomes visible only after permitted publication succeeds
```

Rules:

- The private supply need may exist without a listing.
- The listing is not a direct view into private records.
- The user must be able to understand what information will be shared before publication.
- A failed or pending publication does not expose the information to others.
- Later edits, closure, or withdrawal must preserve the distinction between private record history and externally visible listing status.

## Shareable Listing Content Boundary

For the narrow initial need-listing workflow:

| Listing field concept | First-slice posture |
| --- | --- |
| Needed item description | Include |
| Desired quantity/unit, if user chooses to share | Include |
| Desired timing | Include where useful |
| General contact/response pathway | Minimal, later refined |
| Optional pickup/delivery/general-area note | Defer or include only if product docs require it |
| Intended audience | Required concept; mechanics deferred |
| Internal inventory count | Exclude |
| Material-use history | Exclude |
| Reason for shortage | Exclude by default |
| Crop/production dependencies | Exclude by default |
| Source audio/photo | Exclude |
| Worker identity | Exclude unless separately required and documented |
| Supplier history or cost | Exclude |

## Sensitive Captures and Attachments

Source audio, source photos, future optional listing attachments, and other supporting documents may reveal farm layout, production practices, crop status, equipment, worker voices or identities, location information, inventory levels, proprietary practices, or incidental personal information.

Rules:

- Audio/photo source captures are sensitive private data by default.
- An operational record confirmed from a capture does not automatically make the source capture visible outside the farm.
- A listing derived from an internal record does not automatically include its supporting capture.
- If the product later allows an attachment to be shared with a listing, that must be a distinct explicit sharing choice.
- Captures must not be reused for model training, benchmarking, public demonstrations, or external sharing merely because they were created during operational use.
- Exact retention, deletion, administrator access, and consent workflows remain to be designed later.

## Auditability and Reversibility Principles

- Meaningful publication actions should later be auditable.
- Users should eventually be able to determine whether a listing is private draft, pending publication, active/shared, withdrawn, expired, or failed.
- Withdrawing a listing should remove it from active availability to its audience when synchronized, but may not erase the internal fact that the listing once existed or was shared.
- Exact audit logging and retention policy are deferred.

## High-Sensitivity Information Categories

Use particular caution with:

- Precise farm location or maps.
- Crop or harvest amounts.
- Inventory shortages.
- Financial, vendor, or supplier information.
- Personal contact information.
- Worker identity or voice.
- Photographs showing farm infrastructure, people, vehicles, labels, or location cues.
- Notes related to operational vulnerabilities.
- Future treatment, compliance, or food-safety information if later added.

## Prohibited Default Behaviors

The system must not, by default:

- Make private records visible to a local network merely because the farm joined it.
- Publish a shortage because a low count was recorded.
- Publish an offer because inventory appears high.
- Share an AI-generated draft.
- Share source audio or photographs.
- Expose detailed farm locations or worker identities through a listing.
- Infer audience or visibility from AI interpretation.
- Treat synchronized private data as externally published data.
- Use operational captures for external model training or evaluation without later explicit governance.

## Domain Questions Requiring Validation

- What information are farmers comfortable sharing with nearby farms?
- Do they prefer named trusted networks, direct sharing, regional groups, or public listings?
- Should a listing reveal the farm identity immediately, only after response, or according to preference?
- Are general location or pickup details necessary for usefulness?
- Would farmers ever attach a photo to a materials request or offer?
- Are they comfortable retaining audio/photo captures internally?
- Who within a farm should be able to see worker-created captures?
- Would farmers value a history of shared requests and outcomes?
- Is a simple contact method sufficient initially, or is in-product messaging necessary?
