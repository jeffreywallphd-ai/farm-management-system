# Decision Readiness Register

- Status: proposed
- Last reviewed: 2026-05-28
- Canonical for: current readiness classification of foundational product-technical decisions
- Related ADRs: [ADR-0001](ADR-0001-offline-first-field-operation.md), [ADR-0002](ADR-0002-history-preserving-idempotent-synchronization.md), [ADR-0003](ADR-0003-ai-interpretations-require-confirmation.md), [ADR-0004](ADR-0004-private-by-default-intentional-sharing.md), [ADR-0005](ADR-0005-data-portability-and-recoverability.md), [ADR-0006](ADR-0006-deployment-mode-compatibility.md)
- Related docs: [Documentation Governance](../README.md), [Standards Index](../standards/README.md), [Change Impact Matrix](../standards/change-impact-matrix.md), [Initial Vertical Slice](../product/initial-vertical-slice.md), [Operational Event Catalog](../domain/operational-event-catalog.md), [Offline-First Mobile Architecture](../architecture/offline-first-mobile-architecture.md), [Synchronization Architecture](../architecture/synchronization-architecture.md), [AI-Assisted Capture Boundaries](../architecture/ai-assisted-capture-boundaries.md), [Identity, Privacy, and Sharing](../architecture/identity-privacy-and-sharing.md), [Server and Deployment Operating Model](../architecture/server-and-deployment-operating-model.md), [Backup, Restore, and Data Export Requirements](../operations/backup-restore-and-data-export-requirements.md)
- Related tests: not yet implemented
- Supersedes: none

## How to Use This Register

This register does not replace individual ADRs. Accepted ADRs remain authoritative for the decisions they record.

This register identifies whether additional candidate decisions are accepted, proposed, deferred, excluded, or not needed as separate ADRs. Automated agents must not implement deferred matters as durable architecture without explicit task authority and corresponding canonical documentation/ADR updates.

## Status Vocabulary

| Status | Meaning |
| --- | --- |
| Accepted ADR | Durable decision recorded and authoritative |
| Proposed ADR | Candidate decision documented but not yet binding as accepted architecture |
| Deferred pending validation | Requires farmer/user/organization evidence before commitment |
| Deferred pending technical evaluation | Requires architecture/technology analysis before commitment |
| Product non-goal / excluded from initial slice | Intentionally out of current implementation scope |
| No separate ADR needed | Governed sufficiently by linked canonical documentation unless the decision changes materially |

## Accepted Decisions

| ADR | Decision | Why accepted now | Key implementation implication |
| --- | --- | --- | --- |
| [ADR-0001](ADR-0001-offline-first-field-operation.md) | Offline-first field operation | Core product constraint | Offline record-retention behavior required |
| [ADR-0002](ADR-0002-history-preserving-idempotent-synchronization.md) | History-preserving/idempotent synchronization posture | Required for trustworthy records | Later sync must prevent duplicate effects and destructive overwrite |
| [ADR-0003](ADR-0003-ai-interpretations-require-confirmation.md) | AI draft-before-confirmation | Trust boundary | No unconfirmed AI operational effects |
| [ADR-0004](ADR-0004-private-by-default-intentional-sharing.md) | Private-by-default and intentional shared representations | Privacy/adoption boundary | Listings cannot expose internal records automatically |
| [ADR-0005](ADR-0005-data-portability-and-recoverability.md) | Data portability and recoverability | Open-source/data-control operating constraint | Backup/export/restore requirements must guide later design |

## Proposed and Deferred Decisions

| Topic | Current status | Why not accepted now | What is needed before decision |
| --- | --- | --- | --- |
| Deployment mode compatibility | [Proposed ADR](ADR-0006-deployment-mode-compatibility.md) | Direction is useful, but implementation burden and sequence remain uncertain | Validation plus technical planning |
| Deployment modes implementation sequence | Deferred pending validation | Farmer preferences and practical support burden unknown | Deployment validation evidence |
| Simplified local-farm server priority | Deferred pending validation | Demand and operational feasibility unproven | Farmer interviews/prototype experience |
| Local-network sync without internet | Deferred pending validation and technical evaluation | Adds topology/security/sync complexity | User need plus architecture evaluation |
| Offline AI interpretation requirement | Deferred pending validation and technical evaluation | Value versus implementation burden unresolved | Field testing plus technical options analysis |
| Server language | Deferred pending technical evaluation | Constraint not required to establish product invariants | Comparative architecture ADR later |
| Database/storage/sync technology | Deferred pending technical evaluation | Must follow accepted invariants | Technical evaluation and implementation plan |
| Identity/auth/security technology | Deferred pending technical evaluation | Privacy boundary defined; mechanism not selected | Security architecture work |
| Voice/photo workflow expansion | Deferred pending validation | Initial experiments not yet evaluated | Prototype/user evidence |
| Availability listings/messaging/group purchasing | Deferred pending validation | Coordination scope intentionally narrow | Farmer validation |
| Need-listing scope as initial external coordination workflow | No separate ADR needed | Governed by product scope and ADR-0004 | Create ADR only if coordination scope changes materially |

