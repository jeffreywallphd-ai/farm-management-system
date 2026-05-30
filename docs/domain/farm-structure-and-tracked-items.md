# Farm Structure and Tracked Items

- Status: proposed
- Last reviewed: 2026-05-28
- Canonical for: first-slice farm structure, location concepts, and tracked item categories
- Related ADRs: none yet
- Related docs: [Glossary](glossary.md), [Operational Event Catalog](operational-event-catalog.md), [Initial Vertical Slice](../product/initial-vertical-slice.md), [Field Workflows](../product/field-workflows.md)
- Related tests: not yet implemented
- Supersedes: none

## Purpose

This document defines the minimum conceptual structure needed to support the first vertical slice without creating a generalized farm ontology.

## Scope

This model exists only to support:

- Recording selected farm activities and observations.
- Identifying where work occurred.
- Identifying what crop, material, equipment, or countable item was involved.
- Enabling later offline use and synchronization architecture.
- Supporting optional private supply-need discovery in the standalone mobile pilot.

It does not attempt to model every kind of farm, livestock system, regulatory record, sales operation, or supply-chain process.

## Farm and Members

A farm owns or controls its private operational records. A farm may have members or workers who record activities or review records.

Detailed membership roles, invitation policies, authentication, and permissions are deferred to later architecture and privacy work. A single-farm operational context is sufficient for the first slice.

## Farm Places

A farm place is a farmer-defined named place relevant to activities, observations, or tracked items. The mobile app presents these as farm places rather than generic locations so farmers can start with recognizable structures. Examples include:

- North Field.
- Bed 4.
- Greenhouse 1.
- High Tunnel 2.
- Barn.
- Input Storage.
- Wash/Pack Area.

Practical farm-place rules:

- A farm place may be nested inside another farm place, such as a bed within a field or a cooler within a wash/pack area.
- The first slice should not require mapping every location geometrically.
- Geographic mapping may be useful later but is not required by this domain prompt.
- A farmer should be able to use terminology matching their operation.

Mobile Pilot 1 implements this small farm-place type vocabulary: `field`, `bed`, `row`, `greenhouse`, `highTunnel`, `greenhouseBed`, `bench`, `storageArea`, `washPack`, `cooler`, `freezer`, `barnShed`, and `other`.

Each farm place may have an optional parent place. This supports simple hierarchies such as:

```text
Field 1
  Bed 1
    Row 1

Greenhouse 1
  Bench 1

Wash/Pack
  Cooler
```

Farm-place hierarchy is a local, private, device-only setup aid. It does not add GIS boundaries, GPS, acreage, bed dimensions, planting plans, row spacing, soil data, maps, or drag-and-drop spatial editing.

## Tracked Item Categories

Only the categories needed for initial workflows are defined here.

| Category | Meaning | Mobile Pilot 1 posture |
| --- | --- | --- |
| Crop / planting | Crop production associated with a location | Crop/crop name is needed for harvest records; planting/transplanting records are candidate later workflows |
| Material / input | Consumable or usable supply | Record material use and count remaining amount; supply-need records are candidate later workflows |
| Equipment | Tool or machine whose condition may be noted | Candidate later equipment issue workflow, not Mobile Pilot 1 |
| Countable item | Repeated standardized item tracked by count | Record manual inventory counts; photo-count experiment is Mobile Pilot 2 |

These categories may share some later implementation mechanics, but they are not to be collapsed into one generic user-facing object in this document.

## Planting Concept

A planting is a crop or crop variety associated with a growing location and relevant time period.

The broader standalone mobile pilot may later support enough meaning to record:

- That a crop was planted or transplanted.
- Where it is growing.
- That harvest occurred from that location or planting.

Deferred concepts:

- Succession planning.
- Planting schedules.
- Yield forecasting.
- Seed-lot traceability.
- Crop rotations.
- Detailed harvest-lot traceability.
- Regulatory traceability.

## Material/Input Concept

Materials are farm supplies that may be used, counted, and potentially sourced.

Examples include:

- Potting mix.
- Feed.
- Row cover.
- Seed.
- Soil amendment.
- Packaging.
- Irrigation fittings.

A material record should make it possible at the product level to associate:

- A recognizable item name.
- Relevant unit or units.
- Quantity observations or use activities.
- An optional private supply need.

This document does not define costing, purchasing, vendor contracts, orders, or accounting.

## Equipment Concept

Equipment is defined minimally to support condition or maintenance-needed observations.

Examples include:

- Tiller.
- Tractor.
- Seeder.
- Wash station tool.
- Irrigation pump.

Equipment issue recording is a candidate later standalone-mobile workflow. It should not expand into maintenance scheduling, parts inventory, telematics, or repair workflow management.

## Countable Item Concept

Countable items are standardized items whose count may matter operationally.

Examples include:

- Seedling flats.
- Harvest crates.
- Trays.
- Possibly bags of a standardized material.

This concept supports manual inventory counts in Mobile Pilot 1 and the later constrained photo-count experiment in Mobile Pilot 2, but does not imply that the system can identify or count arbitrary objects.

## Explicit Non-Goals

This domain foundation does not define:

- Livestock treatment or health records.
- Customer, sales, payment, or order domains.
- Accounting.
- Regulatory compliance.
- Broad equipment maintenance system.
- Detailed crop planning.
- Generalized marketplace.
- Arbitrary visual asset recognition.
- Technical storage or database shapes.
