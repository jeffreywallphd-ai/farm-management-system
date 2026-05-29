# Mobile Pilot 1 Operational Records

- Status: accepted
- Last reviewed: 2026-05-28
- Canonical for: operational-record meanings implemented in Mobile Pilot 1
- Related ADRs: [ADR-0001](../adr/ADR-0001-offline-first-field-operation.md), [ADR-0002](../adr/ADR-0002-history-preserving-idempotent-synchronization.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [ADR-0005](../adr/ADR-0005-data-portability-and-recoverability.md), [ADR-0007](../adr/ADR-0007-standalone-mobile-pilot-before-server-connected-features.md)
- Related docs: [Glossary](glossary.md), [Inventory and Reconciliation Rules](inventory-and-reconciliation-rules.md), [Initial Vertical Slice](../product/initial-vertical-slice.md), [Mobile Pilot 1 Implementation Scope](../product/mobile-pilot-1-implementation-scope.md), [Offline-First Mobile Architecture](../architecture/offline-first-mobile-architecture.md), [Mobile Pilot Data-Safety Requirements](../operations/mobile-pilot-data-safety-requirements.md)
- Related tests: not yet implemented
- Supersedes: none

## Purpose

This document defines the accepted operational-record semantics for the first buildable increment only:

- `HarvestRecorded`
- `MaterialUseRecorded`
- `InventoryCountRecorded`

The broader [Operational Event Catalog](operational-event-catalog.md) remains a proposed candidate catalog for later standalone-mobile and server-connected expansion. If the proposed catalog conflicts with this accepted document for Mobile Pilot 1 implementation, this document governs.

## Shared Rules

These are private device-local confirmed operational records in Mobile Pilot 1.

Manual save or confirmation creates the operational record. These records must be retainable offline and visible in local activity history.

Each record must preserve enough meaning for current local use and future server compatibility: stable identity or future-map-able identity, recorded/effective timestamps, farm-reference meaning, quantity and unit meaning, privacy classification, and correction/discrepancy meaning.

Mobile Pilot 1 has no server acceptance, synchronization state, cross-device visibility, external sharing, or publication state. No record becomes shared externally.

Basic correction for obvious entry mistakes may be supported if deliberately implemented. Correction must not silently erase meaningful recorded history or hide inventory discrepancy meaning. More advanced correction lineage, audit trail, adjustment records, and supersession workflows are deferred unless explicitly scoped later.

## `HarvestRecorded`

Plain-language meaning: a worker records that a quantity of a crop was harvested from a location.

Minimum required fields:

- Crop or crop name.
- Source location.
- Quantity.
- Unit.
- Recorded/effective date and time.
- Optional note.

Mobile Pilot 1 behavior:

- Private and device-local.
- Appears in local activity history.
- Included in Mobile Pilot 1 export/backup.
- Does not imply saleable inventory, customer fulfillment, marketplace availability, listing publication, or server synchronization.

## `MaterialUseRecorded`

Plain-language meaning: a worker records that a material or input was used during farm work.

Minimum required fields:

- Material/input.
- Quantity.
- Unit.
- Date and time.
- Optional use location.
- Optional note.

Mobile Pilot 1 behavior:

- Private and device-local.
- Included in Mobile Pilot 1 export/backup.
- May affect expected material quantity only where the pilot implements that behavior transparently.
- Does not automatically create a supply need, publish a need, notify anyone, or imply server synchronization.

## `InventoryCountRecorded`

Plain-language meaning: a worker records an observed quantity of a tracked material or countable item at a point in time.

Minimum required fields:

- Tracked material or countable item.
- Observed quantity.
- Unit.
- Date and time.
- Optional location.
- Optional note.

Mobile Pilot 1 behavior:

- Private and device-local.
- Included in Mobile Pilot 1 export/backup.
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

