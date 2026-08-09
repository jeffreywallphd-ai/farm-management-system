# Inventory and Reconciliation Rules

- Status: proposed
- Last reviewed: 2026-06-04
- Canonical for: first-slice inventory meaning, quantity semantics, discrepancy handling, and reconciliation principles
- Related ADRs: [ADR-0002](../adr/ADR-0002-history-preserving-idempotent-synchronization.md), [ADR-0003](../adr/ADR-0003-ai-interpretations-require-confirmation.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md)
- Related docs: [Glossary](glossary.md), [Farm Structure and Tracked Items](farm-structure-and-tracked-items.md), [Mobile Pilot 1 Operational Records](mobile-pilot-1-operational-records.md), [Operational Event Catalog](operational-event-catalog.md), [AI-Assisted Capture and Confirmation Rules](ai-assisted-capture-and-confirmation-rules.md), [Privacy, Visibility, and Sharing Rules](privacy-visibility-and-sharing-rules.md), [Sourcing and Local Network Model](sourcing-and-local-network-model.md), [Initial Vertical Slice](../product/initial-vertical-slice.md)
- Related tests: [Manual record validation tests](../../apps/mobile/src/domain/validation/manualRecordValidation.test.ts), [Manual record use-case tests](../../apps/mobile/src/application/use-cases/manualRecordUseCases.test.ts), [Inventory use-case tests](../../apps/mobile/src/application/use-cases/inventoryUseCases.test.ts), [Harvest migration tests](../../apps/mobile/src/infrastructure/sqlite/migrations/harvestMigration.test.ts)
- Supersedes: none

## Purpose

This document defines what "inventory" means in the initial product slice and how activities and observations should inform it.

The first release does not need a comprehensive accounting-grade inventory system, but it does need trustworthy rules for material use and counted items.

## Initial Inventory Scope

Mobile Pilot 1 uses the accepted [Mobile Pilot 1 Operational Records](mobile-pilot-1-operational-records.md) document for the implemented inventory-related records: `MaterialUseRecorded` and `InventoryCountRecorded`.

For Mobile Pilot 1, inventory meaning includes material use, inventory-count observations, a local inventory catalog for farm inputs/materials and equipment, purchase-oriented farm notes, farmer-entered catalog quantity context, and any simple expected-versus-observed display explicitly implemented for those records. Materials remain backed by the existing tracked-material reference records so `MaterialUseRecorded` and `InventoryCountRecorded` stay interpretable. Equipment catalog entries are setup/reference data only; they do not create a new confirmed operational record type in the pilot.

The Inventory Management page is the farmer-facing home for adding farm inputs/materials and equipment. Farm Setup should not keep a separate material-management card.

Inventory Management uses a guided catalog flow for adding farm inputs/materials and equipment: category, common item, optional custom name, source type, amount on hand, unit, storage place, supplier/source, and notes. Each category includes an `Other` option so the app can reduce typing without pretending the predefined list is exhaustive. Source type is a simple catalog field with these meanings: purchased, donated, self-produced, or already owned.

Inventory Management may also offer quick farm-note recording inside the add-input and add-equipment forms for material purchases and equipment purchases. These are ordinary private farm-event notes with voice and optional photos, useful for preserving receipt, label, item-condition, and storage-location context. When the catalog item is saved, the inventory item may retain the linked farm-note ID so the note can be reviewed with that catalog item later. They are not accounting records, purchase orders, inventory receipts, or automatic stock adjustments.

Material usage reporting is derived from confirmed `MaterialUseRecorded` records and grouped by material and unit. The app does not convert units or claim authoritative current stock totals.

Inventory catalog items may store category/common-item keys, acquisition/source type, current farmer-entered amount and unit, storage place, supplier, reorder point, notes, organic relevance, farmer-entered approval/review status, evidence notes, equipment contact-risk notes, and whether cleaning evidence is needed before organic-contact use. This current amount is catalog context, not an accounting ledger or authoritative reconciled stock total.

Organic inventory fields are evidence-organization fields. They do not automatically verify OMRI, WSDA, National List, USDA, or certifier status and must not be presented as legal approval or certification.

Broader inventory records in the proposed event catalog do not become first-build scope through this document.

The broader first slice may later track practical quantities for:

- Materials/inputs.
- Countable standardized items.
- Possibly harvested quantity as activity history.

It should not yet claim comprehensive inventory support for:

