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

## Locations

A location is a farmer-defined named place relevant to activities, observations, or tracked items. Examples include:

- North Field.
- Bed 4.
- Greenhouse 1.
- High Tunnel 2.
- Barn.
- Input Storage.
- Wash/Pack Area.

Practical location rules:

- A location may be nested or related to another location, such as a bed within a field.
- The first slice should not require mapping every location geometrically.
- Geographic mapping may be useful later but is not required by this domain prompt.
- A farmer should be able to use terminology matching their operation.

## Tracked Item Categories

Only the categories needed for initial workflows are defined here.

| Category | Meaning | First-slice example uses |
| --- | --- | --- |
| Crop / planting | Crop production associated with a location | Record planting/transplanting and harvest |
| Material / input | Consumable or usable supply | Record use, count remaining amount, create supply need |
| Equipment | Tool or machine whose condition may be noted | Record issue or maintenance-needed observation |
| Countable item | Repeated standardized item tracked by count | Record seedling-flat or harvest-crate count; photo-count experiment |

These categories may share some later implementation mechanics, but they are not to be collapsed into one generic user-facing object in this document.

## Planting Concept

A planting is a crop or crop variety associated with a growing location and relevant time period.

The first slice should support enough meaning to record:

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

The first slice may permit recording that an equipment issue exists, but should not expand into maintenance scheduling, parts inventory, telematics, or repair workflow management.

## Countable Item Concept

Countable items are standardized items whose count may matter operationally.

Examples include:

- Seedling flats.
- Harvest crates.
- Trays.
- Possibly bags of a standardized material.

This concept supports the constrained photo-count experiment, but does not imply that the system can identify or count arbitrary objects.

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
