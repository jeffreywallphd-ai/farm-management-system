# ADR-0001: Offline-First Field Operation Is Foundational

- Status: accepted
- Date: 2026-05-28
- Last reviewed: 2026-05-28
- Deciders: project owner and contributors
- Canonical for: offline-capable mobile field recording as a foundational product-technical constraint
- Related docs: [Initial Vertical Slice](../product/initial-vertical-slice.md), [Field Workflows](../product/field-workflows.md), [Offline-First Mobile Architecture](../architecture/offline-first-mobile-architecture.md), [Synchronization Architecture](../architecture/synchronization-architecture.md), [Server and Deployment Operating Model](../architecture/server-and-deployment-operating-model.md)
- Supersedes: none
- Superseded by: none

## Context

Farm work often happens in fields, barns, greenhouses, tunnels, storage areas, and wash/pack spaces where reception or server access may be weak or unavailable. The product's first vertical slice is built around recording work close to the moment it happens.

If supported field recording depends on live network access, workers will either delay entry, reconstruct details from memory, or stop trusting the tool.

## Decision

Supported first-slice private operational recording must function without live network access or server reachability.

A worker must be able to create and locally retain supported confirmed operational records offline. Synchronization occurs later when an appropriate configured server connection becomes available. Deployment mode does not remove this requirement.

Network-dependent shared publication and coordination features must distinguish local pending actions from synchronized external visibility.

## Rationale

Offline operation is central to the product's value, not an optional enhancement. Delayed recording increases burden and the risk of inaccurate farm history. Local/hosted/cooperative deployment choices should not weaken the core field workflow.

## Alternatives Considered

### Alternative: Require Server Connectivity for Confirmed Records

- Benefits: simpler server-authoritative implementation model.
- Drawbacks: fails in common farm environments and makes field recording unreliable.
- Reason not selected: contradicts the product's field-first purpose.

### Alternative: Cache Screens but Require Later Re-Entry

- Benefits: lighter local persistence requirements.
- Drawbacks: does not safely retain user work and creates duplicate effort.
- Reason not selected: offline-first means retained work, not just cached interface state.

## Consequences

### Positive

- Workers can record supported private work where it happens.
- Deployment modes remain compatible with weak connectivity.
- Offline retention and synchronization become first-class architecture concerns.

### Negative / Tradeoffs

- Mobile persistence, sync status, retry, and recovery behavior become required from early implementation.
- Some externally visible actions cannot be completed globally while offline.

### Risks and Mitigations

- Risk: users may confuse locally saved work with synchronized/shared work.
- Mitigation: later UI and tests must clearly distinguish saved locally, awaiting synchronization, synchronized, and published/shared states.

## Validation and Revisit Conditions

This decision should only be revisited if product scope stops serving field recording use cases. Farmer validation may refine which workflows must work offline, but supported private field recording remains foundational.

## Documentation and Test Impact

Product, architecture, and operations docs must preserve this decision. Future tests must cover offline record creation, local retention through restart, retry after reconnect, and server-unavailable scenarios.

This ADR does not decide mobile framework, local database, sync technology, server technology, or background synchronization mechanism.
