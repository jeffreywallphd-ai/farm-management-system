# Offline-First Mobile Architecture

- Status: proposed
- Last reviewed: 2026-05-28
- Canonical for: mobile offline behavior, local retained work, draft lifecycle, and offline user-facing boundaries
- Related ADRs: [ADR-0001](../adr/ADR-0001-offline-first-field-operation.md), [ADR-0002](../adr/ADR-0002-history-preserving-idempotent-synchronization.md)
- Related docs: [System Overview](system-overview.md), [Synchronization Architecture](synchronization-architecture.md), [Persistence and Attachment Storage](persistence-and-attachment-storage.md), [AI-Assisted Capture Boundaries](ai-assisted-capture-boundaries.md), [Identity, Privacy, and Sharing](identity-privacy-and-sharing.md), [Server and Deployment Operating Model](server-and-deployment-operating-model.md), [Initial Vertical Slice](../product/initial-vertical-slice.md), [Field Workflows](../product/field-workflows.md), [Operational Event Catalog](../domain/operational-event-catalog.md)
- Related tests: not yet implemented
- Supersedes: none

## Purpose

This document defines what offline-first means for the mobile field experience and what architectural responsibilities the mobile side must eventually fulfill.

It defines behavior and boundaries. It does not choose a mobile framework or local database technology.

## Why Offline-First Is a Core Architecture Requirement

Farms may have fields, barns, tunnels, greenhouses, and storage areas without reliable reception. Recording should happen close to the work, not later from memory.

If a worker cannot record a harvest, material use, movement, count, equipment issue, or supply need while disconnected, the product fails its first-slice purpose. Sourcing publication may wait for connectivity, but private operational capture must not. This remains true whether the configured server is hosted, local, cooperative, private-cloud, or technically self-hosted.

The product workflows that drive this requirement are defined in [Field Workflows](../product/field-workflows.md) and [Initial Vertical Slice](../product/initial-vertical-slice.md).

## Definition of Offline Capability for Release 1

| Workflow | Must work offline? | Offline result |
| --- | ---: | --- |
| Review sufficient known farm locations/tracked items for new entry | Yes | Worker can choose relevant known context locally |
| Record planting/transplanting | Yes | Confirmed record retained locally |
| Record harvest | Yes | Confirmed record retained locally |
| Record material use | Yes | Confirmed record retained locally |
| Record item movement | Yes | Confirmed record retained locally |
| Record inventory count | Yes | Confirmed observation retained locally |
| Record equipment issue | Yes | Confirmed observation retained locally |
| Recognize private supply need | Yes | Private record retained locally |
| Create a shared need-listing draft | Yes/proposed | Pending publication stored locally |
| Make a listing externally visible | Not necessarily | Requires synchronization/acceptance unless later architecture proves otherwise |
| Use voice-to-draft experiment | Intended where feasible; AI-assisted capture docs define details | Draft retained locally until confirmed or discarded |
| Use photo-count-to-draft experiment | Intended where feasible; AI-assisted capture docs define details | Draft/photo retained locally until confirmed or discarded |

The canonical product documents require review and confirmation for voice/photo experiments, but they defer detailed offline processing expectations. [AI-Assisted Capture Boundaries](ai-assisted-capture-boundaries.md) documents the open decision: first-release interpretation may need to run fully offline, or offline capture may wait for later interpretation if farmer validation supports that limitation. Private manual operational recording remains offline-required regardless.

## Local Mobile Responsibilities

The mobile client must eventually be capable of retaining:

- Enough locally available farm/reference context for supported field entry.
- Locally confirmed operational records.
- Unsynchronized record state.
- User corrections or related follow-up records when allowed by later design.
- Drafts from future AI-assisted capture.
- Pending attachments required for first-slice workflows.
- Synchronization cursors/status/outcomes or equivalent bookkeeping.
- User-visible failure/attention status.

## Local-First Read Behavior

First-slice mobile workflows should read from local retained data during field work rather than require a server fetch for each interaction.

Synchronization updates local available context when connectivity permits. Offline field recording operates against locally available context. Stale reference context must be visible or bounded where it could matter later, and the product must not falsely imply that network-visible information is current when the device is offline.

Cached shared-listing information may also be stale while offline. A locally prepared shared-listing draft or publication request must remain visibly pending until synchronization and publication acceptance succeed.

This document does not prescribe client-state libraries or database technologies.

## Local Confirmed Record Lifecycle

```text
Entry started
-> User completes or confirms record
-> Record retained locally as confirmed operational record
-> Record marked awaiting synchronization
-> Submission attempted when connectivity permits
-> Server accepts, rejects, or requires attention
-> Mobile retains visible synchronization outcome
```

A private operational record is validly captured for the user once locally confirmed and retained, even before synchronization. Server acceptance is still required for shared/multi-device authoritative synchronization.

Rejected or attention-required records must not disappear silently.

## Draft Lifecycle

```text
Capture initiated
-> Draft interpretation created or pending
-> User reviews
-> User confirms, edits and confirms, or discards
-> Confirmed farm record enters local operational-record lifecycle
```

Unconfirmed drafts must not alter activity history or inventory interpretation. Attachments may have separate retained/pending-transfer status. Detailed provenance and AI inference requirements are defined in [AI-Assisted Capture Boundaries](ai-assisted-capture-boundaries.md).

## Offline Limitations That Must Be Communicated Honestly

Offline-first does not mean every system action can be completed globally while disconnected.

- A local private activity can be retained offline.
- A shared listing may be prepared offline but not visible to others until sync succeeds.
- Another device's newest records may not be visible until synchronization occurs.
- Network messages or responses may be unavailable while disconnected.
- A worker may see expected inventory that does not yet incorporate unsynchronized records on another device.
- Scarce-resource commitments should not be represented as confirmed across farms until validated by the shared server boundary.
- Local server reachability may improve synchronization opportunities later, but it does not remove the local-retention requirement.

## Usability Implications to Preserve

Later standards and UI work must preserve these implications:

- Synchronization status must be understandable, not hidden.
- Offline recording should not force repeated network-error interruptions.
- Users should not have to understand synchronization internals to record normal work.
- Records requiring attention should be surfaced separately from ordinary successful background synchronization.
- Long offline periods must not make the application appear broken merely because network-dependent features are unavailable.