- Produce sales availability.
- Accounting valuation.
- Purchase orders.
- Lot traceability.
- Livestock.
- Regulatory compliance decisions.
- Customer fulfillment.
- Multi-location warehousing.

## Expected Quantity Versus Observed Quantity

**Expected quantity** is the quantity inferred from confirmed quantity-affecting operational records, such as recorded starting amount and recorded material use.

**Observed quantity** is a quantity counted or measured by a worker at a point in time.

**Discrepancy** is a difference between expected and observed quantity.

A discrepancy is not necessarily an error. It may indicate:

- Unrecorded use.
- Waste or loss.
- Counting mistake.
- Measurement variance.
- Prior incorrect record.
- Theft, damage, or spoilage where relevant.
- Incomplete starting information.

## Reconciliation Principle

An inventory count is an observation of current reality; it should not silently erase the history that produced a different expected quantity.

Proposed first-slice product behavior:

- Preserve prior activities and observations.
- Show or make available the discrepancy when meaningful.
- Allow a user to acknowledge or explain an adjustment later.
- Defer exact adjustment-record design to later domain or architecture work if not required immediately.

## Quantity and Units

- Every tracked quantity must be paired with a unit.
- Mobile Pilot 1 currently accepts only this small pilot unit vocabulary: `lb`, `oz`, `kg`, `g`, `each`, `bunch`, `crate`, `bag`, `gal`, `L`, `flat`, and `tray`.
- Do not silently combine quantities using incompatible units.
- Unit-conversion behavior is deferred unless explicitly required for the first slice.
- A material may commonly be tracked in a farm-specific unit, such as bags rather than weight.

## Inventory-Affecting Initial Records

| Record | Initial inventory interpretation |
| --- | --- |
| Material use recorded | Mobile Pilot 1 included; may reduce expected quantity of the selected material when an expected quantity exists and the behavior is transparent |
| Inventory count recorded | Mobile Pilot 1 included; provides observed quantity at a point in time |
| Inventory catalog item | Mobile Pilot 1 included as local setup/reference data for materials and equipment; may store farmer-entered source and amount-on-hand context; does not itself create accounting, receipt, use, movement, or maintenance records |
| Harvest recorded | Mobile Pilot 1 included; records output quantity but does not require full saleable inventory management |
| Item movement recorded | Candidate later workflow; may change location assignment if later implemented |
| Supply need recognized | Candidate later discovery workflow; expresses a need but does not alter inventory |
| Need listing published | Future server-connected only; shares a need but does not alter internal inventory |
| Equipment issue recorded | Candidate later workflow; no inventory effect |
| Planting/transplanting recorded | Candidate later workflow; no required material-inventory effect initially |

## AI-Assisted Drafts and Inventory

- Unconfirmed AI-assisted interpretation drafts have no inventory effect.
- A confirmed AI-assisted material-use record affects expected inventory in the same manner as an equivalent manually confirmed material-use record.
- A confirmed AI-assisted inventory count contributes an observation in the same manner as an equivalent manually confirmed inventory count.
- AI-assisted interpretation must not automatically create a supply need, publish a listing, or disclose inventory outside the farm.

## Offline Relevance

- Inventory-affecting activities and counts must be recordable without connectivity.
- Multiple offline observations or activities may later reveal discrepancies.
- The product must not promise perfect current shared inventory when disconnected devices have un-synchronized records.
- Future synchronization architecture must preserve confirmed records and expose unresolved discrepancies or conflicts appropriately.

## Shared-Listing Separation

- Internal inventory quantity is private by default.
- Recording a low quantity or discrepancy does not publish that information.
- A private supply need recorded during the standalone mobile pilot does not publish inventory information.
- A future need listing contains only information intentionally selected or entered for sharing after later server-connected scope is authorized.
- A future need listing does not automatically expose expected quantity, observed quantity, discrepancy, material-use history, source captures, or why the farm needs the material.
- An availability listing, when supported, may offer an intentionally selected amount without exposing the farm's total holdings.

## Questions Deferred for Later Work

- Whether to support inventory adjustment records in the first implementation.
- Whether expected quantity should later be reconciled from catalog starting quantity, explicit receipt records, use records, and adjustment records.
- Whether harvested quantities become tracked output inventory or remain activity history initially.
- Whether equipment-use, cleaning, maintenance, or movement should become confirmed operational records.
- Whether transcript-assisted material-use drafts should be authorized after capture-first validation.
- How offline concurrent quantity changes are reconciled technically.
- Which units require conversions.
- Whether location-specific inventory is required for all initial item types.
