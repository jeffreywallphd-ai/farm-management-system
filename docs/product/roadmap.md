# Roadmap

- Status: accepted
- Last reviewed: 2026-05-28
- Canonical for: product sequencing, conditional expansion gates, and corrected standalone mobile pilot order
- Related ADRs: [ADR-0001](../adr/ADR-0001-offline-first-field-operation.md), [ADR-0003](../adr/ADR-0003-ai-interpretations-require-confirmation.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [ADR-0005](../adr/ADR-0005-data-portability-and-recoverability.md), [ADR-0007](../adr/ADR-0007-standalone-mobile-pilot-before-server-connected-features.md), [ADR-0012](../adr/ADR-0012-voice-photo-first-farm-event-capture-pilot.md)
- Related docs: [Product Vision and Scope](product-vision-and-scope.md), [Initial Vertical Slice](initial-vertical-slice.md), [Mobile Pilot 1 Implementation Scope](mobile-pilot-1-implementation-scope.md), [Field Workflows](field-workflows.md), [User Research and Validation](user-research-and-validation.md), [AI-Assisted Capture Validation Plan](ai-assisted-capture-validation-plan.md), [Local Coordination and Sharing Validation Plan](local-coordination-and-sharing-validation-plan.md), [Deployment and Data-Control Validation Plan](deployment-and-data-control-validation-plan.md)
- Related tests: not yet implemented
- Supersedes: none

## Roadmap Posture

This roadmap sequences learning and implementation. It is not a promise that every later phase will ship.

Server-connected functionality remains a motivating future direction, but the accepted first implementation target is the standalone offline-first mobile pilot defined by [ADR-0007](../adr/ADR-0007-standalone-mobile-pilot-before-server-connected-features.md). [ADR-0012](../adr/ADR-0012-voice-photo-first-farm-event-capture-pilot.md) now refines the next farmer-shareable version of that pilot: voice/photo-first farm-event capture should be tested before investing further in form-heavy recordkeeping, AI interpretation, or server-connected features.

## Sequenced Phases

| Phase | Primary purpose | Implementation posture |
| --- | --- | --- |
| Documentation foundation and correction | Establish implementation-safe product, domain, architecture, operations, ADR, standards, and context guidance | Current foundation work |
| Mobile Pilot 1A | Manual harvest, material use, inventory count, minimal local farm setup, local history, local persistence, clear local saved state, export/backup | Core manual implementation complete; retained as foundation |
| Mobile Pilot 1B | Voice memo and optional photo farm-event capture, light context, local timeline, recovery package with media | Accepted next farmer-shareable differentiator; implement without AI interpretation or server features |
| Mobile Pilot 2 | Constrained transcription, structured extraction, or photo-count draft experiments based on Pilot 1B evidence | Implement only within draft-confirm boundaries after later scope/ADR review |
| Farmer discovery period | Use real pilot feedback to refine workflows and determine next priorities | Evidence-gathering gate |
| Server decision phase | Decide synchronization, hosting/local operation, coordination, and deployment priorities based on evidence | ADR/product updates required before implementation |
| Server-connected expansion, if justified | Multi-device sync, intentional shared need listings, controlled communication, hosted/local/cooperative deployment modes | Conditional future work |

## Mobile Pilot 1A: Manual Offline Recording Foundation

The implemented manual core remains part of [Mobile Pilot 1](mobile-pilot-1-implementation-scope.md). It is useful foundation, but it is no longer the primary farmer-test differentiator.

Focus:

- Device-local mobile use during real farm work.
- Basic local farm setup.
- Manual `HarvestRecorded`, `MaterialUseRecorded`, and `InventoryCountRecorded`.
- Local activity history.
- Local durable retention appropriate to the pilot.
- Clear local saved state.
- Practical export/backup before meaningful farmer reliance.

Do not include planting/transplanting, item movement, equipment issue, private supply-need note, AI-assisted capture, server synchronization, shared publication, multi-device access, or server deployment unless later scope is accepted.

## Mobile Pilot 1B: Voice/Photo-First Farm Event Capture

[ADR-0012](../adr/ADR-0012-voice-photo-first-farm-event-capture-pilot.md) accepts the next standalone farmer-test direction.

Focus:

- One primary capture action: record a farm note.
- Local voice memo capture.
- Optional related photos.
- Optional light context, such as farm place, event type, and note text.
- Local event timeline and detail review.
- User-controlled recovery package containing metadata plus retained audio/photo files.

Do not include AI transcription, computer vision, automatic structured-record creation, server upload, synchronization, shared listings, authentication, cloud backup, analytics, or distribution configuration in this phase.

## Mobile Pilot 2: Constrained Assisted Interpretation

Focus:

- One voice-to-draft or transcription workflow only after farmers use the capture-first pilot.
- One photo-count-to-draft workflow for a constrained item class only if capture-first evidence supports it.
- Explicit review, correction, confirmation, and rejection.
- Manual alternatives.
- Privacy and retention expectations for source captures.

Do not include autonomous AI records, broad computer vision, disease/treatment advice, model-training assumptions, or AI-selected publication.

## Farmer Discovery Period

Use pilot learning to answer:

- Which manual workflows deserve first-class support?
- Which fields are essential during real work?
- Whether local history and export/backup build trust.
- Whether voice/photo assistance reduces real burden.
- Whether farmers want future sourcing/coordination functionality.
- What server, synchronization, hosting, local operation, or network capabilities are justified.

## Server Decision Phase

Before building server-connected scope, the project should decide through product/ADR work:

- Whether server synchronization should be implemented next.
- Whether multi-device farm access is required.
- Whether hosted, local, cooperative, or technical self-hosted operation should be prioritized.
- Whether in-product need-listing publication is valuable enough to implement.
- Whether responses, contact workflows, or messaging are required.
- How export/backup/restore expectations change when a server exists.

## Conditional Server-Connected Expansion

If justified by evidence and accepted decisions, later expansion may include:

- Multi-device synchronization.
- Server-backed farm administration.
- Intentional shared need listings.
- Controlled responses or contact workflows.
- Hosted service, simplified local server, technical self-hosting, or cooperative/private-cloud operation.
- Broader backup, restore, migration, and recovery pathways.

These are not automatically next. Each must remain consistent with ADR-0001 through ADR-0007, the decision-readiness register, and updated product validation.

## Explicitly Deferred or Excluded Areas

- Public marketplace.
- Payments, orders, ecommerce, accounting, payroll.
- Broad social networking.
- Regulatory/compliance system.
- Disease diagnosis and treatment recommendations.
- Autonomous AI farm decisions.
- Arbitrary object recognition.
- Server federation.
- Generalized workflow engine or premature microservices.

Future interest in these areas requires product validation and likely ADR work before implementation.
