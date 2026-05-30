# Mobile Pilot 1 Operational Records

- Status: accepted
- Last reviewed: 2026-05-28
- Canonical for: operational-record meanings implemented in Mobile Pilot 1
- Related ADRs: [ADR-0001](../adr/ADR-0001-offline-first-field-operation.md), [ADR-0002](../adr/ADR-0002-history-preserving-idempotent-synchronization.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [ADR-0005](../adr/ADR-0005-data-portability-and-recoverability.md), [ADR-0007](../adr/ADR-0007-standalone-mobile-pilot-before-server-connected-features.md), [ADR-0009](../adr/ADR-0009-mobile-pilot-1-local-persistence.md), [ADR-0010](../adr/ADR-0010-mobile-pilot-1-export-and-recovery-copy.md), [ADR-0011](../adr/ADR-0011-mobile-pilot-1-runtime-boundary-validation.md)
- Related docs: [Glossary](glossary.md), [Inventory and Reconciliation Rules](inventory-and-reconciliation-rules.md), [Initial Vertical Slice](../product/initial-vertical-slice.md), [Mobile Pilot 1 Implementation Scope](../product/mobile-pilot-1-implementation-scope.md), [Offline-First Mobile Architecture](../architecture/offline-first-mobile-architecture.md), [Mobile Pilot Data-Safety Requirements](../operations/mobile-pilot-data-safety-requirements.md), [Mobile App README](../../apps/mobile/README.md)
- Related tests: [Harvest validation tests](../../apps/mobile/src/domain/validation/harvestValidation.test.ts), [Harvest use-case tests](../../apps/mobile/src/application/use-cases/harvestUseCases.test.ts), [Manual record validation tests](../../apps/mobile/src/domain/validation/manualRecordValidation.test.ts), [Manual record use-case tests](../../apps/mobile/src/application/use-cases/manualRecordUseCases.test.ts)
- Supersedes: none

## Purpose

This document defines the accepted operational-record semantics for the first buildable increment only:

- `HarvestRecorded`
- `MaterialUseRecorded`
- `InventoryCountRecorded`

The broader [Operational Event Catalog](operational-event-catalog.md) remains a proposed candidate catalog for later standalone-mobile and server-connected expansion. If the proposed catalog conflicts with this accepted document for Mobile Pilot 1 implementation, this document governs.

The TypeScript domain files under `apps/mobile/src/domain` are implementation skeletons derived from this document. They do not replace this document as the source of operational-record meaning.

## Shared Rules

These are private device-local confirmed operational records in Mobile Pilot 1.

Manual save or confirmation creates the operational record. These records must be retainable offline and visible in local activity history.

Each record must preserve enough meaning for current local use and future server compatibility: stable identity or future-map-able identity, recorded/effective timestamps, farm-reference meaning, quantity and unit meaning, privacy classification, and correction/discrepancy meaning.

The implemented Mobile Pilot 1 unit vocabulary is `lb`, `oz`, `kg`, `g`, `each`, `bunch`, `crate`, `bag`, `gal`, `L`, `flat`, and `tray`. Unit conversion, packaging equivalency, and authoritative inventory calculation are not implemented.

Operational records refer to farm places by stable ID. The app displays those references with farmer-readable place paths, such as `Field 1 > Bed 2`, when parent/child farm-place structure exists. Farm-place hierarchy is still only a local setup aid and does not imply GIS, crop planning, or spatial geometry.

Mobile Pilot 1 has no server acceptance, synchronization state, cross-device visibility, external sharing, or publication state. No record becomes shared externally.

Basic correction for obvious entry mistakes may be supported if deliberately implemented. Correction must not silently erase meaningful recorded history or hide inventory discrepancy meaning. More advanced correction lineage, audit trail, adjustment records, and supersession workflows are deferred unless explicitly scoped later.

## `HarvestRecorded`

Plain-language meaning: a worker records that a quantity of a crop was harvested from a location.

Minimum required fields:

- Tracked crop reference by stable ID.
- Source farm place.
- Quantity.
- Unit.
- Recorded/effective date and time.
- Optional note.

Mobile Pilot 1 behavior:

- Private and device-local.
- Appears in unified local activity history.
- Included in the implemented Mobile Pilot 1 recovery-copy export.
- Export/recovery copies must include the tracked crop reference data needed to interpret exported harvest records.
- Does not imply saleable inventory, customer fulfillment, marketplace availability, listing publication, or server synchronization.
- The implemented app presents read-only saved harvest records; editing, deletion, correction lineage, and supersession are deferred.

Crop rename, deletion, and historical name-snapshot behavior are deferred because reference-editing behavior is not yet implemented in Mobile Pilot 1. Until that behavior is deliberately scoped, harvest records should preserve stable crop identity without silently losing the crop meaning needed for local history or export.

## `MaterialUseRecorded`

Plain-language meaning: a worker records that a material or input was used during farm work.

Minimum required fields:

- Material/input.
- Quantity.
- Unit.
- Date and time.
- Optional use farm place.
- Optional note.

Mobile Pilot 1 behavior:

- Private and device-local.
- Appears in unified local activity history.
- Included in the implemented Mobile Pilot 1 recovery-copy export.
- May affect expected material quantity only where the pilot implements that behavior transparently.
- Does not automatically create a supply need, publish a need, notify anyone, or imply server synchronization.

## `InventoryCountRecorded`

Plain-language meaning: a worker records an observed quantity of a tracked material or countable item at a point in time.

Minimum required fields:

- Tracked material or countable item.
- Observed quantity.
- Unit.
- Date and time.
- Optional farm place.
- Optional note.

Mobile Pilot 1 behavior:

- Private and device-local.
- Appears in unified local activity history.
- Included in the implemented Mobile Pilot 1 recovery-copy export.
- The count is an observation, not a destructive replacement of earlier history.
- If material use and counts are both displayed, discrepancy interpretation must preserve the difference between expected and observed quantity rather than silently overwrite prior records.

## Candidate or Deferred Records

The following are not Mobile Pilot 1 implementation scope:

| Record or concept | Pilot 1 posture |
| --- | --- |
| `PlantingRecorded` | Candidate later standalone-mobile workflow |
| `ItemMoved` | Candidate later standalone-mobile workflow |
| `EquipmentIssueRecorded` | Candidate later standalone-mobile workflow |
| `SupplyNeedRecorded` | Candidate later discovery workflow after core recording proves usable |
| `NeedListingPublished` | Future server-connected functionality only |
| `AvailabilityListingPublished` | Deferred future scope |
| AI-assisted records/capture provenance | Mobile Pilot 2 or later; governed by ADR-0003 and later accepted scope |
