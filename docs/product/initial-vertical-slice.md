# Initial Vertical Slice

- Status: proposed
- Last reviewed: 2026-05-28
- Canonical for: first implementation target, included product capabilities, first-slice non-goals, and validation goals
- Related ADRs: [ADR-0001](../adr/ADR-0001-offline-first-field-operation.md), [ADR-0003](../adr/ADR-0003-ai-interpretations-require-confirmation.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md)
- Related docs: [Product Vision and Scope](product-vision-and-scope.md), [Field Workflows](field-workflows.md), [User Research and Validation](user-research-and-validation.md), [Local Coordination and Sharing Validation Plan](local-coordination-and-sharing-validation-plan.md), [Deployment and Data-Control Validation Plan](deployment-and-data-control-validation-plan.md), [Roadmap](roadmap.md)
- Related tests: not yet implemented
- Supersedes: none

## First-Slice Statement

The first vertical slice is an offline-capable mobile farm activity recorder that allows a single farm and its workers to define basic locations and tracked items, manually record a small set of farm activities, synchronize retained work when connectivity permits, experiment with one voice-to-draft flow and one photo-count-to-draft flow, and convert one low-material observation into an intentionally shared sourcing need.

This slice should be narrow enough to build, test with real users, and revise without committing the repository to a broad farm-management platform.

## What the Slice Proves

- Farm workers can record useful activity in the moment with less friction than a form-heavy workflow.
- Offline field capture is a core product requirement, not a later convenience feature.
- A small set of farmer-facing activity types can guide initial domain modeling.
- Voice and photo assistance can be evaluated as reviewable drafts rather than trusted automation.
- A material shortage can become an intentionally shared sourcing need without exposing private operational records.

## Included Capabilities

### A. Basic Farm Setup

The first slice includes:

- One farm organization or farm account context.
- Worker/member access only to the extent needed for first-slice use.
- Basic farm locations such as field, bed, greenhouse, tunnel, barn, or storage area.
- Basic tracked items sufficient for workflows: selected crops, materials, equipment, or standardized countable items.

This document does not design detailed identity architecture or a generalized asset taxonomy.

### B. Manual Farm Activity Recording

The first slice includes these initial activity categories at the product level:

- Planting or transplanting record.
- Harvest record.
- Material-use record.
- Movement record.
- Inventory observation/count.
- Equipment issue or maintenance-needed note.

A later domain prompt will define precise operational events, vocabulary, and rules.

### C. Activity History

The first slice includes:

- Ability to review recent recorded activities.
- Ability to recognize records awaiting synchronization when offline.
- Ability to review activity associated with a relevant item or location at a practical level.

This document does not define detailed reporting architecture.

### D. Offline Field Behavior

The first slice includes these product requirements:

- Field recording remains usable without live reception.
- Work created offline is retained.
- The user receives understandable synchronization status.
- Reconnecting should allow retained work to be synchronized without requiring re-entry.

This document does not choose synchronization technology, storage design, or conflict algorithm.

The first slice requires an end-to-end synchronization environment for validation, but it does not require production-grade hosted packaging, local-server packaging, cooperative hosting, or private-cloud deployment unless later product scope is revised.

### E. Voice-Assisted Draft Experiment

The first voice proof should be limited to a small number of activity categories, preferably:

- Harvest.
- Material use.
- Movement.

Required product behavior:

- User initiates voice capture.
- System proposes interpreted fields.
- User confirms, edits, or rejects the draft.
- Only confirmed information is treated as an activity record.

Open-ended voice assistants, automatic recommendations, and autonomous farm actions are not included.

### F. Photo-Count Draft Experiment

Candidate item types for initial validation include:

- Seedling flats.
- Harvest crates.
- Stacked bags of a standard material, only if real-world validation supports it.

Required product behavior:

- User chooses the type of item being counted.
- User captures a photo.
- System proposes a count.
- User confirms or corrects the result.
- The confirmed count becomes an observation.

Arbitrary asset recognition, plant-disease diagnosis, weed detection, yield prediction, and autonomous inventory adjustment are not included.

### G. Narrow Local-Sourcing Workflow

The first slice includes:

- A user can turn an observed material shortage or need into a deliberately shared need listing.
- The listing includes only information intentionally provided for sharing.
- Private operational records and total inventory remain private by default.
- Source captures, AI drafts, private attachments, material-use history, and inventory discrepancies are not disclosed automatically.
- A listing created while offline remains pending publication until synchronization and acceptance.
- An initial response/contact mechanism may be minimal.

The first slice does not include a full marketplace, payment system, public ecommerce system, cooperative procurement engine, or general-purpose social platform.

## Explicit Non-Goals for the First Vertical Slice

The following are explicitly deferred:

- Accounting and bookkeeping.
- Payroll.
- Point-of-sale.
- Customer ecommerce.
- Payment handling.
- Regulatory or compliance reporting.
- Full crop planning.
- Full livestock-health or medication tracking.
- Agronomic treatment recommendations.
- Pesticide recommendations.
- Crop-disease diagnosis.
- Autonomous AI-created operational records.
- Broad object recognition.
- Route or logistics optimization.
- Advanced cooperative purchasing.
- Independent-server federation.
- Broad public marketplace features.
- Generalized workflow engines.
- Microservice decomposition or infrastructure complexity unrelated to validating the slice.

A deferred capability may later become important, but it must not be pulled into the first implementation without an intentional product-scope revision.

## First-Slice Success Criteria

- A farmer or worker can record the selected activities with materially less friction than a form-heavy workflow.
- Core recording remains possible without connectivity.
- Users understand what is saved locally and what has synchronized.
- Voice capture reduces entry friction without undermining trust.
- Photo counting is either useful within the constrained case or is rejected early based on real evidence.
- The sourcing workflow helps test whether farms want intentionally shared local material requests tied to their operational needs.
- The first slice generates feedback sufficient to refine domain and architecture decisions.

## Product Questions This Slice Should Validate

- Which activity types are frequent enough to deserve first-class support?
- Which fields are necessary during real work and which can be deferred or optional?
- Whether offline status is understandable to non-technical users.
- Whether voice drafts save time compared with manual entry.
- Whether photo counting works for constrained item types in real farm lighting and clutter.
- Whether farms want to share needs or offers with trusted local contacts.

## Decisions Intentionally Deferred

This product document does not decide:

- Final technical stack.
- Server language.
- Mobile framework.
- Database.
- Offline synchronization technology.
- Data model or event schema.
- Final AI runtime or model.
- Hosting packaging.
- Payment or business model.
- Final public/private sharing system.

These decisions require later architecture work and ADRs where appropriate.
