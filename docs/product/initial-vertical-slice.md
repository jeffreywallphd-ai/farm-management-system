# Initial Vertical Slice

- Status: accepted
- Last reviewed: 2026-05-30
- Canonical for: accepted standalone mobile pilot target, included pilot capabilities, pilot non-goals, and validation goals
- Related ADRs: [ADR-0001](../adr/ADR-0001-offline-first-field-operation.md), [ADR-0003](../adr/ADR-0003-ai-interpretations-require-confirmation.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [ADR-0005](../adr/ADR-0005-data-portability-and-recoverability.md), [ADR-0007](../adr/ADR-0007-standalone-mobile-pilot-before-server-connected-features.md), [ADR-0008](../adr/ADR-0008-mobile-pilot-1-application-stack.md), [ADR-0009](../adr/ADR-0009-mobile-pilot-1-local-persistence.md), [ADR-0010](../adr/ADR-0010-mobile-pilot-1-export-and-recovery-copy.md), [ADR-0011](../adr/ADR-0011-mobile-pilot-1-runtime-boundary-validation.md)
- Related docs: [Product Vision and Scope](product-vision-and-scope.md), [Mobile Pilot 1 Implementation Scope](mobile-pilot-1-implementation-scope.md), [Field Workflows](field-workflows.md), [User Research and Validation](user-research-and-validation.md), [AI-Assisted Capture Validation Plan](ai-assisted-capture-validation-plan.md), [Local Coordination and Sharing Validation Plan](local-coordination-and-sharing-validation-plan.md), [Deployment and Data-Control Validation Plan](deployment-and-data-control-validation-plan.md), [Roadmap](roadmap.md), [Mobile Pilot 1 Operational Records](../domain/mobile-pilot-1-operational-records.md), [Mobile Pilot Data-Safety Requirements](../operations/mobile-pilot-data-safety-requirements.md)
- Related tests: not yet implemented
- Supersedes: none

## First-Slice Statement

The first vertical slice is a standalone offline-first mobile pilot that farmers can download and use during real work for customer discovery and workflow validation.

The broader standalone mobile pilot program supports a single-farm, device-local operating context; minimal local setup; narrowly scoped manual operational records; local activity history; understandable local saved state; later constrained voice/photo draft experiments; and practical export/backup before farmers rely on the pilot for meaningful operational data.

ADR-0012 revises the next farmer-shareable pilot emphasis: the first differentiated test should be voice/photo farm-event capture, not more form-heavy recordkeeping. Manual records remain implemented foundation, while local voice memos, optional photos, light context, timeline review, and recovery export become the next standalone mobile pilot focus.

The pilot must remain compatible with later server connection, but it does not implement server synchronization, multi-device coordination, hosted/local/cooperative server operation, in-product shared listing publication, listing responses, or broader network functionality.

## Mobile Pilot 1 Exact Implementation Scope

[Mobile Pilot 1](mobile-pilot-1-implementation-scope.md) is the first buildable increment of this broader standalone mobile pilot program.

Mobile Pilot 1 includes only:

- Manual `HarvestRecorded`.
- Manual `MaterialUseRecorded`.
- Manual `InventoryCountRecorded`.
- Minimal local setup/reference information needed for those records.
- Local activity history, clear device-local saved state, offline retention, and practical export/backup.

The accepted record meanings are defined in [Mobile Pilot 1 Operational Records](../domain/mobile-pilot-1-operational-records.md). The accepted pilot data-safety requirements are defined in [Mobile Pilot Data-Safety Requirements](../operations/mobile-pilot-data-safety-requirements.md).

AI interpretation of voice/photo capture, private supply-need notes, planting/transplanting, item movement, equipment issues, and server-connected features are not Mobile Pilot 1 implementation scope unless later canonical documents intentionally authorize a later increment. Local voice memo and optional photo farm-event capture are now accepted next scope under ADR-0012, without AI transcription or photo inference.

## What the Pilot Proves

- Farmers can record useful activity in the moment with less friction than a form-heavy workflow.
- Offline field capture and local retention are core product requirements.
- Local activity history is understandable and useful without a server.
- Constrained AI-assisted drafts can be evaluated without granting AI operational authority.
- Practical export/backup is necessary before mobile-only pilot data becomes meaningful to farmers.
- Private internal supply-need notes, if scoped, help test whether later sourcing/coordination deserves priority.
- Future server-connected functionality should be based on evidence gathered from the mobile pilot.

## Included Pilot Capabilities

### A. Mobile-Only Farm Context

The pilot includes:

- A single-farm device-local operating context.
- Minimal local farm setup.
- Basic farm locations such as field, bed, greenhouse, tunnel, barn, storage area, or wash/pack area.
- Basic tracked items sufficient for scoped workflows: selected crops, materials, equipment, or countable items.

This slice does not design account systems, multi-device membership, or final identity architecture.

### B. Manual Activity and Observation Recording

Mobile Pilot 1 includes the smallest accepted manual record set:

- Harvest record.
- Material-use record.
- Inventory observation/count.

Candidate later standalone workflows include planting/transplanting, movement, equipment issue or maintenance-needed note, and private internal supply-need note. They must not be implemented as Mobile Pilot 1 scope without a product-scope update or later increment authorization.

### C. Local Activity History and Saved State

The pilot includes:

- Review of recent locally recorded activities and observations.
- Practical review by item or location where useful and simple.
- Clear indication that records are stored locally on the device.
- Clear distinction between confirmed local records and unconfirmed drafts.

The standalone pilot does not show server synchronization state because no server is implemented. Future server-enabled versions may introduce awaiting synchronization, synchronized, rejected, and attention-required states.

### D. Offline Local Retention

The pilot includes:

- Field recording without live reception or server connectivity.
- Local retention of confirmed records appropriate to the pilot.
- Recovery from ordinary app interruption/restart without silent loss where durability is claimed.
- Local data boundaries that do not make later synchronization unnecessarily difficult.

This document does not choose mobile persistence technology, identifier implementation, or record storage format.

### E. Practical Export/Backup

Before farmers rely on the pilot for meaningful operational records, the pilot must provide a practical export/backup pathway.

The farmer must be able to understand:

- What records are included.
- Whether local setup/reference information is included.
- Whether source photos, audio, provenance, and drafts are included or excluded.
- What risks remain if a device is lost, the app is uninstalled, a test build is replaced, or an update fails.

This document does not choose export file format, backup mechanism, restore workflow, encryption mechanism, or cloud/local storage provider.

### F. Voice/Photo Farm-Event Capture

The next farmer-shareable pilot should include local farm-event capture:

- User initiates a quick farm note.
- User records a voice memo.
- User may attach one or more related photos.
- User may add light context such as place, event type, or text note.
- The event is saved locally and privately.
- The event appears in a local timeline.
- The recovery export includes metadata and retained media.

This capture workflow does not transcribe, infer, count, recommend, or create structured operational records automatically.

Open-ended voice assistants, automatic recommendations, and autonomous farm actions are not included.

### G. Later Assisted Interpretation Experiments

Mobile Pilot 2 may later include constrained voice-to-draft, transcription, structured extraction, or photo-count experiments if capture-first evidence supports them.

Required product behavior:

- System output remains a draft.
- User confirms, edits and confirms, or rejects the draft.
- Only confirmed information becomes an operational record.
- Manual counting/entry remains available.

Arbitrary object recognition, plant-disease diagnosis, weed detection, yield prediction, and autonomous inventory adjustment are not included.

### H. Private Supply-Need Discovery

A later standalone mobile pilot increment may allow a farmer to record a private internal supply need if this helps discovery.

Rules:

- The need remains device-local and private in the pilot.
- It is not a shared listing.
- It is not published through the platform.
- It may help validate whether server-connected sourcing should be prioritized later.

## Explicitly Deferred From the Pilot

The following are outside the standalone mobile pilot:

- Configured server synchronization.
- Server acceptance or synchronization status.
- Multi-device farm access.
- Hosted, local, cooperative, or private-cloud server implementation.
- In-product need-listing publication.
- Listing responses or farmer-to-farmer communication through the application.
- External sharing audiences.
- Server-based backup/recovery.
- Public marketplace features.
- General social networking.
- Payments, orders, accounting, payroll, or ecommerce.
- Regulatory/compliance reporting.
- Disease diagnosis, treatment recommendations, or broad agronomic advice.
- Autonomous AI-created operational records.
- Broad computer vision.
- Server federation.
- Generalized workflow engines or premature microservices.

A deferred capability may later become important, but it must not be pulled into the pilot without intentional product-scope and ADR review.

## Future-Server Extensibility Requirement

The pilot should not be a throwaway data model. Local record identity, timestamps, quantities, units, locations/items, provenance, privacy classification, and correction/discrepancy meaning should be represented so later synchronization is feasible.

This is a design constraint, not authorization to implement synchronization, server APIs, server storage, multi-device behavior, or publication.

## Pilot Success Criteria

- A farmer or worker can record selected activities during real work without live connectivity.
- Locally saved records remain understandable and available on the device.
- Users understand that pilot records are local to the device unless exported/backed up.
- Export/backup is practical enough before meaningful farmer reliance.
- Voice capture reduces entry friction without undermining trust, or is rejected based on evidence.
- Photo counting is useful within the constrained case, or is rejected based on evidence.
- Private supply-need capture, if included, helps determine whether later sourcing coordination is worth building.
- The pilot generates feedback sufficient to refine product scope, domain rules, and later architecture decisions.

## Product Questions This Pilot Should Validate

- Which activity types are frequent enough to deserve first-class support?
- Which fields are necessary during real work and which can be optional or deferred?
- Whether local history helps farmers understand recent work.
- Whether farmers understand local saved state and export/backup responsibilities.
- Whether voice drafts save time compared with manual entry.
- Whether photo counting works for constrained item types in real farm lighting, clutter, and movement.
- Whether farmers want future sharing of needs/offers with trusted local contacts.
- What future server, synchronization, hosting, or local-network capabilities are justified by evidence.

## Decisions Intentionally Deferred

ADR-0008 through ADR-0011 now decide the Mobile Pilot 1 app stack, local persistence, export/recovery-copy mechanism, and runtime boundary validation. This product document still does not decide:

- Final technical stack beyond Mobile Pilot 1.
- AI runtime or model.
- Server language.
- Server database or storage.
- Offline synchronization technology.
- Data model or event schema.
- Hosting packaging.
- Authentication or authorization mechanism.
- Payment or business model.
- Final public/private sharing system.
