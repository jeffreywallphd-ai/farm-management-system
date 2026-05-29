# Context Pack: Product and Domain

- Pack name: `product-and-domain`
- Status: active
- Last reviewed: 2026-05-28
- Authority posture: Derived context aid only; canonical docs and accepted ADRs govern.

## Purpose

Helps agents handle product scope, farmer workflows, farm terminology, tracked items, operational records, inventory meaning, and sourcing concepts without broadening the first slice.

## Use When

- Adding or revising farmer-facing workflows.
- Creating or modifying operational record behavior.
- Changing tracked farm concepts or terminology.
- Adjusting inventory/discrepancy meaning.
- Modifying internal supply-need concepts.
- Assessing whether a proposed feature belongs in the initial slice.

## Do Not Use When

- Isolated deployment maintenance has no domain behavior change.
- Pure diagnostics wording fixes do not affect farm behavior.
- Generic repository navigation is covered by `index.pack.md`.

## Core Guidance

- First-slice scope is a narrow standalone mobile pilot.
- Mobile Pilot 1 implements only `HarvestRecorded`, `MaterialUseRecorded`, and `InventoryCountRecorded`.
- TypeScript domain skeletons under `apps/mobile/src/domain` derive from the accepted Mobile Pilot 1 record document and must not become a competing source of domain truth.
- Planting/transplanting, movement, equipment issue, and private supply-need records require later pilot scope authorization.
- Use farmer-understandable terms from the glossary.
- Operational records represent confirmed activities or observations.
- Inventory observations preserve discrepancy/history meaning.
- Farmer workflows in the pilot are local/device-based.
- Private supply needs may be captured for discovery if scoped.
- External need-listing publication is deferred server-connected scope.
- Capture method is not operational meaning.
- Broad farm ERP areas remain deferred.

## Non-Negotiable Constraints

- [ADR-0002](../../adr/ADR-0002-history-preserving-idempotent-synchronization.md): preserve operational history and discrepancy evidence.
- [ADR-0003](../../adr/ADR-0003-ai-interpretations-require-confirmation.md): AI drafts are not records until confirmation.
- [ADR-0004](../../adr/ADR-0004-private-by-default-intentional-sharing.md): private records do not become shared listings automatically.

## Decisions Still Deferred

New record types, need-listing publication, availability listings, messaging, group purchasing, equipment sharing, and broader coordination require validation and canonical scope updates.

## Explicit Non-Goals / Overreach to Avoid

Do not add accounting, payments, ecommerce, public marketplace, broad compliance, diagnosis/treatment recommendations, broad AI, federation, speculative platform abstractions, or casual new record types.

## Canonical Source Documents and ADRs

- `docs/product/product-vision-and-scope.md`: product direction and non-goals.
- `docs/product/initial-vertical-slice.md`: first-slice scope.
- `docs/product/mobile-pilot-1-implementation-scope.md`: exact current Pilot 1 implementation scope.
- `docs/product/field-workflows.md`: representative farmer workflows.
- `docs/product/roadmap.md`: sequencing and scope-change rules.
- `docs/domain/glossary.md`: authoritative terminology.
- `docs/domain/farm-structure-and-tracked-items.md`: farm locations and tracked item categories.
- `docs/domain/mobile-pilot-1-operational-records.md`: accepted Pilot 1 record semantics.
- `docs/domain/operational-event-catalog.md`: activity/observation record meanings.
- `docs/domain/inventory-and-reconciliation-rules.md`: inventory and discrepancy semantics.
- `docs/domain/sourcing-and-local-network-model.md`: supply needs and listings.

## Required Standards

- `docs/standards/naming-and-domain-language-standards.md`
- `docs/standards/coding-standards.md`
- `docs/standards/testing-and-verification-standards.md`
- `docs/standards/change-impact-matrix.md`

## Required Documentation Impact Review

Review product and domain docs when workflows, terminology, record meaning, inventory rules, sourcing concepts, or first-slice boundaries change. ADR review is likely if a durable record/scope invariant changes.

## Required Verification Impact Review

Future implementation must include domain behavior tests, sync/discrepancy tests for quantity-affecting records, privacy tests for supply/listing separation, and usability review for farmer-facing workflows.

## Prompt Assembly Notes

Common companions: `mobile-field-capture`, `offline-sync`, `privacy-and-sharing`, or `testing-and-diagnostics`. Do not load deployment or dependency packs unless the task actually touches those concerns.