## Technology Selections Not Accepted by Current ADR Work

- Server programming language.
- Server framework.
- Mobile framework.
- Web/office client framework.
- Mobile local persistence technology.
- Server persistence technology.
- Spatial/geographic database capability.
- Attachment storage technology.
- Synchronization protocol, library, or vendor.
- API style and transport.
- Background-job mechanism.
- AI transcription/inference technology.
- Computer-vision model/runtime.
- Model training/evaluation tooling.
- Deployment packaging technology.
- Containerization or installer technology.
- Cloud provider.
- Observability stack.
- Authentication mechanism.
- Authorization-policy implementation.
- Encryption and key management.
- Backup/archive/export format.
- Upgrade and migration tooling.

## Product Prioritization Decisions Requiring Validation

- Whether managed hosted mode is the first production deployment path.
- Whether simplified local-farm server mode ships early.
- Whether cooperative/regional hosting should be prioritized.
- Whether availability listings should follow need listings.
- Whether in-product messaging is required early.
- Whether group purchasing, equipment sharing, or transport coordination is valuable.
- Whether voice capture is valuable enough beyond a constrained experiment.
- Whether photo counting is useful enough for any selected item category.
- Whether AI interpretation must operate fully offline.

## Initial-Slice Exclusions

| Excluded area | Status | Canonical source |
| --- | --- | --- |
| Accounting, payroll, payments, ecommerce | Product non-goal / excluded from initial slice | [Initial Vertical Slice](../product/initial-vertical-slice.md) |
| Public marketplace and generalized social networking | Product non-goal / excluded from initial slice | [Initial Vertical Slice](../product/initial-vertical-slice.md), [Sourcing and Local Network Model](../domain/sourcing-and-local-network-model.md) |
| Regulatory/compliance system | Product non-goal / excluded from initial slice | [Initial Vertical Slice](../product/initial-vertical-slice.md) |
| Disease diagnosis and treatment recommendations | Product non-goal / excluded from initial slice | [Initial Vertical Slice](../product/initial-vertical-slice.md), [AI-Assisted Capture and Confirmation Rules](../domain/ai-assisted-capture-and-confirmation-rules.md) |
| Autonomous AI farm decisions | Product non-goal / excluded from initial slice | [AI-Assisted Capture and Confirmation Rules](../domain/ai-assisted-capture-and-confirmation-rules.md), [ADR-0003](ADR-0003-ai-interpretations-require-confirmation.md) |
| Broad computer vision | Product non-goal / excluded from initial slice | [Initial Vertical Slice](../product/initial-vertical-slice.md), [AI-Assisted Capture Boundaries](../architecture/ai-assisted-capture-boundaries.md) |
| Server federation | Product non-goal / excluded from initial slice | [Initial Vertical Slice](../product/initial-vertical-slice.md), [Server and Deployment Operating Model](../architecture/server-and-deployment-operating-model.md) |
| Generalized workflow engine or premature microservices | Product non-goal / excluded from initial slice | [Initial Vertical Slice](../product/initial-vertical-slice.md) |

## Required Next Decision Work

Later prompts should:

- Create context packs once canonical and ADR guidance is stable.
- Perform documentation consistency review.
- Conduct technology-selection ADR work only after the foundational documentation set is accepted/reviewed and implementation planning begins.

Repository-wide standards and change-impact rules now exist in [Standards Documentation](../standards/README.md). They operationalize accepted ADR constraints without accepting deferred technology or product-priority decisions.

Future technology-selection or ADR work should use [Prompt Routing](../context/prompt-routing.md), [Dependency and Technology Selection Pack](../context/packs/dependency-and-technology-selection.pack.md), and [Documentation and ADR Governance Pack](../context/packs/documentation-and-adr-governance.pack.md) before creating or accepting decisions.
