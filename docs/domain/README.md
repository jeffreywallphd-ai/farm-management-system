# Domain Documentation

`docs/domain/` is canonical for farm-specific behavior and vocabulary.

## Current Domain Documents

- [Farm Domain Glossary](glossary.md): authoritative first-slice farm vocabulary and terminology boundaries.
- [Farm Structure and Tracked Items](farm-structure-and-tracked-items.md): farm, member, location, crop/planting, material/input, equipment, and countable-item concepts.
- [Mobile Pilot 1 Operational Records](mobile-pilot-1-operational-records.md): accepted operational-record meanings for the exact first buildable Mobile Pilot 1 record set.
- [Operational Event Catalog](operational-event-catalog.md): proposed broader candidate activities, observations, draft/confirmed record distinction, and correction principles.
- [Inventory and Reconciliation Rules](inventory-and-reconciliation-rules.md): expected versus observed quantity, discrepancy handling, inventory effects, and shared-listing separation.
- [Sourcing and Local Network Model](sourcing-and-local-network-model.md): private supply needs, future intentionally shared need listings, local farm network concepts, and standalone-pilot sourcing boundaries.
- [AI-Assisted Capture and Confirmation Rules](ai-assisted-capture-and-confirmation-rules.md): meaning of AI-assisted drafts, confirmation, correction, provenance, and their relationship to operational records.
- [Privacy, Visibility, and Sharing Rules](privacy-visibility-and-sharing-rules.md): private-by-default domain behavior, visibility classes, intentionally shared representations, and sensitive content rules.

Domain rules should use farmer-understandable language. They must not be buried only in database models, UI forms, API schemas, or AI prompts.

The accepted Mobile Pilot 1 operational-record document governs current implementation for `HarvestRecorded`, `MaterialUseRecorded`, and `InventoryCountRecorded`. The broader operational event catalog remains proposed future guidance unless a later scope decision accepts more records.

These documents are canonical for domain terminology and behavior within their stated statuses. They do not choose server language, client framework, database technology, synchronization protocol, AI model, or deployment architecture.

Accepted ADRs may also govern cross-cutting domain constraints. See [ADR-0002](../adr/ADR-0002-history-preserving-idempotent-synchronization.md), [ADR-0003](../adr/ADR-0003-ai-interpretations-require-confirmation.md), and [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md).

When implementation changes farm operational behavior or vocabulary, update the relevant domain documentation in the same change.

Future implementation must also follow the [Naming and Domain Language Standards](../standards/naming-and-domain-language-standards.md), [Coding Standards](../standards/coding-standards.md), [Testing and Verification Standards](../standards/testing-and-verification-standards.md), and [Change Impact Matrix](../standards/change-impact-matrix.md) where domain behavior is affected.
