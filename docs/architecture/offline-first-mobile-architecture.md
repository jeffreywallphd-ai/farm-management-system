# Offline-First Mobile Architecture

- Status: accepted
- Last reviewed: 2026-05-28
- Canonical for: standalone mobile pilot offline behavior, local retained work, draft lifecycle, local saved-state boundaries, and future-sync compatibility
- Related ADRs: [ADR-0001](../adr/ADR-0001-offline-first-field-operation.md), [ADR-0002](../adr/ADR-0002-history-preserving-idempotent-synchronization.md), [ADR-0007](../adr/ADR-0007-standalone-mobile-pilot-before-server-connected-features.md)
- Related docs: [System Overview](system-overview.md), [Synchronization Architecture](synchronization-architecture.md), [Persistence and Attachment Storage](persistence-and-attachment-storage.md), [AI-Assisted Capture Boundaries](ai-assisted-capture-boundaries.md), [Identity, Privacy, and Sharing](identity-privacy-and-sharing.md), [Server and Deployment Operating Model](server-and-deployment-operating-model.md), [Initial Vertical Slice](../product/initial-vertical-slice.md), [Field Workflows](../product/field-workflows.md), [Operational Event Catalog](../domain/operational-event-catalog.md)
- Related tests: not yet implemented
- Supersedes: none

## Purpose

This document defines what offline-first means for the standalone mobile pilot and what local architecture responsibilities must be preserved before server-connected features exist.

It defines behavior and boundaries. It does not choose a mobile framework, local database technology, export format, synchronization technology, or server design.

## Why Offline-First Is Required Now

Farms may have fields, barns, tunnels, greenhouses, and storage areas without reliable reception. Recording should happen close to the work, not later from memory.

The first pilot must work without a live server. A worker must be able to record supported activities and observations locally, review local history, and understand that the data is stored on the device unless exported/backed up.

## Definition of Offline Capability for the Standalone Pilot

| Workflow | Must work offline? | Pilot result |
| --- | ---: | --- |
| Create minimal local farm setup/reference information | Yes | Farm context available on device |
| Review locally stored locations/tracked items | Yes | Worker can choose local context |
| Record planting/transplanting | Yes | Confirmed record retained locally |
| Record harvest | Yes | Confirmed record retained locally |
| Record material use | Yes | Confirmed record retained locally |
| Record item movement | Yes | Confirmed record retained locally |
| Record inventory count | Yes | Confirmed observation retained locally |
| Record equipment issue | Yes | Confirmed observation retained locally |
| Record private supply need, if scoped | Yes | Private local discovery note retained |
| Review local activity history | Yes | Locally retained records are understandable |
| Export/back up pilot data | Required before meaningful reliance | User-controlled data retrieval/backup |
| Use voice-to-draft experiment | Pilot experiment where feasible | Draft retained locally until confirmed or discarded |
| Use photo-count-to-draft experiment | Pilot experiment where feasible | Draft/photo retained locally until confirmed or discarded |
| Synchronize to server | No | Deferred future behavior |
| Publish listing externally | No | Deferred future behavior |

## Local Mobile Responsibilities

The mobile pilot must be capable of retaining:

- Local farm/reference context for supported entry.
- Locally confirmed operational records.
- Local activity history.
- User corrections or follow-up records where supported.
- Drafts from AI-assisted capture.
- Source captures and provenance retained according to pilot policy.
- Export/backup state or guidance where relevant.
- User-visible local saved/failure state.

The pilot should not present server synchronization state when no server exists. It should instead communicate local saved state, local history availability, and export/backup status or risk where relevant.

## Local Confirmed Record Lifecycle

```text
Entry started
-> User completes or confirms record
-> Record retained locally as a confirmed operational record
-> Record appears in local activity history
-> Record is included in export/backup according to pilot policy
```

A private operational record is validly captured for the user once locally confirmed and retained. Future server acceptance is not part of the standalone pilot.

## Draft Lifecycle

```text
Capture initiated
-> Draft interpretation created or pending
-> User reviews
-> User confirms, edits and confirms, or discards
-> Confirmed farm record enters local confirmed-record lifecycle
```

Unconfirmed drafts must not alter local activity history or inventory interpretation. Attachments/source captures may have separate retention/export/backup treatment. Detailed provenance and AI inference requirements are defined in [AI-Assisted Capture Boundaries](ai-assisted-capture-boundaries.md).

## Future Synchronization Compatibility

The pilot must not implement synchronization merely because local records are designed with future synchronization in mind.

Local design should preserve:

- Stable local record identity or an equivalent future-map-able identity concept.
- Timestamps/effective dates.
- Farm/location/item references.
- Quantity and unit meaning.
- Draft versus confirmed state.
- Provenance and source-capture association where retained.
- Privacy/visibility classification.
- Correction/discrepancy meaning.

These constraints reduce later sync risk but do not authorize server APIs, outbox/inbox implementation, server acceptance, cross-device distribution, or publication state in the pilot.

## Offline Limitations That Must Be Communicated Honestly

- Local records are stored on the device unless exported/backed up.
- A lost device, app uninstall, failed update, or test build replacement may risk data if export/backup is not used.
- Other devices will not see local records because multi-device synchronization is deferred.
- No nearby farm can see a private supply need because in-product publication is deferred.
- Voice/photo interpretation may be limited by the pilot's selected AI approach; manual entry must remain available.
- Future server-dependent content may not be current or available until server-connected scope exists.

## Usability Implications to Preserve

Later UI work must preserve these implications:

- Local saved state must be understandable.
- Offline recording should not force repeated network-error interruptions.
- Users should not have to understand synchronization internals to record normal pilot work.
- Export/backup availability and limitations must be understandable before meaningful reliance.
- Long offline periods must not make the application appear broken merely because server-dependent features are not part of the pilot.
