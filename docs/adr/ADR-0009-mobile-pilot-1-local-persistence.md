# ADR-0009: Mobile Pilot 1 Local Persistence

- Status: accepted
- Date: 2026-05-28
- Last reviewed: 2026-05-28
- Deciders: project owner and contributors
- Canonical for: Mobile Pilot 1 device-local persistence technology and persistence boundary style
- Related docs: [Mobile Pilot 1 Implementation Scope](../product/mobile-pilot-1-implementation-scope.md), [Mobile Pilot 1 Operational Records](../domain/mobile-pilot-1-operational-records.md), [Offline-First Mobile Architecture](../architecture/offline-first-mobile-architecture.md), [Persistence and Attachment Storage](../architecture/persistence-and-attachment-storage.md), [Mobile Pilot Data-Safety Requirements](../operations/mobile-pilot-data-safety-requirements.md), [Decision Readiness Register](decision-readiness-register.md)
- Supersedes: none
- Superseded by: none

## Context

Mobile Pilot 1 must retain confirmed records locally on the device and preserve enough record meaning for local history, export/recovery copy, and future server compatibility.

The current pilot does not implement server synchronization, cross-device behavior, or a server-side database.

## Decision

Use `expo-sqlite` for device-local persistence in Mobile Pilot 1.

Access SQLite through local persistence adapters and repositories, not directly from UI components.

Use small hand-written, versioned SQLite migrations for Mobile Pilot 1.

Do not introduce an ORM in Mobile Pilot 1 unless a later ADR supersedes this decision.

Store stable locally created IDs and schema/export versioning so future server synchronization is not unnecessarily obstructed.

Do not implement synchronization, outbox behavior, server acceptance, server APIs, or cross-device behavior as part of this decision.

## Rationale

SQLite fits related local farm records, reference information, quantities, and history.

Direct SQLite access keeps the first pilot simple and avoids adopting a broad data framework before the domain is validated.

Repository and adapter boundaries prevent database tables from becoming the domain model and keep UI code separate from persistence details.

Future synchronization compatibility requires stable IDs and clear record semantics, but building synchronization now would violate Mobile Pilot 1 scope.

## Alternatives Considered

### Alternative: Async Key-Value Storage

- Benefits: simple setup and small API surface.
- Drawbacks: weaker fit for related records, local history queries, and future export/migration needs.
- Reason not selected: Mobile Pilot 1 records have relationships among farm setup, locations, tracked items, and operational records.

### Alternative: ORM

- Benefits: higher-level querying and schema abstractions.
- Drawbacks: adds dependency weight and abstraction before the local model has been validated.
- Reason not selected: direct SQLite through adapters is sufficient for the narrow pilot.

### Alternative: Defer Persistence Technology

- Benefits: preserves optionality.
- Drawbacks: blocks meaningful app structure and implementation planning for local retention.
- Reason not selected: local retention is an accepted Mobile Pilot 1 requirement.

## Consequences

### Positive

- Mobile Pilot 1 has a concrete, offline-capable persistence path.
- Repository boundaries keep persistence replaceable enough for later learning.
- Versioned migrations make local data changes visible and reviewable.

### Negative / Tradeoffs

- The team must maintain hand-written SQL and migrations carefully.
- Without an ORM, some type mapping and query discipline must be implemented directly.

### Risks and Mitigations

- Risk: persistence code may leak into UI components.
- Mitigation: route persistence through application ports and infrastructure adapters.
- Risk: future synchronization needs may be harder if local IDs or histories are poorly shaped.
- Mitigation: preserve stable local IDs, timestamps, privacy classification, and correction/discrepancy meaning from accepted domain docs.

## Validation and Revisit Conditions

Revisit this ADR if Mobile Pilot 1 local queries become too complex for direct SQLite, if migration burden becomes unsafe, or if later server synchronization requires a different local storage strategy.

## Documentation and Test Impact

Documentation and context routing must identify `expo-sqlite`, repository/adapters, hand-written migrations, and no ORM as Mobile Pilot 1 decisions only.

Future implementation must test local retention, restart durability where claimed, migration safety, and export completeness after persistence behavior exists.
