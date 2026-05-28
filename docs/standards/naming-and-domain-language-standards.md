# Naming and Domain Language Standards

- Status: proposed
- Last reviewed: 2026-05-28
- Canonical for: farmer-centered terminology, boundary-revealing names, and prevention of domain-language drift
- Related ADRs: [ADR-0002](../adr/ADR-0002-history-preserving-idempotent-synchronization.md), [ADR-0003](../adr/ADR-0003-ai-interpretations-require-confirmation.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md)
- Related docs: [Farm Domain Glossary](../domain/glossary.md), [Farm Structure and Tracked Items](../domain/farm-structure-and-tracked-items.md), [Operational Event Catalog](../domain/operational-event-catalog.md), [AI-Assisted Capture and Confirmation Rules](../domain/ai-assisted-capture-and-confirmation-rules.md), [Privacy, Visibility, and Sharing Rules](../domain/privacy-visibility-and-sharing-rules.md)
- Related tests: not yet implemented
- Supersedes: none

## Domain Terminology Is Authoritative

Names in implementation, interfaces, tests, documentation, and user-facing concepts should align with [Farm Domain Glossary](../domain/glossary.md) and related domain documents.

Technical implementation may use additional terms internally, but those terms must not obscure domain meaning or create parallel models.

## Preferred Domain Names

| Prefer | Avoid replacing with vague alternatives |
| --- | --- |
| Farm | Workspace, tenant, container unless later architecture explicitly needs a technical term |
| Farm member / worker | Actor, user unit, operator object in user-facing/domain contexts |
| Location, field, bed, greenhouse, tunnel, storage area | Generic node/resource for farmer-facing concepts |
| Crop / planting | Generic asset unless technical implementation clearly maps without replacing user terminology |
| Material / input | Inventory asset, resource item without domain context |
| Equipment | Device/resource unless appropriate only at a technical boundary |
| Countable item | Detected asset/object class in product-facing language |
| Activity | Workflow transaction |
| Observation | State update or mutation |
| Operational record | Generic event/log where farmer meaning matters |
| Draft interpretation | AI result, prediction, generated record without qualification |
| Confirmed operational record | Accepted AI output or saved result without domain meaning |
| Supply need | Issue/request object with no domain context |
| Need listing / availability listing | Marketplace item, post, offer transaction unless later adopted deliberately |
| Shared representation | Exposed record or synced object |
| Publication | Sync/write operation |
| Discrepancy | Conflict or error when it is specifically an inventory difference |

## Naming of AI Concepts

- Distinguish capture, transcription, inference, draft, confirmation, correction, provenance, and confirmed record.
- Do not call an AI-produced draft a record unless qualified as a draft.
- Do not name a photo count as an inventory count until user confirmation occurs.
- Avoid names implying autonomy, such as `autoPublishNeed`, `autoConfirmHarvest`, or `smartInventoryUpdate`, unless later accepted policy explicitly permits such behavior.

## Naming of Privacy and Sharing Concepts

- Use explicit names distinguishing private data from shared representations.
- Do not name server synchronization methods as publication methods unless they actually publish intentionally shared content.
- Avoid names suggesting local-network users can retrieve internal farm records.
- Include visibility or sharing meaning in concepts that cross the private/publication boundary.

## Naming of Status Concepts

Future implementation names must preserve meaningful distinctions:

| Distinction to preserve | Examples of acceptable conceptual naming |
| --- | --- |
| Local saved versus server accepted | `savedLocally`, `awaitingSync`, `synchronized` |
| Draft versus confirmed | `draft`, `awaitingConfirmation`, `confirmed` |
| Publication pending versus visible | `pendingPublication`, `published`, `publicationFailed` |
| Transfer pending versus attachment available | `attachmentPendingTransfer`, `attachmentTransferred`, `attachmentTransferFailed` |
| Ordinary mismatch versus resolution state | `discrepancy`, `requiresAttention`, `resolved` |

These examples do not prescribe exact enum values. They require the conceptual distinctions.

## Prohibited Ambiguous Naming Patterns

Avoid vague terms such as `data`, `item`, `object`, `resource`, `record`, `entry`, `status`, `sync`, `share`, `asset`, `manager`, `service`, or `handler` when used without sufficient domain or responsibility context.

Conceptual examples:

- Prefer `RecordHarvestUseCase` over `SaveEntry`.
- Prefer `PublishNeedListing` over `ShareData`.
- Prefer `InventoryCountDraft` over `DetectionResult` in a product-facing workflow.
- Prefer `PrivateOperationalRecordExport` over `DataExport` when scope matters.

These examples do not establish a final code naming convention before stack and module structure are selected.

## Naming Review Checklist

- Does the name reveal farm meaning?
- Does it distinguish private data from shared representation?
- Does it distinguish draft from confirmed fact?
- Does it distinguish local retention from synchronization/publication?
- Is a technical abstraction replacing farmer language unnecessarily?
- Would an automated agent reading the name likely infer the correct boundary?
