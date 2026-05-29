# Operational Event Catalog

- Status: proposed
- Last reviewed: 2026-05-28
- Canonical for: proposed broader operational activities, observations, draft/confirmed record distinction, and correction principles
- Related ADRs: [ADR-0002](../adr/ADR-0002-history-preserving-idempotent-synchronization.md), [ADR-0003](../adr/ADR-0003-ai-interpretations-require-confirmation.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [ADR-0007](../adr/ADR-0007-standalone-mobile-pilot-before-server-connected-features.md)
- Related docs: [Glossary](glossary.md), [Farm Structure and Tracked Items](farm-structure-and-tracked-items.md), [Inventory and Reconciliation Rules](inventory-and-reconciliation-rules.md), [Sourcing and Local Network Model](sourcing-and-local-network-model.md), [Privacy, Visibility, and Sharing Rules](privacy-visibility-and-sharing-rules.md), [AI-Assisted Capture and Confirmation Rules](ai-assisted-capture-and-confirmation-rules.md), [Initial Vertical Slice](../product/initial-vertical-slice.md), [Field Workflows](../product/field-workflows.md)
- Related tests: not yet implemented
- Supersedes: none

## Purpose

This document is a proposed broader product-domain catalog of activities and observations that may be retained as confirmed farm operational records across standalone-mobile and future server-connected expansion.

[Mobile Pilot 1 Operational Records](mobile-pilot-1-operational-records.md) is accepted and governs the exact current implementation set: `HarvestRecorded`, `MaterialUseRecorded`, and `InventoryCountRecorded`. Where this proposed catalog conflicts with that accepted document, the accepted Mobile Pilot 1 document governs current implementation.

It is technology-neutral. It does not define JSON schemas, tables, transport contracts, persistence implementations, or synchronization protocols.

## Activity Versus Observation

An **activity** is a record that a worker reports work was performed, such as harvesting or using material.

An **observation** is a record that a worker reports a state, condition, or count noticed at a time, such as a remaining quantity or equipment issue.

Both activities and observations can become confirmed operational records.

## Draft Versus Confirmed Record

A manually completed and saved record is confirmed through the user's intentional save action.

A voice-assisted or photo-assisted interpretation remains a draft until confirmed or corrected by a user.

Only confirmed operational records may contribute to reliable activity history or inventory understanding. [AI-Assisted Capture and Confirmation Rules](ai-assisted-capture-and-confirmation-rules.md) defines detailed AI-draft handling.

## Correction Principle

Confirmed operational records represent what was recorded at a time. Correcting a meaningful record must preserve an auditable indication that a correction occurred.

Later implementation may determine whether this is achieved through correction records, supersession, or another mechanism. Silent destructive edits are not acceptable for operationally meaningful records.

## A. Planting or Transplanting Recorded

Reference identifier: `PlantingRecorded`

Plain-language meaning: records that a crop or crop variety was planted or transplanted in a farm location.

Proposed domain posture: planting and transplanting should initially be one activity type with a simple method or note indicating whether the crop was seeded, planted, or transplanted. This keeps the first slice farmer-understandable without forcing separate records before field validation.

- Why included later: may support associating crop work and later harvest with a growing location after core Pilot 1 recording is validated.
- Example farmer statement: "Transplanted kale into Bed 4."
- Minimum conceptual information: crop or variety when known; location; date/time or effective date; optional quantity and unit when practical; optional note.
- Type: activity.
- Offline capture required: yes.
- Inventory effect: not required to calculate material inventory in the first slice; may establish a planting for later harvest association.
- Private/shared posture: private operational record by default.
- Correction considerations: corrections may clarify crop, location, date, or quantity without erasing the original recorded meaning.
- First-slice status: candidate later standalone-mobile workflow; not Mobile Pilot 1.

## B. Harvest Recorded

Reference identifier: `HarvestRecorded`

Plain-language meaning: records that a quantity of a crop was harvested from a location or known planting.

- Why included: harvest is a high-value field record and a candidate for lower-friction capture.
- Example farmer statement: "Harvested eighteen pounds of kale from Bed 4."
- Minimum conceptual information: crop or planting; source location; quantity; unit; date/time; optional note.
- Type: activity.
- Offline capture required: yes.
- Inventory effect: records harvested quantity; does not assume customer-sale or finished-inventory workflow yet.
- Private/shared posture: private operational record by default.
- Correction considerations: later correction may adjust crop, source, unit, quantity, or date while preserving that a harvest was recorded.
- First-slice status: Mobile Pilot 1 included; governed by [Mobile Pilot 1 Operational Records](mobile-pilot-1-operational-records.md). Voice-to-draft is Mobile Pilot 2 only.

## C. Material Use Recorded

Reference identifier: `MaterialUseRecorded`

Plain-language meaning: records that a tracked material/input was used during farm work.

- Why included: connects practical work to inventory awareness and sourcing needs.
- Example farmer statement: "Used two bags of potting mix in Greenhouse 1."
- Minimum conceptual information: material; quantity; unit; date/time; optional use location; optional related crop/planting/activity note.
- Type: activity.
- Offline capture required: yes.
- Inventory effect: decreases expected available amount when tracked quantitatively.
- Private/shared posture: private operational record by default.
- Correction considerations: later correction may change material, quantity, unit, or location without hiding that material use had been recorded.
- First-slice status: Mobile Pilot 1 included; governed by [Mobile Pilot 1 Operational Records](mobile-pilot-1-operational-records.md). Voice-to-draft is Mobile Pilot 2 or later only.

The user-facing term should be "material use," not "consumption," unless later farmer validation shows another term is clearer.

## D. Item Movement Recorded

Reference identifier: `ItemMoved`

Plain-language meaning: records that a tracked item or group was moved from one location to another.

- Why included later: may help workers understand where items are without requiring a full custody or logistics system.
- Example farmer statement: "Moved twelve seedling flats from Greenhouse 1 to North Field."
- Minimum conceptual information: tracked item; quantity/unit where relevant; origin location when known; destination location; date/time; optional note.
- Type: activity.
- Offline capture required: yes.
- Inventory effect: may affect location-based understanding without necessarily changing total quantity.
- Private/shared posture: private operational record by default.
- Correction considerations: later correction may clarify item, quantity, origin, destination, or date.
- First-slice status: candidate later standalone-mobile workflow; not Mobile Pilot 1.

Movement need not initially support every item class or a complex custody chain.

## E. Inventory Count Recorded

Reference identifier: `InventoryCountRecorded`

Plain-language meaning: records an observed amount of a tracked material or countable item at a point in time and, where relevant, a location.

- Why included: supports practical inventory awareness in Mobile Pilot 1 and a later constrained photo-count experiment in Mobile Pilot 2.
- Example farmer statement: "Counted twenty-four harvest crates in the wash/pack area."
- Minimum conceptual information: tracked material or countable item; observed quantity; unit; date/time; optional location; optional note.
- Type: observation.
- Offline capture required: yes.
- Inventory effect: provides an observation that may confirm or conflict with expected quantity.
- Private/shared posture: private operational record by default.
- Correction considerations: an observed count does not silently delete or invalidate prior activity history; correction should indicate whether the count itself was wrong or whether an adjustment is being acknowledged.
- First-slice status: Mobile Pilot 1 included as manual count; governed by [Mobile Pilot 1 Operational Records](mobile-pilot-1-operational-records.md). Photo-count-to-draft is Mobile Pilot 2 only.

## F. Equipment Issue Recorded

Reference identifier: `EquipmentIssueRecorded`

Plain-language meaning: records that a worker observed an issue or maintenance need associated with equipment.

- Why included later: equipment problems often arise during practical work and may need a simple record after core Pilot 1 workflows are validated.
- Example farmer statement: "Seeder needs repair; handle is loose."
- Minimum conceptual information: equipment item; issue description; date/time; optional simple severity or urgency; optional location; optional photo later.
- Type: observation.
- Offline capture required: yes.
- Inventory effect: none.
- Private/shared posture: private operational record by default.
- Correction considerations: later correction may clarify the issue or mark it as resolved, but should not turn this into a full work-order history unless product scope changes.
- First-slice status: candidate later standalone-mobile workflow; not Mobile Pilot 1.

This record does not define a maintenance scheduling, parts inventory, telematics, or repair workflow system.

## G. Supply Need Recognized

Reference identifier: `SupplyNeedRecorded`

Plain-language meaning: records that the farm privately recognizes a need for a material or resource.

- Why included later: may support standalone mobile discovery around sourcing needs without exposing internal inventory after core recording proves usable.
- Example farmer statement: "We need more potting mix before next week."
- Minimum conceptual information: needed item or description; desired quantity/unit if known; desired timing if known; optional internal note.
- Type: observation/intent record.
- Offline capture required: yes, as an internal farm record.
- Inventory effect: may be motivated by inventory observation but must not require exposing internal quantity.
- Private/shared posture: private in the standalone mobile pilot. Later server-connected scope may allow intentional conversion into a shared need listing.
- Correction considerations: a need may be changed, withdrawn, or resolved while preserving that the need was recognized. Conversion into a listing is future server-connected behavior.
- First-slice status: candidate later discovery workflow; not Mobile Pilot 1.

## H. Need Listing Intentionally Published

Reference identifier: `NeedListingPublished`

Plain-language meaning: records that the farm intentionally shares selected supply-need information with an allowed audience.

- Why included: defines the later server-connected publication concept if farmer discovery justifies it.
- Example farmer statement: "Share that we are looking for five bags of potting mix this week."
- Minimum conceptual information: public/shared description of needed item; requested amount/unit if the farm chooses to share it; timing; sharing audience or visibility category; contact/response pathway at the product level.
- Type: shared coordination record.
- Offline capture required: not part of the standalone mobile pilot. A later server-connected version may allow a draft or pending publish action to be created offline, but publication/availability to others requires synchronization and acceptance.
- Inventory effect: must not automatically reveal internal inventory records or shortage calculation.
- Private/shared posture: shared only because the farmer intentionally publishes selected listing information; source captures, AI drafts, private attachments, and internal need history are not listing content by default.
- Correction considerations: a listing may be changed, withdrawn, expired, or resolved with history sufficient to avoid confusion.
- First-slice status: deferred from the standalone mobile pilot; conceptually defined for later server-connected functionality.

## I. Availability Listing Intentionally Published

Reference identifier: `AvailabilityListingPublished`

Plain-language meaning: records that a farm intentionally offers a selected material, item, equipment access, or resource to an allowed audience.

- Why included: conceptually related to need listings, but not required for the first slice.
- Example farmer statement: "We have extra seedling trays available."
- Minimum conceptual information: offered item description; amount the farm chooses to offer; timing/availability; optional pickup/delivery note.
- Type: shared coordination record.
- Offline capture required: to be determined.
- Inventory effect: an offered quantity is not the same as exposing total internal inventory.
- Private/shared posture: shared intentionally.
- Correction considerations: an availability listing may be changed, withdrawn, expired, or resolved.
- First-slice status: deferred unless product scope is intentionally revised.

## Voice and Photo Confirmation Records

Voice and photo are capture or provenance methods for creating or supporting a confirmed operational record. They are not standalone farm-activity types merely because the capture occurred.

Examples:

- A confirmed photo-assisted count should produce or support an `InventoryCountRecorded` operational record with provenance.
- A confirmed voice-assisted harvest should produce or support a `HarvestRecorded` operational record with provenance.

Capture method does not replace operational meaning. Retention and visibility of source capture, interpretation, confirmation, and provenance metadata is governed by [AI-Assisted Capture and Confirmation Rules](ai-assisted-capture-and-confirmation-rules.md), [Privacy, Visibility, and Sharing Rules](privacy-visibility-and-sharing-rules.md), and [AI-Assisted Capture Boundaries](../architecture/ai-assisted-capture-boundaries.md).

## Initial Event Summary

| Operational record | Type | Offline capture required? | Impacts inventory understanding? | Shared by default? | First-slice posture |
| --- | --- | ---: | ---: | ---: | --- |
| Planting/transplanting recorded | Activity | Yes | Limited/no initial quantity effect | No | Candidate later standalone-mobile workflow |
| Harvest recorded | Activity | Yes | Records harvested quantity | No | Mobile Pilot 1 included; accepted document governs |
| Material use recorded | Activity | Yes | Decreases expected material quantity where supported | No | Mobile Pilot 1 included; accepted document governs |
| Item movement recorded | Activity | Yes | Changes location understanding | No | Candidate later standalone-mobile workflow |
| Inventory count recorded | Observation | Yes | Reconciles expected versus observed where displayed | No | Mobile Pilot 1 included; accepted document governs |
| Equipment issue recorded | Observation | Yes | No | No | Candidate later standalone-mobile workflow |
| Supply need recognized | Observation/intent record | Yes | No direct disclosure | No | Candidate later discovery workflow |
| Need listing published | Shared coordination record | Future only | No automatic disclosure | Intentionally shared | Future server-connected only |
| Availability listing published | Shared coordination record | To be determined | No automatic disclosure | Intentionally shared | Deferred future scope |
